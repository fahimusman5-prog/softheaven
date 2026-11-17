import "server-only";
import { AccessError } from "@/lib/request-security";
import { paymentMethods, type PaymentMethod } from "./payment-methods";
// Future adapters receive a trusted server quote and order reference, never browser totals.
export interface PaymentProvider {
  method: Exclude<PaymentMethod, "cod">;
  start(input: {
    orderId: string;
    amount: number;
    currency: "LKR";
    idempotencyKey: string;
  }): Promise<{ redirectUrl: string }>;
  verify(
    input: Request,
  ): Promise<{
    orderId: string;
    transactionId: string;
    amount: number;
    currency: "LKR";
    paid: boolean;
  }>;
}
// No provider endpoint, credentials or callback scheme is assumed. Activation requires
// an official merchant adapter and independently verified payment/order update flow.
export function requireConfiguredPayment(method: PaymentMethod) {
  if (!paymentMethods.find((p) => p.id === method)?.enabled)
    throw new AccessError(
      "This payment method is not configured. Please choose cash on delivery.",
      400,
    );
}
