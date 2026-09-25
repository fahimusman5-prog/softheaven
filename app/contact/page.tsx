'use client';
import { useState } from 'react';
import { siteConfig } from '@/lib/site-config';

const channels = [
  { name: 'Email', detail: siteConfig.contact.email ?? 'Not configured yet', href: siteConfig.contact.email ? `mailto:${siteConfig.contact.email}` : null },
  { name: 'WhatsApp', detail: siteConfig.social.whatsapp ?? 'Not configured yet', href: siteConfig.social.whatsapp },
  { name: 'Instagram', detail: siteConfig.social.instagram ?? 'Not configured yet', href: siteConfig.social.instagram },
  { name: 'Facebook', detail: siteConfig.social.facebook ?? 'Not configured yet', href: siteConfig.social.facebook },
  { name: 'TikTok', detail: siteConfig.social.tiktok ?? 'Not configured yet', href: siteConfig.social.tiktok },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const verifiedChannels = channels.filter((channel) => channel.href);

  return <div className="contact-page contact-page--enhanced">
    <div className="page-intro compact"><span className="eyebrow">The SoftHaven concierge</span><h1>How can we make it softer?</h1><p>Questions about an order, a thoughtful gift or caring for a companion? Find the channel that works for you.</p></div>
    <aside className="contact-information" aria-labelledby="contact-options-title">
      <h2 id="contact-options-title">A note from the atelier</h2>
      <p>We keep our public contact details verified. Channels without a confirmed address stay unpublished rather than sending you to an unverified account.</p>
      <div className="contact-channel-list">{(verifiedChannels.length ? verifiedChannels : channels).map((channel) => <div className="contact-channel" key={channel.name}>
        <span><strong>{channel.name}</strong><small>{channel.detail}</small></span>{channel.href ? <a href={channel.href} aria-label={`Contact SoftHaven via ${channel.name}`} target={channel.href.startsWith('http') ? '_blank' : undefined} rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}>↗</a> : <span aria-label={`${channel.name} not configured`}>—</span>}
      </div>)}</div>
      {!verifiedChannels.length && <p className="contact-note">No verified public contact destinations are configured yet.</p>}
    </aside>
    <div className="contact-form-column" id="message-form">
      {sent ? <div className="success-panel"><span className="success-mark">✓</span><h2>Your note is ready.</h2><p>This preview form does not send or store messages yet. Please use a verified contact channel once one is configured.</p></div> : <form className="contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
        <h2>How can we help?</h2>
        <label>Your name<input required placeholder="Your name" autoComplete="name" /></label>
        <label>Email address<input required type="email" placeholder="you@example.com" autoComplete="email" /></label>
        <label>How can we help?<select defaultValue=""><option value="" disabled>Select a topic</option><option>Order & delivery</option><option>Gifting guidance</option><option>Care & restoration</option><option>Something else</option></select></label>
        <label>Your message<textarea required placeholder="Tell us a little about what you need..." /></label>
        <button className="primary-button" type="submit">Prepare your note →</button>
        <p className="contact-note">This form is a local preview and does not submit information.</p>
      </form>}
    </div>
  </div>;
}
