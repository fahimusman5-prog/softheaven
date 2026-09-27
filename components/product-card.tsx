'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Product } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { useCart } from './cart-provider';
import { ProductMedia } from './product-media';
export function ProductCard({ product }: { product: Product }) { const { add } = useCart(); const [added, setAdded] = useState(false); const reduceMotion = useReducedMotion(); return <article className="product-card"><motion.div whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.22, ease: 'easeOut' }}><div className="product-image"><Link href={`/product/${product.slug}`}><ProductMedia product={product} alt={product.name} fit="cover"/></Link><button className="heart" aria-label={`Save ${product.name}`}>♡</button></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.color}</p></div><div className="price-stack"><strong>{formatPrice(product.price)}</strong>{product.compareAt && <del>{formatPrice(product.compareAt)}</del>}</div></div><motion.button className={`card-add ${added ? 'added' : ''}`} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={() => { add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1200); }}>{added ? 'Added to bag ✓' : 'Add to bag +'}</motion.button></motion.div></article>; }
