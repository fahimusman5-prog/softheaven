import { withSupabase } from "@supabase/server";
import { sha256 } from "../_shared/crypto.ts";
import { errorResponse, handleOptions, readJson, requirePublicKey, response, stringValue } from "../_shared/http.ts";

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    try {
      const options = handleOptions(req); if (options) return options;
      if (req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
      requirePublicKey(req); const body = await readJson(req); const orderNumber = stringValue(body.order_number, 40); const suppliedToken = stringValue(body.confirmation_token, 160);
      const pepper = Deno.env.get("ORDER_TOKEN_PEPPER"); if (!pepper) throw new Error("Order confirmation is not configured"); const hash = await sha256(`${suppliedToken}:${pepper}`);
      const { data: order, error } = await ctx.supabaseAdmin.from("orders").select("id,order_number,customer_name,email,phone,address_line_1,address_line_2,city,postal_code,country,currency,subtotal,shipping_amount,payment_fee,grand_total,payment_method,payment_status,order_status,created_at").eq("order_number", orderNumber).eq("confirmation_token_hash", hash).maybeSingle();
      if (error || !order) return response(req, { error: "Order confirmation could not be verified" }, 404);
      const { data: items } = await ctx.supabaseAdmin.from("order_items").select("product_name_snapshot,sku_snapshot,image_snapshot,quantity,unit_price,line_total").eq("order_id", order.id).order("created_at");
      return response(req, { ...order, items: items ?? [] });
    } catch (error) { return errorResponse(req, error); }
  }),
};
