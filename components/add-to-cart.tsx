'use client';
import { useState } from 'react';
import type { Product } from '@/lib/data';
import { useCart } from './cart-provider';
import { formatPrice } from '@/lib/format';
export function AddToCart({ product }: { product: Product }) { const { add } = useCart(); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false); return <div className="add-controls"><div className="quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(12, quantity + 1))}>+</button></div><button className="primary-button" onClick={() => { for (let i = 0; i < quantity; i += 1) add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1400); }}>{added ? 'Added to SoftHaven Bag ✓' : `Add to SoftHaven Bag — ${formatPrice(product.price * quantity)}`}</button></div>; }
