import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AccessError } from "@/lib/request-security";
export async function requireBudget(
  db: SupabaseClient,
  action: "account" | "admin" | "upload",
) {
  const { data, error } = await db.rpc("consume_request_budget", {
    p_action: action,
  });
  if (error) throw error;
  if (!data)
    throw new AccessError("Too many requests. Please try again later.", 429);
}
