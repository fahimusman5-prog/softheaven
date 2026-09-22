import type { Metadata } from 'next';
import { AboutPage as AboutExperience } from '@/components/about-page';

export const metadata: Metadata = {
  title: 'About SoftHaven',
  description: 'Meet ANTZ SoftHaven: plush companions, thoughtful gifts, and a softer way to shop.',
  openGraph: {
    title: 'About SoftHaven',
    description: 'Plush companions and thoughtful gifts for a softer everyday.',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutExperience />;
}
