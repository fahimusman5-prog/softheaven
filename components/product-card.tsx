'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { useCart } from './cart-provider';
export function ProductCard({ product }: { product: Product }) { const { add } = useCart(); const [added, setAdded] = useState(false); return <article className="product-card"><Link href={`/product/${product.slug}`} className="product-image"><img src={product.image} alt={product.name}/><button className="heart" aria-label={`Save ${product.name}`} onClick={(event) => event.preventDefault()}>♡</button>{product.badge && <span className="badge">{product.badge}</span>}</Link><div className="product-info"><div><h3>{product.name}</h3><p>{product.color}</p></div><div className="price-stack"><strong>{formatPrice(product.price)}</strong>{product.compareAt && <del>{formatPrice(product.compareAt)}</del>}</div></div><button className={`card-add ${added ? 'added' : ''}`} onClick={() => { add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1200); }}>{added ? 'Added to bag ✓' : 'Add to bag +'}</button></article>; }
