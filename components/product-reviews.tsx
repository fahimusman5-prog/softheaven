'use client';
import { useEffect, useState } from 'react';
export type ReviewSummary = { count: number; average: number; distribution: number[] };
type Review = {
  created_at?: string;
  id: string;
  rating: number;
  title: string;
  body: string;
  verified_purchase: boolean;
  reply: string | null;
};
export function ProductReviews({ productId, onSummary }: { productId: string; onSummary?: (summary: ReviewSummary) => void }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reviews?product=' + encodeURIComponent(productId), { signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error('Unable to load reviews'); return r.json(); })
      .then(r => { setReviews(r.reviews ?? []); setSummary(r.summary); onSummary?.(r.summary); setLoading(false); })
      .catch(() => { if (!controller.signal.aborted) { setMessage('Reviews could not be loaded. Please refresh to retry.'); setLoading(false); } });
    return () => controller.abort();
  }, [productId, onSummary]);
  return (
    <section className="pdp-reviews" id="customer-love" aria-labelledby="pdp-reviews-title">
      <div className="pdp-section-heading"><div><p className="pdp-eyebrow">From your homes, with love</p><h2 id="pdp-reviews-title">Customer <em>love.</em></h2></div><a href="#write-review">Write a review ↗</a></div>
      <div className="pdp-review-overview"><div><strong className="pdp-review-average">{loading ? '…' : summary?.count ? summary.average.toFixed(1) : '—'}</strong><p>{loading ? 'Loading customer reviews' : summary?.count ? `${summary.count} reviews · out of 5` : message || 'No reviews yet. Be the first to share a little love.'}</p></div><div className="pdp-rating-bars" aria-label="Rating distribution">{[5,4,3,2,1].map(n => <div key={n}><span>{n} <span aria-hidden="true">★</span></span><meter min={0} max={summary?.count || 1} value={summary?.distribution[n-1] ?? 0} aria-label={`${n} stars: ${summary?.distribution[n-1] ?? 0} reviews`}/><span>{summary?.distribution[n-1] ?? 0}</span></div>)}</div></div>
      <div className="pdp-review-cards">{reviews.map(r => <article className="pdp-review-card" key={r.id}><div><span className="pdp-stars" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>{r.verified_purchase && <small>Verified purchase</small>}{r.created_at && <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Colombo' })}</time>}</div><h3>{r.title || 'Customer review'}</h3><p>{r.body}</p>{r.reply && <blockquote><strong>SoftHaven</strong><p>{r.reply}</p></blockquote>}</article>)}</div>
      {summary && summary.count > reviews.length && <p>Showing the latest {reviews.length} customer reviews.</p>}
      <form
        className="pdp-review-form"
        id="write-review"
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
        <button className="pdp-add" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit review'}
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
