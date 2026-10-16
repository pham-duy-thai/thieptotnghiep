
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
