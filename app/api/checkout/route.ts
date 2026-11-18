import { paymentService } from '@/lib/payments/server';
import { payhereConfig, payhereFields, cardCheckoutAvailable } from '@/lib/payments/payhere';
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
  const paymentConfiguration = user ? await db.rpc('checkout_payment_configuration') : null;
  const bank = paymentConfiguration?.data?.bank ?? null;
  const payments = { card: Boolean(cardCheckoutAvailable() && process.env.SUPABASE_SECRET_KEY), bank_transfer: Boolean(bank && process.env.SUPABASE_SECRET_KEY) };
  if (!user)
    return Response.json(
      { rates: data, customer: null, payments, bank: null },
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
      rates: data, payments, bank, bankVersion: paymentConfiguration?.data?.bank_version ?? null,
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
        paymentMethod: z.enum(paymentIds),
        receipt: z.uuid().nullable().optional(),
        bankVersion: z.string().regex(/^[a-f0-9]{32}$/).nullable().optional(),
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
          name: z.string().trim().min(1).max(150),
          phone: z.string().trim().min(6).max(30).regex(/^[+\d ().-]+$/),
          address: z.string().trim().min(3).max(500),
          city: z.string().trim().min(1).max(150),
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
    if (v.commit) requireConfiguredPayment(v.paymentMethod);
    const db = await serverClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new AccessError("Sign in first", 401);
    if (v.commit && !v.key)
      throw new AccessError("Order request key required", 400);
    if (v.commit) {
      const {data,error} = await paymentService().rpc('create_payment_order', {p_customer:user.id,p_method:v.paymentMethod,p_lines:v.lines,p_address:v.address,p_rate:v.rate,p_key:v.key,p_receipt:v.receipt??null,p_coupon:v.coupon,p_points:v.points,p_notes:v.notes,p_bank_version:v.bankVersion??null});
      if(error) throw new AccessError('Order could not be submitted. Check delivery availability, stock and your payment receipt.',409);
      if(v.paymentMethod==='card' && data.payment_status==='pending' && data.status==='pending') {
        const config=payhereConfig()!;
        return Response.json({...data,payment:{endpoint:config.endpoint,fields:payhereFields(data,config)}});
      }
      return Response.json(data);
    }
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
