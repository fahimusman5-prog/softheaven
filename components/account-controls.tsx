'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AccountControls({
  profile,
  addresses,
}: {
  profile: Record<string, any> | null;
  addresses: Record<string, any>[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        onClick={async () => {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }),
          });
          router.refresh();
        }}
      >
        Sign out
      </button>
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            const r = await fetch('/api/account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'profile',
                name: f.get('name'),
                phone: f.get('phone'),
              }),
            });
            const data = await r.json();
            setMessage(r.ok ? 'Profile saved' : data.error);
            if (r.ok) router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>Profile</h2>
        <label>
          Name
          <input
            name="name"
            defaultValue={profile?.name ?? ''}
            maxLength={150}
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            defaultValue={profile?.phone ?? ''}
            maxLength={30}
          />
        </label>
        <button disabled={busy}>Save profile</button>
      </form>
      <h2>Addresses</h2>
      {addresses.map((a) => (
        <article className="form-card" key={a.id}>
          <strong>{a.name}</strong>
          <p>
            {a.address}, {a.city}, {a.district}
          </p>
          <p>{a.phone}</p>
          <button
            disabled={busy}
            onClick={async () => {
              if (!confirm('Remove this address?')) return;
              const r = await fetch('/api/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'remove_address', id: a.id }),
              });
              if (r.ok) router.refresh();
              else setMessage('Address could not be removed');
            }}
          >
            Remove address
          </button>
        </article>
      ))}
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            const r = await fetch('/api/account', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'address',
                name: f.get('name'),
                phone: f.get('phone'),
                address: f.get('address'),
                city: f.get('city'),
                district: f.get('district'),
              }),
            });
            const data = await r.json();
            setMessage(r.ok ? 'Address saved' : data.error);
            if (r.ok) router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        <h3>Add delivery address</h3>
        {['name', 'phone', 'address', 'city', 'district'].map((n) => (
          <label key={n}>
            {n}
            <input name={n} required maxLength={n === 'address' ? 500 : 150} />
          </label>
        ))}
        <button disabled={busy}>Save address</button>
      </form>
      <p role="status">{message}</p>
    </>
  );
}
