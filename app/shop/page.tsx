'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';

const categories = ['All', 'Teddy Bear Collection', 'Love & Gifting', 'Soft Animal Friends'];
type ShopSearchParams = { search?: string | string[]; category?: string | string[] };

export default function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const params = use(searchParams);
  const searchValue = Array.isArray(params.search) ? params.search[0] : params.search;
  const requestedCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const [category, setCategory] = useState(() => requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'All');
  const [query, setQuery] = useState(searchValue ?? '');
  const [sort, setSort] = useState('Featured');

  useEffect(() => {
    if (searchValue !== undefined) setQuery(searchValue);
    if (requestedCategory && categories.includes(requestedCategory)) setCategory(requestedCategory);
  }, [requestedCategory, searchValue]);

  const visible = useMemo(() => products
    .filter((product) => (category === 'All' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : 0), [category, query, sort]);

  return (
    <div className="shop-page">
      <section className="page-intro">
        <span className="eyebrow">The SoftHaven atelier</span>
        <h1>Shop the collection</h1>
        <p>Companions for gifting, collecting, and creating a softer room.</p>
      </section>
      <div className="shop-toolbar" id="collections">
        <div className="category-tabs">
          {categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="shop-controls">
          <label className="search-field">⌕<input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companions"/></label>
          <select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select>
        </div>
      </div>
      <div className="shop-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>
      {visible.length === 0 && <div className="empty-state"><h2>No soft companions found</h2><p>Try another search or browse the full collection.</p><button className="text-button" onClick={() => { setQuery(''); setCategory('All'); }}>Reset filters →</button></div>}
    </div>
  );
}
