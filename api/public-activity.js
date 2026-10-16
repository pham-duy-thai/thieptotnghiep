import { getSupabase, json, explainSupabaseError } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    const db = getSupabase();
    const [rsvps, wishes, hearts, heartCount] = await Promise.all([
      db.from("rsvps").select("id,name,attending,guest_count,created_at").eq("attending", true).order("created_at", { ascending: false }).limit(100),
      db.from("wishes").select("id,name,message,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("heart_stats").select("id,name,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("heart_stats").select("id", { count: "exact", head: true })
    ]);
    if (rsvps.error || wishes.error || heartCount.error) throw rsvps.error || wishes.error || heartCount.error;
    let heartRows = hearts.data || [];
    if (hearts.error) {
      const fallback = await db.from("heart_stats").select("id,created_at").order("created_at", { ascending: false }).limit(100);
      if (fallback.error) throw hearts.error;
      heartRows = fallback.data || [];
    }
    const events = [
      ...rsvps.data.map((row) => ({ id: `r-${row.id}`, type: "rsvp", name: row.name, detail: `đã xác nhận tham dự${row.guest_count > 1 ? ` cùng ${row.guest_count - 1} người` : ""}`, created_at: row.created_at })),
      ...wishes.data.map((row) => ({ id: `w-${row.id}`, type: "wish", name: row.name, detail: row.message, created_at: row.created_at })),
      ...heartRows.filter((row) => row.name).map((row) => ({ id: `h-${row.id}`, type: "heart", name: row.name, detail: "đã gửi một trái tim", created_at: row.created_at }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 100);
    return json(res, 200, {
      rsvps: rsvps.data,
      wishes: wishes.data,
      hearts: heartCount.count || 0,
      events
    });
  } catch (error) {
    console.error("Public activity query failed", error);
    return json(res, 500, { error: explainSupabaseError(error) });
  }
}
