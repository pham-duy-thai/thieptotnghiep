import { getSupabase, json, explainSupabaseError } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const { name, attending, guest_count } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 1 || name.length > 60) return json(res, 400, { error: "Vui lòng nhập họ tên hợp lệ." });
  if (typeof attending !== "boolean") return json(res, 400, { error: "Trạng thái tham dự không hợp lệ." });
  const count = attending ? Number(guest_count) : 0;
  if (attending && (!Number.isInteger(count) || count < 1 || count > 10)) return json(res, 400, { error: "Số lượng khách không hợp lệ." });
  try {
    const { error } = await getSupabase().from("rsvps").insert({ name: name.trim(), attending, guest_count: count });
    if (error) throw error;
    return json(res, 201, { ok: true });
  } catch (error) {
    console.error("RSVP insert failed", error);
    return json(res, 500, { error: explainSupabaseError(error) });
  }
}
