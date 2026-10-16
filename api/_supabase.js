
import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const rawUrl = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Loại bỏ khoảng trắng, /rest/v1 và dấu / ở cuối URL
  const url = rawUrl
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");

  if (!url || !key) {
    throw new Error("Supabase chưa được cấu hình trên Vercel.");
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error("SUPABASE_URL không đúng định dạng.");
  }

  console.log("Supabase config check:", {
    hasUrl: true,
    hasKey: Boolean(key),
    urlLooksValid: true,
  });

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export function explainSupabaseError(error) {
  const code = error?.code || "";
  const message = error?.message || "";
  if (code === "42P01" || /relation .* does not exist/i.test(message)) return "Chưa có bảng Supabase. Hãy chạy supabase-schema.sql trong SQL Editor.";
  if (code === "PGRST205" || /could not find the table/i.test(message)) return "Supabase chưa nhận diện bảng. Kiểm tra schema và làm mới API schema cache.";
  if (code === "42501" || /permission denied|row-level security/i.test(message)) return "Supabase từ chối quyền truy cập. Kiểm tra service role key trong Vercel.";
  if (/Invalid API key|JWT/i.test(message)) return "SUPABASE_SERVICE_ROLE_KEY không hợp lệ. Cập nhật key trong Vercel rồi deploy lại.";
  if (/fetch failed|ENOTFOUND|ECONN/i.test(message)) return "Vercel không kết nối được Supabase. Kiểm tra SUPABASE_URL.";
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return "Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong Vercel Environment Variables.";
  return "Lỗi Supabase. Xem Function Logs của Vercel để biết chi tiết.";
}

export function json(res, status, body) {
  res
    .status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8")
    .end(JSON.stringify(body));
}

export function requireAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const supplied = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return Boolean(expected && supplied && supplied === expected);
}
