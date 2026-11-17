import { paymentIds } from "@/lib/checkout/payment-methods";
import { requireConfiguredPayment } from "@/lib/checkout/payment-provider";
import { readJson, AccessError } from "@/lib/request-security";
import { serverClient } from "@/lib/supabase/server";
import { sameOrigin, apiError } from "@/lib/admin/auth";
import { z } from "zod";
export async function GET() {
  const db = await serverClient();
  const { data, error } = await db
    .from("shipping_rates")
    .select("*,shipping_zones(*)")
    .eq("active", true);
  if (error) return apiError(error);
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return Response.json(
      { rates: data, customer: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  const [profile, addresses, balance] = await Promise.all([
    db.from("profiles").select("name,phone").eq("id", user.id).single(),
    db
      .from("customer_addresses")
      .select("id,name,phone,address,city,district")
      .eq("customer_id", user.id)
      .limit(25),
    db.rpc("reward_balance"),
  ]);
  return Response.json(
    {
      rates: data,
      customer: {
        profile: profile.data,
        addresses: addresses.data ?? [],
        balance: balance.error ? null : Number(balance.data),
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const v = z
      .object({
        paymentMethod: z.enum(paymentIds).default("cod"),
        lines: z
          .array(
            z.object({
              variant_id: z.uuid(),
              quantity: z.number().int().min(1).max(12),
            }),
          )
          .min(1)
          .max(100),
        address: z.object({
          name: z.string().min(1).max(150),
          phone: z.string().min(6).max(30),
          address: z.string().min(3).max(500),
          city: z.string().min(1).max(150),
          district: z.string().max(100),
          country: z.string().length(2),
        }),
        rate: z.uuid(),
        coupon: z.string().max(100).default(""),
        points: z.number().int().min(0).default(0),
        commit: z.boolean().default(false),
        key: z.uuid().nullable().default(null),
        notes: z.string().max(2000).default(""),
      })
      .parse(await readJson(request));
    requireConfiguredPayment(v.paymentMethod);
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new AccessError("Sign in first", 401);
    if (v.commit && !v.key)
      throw new AccessError("Order request key required", 400);
    const { data, error } = await db.rpc("commerce_checkout", {
      p_lines: v.lines,
      p_address: v.address,
      p_rate: v.rate,
      p_coupon: v.coupon,
      p_points: v.points,
      p_commit: v.commit,
      p_key: v.key,
      p_notes: v.notes,
    });
    if (error) throw new Error(error.message);
    return Response.json(data);
  } catch (e) {
    return apiError(e);
  }
}
