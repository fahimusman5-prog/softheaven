import type { Metadata } from 'next';
import { ContactExperience } from './contact-experience';
import './contact.css';
export const metadata: Metadata = { title: 'Contact Us', description: 'Get in touch with SoftHaven Sri Lanka for product and order assistance.' };
export default function ContactPage() {
  return <ContactExperience configuration={{ whatsappNumber: process.env.WHATSAPP_NUMBER, facebookUrl: process.env.FACEBOOK_URL, instagramUrl: process.env.INSTAGRAM_URL, tiktokUrl: process.env.TIKTOK_URL }} />;
}
