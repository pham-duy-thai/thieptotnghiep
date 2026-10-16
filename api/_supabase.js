
import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Supabase config check:", {
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlLooksValid: Boolean(
      url?.startsWith("https://") && url?.endsWith(".supabase.co")
    ),
  });

  if (!url || !key) {
    throw new Error("Supabase chưa được cấu hình trên Vercel.");
  }

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
