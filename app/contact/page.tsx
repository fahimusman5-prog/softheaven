'use client';
import { StoreMotion } from '@/components/store-motion';

import { useState, type FormEvent } from 'react';
import { useCatalogue } from '@/components/catalogue-provider';
import './contact.css';
import '@/components/policy-page.css';
import { resolveBusiness, isConfirmed } from '@/lib/business';
import { BusinessDetails } from '@/components/business-details';

type Channel = {
  name: string;
  detail: string;
  icon: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok';
};

function LineIcon({
  name,
  className = '',
}: {
  name: Channel['icon'] | 'person' | 'message' | 'pencil' | 'send' | 'arrow';
  className?: string;
}) {
  const shared = {
    'aria-hidden': true as const,
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'email')
    return (
      <svg {...shared}>
        <rect x="3.3" y="5.2" width="17.4" height="13.6" rx="2.2" />
        <path d="m4.2 7 7.8 6 7.8-6" />
      </svg>
    );
  if (name === 'whatsapp')
    return (
      <svg {...shared}>
        <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.1l-4.3 1.1 1.2-4.1a8.2 8.2 0 1 1 15.2-4.1Z" />
        <path d="M8.4 8.1c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.6.7c-.2.2-.2.4 0 .7.6 1 1.5 1.8 2.6 2.3.3.1.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.6.8c.3.2.4.3.4.5 0 .3-.1 1.1-.7 1.6-.6.6-1.5.8-2.3.6-.8-.2-1.8-.6-3.1-1.6-1.2-.9-2.1-2.1-2.6-3.1-.6-1-.6-1.9-.4-2.4Z" />
      </svg>
    );
  if (name === 'instagram')
    return (
      <svg {...shared}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.7" />
        <circle cx="17.6" cy="6.7" r=".9" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === 'facebook')
    return (
      <svg {...shared}>
        <path d="M14.2 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8v3.1h2.8v8h3.4Z" />
      </svg>
    );
  if (name === 'tiktok')
    return (
      <svg {...shared}>
        <path d="M14 4v10.2a3.6 3.6 0 1 1-3-3.5" />
        <path d="M14 4c.4 2.7 2.1 4.3 4.8 4.5" />
      </svg>
    );
  if (name === 'person')
    return (
      <svg {...shared}>
        <circle cx="12" cy="8" r="3.3" />
        <path d="M5.3 20c.4-3.2 2.9-5.2 6.7-5.2s6.3 2 6.7 5.2" />
      </svg>
    );
  if (name === 'message')
    return (
      <svg {...shared}>
        <path d="M20 11.4a7.5 7.5 0 0 1-7.8 7.3 8.8 8.8 0 0 1-3.1-.6L4 19.7l1.3-4.1a7 7 0 0 1-1.3-4.2 7.5 7.5 0 0 1 7.8-7.3 7.5 7.5 0 0 1 8.2 7.3Z" />
        <path d="M8.2 11.7h.1m3.7 0h.1m3.7 0h.1" strokeWidth="2.8" />
      </svg>
    );
  if (name === 'pencil')
    return (
      <svg {...shared}>
        <path d="m14.8 5.2 4 4L8.3 19.7l-4.7 1 1-4.7L14.8 5.2Z" />
        <path d="m12.9 7.1 4 4M3.8 20.7h5" />
      </svg>
    );
  if (name === 'send')
    return (
      <svg {...shared}>
        <path d="m21 3-7.2 18-3.8-7-7-3.8L21 3Z" />
        <path d="M10 14 21 3" />
      </svg>
    );
  return (
    <svg {...shared}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ContactPage() {
  const { settings } = useCatalogue();
  const business = resolveBusiness(settings);
  const siteConfig = {
    contact: { email: isConfirmed(business.supportEmail) ? business.supportEmail : null },
    social: settings.social ?? {},
  };
  const channels: (Channel & { href: string | null })[] = [
    {
      name: 'Email',
      detail: siteConfig.contact.email ?? 'No public address',
      icon: 'email',
      href: siteConfig.contact.email
        ? `mailto:${siteConfig.contact.email}`
        : null,
    },
    {
      name: 'WhatsApp',
      detail: siteConfig.social.whatsapp
        ? 'Chat with our team'
        : 'No public chat link',
      icon: 'whatsapp',
      href: siteConfig.social.whatsapp,
    },
    {
      name: 'Instagram',
      detail: siteConfig.social.instagram
        ? 'Visit our profile'
        : 'No public profile',
      icon: 'instagram',
      href: siteConfig.social.instagram,
    },
    {
      name: 'Facebook',
      detail: siteConfig.social.facebook ? 'Visit our page' : 'No public page',
      icon: 'facebook',
      href: siteConfig.social.facebook,
    },
    {
      name: 'TikTok',
      detail: siteConfig.social.tiktok
        ? 'Visit our profile'
        : 'No public profile',
      icon: 'tiktok',
      href: siteConfig.social.tiktok,
    },
  ];
  const hasConfiguredChannels = channels.some((channel) =>
    Boolean(channel.href),
  );
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!siteConfig.contact.email) { setNotice('Support email is not configured yet. No message has been sent.'); return; }
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent('SoftHaven support: ' + String(data.get('topic')));
    const body = encodeURIComponent('Name: ' + String(data.get('name')) + '\nReply email: ' + String(data.get('email')) + '\n\n' + message);
    window.location.href = 'mailto:' + siteConfig.contact.email + '?subject=' + subject + '&body=' + body;
    setNotice('Your email app will open. Send the message there to contact us.');
  }

  return (
    <StoreMotion><div className="contact-page contact-redesign">
      <header className="contact-hero">
        <span className="contact-eyebrow">The SoftHaven concierge</span>
        <h1>
          How can we make it <em>softer?</em>
          <span className="contact-heart" aria-hidden="true">
            ♡
          </span>
        </h1>
        <p>
          Questions about an order, a thoughtful gift or caring for a companion?
          <br className="contact-desktop-break" /> Find the channel that works
          for you. We’re here to help.
        </p>
      </header>

      <div className="contact-panels">
        <section
          className="contact-panel contact-channels"
          aria-labelledby="contact-channels-title"
        >
          <div className="contact-panel-heading">
            <h2 id="contact-channels-title">Let’s Stay in Touch</h2>
            <p>
              We keep our public contact details verified. Channels without a
              confirmed address stay unpublished rather than sending you to an
              unverified account.
            </p>
          </div>
          <ul className="contact-channel-list">
            {channels.map((channel) => (
              <li
                className={`contact-channel${channel.href ? ' is-available' : ''}`}
                key={channel.name}
              >
                <span
                  className={`contact-channel-icon contact-channel-icon--${channel.icon}`}
                >
                  <LineIcon name={channel.icon} />
                </span>
                <span className="contact-channel-copy">
                  <strong>{channel.name}</strong>
                  <small>{channel.detail}</small>
                </span>
                <span className="contact-channel-status">
                  {channel.href ? 'Available' : 'Unavailable'}
                </span>
                {channel.href ? (
                  <a
                    className="contact-channel-arrow"
                    href={channel.href}
                    aria-label={`Open SoftHaven ${channel.name}`}
                    target={
                      channel.href.startsWith('http') ? '_blank' : undefined
                    }
                    rel={
                      channel.href.startsWith('http') ? 'noreferrer' : undefined
                    }
                  >
                    <LineIcon name="arrow" />
                  </a>
                ) : (
                  <span className="contact-channel-arrow" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            ))}
          </ul>
          {!hasConfiguredChannels && (
            <p className="contact-verification">
              <span aria-hidden="true">ⓘ</span> No verified public contact
              destinations are configured yet.
            </p>
          )}
        </section>

        <section
          className="contact-panel contact-message-panel"
          aria-labelledby="contact-form-title"
        >
          <div className="contact-panel-heading contact-form-heading">
            <div>
              <h2 id="contact-form-title">Send us a message</h2>
              <p>
                Tell us a little about what you need. Your email app opens so you can review and send your message.
              </p>
            </div>
            <div className="contact-bear" aria-hidden="true">
              <img src="/assets/header-teddies.png" alt="" />
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field-row">
              <label className="contact-field contact-field--inline">
                <span className="sr-only">Your name</span>
                <LineIcon name="person" />
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="contact-field contact-field--inline">
                <span className="sr-only">Email address</span>
                <LineIcon name="email" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  required
                />
              </label>
            </div>

            <label className="contact-field contact-field--select">
              <LineIcon name="message" />
              <span className="contact-field-stack">
                <span>How can we help?</span>
                <select name="topic" defaultValue="" required>
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option>Order &amp; delivery</option>
                  <option>Gifting guidance</option>
                  <option>Companion care</option>
                  <option>Something else</option>
                </select>
              </span>
              <svg
                className="contact-chevron"
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </label>

            <label className="contact-field contact-field--textarea">
              <LineIcon name="pencil" />
              <span className="sr-only">
                Tell us a little about what you need
              </span>
              <textarea
                name="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={500}
                placeholder="Tell us a little about what you need..."
                required
              />
            </label>
            <div className="contact-count" aria-live="polite">
              {message.length}/500
            </div>
            <button className="contact-send" type="submit">
              <LineIcon name="send" /> <span>Compose email</span>{' '}
              <LineIcon name="arrow" />
            </button>
            <p className="contact-form-note">
              <span aria-hidden="true">♙</span> This form opens your email app; it does not send a message automatically.
            </p>
            {notice && (
              <p className="contact-form-notice" role="status">
                {notice}
              </p>
            )}
          </form>
        </section>
      </div>
      <section className="contact-business" aria-labelledby="business-title"><h2 id="business-title">Business &amp; support details</h2><BusinessDetails business={business}/><p>Bracketed information requires merchant confirmation before publication.</p></section>
    </div></StoreMotion>
  );
}
