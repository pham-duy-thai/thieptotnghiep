import { getSupabase, json, explainSupabaseError } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const { name, message } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 1 || name.length > 60) return json(res, 400, { error: "Vui lòng nhập họ tên hợp lệ." });
  if (typeof message !== "string" || message.trim().length < 1 || message.length > 140) return json(res, 400, { error: "Lời chúc cần từ 1 đến 140 ký tự." });
  try {
    const { error } = await getSupabase().from("wishes").insert({ name: name.trim(), message: message.trim() });
    if (error) throw error;
    return json(res, 201, { ok: true });
  } catch (error) {
    console.error("Wish insert failed", error);
    return json(res, 500, { error: explainSupabaseError(error) });
  }
}
