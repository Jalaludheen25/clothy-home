import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../data/catalog.js';
import { src } from '../data/images.js';
import { useStore } from '../context/StoreContext.jsx';
import { Wordmark } from '../components/layout/Header.jsx';
import { useMinimalChrome } from '../hooks/useHeaderTone.js';
import { Logo } from '../components/ui/Logo.jsx';
import { EmptyState, MagneticButton, Reveal, RevealText } from '../components/ui/Primitives.jsx';

/* ==========================================================================
   Checkout
   --------------------------------------------------------------------------
   Three steps on one page. Each step validates only its own fields, so a
   visitor is never blocked by something they have not reached yet.
   ========================================================================== */

const STEPS = ['Contact', 'Delivery', 'Payment'];

const DELIVERY = [
  { id: 'standard', label: 'Standard', note: 'Insured, 5–8 working days', cost: 0 },
  { id: 'express', label: 'Express', note: 'Insured, 2–3 working days', cost: 900 },
  { id: 'white-glove', label: 'White glove', note: 'Hand-delivered in metros, by appointment', cost: 2400 },
];

const PAYMENT = [
  { id: 'card', label: 'Card', note: 'Visa, Mastercard, Amex, RuPay' },
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', label: 'Net banking', note: 'All major Indian banks' },
  { id: 'cod', label: 'Cash on delivery', note: 'Orders under ₹25,000 only' },
];

const REQUIRED = {
  0: ['email', 'phone'],
  1: ['name', 'line1', 'city', 'state', 'pin'],
  2: [],
};

const LABELS = {
  email: 'Email',
  phone: 'Phone',
  name: 'Full name',
  line1: 'Address',
  city: 'City',
  state: 'State',
  pin: 'PIN code',
  cardNumber: 'Card number',
  cardExp: 'Expiry',
  cardCvc: 'CVC',
  upiId: 'UPI ID',
};

export default function Checkout() {
  useMinimalChrome();
  const { lines, totals, placeOrder, user, signIn } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pin: '',
    gift: false,
    note: '',
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    upiId: '',
  });
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const deliveryCost = DELIVERY.find((d) => d.id === delivery)?.cost ?? 0;
  const grandTotal = totals.total + deliveryCost;

  const validate = (which) => {
    const next = {};
    REQUIRED[which].forEach((key) => {
      if (!String(form[key]).trim()) next[key] = `${LABELS[key]} is required`;
    });
    if (which === 0 && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      next.email = 'That email does not look right';
    }
    if (which === 0 && form.phone && !/^[+\d][\d\s-]{8,}$/.test(form.phone)) {
      next.phone = 'Enter a reachable phone number';
    }
    if (which === 1 && form.pin && !/^\d{6}$/.test(form.pin)) {
      next.pin = 'Indian PIN codes are six digits';
    }
    if (which === 2 && payment === 'card') {
      const digits = form.cardNumber.replace(/\s/g, '');
      if (digits.length < 15) next.cardNumber = 'Enter the full card number';
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(form.cardExp)) next.cardExp = 'MM / YY';
      if (!/^\d{3,4}$/.test(form.cardCvc)) next.cardCvc = '3 or 4 digits';
    }
    if (which === 2 && payment === 'upi' && !/^[\w.-]+@[\w]+$/.test(form.upiId)) {
      next.upiId = 'Looks like name@bank';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const advance = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(2, s + 1));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate(2)) return;
    setPlacing(true);

    /* Stand-in for the payment round trip. */
    window.setTimeout(() => {
      if (!user) signIn({ name: form.name || 'Guest', email: form.email, phone: form.phone });
      const order = placeOrder({
        contact: { email: form.email, phone: form.phone },
        address: {
          name: form.name,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pin: form.pin,
        },
        delivery: DELIVERY.find((d) => d.id === delivery),
        payment: PAYMENT.find((p) => p.id === payment),
        gift: form.gift,
        note: form.note,
        grandTotal,
      });
      navigate(`/track/${order.id}`, { replace: true });
    }, 1500);
  };

  if (!lines.length) {
    return (
      <div className="checkout checkout--empty">
        <div className="shell">
          <EmptyState
            title="There is nothing to check out"
            blurb="Add a piece to the bag and this page will have something to do."
            action={
              <MagneticButton to="/shop" variant="line">
                Browse the house
              </MagneticButton>
            }
          />
        </div>
      </div>
    );
  }

  const field = (key, props = {}) => (
    <label className={`field ${errors[key] ? 'field--error' : ''}`}>
      <span>{LABELS[key]}</span>
      <input
        value={form[key]}
        onChange={set(key)}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        placeholder={props.placeholder}
        type={props.type || 'text'}
      />
      {errors[key] ? <span className="field__error">{errors[key]}</span> : null}
    </label>
  );

  return (
    <div className="checkout">
      <div className="checkout__grid">
        <div className="checkout__form">
          <header className="checkout__head">
            <Wordmark />
            <Link to="/cart" className="checkout__back">
              ← Back to bag
            </Link>
          </header>

          <ol className="steps" aria-label="Checkout progress">
            {STEPS.map((label, i) => (
              <li key={label} className={`steps__item ${i === step ? 'is-on' : ''} ${i < step ? 'is-done' : ''}`}>
                <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}>
                  <span className="steps__num num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="steps__label">{label}</span>
                </button>
              </li>
            ))}
          </ol>

          <form onSubmit={submit} noValidate>
            {/* --- 1. contact --- */}
            <section className={`cstep ${step === 0 ? 'is-on' : ''}`} hidden={step !== 0}>
              <RevealText as="h1" className="display d2 cstep__title" text="How do we reach you?" />
              <p className="lead cstep__blurb">
                One confirmation email, one dispatch note. Nothing else.
              </p>
              <div className="cstep__fields">
                {field('email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
                {field('phone', { type: 'tel', autoComplete: 'tel', placeholder: '+91 98400 00000' })}
              </div>
              <MagneticButton variant="solid" size="lg" onClick={advance}>
                Continue to delivery
              </MagneticButton>
            </section>

            {/* --- 2. delivery --- */}
            <section className={`cstep ${step === 1 ? 'is-on' : ''}`} hidden={step !== 1}>
              <RevealText as="h1" className="display d2 cstep__title" text="Where is it going?" />
              <div className="cstep__fields">
                {field('name', { autoComplete: 'name' })}
                {field('line1', { autoComplete: 'address-line1', placeholder: 'Flat, building, street' })}
                <label className="field">
                  <span>Landmark (optional)</span>
                  <input value={form.line2} onChange={set('line2')} autoComplete="address-line2" />
                </label>
                <div className="field-row">
                  {field('city', { autoComplete: 'address-level2' })}
                  {field('state', { autoComplete: 'address-level1' })}
                </div>
                {field('pin', { inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '600004' })}
              </div>

              <fieldset className="options">
                <legend className="eyebrow">Delivery method</legend>
                {DELIVERY.map((d) => (
                  <label className={`option ${delivery === d.id ? 'is-on' : ''}`} key={d.id}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === d.id}
                      onChange={() => setDelivery(d.id)}
                    />
                    <span className="option__mark" aria-hidden="true" />
                    <span className="option__body">
                      <strong>{d.label}</strong>
                      <em>{d.note}</em>
                    </span>
                    <span className="option__cost num">
                      {d.cost === 0 ? 'Included' : formatINR(d.cost)}
                    </span>
                  </label>
                ))}
              </fieldset>

              <label className="switch">
                <input type="checkbox" checked={form.gift} onChange={set('gift')} />
                <span className="switch__track" aria-hidden="true">
                  <i />
                </span>
                <span>Wrap as a gift, in our tissue silk and a handwritten card</span>
              </label>
              {form.gift ? (
                <label className="field cstep__note">
                  <span>Message on the card</span>
                  <textarea rows={3} value={form.note} onChange={set('note')} maxLength={220} />
                </label>
              ) : null}

              <MagneticButton variant="solid" size="lg" onClick={advance}>
                Continue to payment
              </MagneticButton>
            </section>

            {/* --- 3. payment --- */}
            <section className={`cstep ${step === 2 ? 'is-on' : ''}`} hidden={step !== 2}>
              <RevealText as="h1" className="display d2 cstep__title" text="How would you like to pay?" />

              <fieldset className="options">
                <legend className="sr-only">Payment method</legend>
                {PAYMENT.map((p) => {
                  const blocked = p.id === 'cod' && grandTotal >= 25000;
                  return (
                    <label
                      className={`option ${payment === p.id ? 'is-on' : ''} ${blocked ? 'is-off' : ''}`}
                      key={p.id}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === p.id}
                        disabled={blocked}
                        onChange={() => setPayment(p.id)}
                      />
                      <span className="option__mark" aria-hidden="true" />
                      <span className="option__body">
                        <strong>{p.label}</strong>
                        <em>{blocked ? 'Not available above ₹25,000' : p.note}</em>
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              {payment === 'card' ? (
                <div className="cstep__fields">
                  {field('cardNumber', {
                    inputMode: 'numeric',
                    autoComplete: 'cc-number',
                    placeholder: '4242 4242 4242 4242',
                  })}
                  <div className="field-row">
                    {field('cardExp', { placeholder: 'MM / YY', autoComplete: 'cc-exp' })}
                    {field('cardCvc', { placeholder: '123', autoComplete: 'cc-csc' })}
                  </div>
                </div>
              ) : null}

              {payment === 'upi' ? (
                <div className="cstep__fields">{field('upiId', { placeholder: 'name@bank' })}</div>
              ) : null}

              <p className="cstep__secure muted">
                This is a demonstration storefront — no card is charged and nothing is
                transmitted anywhere.
              </p>

              <MagneticButton
                variant="solid"
                size="lg"
                type="submit"
                onClick={submit}
                disabled={placing}
                className="cstep__place"
              >
                {placing ? 'Placing your order…' : `Place order — ${formatINR(grandTotal)}`}
              </MagneticButton>
            </section>
          </form>
        </div>

        {/* --- order rail --- */}
        <aside className="checkout__rail">
          <div className="checkout__rail-inner">
            <Reveal as="h2" className="eyebrow">
              Your order
            </Reveal>
            <ul className="orail">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.size}`}>
                  <span className="orail__img">
                    <img src={src(line.product.images[0], 180, 1.25)} alt="" loading="lazy" />
                    <span className="orail__qty num">{line.qty}</span>
                  </span>
                  <span className="orail__body">
                    <strong>{line.product.name}</strong>
                    <em>{line.size || line.product.colour}</em>
                  </span>
                  <span className="orail__price num">{formatINR(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="summary__sums">
              <div>
                <dt>Subtotal</dt>
                <dd className="num">{formatINR(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 ? (
                <div className="is-credit">
                  <dt>Promotion</dt>
                  <dd className="num">−{formatINR(totals.discount)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Delivery</dt>
                <dd className="num">
                  {totals.shipping + deliveryCost === 0
                    ? 'Complimentary'
                    : formatINR(totals.shipping + deliveryCost)}
                </dd>
              </div>
              <div>
                <dt>GST (5%)</dt>
                <dd className="num">{formatINR(totals.tax)}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd className="num">{formatINR(grandTotal)}</dd>
              </div>
            </dl>

            <ul className="summary__trust">
              <li>Insured, tracked delivery</li>
              <li>Thirty-day returns</li>
            </ul>
          </div>
        </aside>
      </div>

      {placing ? (
        <div className="placing" aria-live="assertive">
          <div className="placing__mark">
            <Logo tone="light" alt="" />
          </div>
          <p className="eyebrow">Confirming your order</p>
          <span className="placing__bar">
            <i />
          </span>
        </div>
      ) : null}
    </div>
  );
}
