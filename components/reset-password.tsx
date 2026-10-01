'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { browserClient } from '@/lib/supabase/browser';
export function ResetPassword() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (params.get('recovery') !== 'true') return null;
  return (
    <form
      className="form-card"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const password = String(f.get('password'));
        if (password !== f.get('confirm')) {
          setMessage('Passwords do not match.');
          return;
        }
        setBusy(true);
        try {
          const { error } = await browserClient().auth.updateUser({ password });
          setMessage(error ? error.message : 'Password updated.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Choose a new password</h2>
      <label>
        New password
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label>
        Confirm password
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <button disabled={busy}>Update password</button>
      <p role="status">{message}</p>
    </form>
  );
}
