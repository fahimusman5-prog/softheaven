'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AuthForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <form
      className="admin-login admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const f = new FormData(e.currentTarget);
        try {
          const r = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: mode,
              email: f.get('email'),
              ...(mode !== 'reset' ? { password: f.get('password') } : {}),
            }),
          });
          const data = await r.json();
          setMessage(data.message ?? data.error);
          if (r.ok && mode === 'login') router.refresh();
        } catch {
          setMessage('Unable to connect. Please retry.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="admin-kicker">SOFTHAVEN</p>
      <h1>{admin ? 'Administrator sign in' : 'Your SoftHaven account'}</h1>
      <p>
        {admin
          ? 'Use your authorized Supabase account. New accounts require email confirmation.'
          : 'Sign in to manage your orders, addresses and reward points.'}
      </p>
      <label>
        Email
        <input required type="email" name="email" autoComplete="email" />
      </label>
      {mode !== 'reset' && (
        <label>
          Password
          <input
            required
            minLength={8}
            type="password"
            name="password"
            autoComplete={
              mode === 'signup' ? 'new-password' : 'current-password'
            }
          />
        </label>
      )}
      <button className="admin-primary" disabled={busy}>
        {busy
          ? 'Please wait…'
          : mode === 'signup'
            ? 'Create account'
            : mode === 'reset'
              ? 'Request reset email'
              : 'Sign in'}
      </button>
      {message && <p role="status">{message}</p>}
      <div>
        <button
          type="button"
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Already have an account' : 'Create an account'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'reset' ? 'login' : 'reset')}
        >
          {mode === 'reset' ? 'Back to sign in' : 'Forgot password'}
        </button>
      </div>
    </form>
  );
}
