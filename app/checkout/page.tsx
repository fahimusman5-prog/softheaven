"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, getCartLineId } from "@/components/cart-provider";
import { ProductMedia } from "@/components/product-media";
import { formatPrice } from "@/lib/format";
import {
  paymentMethods,
  type PaymentMethod,
} from "@/lib/checkout/payment-methods";
import "./checkout.css";

type Address = {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  country: string;
};
type SavedAddress = Omit<Address, "country"> & { id: string };
type Customer = {
  profile: { name: string; phone: string } | null;
  addresses: SavedAddress[];
  balance: number | null;
};
type Rate = {
  id: string;
  name: string;
  rate: number;
  shipping_zones?: { active: boolean; districts?: string[] };
};
type Quote = {
  subtotal: number;
  shipping: number;
  discount: number;
  points_discount: number;
  total: number;
};
type Order = { id: string; order_number: number; total: number };
const blankAddress: Address = {
  name: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  country: "LK",
};
function Icon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    truck: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M1 10h6M1 14h4" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    card: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M2 9h20M6 15h4" />
      </>
    ),
    bank: (
      <>
        <path d="m2 7 10-5 10 5H2ZM3 21h18M5 10v8M10 10v8M15 10v8M20 10v8" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M10 5h4M11 18h2" />
      </>
    ),
    parcel: (
      <>
        <path d="m3 6 9-4 9 4v12l-9 4-9-4V6Zm0 0 9 4 9-4M12 10v12M7 4l10 4v5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="12" rx="3" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    pin: (
      <>
        <path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 14 0Z" />
        <circle cx="12" cy="9" r="2" />
      </>
    ),
    tag: (
      <>
        <path d="M3 3h9l9 9-9 9-9-9V3Z" />
        <circle cx="8" cy="8" r="1" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.pin}
    </svg>
  );
}
function CardHeading({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="sh-checkout__card-heading">
      <span className="sh-checkout__icon">
        <Icon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
export default function CheckoutPage() {
  const { lines, clear, update, remove } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [rate, setRate] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [address, setAddress] = useState<Address>(blankAddress);
  const [savedAddress, setSavedAddress] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [coupon, setCoupon] = useState("");
  const [points, setPoints] = useState(0);
  const [notes, setNotes] = useState("");
  const [quoteState, setQuoteState] = useState<{
    value: Quote;
    fingerprint: string;
  } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const lock = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const addressTouched = useRef(false);
  const selectedPayment = paymentMethods.find((p) => p.id === payment)!;
  const payload = {
    lines: lines.map((l) => ({
      variant_id: l.variant.id,
      quantity: l.quantity,
    })),
    address,
    rate,
    coupon,
    points,
    notes,
    paymentMethod: payment,
  };
  const fingerprint = JSON.stringify(payload);
  const quote =
    quoteState?.fingerprint === fingerprint ? quoteState.value : null;
  useEffect(() => {
    setHydrated(true);
    const controller = new AbortController();
    fetch("/api/checkout", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            "Delivery details could not be loaded. Please refresh to retry.",
          );
        return r.json();
      })
      .then((v) => {
        const active: Rate[] = (v.rates ?? []).filter(
          (r: Rate) => r.shipping_zones?.active !== false,
        );
        setRates(active);
        setRate(active[0]?.id ?? "");
        setCustomer(v.customer ?? null);
        if (!addressTouched.current && v.customer?.profile)
          setAddress((a) => ({
            ...a,
            name: v.customer.profile.name ?? "",
            phone: v.customer.profile.phone ?? "",
          }));
        setLoaded(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setMessage(
            "Delivery details could not be loaded. Please refresh to retry.",
          );
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const commit =
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
      "place";
    if (!selectedPayment.enabled) {
      setMessage(
        "This payment method requires configuration. Please choose cash on delivery.",
      );
      return;
    }
    if (commit && !quote) {
      setMessage("Review your updated total before placing the order.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, commit, key }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your order could not be prepared. Please retry.",
        );
      if (commit) {
        setOrder(result);
        clear();
        if (saveAddress && customer && !savedAddress) {
          try {
            const r = await fetch("/api/account", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "address", ...address }),
            });
            if (!r.ok)
              setMessage(
                "Your order was received, but the address could not be saved to your account.",
              );
          } catch {
            setMessage(
              "Your order was received, but the address could not be saved to your account.",
            );
          }
        }
      } else {
        setQuoteState({ value: result, fingerprint });
        setMessage(
          coupon
            ? "Your total has been reviewed, including your coupon."
            : "Your total is ready. Review it before placing your order.",
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
      feedback.current?.focus();
    }
  }
  const currentStep = order ? 3 : quote ? 2 : 1;
  return (
    <div className="sh-checkout">
      <div className="sh-checkout__atmosphere" aria-hidden="true">
        <span className="sh-checkout__heart">♡</span>
      </div>
      <div className="sh-checkout__shell">
        <header className="sh-checkout__header">
          <div className="sh-checkout__brand">
            <Link href="/" aria-label="SoftHaven home">
              <Image
                src="/assets/soft-haven-logo-transparent.png"
                alt="SoftHaven Sri Lanka"
                width={194}
                height={82}
                priority
                unoptimized
              />
            </Link>
            <Link className="sh-checkout__back" href="/shop">
              ← <span>Continue shopping</span>
            </Link>
          </div>
          <ol className="sh-checkout__progress" aria-label="Checkout progress">
            {["Delivery", "Payment", "Confirmation"].map((step, i) => (
              <li
                key={step}
                className={
                  currentStep === i + 1
                    ? "is-current"
                    : currentStep > i + 1
                      ? "is-complete"
                      : ""
                }
                aria-current={currentStep === i + 1 ? "step" : undefined}
              >
                <span>{currentStep > i + 1 ? "✓" : `0${i + 1}`}</span>
                <strong>{step}</strong>
                <small>
                  {["Your details", "Choose how to pay", "All set!"][i]}
                </small>
              </li>
            ))}
          </ol>
          <div className="sh-checkout__trust">
            <span className="sh-checkout__icon">
              <Icon name="lock" />
            </span>
            <div>
              <strong>Your information is protected</strong>
              <small>Secure account handling</small>
            </div>
          </div>
        </header>
        <div className="sh-checkout__hero">
          <h1>
            Secure <em>Checkout</em>
          </h1>
          <p>
            Your SoftHaven companion is almost home.{" "}
            <span aria-hidden="true">♡</span>
          </p>
        </div>
        {order ? (
          <section className="sh-checkout__empty sh-checkout__card">
            <Icon name="bag" />
            <h2>A little happiness is on its way.</h2>
            <p>
              Order SH-{order.order_number} · {formatPrice(Number(order.total))}
            </p>
            <p>Payment is pending. Pay cash when your order arrives.</p>
            {message && <p role="status">{message}</p>}
            <Link
              className="sh-checkout__cta"
              href={`/account/orders/${order.id}`}
            >
              View your order →
            </Link>
          </section>
        ) : !hydrated ? (
          <p className="sh-checkout__empty" role="status">
            Preparing your checkout…
          </p>
        ) : !lines.length ? (
          <section className="sh-checkout__empty sh-checkout__card">
            <Icon name="bag" />
            <h2>Your cloud is feeling a little empty.</h2>
            <p>A soft companion is waiting to meet you.</p>
            <Link className="sh-checkout__cta" href="/shop">
              Explore companions →
            </Link>
          </section>
        ) : (
          <form onSubmit={submit} aria-busy={busy}>
            <fieldset className="sh-checkout__layout" disabled={busy}>
              <div className="sh-checkout__details">
                <section className="sh-checkout__card">
                  <CardHeading
                    icon="truck"
                    title="Delivery Details"
                    subtitle="Where should we send your new companion?"
                  />
                  {loaded && !customer && (
                    <p className="sh-checkout__notice">
                      <Link href="/account">Sign in or create an account</Link>{" "}
                      to review your total and place your order.
                    </p>
                  )}
                  {!!customer?.addresses.length && (
                    <label className="sh-checkout__saved">
                      Saved address
                      <select
                        value={savedAddress}
                        onChange={(e) => {
                          setSavedAddress(e.target.value);
                          const selected = customer.addresses.find(
                            (a) => a.id === e.target.value,
                          );
                          if (selected) {
                            addressTouched.current = true;
                            setAddress({
                              name: selected.name,
                              phone: selected.phone,
                              address: selected.address,
                              city: selected.city,
                              district: selected.district,
                              country: "LK",
                            });
                          }
                        }}
                      >
                        <option value="">Enter a new address</option>
                        {customer.addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} · {a.address}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="sh-checkout__fields">
                    {(
                      [
                        ["name", "Full name", "name", "user", 150],
                        ["phone", "Phone", "tel", "phone", 30],
                        [
                          "address",
                          "Street address",
                          "street-address",
                          "pin",
                          500,
                        ],
                        ["city", "City", "address-level2", "pin", 150],
                        ["district", "District", "address-level1", "bank", 100],
                      ] as const
                    ).map(([field, label, auto, icon, max]) => (
                      <label
                        key={field}
                        className={field === "address" ? "is-wide" : ""}
                        htmlFor={`delivery-${field}`}
                      >
                        {label} <b aria-hidden="true">*</b>
                        <span className="sh-checkout__input">
                          <Icon name={icon} />
                          <input
                            id={`delivery-${field}`}
                            name={field}
                            type={field === "phone" ? "tel" : "text"}
                            autoComplete={auto}
                            required
                            minLength={
                              field === "phone"
                                ? 6
                                : field === "address"
                                  ? 3
                                  : 1
                            }
                            maxLength={max}
                            value={address[field]}
                            aria-describedby="checkout-feedback"
                            onChange={(e) => {
                              addressTouched.current = true;
                              setSavedAddress("");
                              setAddress((a) => ({
                                ...a,
                                [field]: e.target.value,
                              }));
                            }}
                          />
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="sh-checkout__address-bottom">
                    <small>Country: Sri Lanka</small>
                    {customer && (
                      <label className="sh-checkout__check">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                        />{" "}
                        <span>
                          Save this address for next time
                          <small>Ready for your next little moment.</small>
                        </span>
                      </label>
                    )}
                  </div>
                </section>
                <section className="sh-checkout__card">
                  <CardHeading
                    icon="truck"
                    title="Delivery Method"
                    subtitle="Choose how you'd like to receive your order."
                  />
                  {!loaded ? (
                    <p role="status">Loading delivery options…</p>
                  ) : !rates.length ? (
                    <p className="sh-checkout__notice" role="status">
                      Delivery is not configured yet. Orders cannot be placed
                      until an active delivery rate is available.
                    </p>
                  ) : (
                    <div className="sh-checkout__delivery-options">
                      {rates.map((r) => (
                        <label
                          className={`sh-checkout__delivery ${rate === r.id ? "is-selected" : ""}`}
                          key={r.id}
                        >
                          <input
                            type="radio"
                            name="delivery-method"
                            required
                            value={r.id}
                            checked={rate === r.id}
                            onChange={() => setRate(r.id)}
                          />
                          <span className="sh-checkout__icon">
                            <Icon name="truck" />
                          </span>
                          <span>
                            <strong>{r.name}</strong>
                            <small>
                              Delivery within the configured shipping zone.
                            </small>
                          </span>
                          <strong>{formatPrice(Number(r.rate))}</strong>
                        </label>
                      ))}
                    </div>
                  )}
                </section>
                <section className="sh-checkout__card">
                  <CardHeading
                    icon="card"
                    title="Payment Method"
                    subtitle="Choose your preferred payment option."
                  />
                  <div className="sh-checkout__payments">
                    {paymentMethods.map((p) => (
                      <label
                        key={p.id}
                        className={`sh-checkout__payment ${payment === p.id ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={p.id}
                          checked={payment === p.id}
                          onChange={() => setPayment(p.id)}
                        />
                        <span className="sh-checkout__icon">
                          <Icon name={p.icon} />
                        </span>
                        <span>
                          <strong>{p.title}</strong>
                          <small>{p.description}</small>
                          <small
                            className={
                              !p.enabled ? "sh-checkout__configuration" : ""
                            }
                          >
                            {p.detail}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                  {!selectedPayment.enabled && (
                    <p className="sh-checkout__notice" role="status">
                      {selectedPayment.title} is not available yet. Choose cash
                      on delivery to continue.
                    </p>
                  )}
                  <label className="sh-checkout__notes">
                    Order notes <span>(optional)</span>
                    <textarea
                      name="notes"
                      maxLength={2000}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </label>
                </section>
              </div>
              <aside
                className="sh-checkout__summary sh-checkout__card"
                aria-label="Order summary"
              >
                <CardHeading
                  icon="bag"
                  title="Order Summary"
                  subtitle={`${lines.reduce((n, l) => n + l.quantity, 0)} items in your cart`}
                />
                <div className="sh-checkout__products">
                  {lines.map((l) => (
                    <article
                      className="sh-checkout__product"
                      key={l.variant.id}
                    >
                      <div className="sh-checkout__product-image">
                        <ProductMedia
                          src={l.variant.image || l.product.image}
                          alt={l.product.name}
                          loading="eager"
                          fill
                          fit="cover"
                        />
                      </div>
                      <div className="sh-checkout__product-copy">
                        <h3>{l.product.name}</h3>
                        <p>{l.product.category}</p>
                        <small>
                          {l.variant.color}
                          {l.variant.sku ? ` · ${l.variant.sku}` : ""}
                        </small>
                        <div className="sh-checkout__quantity">
                          <button
                            type="button"
                            aria-label={`Decrease ${l.product.name} quantity`}
                            onClick={() =>
                              update(
                                getCartLineId(l.product, l.variant),
                                l.quantity - 1,
                              )
                            }
                          >
                            −
                          </button>
                          <span>{l.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${l.product.name} quantity`}
                            disabled={
                              l.quantity >= Math.min(12, l.variant.stock ?? 12)
                            }
                            onClick={() =>
                              update(
                                getCartLineId(l.product, l.variant),
                                l.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                          <button
                            className="sh-checkout__remove"
                            type="button"
                            aria-label={`Remove ${l.product.name}`}
                            onClick={() =>
                              remove(getCartLineId(l.product, l.variant))
                            }
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <strong className="sh-checkout__line-price">
                        {formatPrice(l.variant.price * l.quantity)}
                      </strong>
                    </article>
                  ))}
                </div>
                <div className="sh-checkout__coupon">
                  <Icon name="tag" />
                  <div>
                    <label htmlFor="checkout-coupon">
                      Have a little treat code?
                    </label>
                    <div>
                      <input
                        id="checkout-coupon"
                        name="coupon"
                        maxLength={100}
                        placeholder="Enter coupon code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                      />
                      <button
                        type="submit"
                        value="quote"
                        disabled={
                          !rate || !customer || !selectedPayment.enabled
                        }
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                <div className="sh-checkout__rewards">
                  <label htmlFor="checkout-points">Reward points</label>
                  <small>
                    {!customer
                      ? "Sign in to use your reward points."
                      : customer.balance === null
                        ? "Your balance could not be loaded."
                        : `${customer.balance} points available`}
                  </small>
                  <input
                    id="checkout-points"
                    name="points"
                    type="number"
                    min={0}
                    max={customer?.balance ?? 0}
                    step={1}
                    disabled={!customer || customer.balance === null}
                    value={points}
                    onChange={(e) =>
                      setPoints(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                </div>
                <dl className="sh-checkout__totals">
                  {[
                    ["Subtotal", quote?.subtotal],
                    ["Delivery", quote?.shipping],
                    ["Discount", quote?.discount],
                    ["Reward points", quote?.points_discount],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <dt>{label}</dt>
                      <dd>
                        {typeof value === "number"
                          ? `${label === "Discount" || label === "Reward points" ? "− " : ""}${formatPrice(value)}`
                          : "Not yet calculated"}
                      </dd>
                    </div>
                  ))}
                  <div className="sh-checkout__total">
                    <dt>Total</dt>
                    <dd>
                      {quote ? formatPrice(quote.total) : "Review to calculate"}
                    </dd>
                  </div>
                </dl>
                <div className="sh-checkout__security">
                  <Icon name="shield" />
                  <div>
                    <h3>Secure checkout</h3>
                    <p>✓ Protected checkout</p>
                    <p>✓ Secure account handling</p>
                    <p>✓ Order totals checked by our server</p>
                  </div>
                </div>
              </aside>
              <div className="sh-checkout__final">
                <div
                  id="checkout-feedback"
                  className={`sh-checkout__feedback ${message ? "has-message" : ""}`}
                  role="status"
                  aria-live="polite"
                  ref={feedback}
                  tabIndex={-1}
                >
                  {message}
                </div>
                <button
                  className="sh-checkout__review"
                  type="submit"
                  value="quote"
                  disabled={
                    !lines.length ||
                    !rate ||
                    !customer ||
                    !selectedPayment.enabled
                  }
                >
                  {busy
                    ? "Reviewing your order…"
                    : quote
                      ? "Refresh order total"
                      : "Review order total"}
                </button>
                <button
                  className="sh-checkout__cta"
                  type="submit"
                  value="place"
                  disabled={
                    !quote || !customer || !rate || !selectedPayment.enabled
                  }
                >
                  {busy ? "Preparing your order…" : selectedPayment.cta}{" "}
                  <span aria-hidden="true">→</span>
                </button>
                <p className="sh-checkout__fineprint">
                  <Icon name="lock" /> Your order is confirmed only after our
                  server validates your details and total.
                </p>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
