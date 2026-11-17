// Contact now hands off locally to WhatsApp. Retire the former email endpoint.
export async function POST() {
  return Response.json({ error: 'Please use the WhatsApp form on the Contact page.' }, { status: 410, headers: { 'Cache-Control': 'private, no-store' } });
}
