import { withSupabase } from "@supabase/server";
import { errorResponse, handleOptions, itemsValue, readJson, requirePublicKey, response, stringValue } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const options = handleOptions(req); if (options) return options;
      if (req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
      requirePublicKey(req);
      const body = await readJson(req);
      const countryCode = stringValue(body.country_code, 2).toUpperCase();
      const paymentMethod = stringValue(body.payment_method, 24);
      if (!/^[A-Z]{2}$/.test(countryCode) || !["cod", "bank_transfer"].includes(paymentMethod)) throw new Error("Payment method or country is not available");
      const { data, error } = await ctx.supabaseAdmin.rpc("checkout_quote", { p_items: itemsValue(body.items), p_country_code: countryCode, p_payment_method: paymentMethod });
      if (error) throw new Error("Checkout quote is unavailable");
      return response(req, data);
    } catch (error) { return errorResponse(req, error); }
  }),
};
