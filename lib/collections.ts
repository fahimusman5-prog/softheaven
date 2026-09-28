import { products } from '@/lib/data';

export type SoftHavenCollection = {
  slug: string;
  name: string;
  description: string;
  featured: boolean;
  symbol: string;
  tone: 'cream' | 'blue' | 'mint' | 'rose' | 'lavender' | 'sky';
  productIds: string[];
  image?: string;
  imageAlt?: string;
};

// Product links reflect the real catalogue entries currently available in this repository.
// Empty product lists stay explicit until matching puppy, kitty, and fantasy products are added.
export const collections: SoftHavenCollection[] = [
  {
    slug: 'teddy-classic-cuddles',
    name: 'Teddy & Classic Cuddles',
    description: 'Timeless teddy companions made for warm, everyday hugs.',
    featured: true,
    symbol: '♡',
    tone: 'cream',
    productIds: ['aurelius', 'amour'],
    image: '/images/collections/teddy-classic-cuddles.webp',
    imageAlt: 'A group of teddy and classic plush companions nestled together on soft clouds',
  },
  {
    slug: 'bunny-sweet-friends',
    name: 'Bunny & Sweet Friends',
    description: 'Gentle, lovable friends with the sweetest personalities.',
    featured: true,
    symbol: '✧',
    tone: 'blue',
    productIds: ['celeste'],
    image: '/images/collections/bunny-sweet-friends.webp',
    imageAlt: 'A group of pastel bunny friends gathered together on a soft cloud bed',
  },
  {
    slug: 'puppy-pals',
    name: 'Puppy Pals',
    description: 'Playful puppy companions ready for cuddles and everyday adventures.',
    featured: false,
    symbol: '⌁',
    tone: 'rose',
    productIds: [],
  },
  {
    slug: 'wild-wonderful',
    name: 'Wild & Wonderful',
    description: 'Playful characters and wonderfully wild companions.',
    featured: true,
    symbol: '✿',
    tone: 'mint',
    productIds: ['oliver'],
    image: '/images/collections/wild-wonderful.webp',
    imageAlt: 'A group of wild and wonderful plush animal friends gathered together',
  },
  {
    slug: 'kitty-corner',
    name: 'Kitty Corner',
    description: 'Soft little feline friends with plenty of personality.',
    featured: false,
    symbol: '⌂',
    tone: 'lavender',
    productIds: [],
  },
  {
    slug: 'fantasy-friends',
    name: 'Fantasy Friends',
    description: 'Whimsical companions made for imaginations big and small.',
    featured: false,
    symbol: '✧',
    tone: 'sky',
    productIds: [],
  },
];

export function getSoftHavenCollection(slug?: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function getCollectionProducts(collection: SoftHavenCollection) {
  return products.filter((product) => collection.productIds.includes(product.id));
}
