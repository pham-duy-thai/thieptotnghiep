import { getSupabase, json, explainSupabaseError } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  try {
    const db = getSupabase();
    const [rsvps, wishes, hearts] = await Promise.all([
      db.from("rsvps").select("id,name,attending,guest_count,created_at").order("created_at", { ascending: false }).limit(100),
      db.from("wishes").select("id,name,message,created_at").order("created_at", { ascending: false }).limit(30),
      db.from("heart_stats").select("id", { count: "exact", head: true })
    ]);
    if (rsvps.error || wishes.error || hearts.error) throw rsvps.error || wishes.error || hearts.error;
    return json(res, 200, { rsvps: rsvps.data, wishes: wishes.data, hearts: hearts.count || 0 });
  } catch (error) {
    console.error("Public activity query failed", error);
    return json(res, 500, { error: explainSupabaseError(error) });
  }
}
