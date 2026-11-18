'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useCatalogue } from '@/components/catalogue-provider';
import { getContactConfig, type ContactOverrides } from '@/lib/contact/config';
import { whatsappHandoff } from '@/lib/contact/whatsapp';
import { whatsappContactSchema as contactSchema, enquiryTopics, orderTopics, type ContactField } from '@/lib/contact/schema';

function ContactIcon({ name }: { name: 'whatsapp' | 'facebook' | 'instagram' | 'tiktok' }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{name === 'facebook' ? <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.3a22 22 0 0 0-2.7-.2C11.5 2.1 9.8 3.8 9.8 7v2.5H7V13h2.8v9z" /> : name === 'instagram' ? <g fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></g> : name === 'tiktok' ? <path d="M14 2h3a5 5 0 0 0 5 5v3a8 8 0 0 1-5-1.7V16a6 6 0 1 1-6-6h1v3h-1a3 3 0 1 0 3 3z"/> : <><path fill="none" stroke="currentColor" strokeWidth="1.6" d="M20 11.5a8 8 0 0 1-11.6 7.2L4 20l1.3-4.4A8 8 0 1 1 20 11.5Z"/><path d="m9 7 2 3-1 1a7 7 0 0 0 3 3l1-1 3 2c-.4 2-2 2-3.2 1.5a11 11 0 0 1-6.3-6.3C7 9 7 7.4 9 7Z"/></>}</svg>;
}

export function ContactExperience({ configuration = {} }: { configuration?: ContactOverrides }) {
  const { settings, navigation } = useCatalogue();
  const contact = getContactConfig(settings, configuration);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [handoff, setHandoff] = useState('');
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Partial<Record<ContactField, string>>>({});
  const result = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elements = root.current?.querySelectorAll('.concierge-reveal');
    if (!elements || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
    elements.forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (success) result.current?.focus(); }, [success]);
  const channels = [
    { icon: 'whatsapp' as const, title: 'Chat With Us', description: 'Our friendly team is just a message away.', action: 'Chat on WhatsApp', href: contact.whatsapp, tone: 'sage' },
    { icon: 'facebook' as const, title: 'Find Us on Facebook', description: 'Follow SoftHaven for updates, new arrivals, and special moments.', action: 'Visit Facebook', href: contact.facebook, tone: 'lavender' },
    { icon: 'instagram' as const, title: 'Follow Our Little World', description: 'Discover beautiful companions, gifting inspiration, and more.', action: 'Visit Instagram', href: contact.instagram, tone: 'blush' },
    { icon: 'tiktok' as const, title: 'See the Magic', description: 'Explore playful videos and the softer side of SoftHaven.', action: 'Visit TikTok', href: contact.tiktok, tone: 'lavender' },
  ].filter(channel => channel.href);
  // Use only policy destinations actually present in public navigation, never invented routes.
  function policy(pattern: RegExp) {
    const item = navigation.find(n => pattern.test(n.label) && /^\/(?!\/)/.test(n.url));
    return item ? <Link href={item.url}>{item.label} ↗</Link> : null;
  }
  const shippingPolicy = policy(/shipping|delivery/i);
  const returnPolicy = policy(/return|exchange/i);
  const privacyPolicy = policy(/privacy/i);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse({ ...data, orderNumber: data.orderNumber || '' });
    setError(''); setFields({});
    if (!parsed.success) {
      const errors: Partial<Record<ContactField, string>> = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as ContactField] = issue.message;
      setFields(errors);
      const name = parsed.error.issues[0]?.path[0];
      if (typeof name === 'string') (form.elements.namedItem(name) as HTMLElement | null)?.focus();
      return;
    }
    try {
      const href = whatsappHandoff(contact.whatsapp, parsed.data);
      setPending(true); setHandoff(href);
      window.open(href, '_blank', 'noopener,noreferrer');
      setSuccess(true);
    } catch { setError('WhatsApp is temporarily unavailable. Please try again later.'); }
    finally { setPending(false); }
  }
  function fieldError(name: ContactField) { return fields[name] ? <span className="concierge-field-error" id={`${name}-error`}>{fields[name]}</span> : null; }
  function fieldProps(name: ContactField) { return { 'aria-invalid': Boolean(fields[name]), 'aria-describedby': fields[name] ? `${name}-error` : undefined }; }

  return <div className="contact-page concierge" ref={root}>
    <header className="concierge-hero">
      <span className="concierge-eyebrow">The SoftHaven concierge</span>
      <h1>How can we make it <em>softer?</em> <span className="concierge-heart" aria-hidden="true">♡</span></h1>
      <p>Every little question deserves a little care. Whether you’re choosing the perfect cuddly companion, tracking an order, or simply saying hello, we’re always happy to help.</p>
      <span className="concierge-hero-signoff">A little closer. A little softer.</span>
    </header>

    {channels.length > 0 && <section className="concierge-channels concierge-reveal" aria-label="Ways to get in touch">
      {channels.map((channel, index) => <article className={`concierge-channel concierge-channel--${channel.tone}`} key={channel.icon}>
        <div className="concierge-channel-top"><span className="concierge-icon"><ContactIcon name={channel.icon} /></span><span className="concierge-number">0{index + 1}</span></div>
        <h2>{channel.title}</h2><p>{channel.description}</p>
        {channel.href ? <><a className="concierge-channel-action" href={channel.href} target="_blank" rel="noopener noreferrer">{channel.action}<span aria-hidden="true">↗</span></a></> : <div className="concierge-channel-unavailable"><span>Not available just yet</span><small>Find order details in <Link href="/account">your account ↗</Link></small></div>}
      </article>)}
    </section>}

    <section className="concierge-note concierge-reveal" id="little-note" aria-labelledby="little-note-title">
      <div className="concierge-section-heading"><span className="concierge-eyebrow">A little message, a lot of love</span><h2 id="little-note-title">Send us a little <em>note</em> <span aria-hidden="true">♡</span></h2><p>Tell us how we can help, and we’ll make your day a little softer.</p></div>
      <div className="concierge-note-grid">
        <div className="concierge-form-surface">
          {success ? <div className="concierge-success" tabIndex={-1} ref={result} role="status"><span aria-hidden="true">♡</span><h3>Your message is ready ♡</h3><p>WhatsApp will open with your message ready to send. Please review it and tap Send in WhatsApp.</p><a className="concierge-button" href={handoff} target="_blank" rel="noopener noreferrer">Open your WhatsApp message ↗</a><button className="concierge-button" onClick={() => { setSuccess(false); setCount(0); setTopic(''); }}>Write another note ↗</button></div> : <form className="concierge-form" onSubmit={submit} noValidate aria-busy={pending}>
            <div className="concierge-form-intro"><span>01 / YOUR LITTLE NOTE</span><span aria-hidden="true">♡</span></div>
            <p className="concierge-required">Asterisks (*) mark required fields.</p>
            <div className="concierge-field-pair"><label>Your name *<input name="name" autoComplete="name" placeholder="What should we call you?" required minLength={2} maxLength={100} {...fieldProps('name')} />{fieldError('name')}</label><label>Email address (optional)<input name="email" type="email" autoComplete="email" placeholder="yourname@example.com" maxLength={254} {...fieldProps('email')} />{fieldError('email')}</label></div>
            <div className="concierge-field-pair"><label>Phone number *<input name="phone" type="tel" required autoComplete="tel" placeholder="Your contact number" maxLength={40} {...fieldProps('phone')} />{fieldError('phone')}</label><label>What can we help you with? *<select name="topic" required value={topic} onChange={e => setTopic(e.target.value)} {...fieldProps('topic')}><option value="" disabled>Select an enquiry</option>{enquiryTopics.map(item => <option key={item}>{item}</option>)}</select>{fieldError('topic')}</label></div>
            {orderTopics.includes(topic) && <label>Order number <span className="concierge-optional">(optional)</span><input name="orderNumber" placeholder="Your SoftHaven order number" maxLength={80} {...fieldProps('orderNumber')} />{fieldError('orderNumber')}</label>}
            <label>Your message *<textarea name="message" placeholder="Tell us a little about how we can help…" required minLength={10} maxLength={4000} rows={5} onChange={e => setCount(e.target.value.length)} {...fieldProps('message')} />{fieldError('message')}</label><span className="concierge-count">{count.toLocaleString()} / 4,000</span>
            <div className="concierge-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            {!contact.whatsapp && <p className="concierge-service-note">WhatsApp support is not available yet. Your order information is available in <Link href="/account">your account ↗</Link>.</p>}
            {error && <p className="concierge-submit-error" role="alert">{error}</p>}
            <button className="concierge-button concierge-submit" type="submit" disabled={pending || !contact.whatsapp}>{pending ? 'Opening WhatsApp…' : 'Continue to WhatsApp ♡'}<span aria-hidden="true">↗</span></button>
            <p className="concierge-privacy">WhatsApp will open with your message ready to send. Your details are shared with WhatsApp when you continue. {privacyPolicy}</p>
          </form>}
        </div>
        <aside className="concierge-companions" aria-label="A little SoftHaven comfort">
          <div className="concierge-art-note">A little comfort,<br /><em>while we take care of you.</em><span aria-hidden="true">♡</span></div>
          <Image src="/assets/home-story/plush-cloud-cutout.webp" alt="A caramel teddy with a lavender ribbon and a cream bunny nestled together on a soft pastel cloud" width={920} height={587} sizes="(max-width: 767px) 90vw, 45vw" className="concierge-plush" />
          <div className="concierge-companion-caption"><span className="concierge-eyebrow">Thoughtful gifts. Everyday comfort.</span><h3>Care is in the little things.</h3><p>Choosing a companion? Tell us who you have in mind. We’re happy to help you find a little happiness.</p><Link href="/shop">Meet the companions <span aria-hidden="true">↗</span></Link></div>
        </aside>
      </div>
    </section>

    <section className="concierge-faq concierge-reveal" aria-labelledby="contact-faq-title">
      <div className="concierge-section-heading"><span className="concierge-eyebrow">Here to help</span><h2 id="contact-faq-title">A little help, <em>right away</em> <span aria-hidden="true">♡</span></h2><p>Find quick answers to some of the questions our SoftHaven family asks most.</p></div>
      <div className="concierge-faq-list">
        <details><summary>How can I track my SoftHaven order?<span aria-hidden="true" /></summary><div><p>Sign in to <Link href="/account">your SoftHaven account</Link> to view your orders. Open an order for its details; tracking information appears when it has been added. Include your order number when asking us for help.</p></div></details>
        <details><summary>How long does delivery take?<span aria-hidden="true" /></summary><div><p>Delivery charges for your address are calculated at checkout. For delivery timing or an update on an existing order, send us an enquiry with your order number and delivery area. {shippingPolicy}</p></div></details>
        <details><summary>Can I send a SoftHaven toy as a gift?<span aria-hidden="true" /></summary><div><p>Explore <Link href="/shop">our companions</Link> for someone special. For help choosing a gift or checking a particular request, select “Gift Enquiry” in your note. Please check with us before ordering if you need any special arrangements.</p></div></details>
        <details><summary>What should I do if my order arrives damaged?<span aria-hidden="true" /></summary><div><p>Please contact us with your order number and a description of the damage. Keep the item and its packaging while our team advises you on the next steps. {returnPolicy}</p></div></details>
        <details><summary>Can I change or cancel my order?<span aria-hidden="true" /></summary><div><p>Contact us as soon as possible with your order number and the change you’d like to make. Our team will check what is possible for your order. Changes and cancellations cannot be guaranteed.</p></div></details>
      </div>
    </section>

    <section className="concierge-cta concierge-reveal" aria-labelledby="contact-cta-title"><span className="concierge-eyebrow">We’re always happy to hear from you</span><h2 id="contact-cta-title">A little happiness is just<br />a message <em>away.</em> <span aria-hidden="true">♡</span></h2><p>Big questions or tiny worries, we’re here to make your SoftHaven experience a little sweeter.</p>{contact.whatsapp ? <a className="concierge-button" href={contact.whatsapp} target="_blank" rel="noopener noreferrer">Let’s Chat on WhatsApp <span aria-hidden="true">↗</span></a> : <p>WhatsApp support will be available once our contact details are confirmed.</p>}<span className="concierge-cta-signature">With love, SoftHaven</span></section>
  </div>;
}
