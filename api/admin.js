import { getSupabase, json, requireAdmin } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!requireAdmin(req)) return json(res, 401, { error: "Unauthorized" });
  try {
    const db = getSupabase();
    const [rsvps, wishes, hearts] = await Promise.all([
      db.from("rsvps").select("id,name,attending,guest_count,created_at").order("created_at", { ascending: false }).limit(500),
      db.from("wishes").select("id,name,message,created_at").order("created_at", { ascending: false }).limit(500),
      db.from("heart_stats").select("id", { count: "exact", head: true })
    ]);
    if (rsvps.error || wishes.error || hearts.error) throw rsvps.error || wishes.error || hearts.error;
    return json(res, 200, {
      rsvps: rsvps.data,
      wishes: wishes.data,
      summary: {
        responses: rsvps.data.length,
        attending: rsvps.data.filter((row) => row.attending).length,
        guests: rsvps.data.reduce((sum, row) => sum + (row.attending ? row.guest_count : 0), 0),
        hearts: hearts.count || 0
      }
    });
  } catch (error) {
    console.error("Admin query failed", error);
    return json(res, 500, { error: "Không tải được thống kê." });
  }
}
