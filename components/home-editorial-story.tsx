import Link from 'next/link';
import type { Product } from '@/lib/data';
import { ProductMedia } from '@/components/product-media';

export function HomeEditorialStory({ product }: { product: Product }) {
  return (
    <section className="home-editorial" aria-labelledby="home-editorial-title">
      <div className="home-editorial__visual" data-sky-editorial-image>
        <ProductMedia
          product={product}
          alt={product.name}
          fit="cover"
          fill
          sizes="(max-width: 700px) 92vw, (max-width: 1100px) 52vw, 680px"
          className="home-editorial__image"
        />
        <span className="home-editorial__image-caption">{product.category}</span>
      </div>
      <div className="home-editorial__copy">
        <span className="eyebrow">A softer kind of company</span>
        <h2 id="home-editorial-title">Meet your new companion</h2>
        <p>{product.description}</p>
        <div className="home-editorial__product">
          <span>In the SoftHaven collection</span>
          <strong>{product.name}</strong>
        </div>
        <Link className="text-button" href={`/product/${product.slug}`}>
          Meet this companion <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
