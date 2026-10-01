'use client';
import { useEffect, useState } from 'react';
type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  reply: string | null;
};
export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/reviews?product=' + encodeURIComponent(productId))
      .then((r) => r.json())
      .then((r) => setReviews(r.reviews ?? []))
      .catch(() => setMessage('Reviews could not be loaded.'));
  }, [productId]);
  return (
    <section className="section">
      <h2>Customer reviews</h2>
      {reviews.length ? (
        <p>
          {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(
            1,
          )}{' '}
          / 5 · {reviews.length} approved reviews shown
        </p>
      ) : (
        <p>No approved reviews yet.</p>
      )}
      {reviews.map((r) => (
        <article className="form-card" key={r.id}>
          <strong>
            {r.title} · {r.rating}/5
          </strong>
          {r.verified_purchase && <small> Verified purchase</small>}
          <p>{r.body}</p>
          {r.reply && <p>SoftHaven: {r.reply}</p>}
        </article>
      ))}
      <form
        className="form-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            const res = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product: productId,
                rating: Number(f.get('rating')),
                title: f.get('title'),
                body: f.get('body'),
              }),
            });
            const r = await res.json();
            setMessage(
              res.ok
                ? 'Thank you. Your review is awaiting moderation.'
                : r.error,
            );
          } catch {
            setMessage('Please retry.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <h3>Share your experience</h3>
        <p>Sign in to submit a review. Reviews appear after moderation.</p>
        <label>
          Rating
          <select name="rating">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input name="title" maxLength={200} />
        </label>
        <label>
          Review
          <textarea name="body" required minLength={5} maxLength={5000} />
        </label>
        <button className="primary-button" disabled={busy}>
          Submit review
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
