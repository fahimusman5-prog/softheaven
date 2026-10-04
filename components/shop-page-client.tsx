'use client';
import { StoreMotion } from '@/components/store-motion';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { ProductCard } from '@/components/product-card';
import { MAX_SEARCH_LENGTH, normalizeSearch } from '@/lib/search';
import { SectionReveal } from '@/components/section-reveal';
import { useCatalogue } from '@/components/catalogue-provider';

type ShopSearchParams = {
  search?: string | string[];
  category?: string | string[];
  collection?: string | string[];
};

export default function ShopPage({ params }: { params: ShopSearchParams }) {
  const { products, collections, categories: categoryRecords } = useCatalogue();
  const categories = useMemo(
    () => ['All', ...categoryRecords.map((c) => c.name)],
    [categoryRecords],
  );
  const getSoftHavenCollection = useCallback(
    (slug?: string) => collections.find((c) => c.slug === slug),
    [collections],
  );

  const searchValue = normalizeSearch(params.search);
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const requestedCollection = Array.isArray(params.collection)
    ? params.collection[0]
    : params.collection;
  const [category, setCategory] = useState(() =>
    requestedCategory && categories.includes(requestedCategory)
      ? requestedCategory
      : 'All',
  );
  const [collectionSlug, setCollectionSlug] = useState(
    () => getSoftHavenCollection(requestedCollection)?.slug,
  );
  const [query, setQuery] = useState(searchValue ?? '');
  const [sort, setSort] = useState('Featured');
  const selectedCollection = getSoftHavenCollection(collectionSlug);

  useEffect(() => {
    setQuery(searchValue ?? '');
    setCategory(
      requestedCategory && categories.includes(requestedCategory)
        ? requestedCategory
        : 'All',
    );
    setCollectionSlug(getSoftHavenCollection(requestedCollection)?.slug);
  }, [
    requestedCategory,
    requestedCollection,
    searchValue,
    categories,
    getSoftHavenCollection,
  ]);

  const visible = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (selectedCollection
              ? selectedCollection.productIds.includes(product.id)
              : category === 'All' || product.category === category) &&
            product.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'Price: low to high'
            ? a.price - b.price
            : sort === 'Price: high to low'
              ? b.price - a.price
              : 0,
        ),
    [category, query, selectedCollection, sort, products],
  );

  return (
    <StoreMotion><div className="shop-page">
      <section className="page-intro">
        <span className="eyebrow">The SoftHaven atelier</span>
        <h1>{selectedCollection?.name ?? 'Shop the collection'}</h1>
        <p>
          {selectedCollection?.description ??
            'Companions for gifting, collecting, and creating a softer room.'}
        </p>
      </section>
      <div className="shop-toolbar" id="collections">
        <div className="category-tabs">
          {categories.map((item) => (
            <button
              className={
                !selectedCollection && category === item ? 'active' : ''
              }
              key={item}
              onClick={() => {
                setCollectionSlug(undefined);
                setCategory(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="shop-controls">
          <label className="search-field">
            ⌕
            <input
              aria-label="Search products"
              maxLength={MAX_SEARCH_LENGTH}
              value={query}
              onChange={(event) => setQuery(normalizeSearch(event.target.value))}
              placeholder="Search companions"
            />
          </label>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option>Featured</option>
            <option>Price: low to high</option>
            <option>Price: high to low</option>
          </select>
        </div>
      </div>
      <SectionReveal>
        <div className="shop-grid" aria-live="polite" aria-label="Product results">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </SectionReveal>
      {visible.length === 0 && (
        <div className="empty-state">
          <h2>
            {selectedCollection
              ? `${selectedCollection.name} is growing`
              : 'No soft companions found'}
          </h2>
          <p>
            {selectedCollection && !selectedCollection.productIds.length
              ? 'We are still adding real companions to this collection. Check back soon, or meet the friends already in the shop.'
              : 'Try another search or browse the full collection.'}
          </p>
          <button
            className="text-button"
            onClick={() => {
              setQuery('');
              setCategory('All');
              setCollectionSlug(undefined);
            }}
          >
            Browse all companions →
          </button>
        </div>
      )}
    </div></StoreMotion>
  );
}
