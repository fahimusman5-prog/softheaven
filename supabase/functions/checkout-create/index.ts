import { withSupabase } from "@supabase/server";
import { escapeHtml, sendEmail } from "../_shared/email.ts";
import { sha256, token } from "../_shared/crypto.ts";
import { emailValue, errorResponse, handleOptions, itemsValue, readJson, requirePublicKey, response, stringValue } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const options = handleOptions(req); if (options) return options;
      if (req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
      requirePublicKey(req);
      const body = await readJson(req); const customerValue = body.customer;
      if (!customerValue || typeof customerValue !== "object" || Array.isArray(customerValue)) throw new Error("Customer details are required");
      const customer = customerValue as Record<string, unknown>;
      const pCustomer = { name: stringValue(customer.name, 160), email: emailValue(customer.email), phone: stringValue(customer.phone, 40), address_line_1: stringValue(customer.address_line_1, 240), address_line_2: stringValue(customer.address_line_2, 240, false), city: stringValue(customer.city, 120), postal_code: stringValue(customer.postal_code, 32, false), country: stringValue(customer.country, 120) };
      const countryCode = stringValue(body.country_code, 2).toUpperCase(); const paymentMethod = stringValue(body.payment_method, 24); const idempotencyKey = stringValue(body.idempotency_key, 120);
      if (!/^[A-Z]{2}$/.test(countryCode) || !["cod", "bank_transfer"].includes(paymentMethod) || idempotencyKey.length < 20) throw new Error("Checkout details are invalid");
      const pepper = Deno.env.get("ORDER_TOKEN_PEPPER"); if (!pepper) throw new Error("Order confirmation is not configured");
      const confirmationToken = token(); const confirmationTokenHash = await sha256(`${confirmationToken}:${pepper}`);
      const { data, error } = await ctx.supabaseAdmin.rpc("create_order", { p_customer: pCustomer, p_items: itemsValue(body.items), p_country_code: countryCode, p_payment_method: paymentMethod, p_notes: stringValue(body.notes, 1000, false), p_idempotency_key: idempotencyKey, p_confirmation_token_hash: confirmationTokenHash });
      if (error) throw new Error("Order could not be created. Please review your details and try again.");
      const order = data as Record<string, unknown>; const adminRecipient = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? Deno.env.get("CONTACT_RECIPIENT_EMAIL");
      const summary = `<p>Thank you, ${escapeHtml(String(order.customer_name))}. Your order <strong>${escapeHtml(String(order.order_number))}</strong> was received.</p><p>Total: <strong>${escapeHtml(String(order.currency))} ${escapeHtml(String(order.grand_total))}</strong><br/>Payment: ${escapeHtml(String(order.payment_method))}</p>`;
      const recipients = [{ kind: "customer_order", to: String(order.email), subject: "Your ANTZ SoftHaven order", html: summary }, ...(adminRecipient ? [{ kind: "admin_order", to: adminRecipient, subject: `ANTZ SoftHaven order ${escapeHtml(String(order.order_number))}`, html: `<p>New order received.</p>${summary}` }] : [])];
      const notifications = [];
      for (const item of recipients) { const delivery = await sendEmail(item); notifications.push({ kind: item.kind, status: delivery.sent ? "sent" : "failed" }); await ctx.supabaseAdmin.from("notification_deliveries").insert({ order_id: order.id, kind: item.kind, recipient: item.to, status: delivery.sent ? "sent" : "failed", provider_reference: delivery.reference ?? null, error_message: delivery.error ?? null, sent_at: delivery.sent ? new Date().toISOString() : null }); }
      return response(req, { ...order, confirmation_token: confirmationToken, notifications });
    } catch (error) { return errorResponse(req, error); }
  }),
};
