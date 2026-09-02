type EmailInput = { to: string; subject: string; html: string };

export async function sendEmail(input: EmailInput): Promise<{ sent: boolean; reference?: string; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  if (!apiKey || !from) return { sent: false, error: "Email provider is not configured" };
  const result = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }) });
  const body = await result.json().catch(() => ({})) as Record<string, unknown>;
  if (!result.ok) return { sent: false, error: typeof body.message === "string" ? body.message.slice(0, 300) : "Email provider rejected the message" };
  return { sent: true, reference: typeof body.id === "string" ? body.id : undefined };
}

export function escapeHtml(value: string): string { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
