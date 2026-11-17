'use client';
export default function AccountError({ reset }: { reset: () => void }) {
  return <section className="account-auth" role="alert"><p className="account-eyebrow">MY SOFTHAVEN</p><h1>A little pause in your corner.</h1><p>We couldn’t load your account right now. Please try again.</p><button className="account-button" onClick={reset}>Try again</button></section>;
}
