import { getSupabase, json } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const db = getSupabase();
    const { error } = await db.from("heart_stats").insert({ amount: 1 });
    if (error) throw error;
    const { count, error: countError } = await db.from("heart_stats").select("id", { count: "exact", head: true });
    if (countError) throw countError;
    return json(res, 200, { ok: true, count });
  } catch (error) {
    console.error("Heart insert failed", error);
    return json(res, 500, { error: "Chưa ghi nhận được lượt tim." });
  }
}
