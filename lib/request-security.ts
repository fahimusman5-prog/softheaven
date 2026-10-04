import { z } from "zod";
export class AccessError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new AccessError("Invalid request origin.", 403);
}
export async function readBytes(
  request: Request,
  limit: number,
): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(request.headers.get("content-length")) > limit)
    throw new AccessError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new AccessError("Request body is required.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new AccessError("Request is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
export async function readJson(
  request: Request,
  limit = 64 * 1024,
): Promise<unknown> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new AccessError("Send a JSON request.", 415);
  const bytes = await readBytes(request, limit);
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new AccessError("Invalid JSON request.", 400);
  }
}
const businessMessages = new Set([
  "Account is inactive",
  "Administrator email must be confirmed",
  "Cart does not qualify for coupon",
  "Closed orders cannot be reopened",
  "Collection not found",
  "Coupon customer limit reached",
  "Coupon is for first orders",
  "Coupon is not eligible for this customer",
  "Coupon unavailable",
  "Coupon usage limit reached",
  "Delivery address is incomplete",
  "Delivery destination is outside this shipping zone",
  "Delivery method not found",
  "Email is required",
  "File contents do not match a supported image type.",
  "Insufficient stock",
  "Invalid adjustment",
  "Invalid cart",
  "Invalid customer details",
  "Invalid delivery charge",
  "Invalid email",
  "Invalid image",
  "Invalid order transition",
  "Invalid profile",
  "Invalid request key",
  "Invalid review",
  "Invalid reward adjustment",
  "Invalid reward redemption",
  "Invalid status",
  "Media is referenced; remove its references before deletion",
  "Only a paid COD order can have an offline refund recorded",
  "Only authorized administrators may confirm collected COD on delivery",
  "Order not found",
  "Order request key required",
  "Password is required",
  "Permission denied",
  "Product not found",
  "Product unavailable",
  "Provide a refund reference and reason",
  "Quantity must be between 1 and 12",
  "Record a verified provider/offline refund before marking refunded",
  "Reward redemption unavailable",
  "Select an existing customer",
  "Select settings to edit",
  "Shipping method unavailable",
  "Sign in first",
  "Sign in with a confirmed email",
  "The final active super administrator cannot be removed",
  "Too many reward points for this cart",
  "Unknown action",
  "Upload an image up to 5 MB.",
  "Use inventory adjustment to receive stock",
  "Variant not found",
]);
export function apiError(error: unknown) {
  let status = 500;
  let message = "The operation could not be completed. Please try again.";
  if (error instanceof AccessError) {
    status = error.status;
    message = error.message;
  } else if (
    error instanceof Error &&
    [
      "Too many requests. Please try again later.",
      "Too many review requests. Please try again later.",
    ].includes(error.message)
  ) {
    status = 429;
    message = error.message;
  } else if (error instanceof z.ZodError) {
    status = 400;
    message = "Please check the supplied fields.";
  } else if (error instanceof Error && businessMessages.has(error.message)) {
    status = 400;
    message = error.message;
  } else if (
    error instanceof Error &&
    error.message.startsWith("Insufficient stock for ")
  ) {
    status = 400;
    message = "An item has insufficient stock. Please update your cart.";
  }
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
