'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AccountIcon } from './ui';
import styles from './auth-entry.module.css';
function AuthIcon({ name }: { name: string }) {
  if (name !== 'lock' && name !== 'mail') return <AccountIcon name={name} />;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={name === 'lock' ? 'M6 10h12v11H6V10ZM8 10V7a4 4 0 0 1 8 0v3M12 14v3' : 'M3 5h18v14H3V5Zm0 0 9 8 9-8'} /></svg>;
}
type Mode = 'login' | 'signup' | 'reset';
const benefits = [
  ['orders', 'Track your orders', 'See where your soft companion is.'],
  ['heart', 'Reward points', 'Earn and redeem for more happiness.'],
  ['pin', 'Saved addresses', 'Faster and easier checkout.'],
  ['star', 'Your favourite companions', 'Wishlist and collections.'],
];
export function AccountAuthEntry() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  function switchMode(next: Mode) { if (pending.current) return; setMode(next); setShow(false); setMessage(''); setError(false); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    if (mode === 'signup' && data.get('password') !== data.get('confirm')) { setError(true); setMessage('Your passwords do not match. Please check both fields.'); return; }
    pending.current = true; setBusy(true); setMessage(''); setError(false);
    try {
      const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: mode, email: data.get('email'), ...(mode !== 'reset' ? { password: data.get('password') } : {}) }) });
      await response.json();
      if (!response.ok) { setError(true); setMessage(response.status === 429 ? 'Too many attempts. Please try again later.' : 'We couldn’t complete this request. Please check your details and try again.'); }
      else if (mode === 'login') { setMessage('Signed in. Opening your account…'); router.refresh(); }
      else setMessage(mode === 'reset' ? 'Check your inbox. If an account exists, a reset link has been requested.' : 'Check your email to confirm your account.');
    } catch { setError(true); setMessage('Unable to connect. Please try again.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className={styles.page}>
    <div className={styles.clouds} aria-hidden="true" />
    <header className={styles.header}><Link href="/" aria-label="SoftHaven homepage"><Image src="/assets/soft-haven-logo-transparent.png" alt="SoftHaven Sri Lanka" width={150} height={100} sizes="150px" /></Link><span className={styles.badge}><AuthIcon name="lock" /><span>Secure account<small>Protected sign-in</small></span></span></header>
    <section className={styles.welcome}><h1><span className={styles.desktopHeading}>Welcome to<br /><em>Your SoftHaven</em><br />Corner.</span><span className={styles.mobileHeading}>Welcome to your<br /><em>SoftHaven corner.</em></span></h1><p>Manage your orders, addresses, rewards<br className={styles.desktopBreak} /> and all your soft companions in one place.</p></section>
    <section className={styles.experience} aria-label="Your account benefits"><ul>{benefits.map(([icon,title,copy]) => <li key={title}><span className={styles.icon}><AuthIcon name={icon} /></span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ul><Image unoptimized className={styles.teddy} src="/images/softhaven/experience/softhaven-experience-teddy-cloud.webp" alt="" width={640} height={800} sizes="(max-width: 1100px) 240px, 300px" /><aside className={styles.brandNote}><span aria-hidden="true">♡</span><h2>A softer way to keep everything together.</h2><p>Orders, favourites, rewards and delivery details — all in your SoftHaven account.</p><Link href="/shop">Continue shopping <span aria-hidden="true">→</span></Link></aside></section>
    <section className={styles.card} aria-label="SoftHaven authentication">
      {mode !== 'reset' ? <div className={styles.tabs} role="tablist" aria-label="Account access">{(['login','signup'] as const).map((value,index) => <button key={value} ref={node => { tabRefs.current[index] = node; }} id={`auth-tab-${value}`} type="button" role="tab" aria-selected={mode === value} aria-controls="auth-panel" tabIndex={mode === value ? 0 : -1} disabled={busy} onClick={() => switchMode(value)} onKeyDown={event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index; switchMode(next ? 'signup' : 'login'); tabRefs.current[next]?.focus(); } }}>{value === 'login' ? 'Sign In' : 'Create Account'}</button>)}</div> : <button className={styles.back} type="button" disabled={busy} onClick={() => switchMode('login')}>← Back to sign in</button>}
      <div id="auth-panel" role={mode === 'reset' ? undefined : 'tabpanel'} aria-labelledby={mode === 'reset' ? 'auth-heading' : `auth-tab-${mode}`} className={styles.panel} key={mode}>
        <h2 id="auth-heading">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your SoftHaven account' : 'Reset your password'} <span aria-hidden="true">♡</span></h2><p className={styles.subtitle}>{mode === 'login' ? 'Sign in to your SoftHaven account.' : mode === 'signup' ? 'Save your favourites, manage orders and make every checkout a little easier.' : "Enter the email connected to your SoftHaven account and we’ll send you a reset link."}</p>
        <form onSubmit={submit} aria-busy={busy}>
          <label htmlFor="auth-email">Email address</label><div className={styles.field}><AuthIcon name="mail" /><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Enter your email" disabled={busy} /></div>
          {mode !== 'reset' && <><label htmlFor="auth-password">Password</label><div className={styles.field}><AuthIcon name="lock" /><input id="auth-password" name="password" type={show ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} maxLength={200} placeholder="Enter your password" disabled={busy} aria-describedby={mode === 'signup' ? 'auth-guidance' : undefined} /><button type="button" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} onClick={() => setShow(!show)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{show && <path d="m3 3 18 18"/>}</svg></button></div></>}
          {mode === 'signup' && <><p id="auth-guidance" className={styles.guidance}>Use at least 8 characters.</p><label htmlFor="auth-confirm">Confirm password</label><div className={styles.field}><AuthIcon name="lock" /><input id="auth-confirm" name="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={200} placeholder="Re-enter your password" disabled={busy} /></div></>}
          {mode === 'login' && <div className={styles.passwordRow}><button type="button" onClick={() => switchMode('reset')}>Forgot password?</button></div>}
          {message && <p className={error ? styles.error : styles.success} role={error ? 'alert' : 'status'}>{message}</p>}
          <button className={styles.primary} disabled={busy} type="submit">{busy ? mode === 'login' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : 'Sending reset link…' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create account' : 'Send reset link'}<span aria-hidden="true">→</span></button>
        </form>
        {mode !== 'reset' && <p className={styles.switch}>{mode === 'login' ? 'Don’t have an account?' : 'Already have an account?'} <button type="button" disabled={busy} onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create one' : 'Sign in'}</button></p>}
      </div>
      <div className={styles.trust}>{[['lock','Safe & Secure','Your data is protected'],['orders','Fast & Easy','Manage your orders'],['heart','More Happiness','Earn rewards & more']].map(([icon,title,copy]) => <div key={title}><AuthIcon name={icon} /><strong>{title}</strong><small>{copy}</small></div>)}</div>
    </section>
  </div>;
}
