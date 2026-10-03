import Image from 'next/image';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/icons';
export function AccountIcon({ name }: { name: string }) {
  const paths: Record<string,string> = { heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z', star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z', pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9' };
  if (!paths[name]) return <AdminIcon name={name} />;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function AccountArt({ kind = 'teddy', className = '' }: { kind?: 'teddy' | 'friends' | 'bunny'; className?: string }) {
  const src = kind === 'teddy' ? '/images/softhaven/experience/softhaven-experience-teddy-cloud.webp' : kind === 'friends' ? '/assets/home-story/plush-cloud-cutout.webp' : '/assets/home-carousel-collections/bunny-640.webp';
  return <Image className={className} src={src} alt="" width={kind === 'friends' ? 900 : 640} height={kind === 'friends' ? 600 : 800} sizes="(max-width: 767px) 280px, 360px" unoptimized />;
}
export function AccountEmptyState({ wishlist = false }: { wishlist?: boolean }) {
  return <div className="account-empty"><AccountArt kind={wishlist ? 'friends' : 'teddy'} /><h3>{wishlist ? 'No favourites yet.' : 'No cuddles on their way… yet.'}</h3><p>{wishlist ? 'Tap the heart when a SoftHaven companion catches your eye.' : 'Your next SoftHaven friend might be waiting for you.'}</p><Link className="account-button" href="/shop">{wishlist ? 'Find your companion' : 'Explore the collection'}<AccountIcon name="arrow" /></Link></div>;
}
export function AccountLoadError() { return <div className="account-error" role="alert"><p>We couldn’t load this right now.</p><button type="button" className="account-button" onClick={() => window.location.reload()}>Try again</button></div>; }
