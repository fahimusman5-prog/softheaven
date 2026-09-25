import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SectionReveal } from '@/components/section-reveal';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore the SoftHaven plush companions by collection and feeling.',
};

const groupedCollections = Array.from(
  products.reduce((groups, product) => {
    const group = groups.get(product.category) ?? [];
    group.push(product);
    groups.set(product.category, group);
    return groups;
  }, new Map<string, typeof products>()).entries(),
).map(([name, items]) => ({ name, items, lead: items[0] }));

function collectionHref(name: string) {
  return `/shop?category=${encodeURIComponent(name)}`;
}

export default function CollectionsPage() {
  const heroProducts = products.slice(0, 3);
  const featured = groupedCollections[0];
  const secondary = groupedCollections.slice(1);
  const discovery = products.slice().reverse();

  return (
    <div className="softhaven-collections">
      <section className="collections-hero">
        <div className="collections-hero__copy">
          <span className="eyebrow">A softer world, by feeling</span>
          <h1>Find your<br /><em>kind of soft.</em></h1>
          <p>Thoughtful companions for tender moments, meaningful gifts and the little comforts that make a place feel like yours.</p>
          <Link className="primary-button" href="#collection-edits">Explore the collections →</Link>
        </div>
        <div className="collections-hero__art" aria-label="SoftHaven collection highlights">
          {heroProducts.map((product) => <Image key={product.id} src={product.image} alt={product.name} fill priority={product.id === heroProducts[0]?.id} sizes="(max-width: 767px) 80vw, 38vw" />)}
        </div>
      </section>

      <SectionReveal>
        <section id="collection-edits" className="collection-editorial" aria-labelledby="featured-collection-title">
          <div className="collection-editorial__image"><Image src={featured.lead.image} alt={featured.lead.name} fill sizes="(max-width: 767px) 92vw, 48vw" data-sky-editorial-image /></div>
          <div className="collection-editorial__copy"><span>01 / Featured collection</span><h2 id="featured-collection-title">{featured.name}</h2><p>{featured.lead.description}</p><Link className="primary-button" href={collectionHref(featured.name)}>Explore this collection →</Link></div>
        </section>
      </SectionReveal>

      <div className="collections-intro"><h2>More ways to feel at home.</h2><p>Each edit is drawn from the current SoftHaven catalogue—choose a feeling to see its available companions.</p></div>

      {secondary.map((collection, index) => (
        <SectionReveal key={collection.name}>
          <section className={`collection-editorial${index % 2 === 0 ? ' collection-editorial--reverse' : ''}`} aria-labelledby={`collection-${index}-title`}>
            <div className="collection-editorial__image"><Image src={collection.lead.image} alt={collection.lead.name} fill sizes="(max-width: 767px) 92vw, 48vw" data-sky-editorial-image /></div>
            <div className="collection-editorial__copy"><span>{String(index + 2).padStart(2, '0')} / Collection edit</span><h2 id={`collection-${index}-title`}>{collection.name}</h2><p>{collection.lead.description}</p><Link className="primary-button" href={collectionHref(collection.name)}>Explore this collection →</Link></div>
          </section>
        </SectionReveal>
      ))}

      <section className="collection-quick-links" aria-label="Browse collections">
        {groupedCollections.map((collection) => <Link key={collection.name} href={collectionHref(collection.name)}>{collection.name} <span aria-hidden="true">↗</span></Link>)}
      </section>

      <SectionReveal>
        <section className="collections-discovery" aria-labelledby="discovery-title">
          <span className="eyebrow">A little help choosing</span><h2 id="discovery-title">Start with a favourite.</h2><p>Meet the companions currently in the SoftHaven collection.</p>
          <div className="collections-discovery__items">{discovery.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      </SectionReveal>

      <section className="collections-final-cta"><h2>Ready for a softer kind of day?</h2><p>Browse the complete SoftHaven catalogue and find the companion that feels right.</p><Link className="primary-button" href="/shop">Shop all companions →</Link></section>
    </div>
  );
}
