import Link from 'next/link';
import { products } from '@/lib/data';
import { ProductMedia } from '@/components/product-media';

const collectionNotes: Record<string, string> = {
  'Teddy Bear Collection': 'Classic companions, ready to be met.',
  'Soft Animal Friends': 'A little animal friend for every day.',
  'Love & Gifting': 'Keepsake-worthy gifts for someone special.',
};

const collections = Array.from(new Set(products.map((product) => product.category)))
  .map((category) => ({
    category,
    product: products.find((product) => product.category === category),
  }))
  .filter((collection) => collection.product);

export function HomeCollections() {
  if (!collections.length) return null;

  return (
    <section className="home-collections" aria-labelledby="home-collections-title">
      <div className="home-collections__heading">
        <div>
          <span className="eyebrow">Find your soft side</span>
          <h2 id="home-collections-title">Choose your perfect match</h2>
        </div>
        <p>Browse the SoftHaven world by the kind of companion you love.</p>
      </div>
      <div className="home-collections__grid">
        {collections.map(({ category, product }, index) => product && (
          <Link
            className={`home-collection-tile${index === 0 ? ' home-collection-tile--featured' : ''}`}
            href={`/shop?category=${encodeURIComponent(category)}`}
            key={category}
          >
            <ProductMedia
              product={product}
              alt={product.name}
              fit="cover"
              fill
              sizes="(max-width: 700px) 90vw, (max-width: 1024px) 44vw, (max-width: 1400px) 30vw, 400px"
              className="home-collection-tile__image"
            />
            <span className="home-collection-tile__veil" aria-hidden="true" />
            <span className="home-collection-tile__copy">
              <small>Explore the collection</small>
              <strong>{category}</strong>
              <span>{collectionNotes[category] ?? 'Meet the companions in this collection.'}</span>
            </span>
            <span className="home-collection-tile__arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
