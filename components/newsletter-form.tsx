'use client';
import { useCatalogue } from '@/components/catalogue-provider';
import { useState } from 'react';
export function NewsletterForm() {
  const { settings } = useCatalogue();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: f.get('email') }),
          });
          const v = await r.json();
          setMessage(r.ok ? 'Subscription recorded.' : v.error);
        } catch {
          setMessage('Please retry.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        {settings.footer?.newsletter_text}
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          aria-label="Newsletter email"
        />
      </label>
      <button disabled={busy}>{busy ? 'Subscribing…' : 'Subscribe'}</button>
      <small role="status">{message}</small>
    </form>
  );
}
