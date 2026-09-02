import { withSupabase } from "@supabase/server";
import { escapeHtml, sendEmail } from "../_shared/email.ts";
import { sha256 } from "../_shared/crypto.ts";
import { emailValue, errorResponse, handleOptions, readJson, requirePublicKey, response, stringValue } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const options = handleOptions(req); if (options) return options;
      if (req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
      requirePublicKey(req);
      const body = await readJson(req); if (stringValue(body.website, 80, false)) return response(req, { accepted: true });
      const name = stringValue(body.name, 120); const email = emailValue(body.email); const subject = stringValue(body.subject, 160, false); const message = stringValue(body.message, 5000);
      const pepper = Deno.env.get("RATE_LIMIT_PEPPER"); if (!pepper) throw new Error("Contact protection is not configured"); const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; const keyHash = await sha256(`${pepper}:${ip}:${email}`);
      const { data: allowed, error: rateError } = await ctx.supabaseAdmin.rpc("consume_submission_rate", { p_key_hash: keyHash, p_limit: 5, p_window_minutes: 60 });
      if (rateError || allowed !== true) return response(req, { error: "Too many messages. Please try again later." }, 429);
      const { data: saved, error } = await ctx.supabaseAdmin.from("contact_messages").insert({ name, email, subject: subject || null, message, source_ip_hash: keyHash }).select("id").single();
      if (error || !saved) throw new Error("Message could not be saved");
      const recipient = Deno.env.get("CONTACT_RECIPIENT_EMAIL") ?? Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
      if (recipient) { const delivery = await sendEmail({ to: recipient, subject: `Contact message${subject ? `: ${escapeHtml(subject)}` : ""}`, html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) sent a message.</p><p>${escapeHtml(message)}</p>` }); await ctx.supabaseAdmin.from("notification_deliveries").insert({ kind: "contact", recipient, status: delivery.sent ? "sent" : "failed", provider_reference: delivery.reference ?? null, error_message: delivery.error ?? null, sent_at: delivery.sent ? new Date().toISOString() : null }); }
      return response(req, { accepted: true, message_id: saved.id });
    } catch (error) { return errorResponse(req, error); }
  }),
};
