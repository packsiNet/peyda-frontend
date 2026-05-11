import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';

// ── Telegram Mini App safe-area hook ──────────────────────────────────────

const tg = window.Telegram?.WebApp ?? null;

function applyTgSafeArea() {
  if (!tg) return;
  const sa  = tg.safeAreaInset        ?? {};
  const csa = tg.contentSafeAreaInset ?? {};
  const top    = (sa.top    ?? 0) + (csa.top    ?? 0);
  const bottom = (sa.bottom ?? 0) + (csa.bottom ?? 0);
  const left   =  sa.left   ?? 0;
  const right  =  sa.right  ?? 0;
  const root = document.documentElement;
  root.style.setProperty('--tg-inset-top',    `${top}px`);
  root.style.setProperty('--tg-inset-bottom', `${bottom}px`);
  root.style.setProperty('--tg-inset-left',   `${left}px`);
  root.style.setProperty('--tg-inset-right',  `${right}px`);
}

// Theme → Telegram header/bg color map
const TG_THEME_COLORS = {
  dark:  { header: '#060E1C', bg: '#060E1C' },
  light: { header: '#F0F8FF', bg: '#F0F8FF' },
  default: { header: '#fbe5c8', bg: '#fbe5c8' },
};

const THEMES = ['dark', 'light'];

function SplashLoader() {
  return (
    <div className="splash-loader" aria-label="Loading" role="status">
      <div className="splash-loader__orbs" aria-hidden="true">
        <div className="splash-loader__orb splash-loader__orb--1" />
        <div className="splash-loader__orb splash-loader__orb--2" />
        <div className="splash-loader__orb splash-loader__orb--3" />
        <div className="splash-loader__orb splash-loader__orb--4" />
      </div>

      <svg className="splash-loader__dots-bg" viewBox="0 0 380 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="splashDots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#a5b4fc" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splashDots)" />
      </svg>

      <svg className="splash-loader__ring splash-loader__ring--outer" viewBox="0 0 360 360" aria-hidden="true">
        <circle cx="180" cy="180" r="170" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="180" cy="180" r="170" fill="none" stroke="rgba(236,72,153,0.4)" strokeWidth="2" strokeDasharray="60 1000" strokeLinecap="round" />
      </svg>

      <svg className="splash-loader__ring splash-loader__ring--inner" viewBox="0 0 290 290" aria-hidden="true">
        <circle cx="145" cy="145" r="135" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="1 6" />
        <circle cx="145" cy="145" r="135" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="2" strokeDasharray="40 1000" strokeLinecap="round" />
      </svg>

      <div className="splash-loader__icon-orbit" aria-hidden="true">
        <div className="splash-icon splash-icon--top">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div className="splash-icon splash-icon--right">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" />
            <circle cx="17" cy="13" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div className="splash-icon splash-icon--bottom">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3M21 14v3M14 17v4h3M17 21h4" />
          </svg>
        </div>
        <div className="splash-icon splash-icon--left">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M6 10v4M18 10v4" />
          </svg>
        </div>
      </div>

      <div className="splash-loader__icon-orbit splash-loader__icon-orbit--inner" aria-hidden="true">
        <div className="splash-icon--sm tr">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5h3.5a1.5 1.5 0 0 1 0 3H9.5M9.5 12.5h4a1.5 1.5 0 0 1 0 3H9.5M11 7v2M11 15v2" />
          </svg>
        </div>
        <div className="splash-icon--sm br">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="13" y2="16" />
          </svg>
        </div>
        <div className="splash-icon--sm bl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="splash-icon--sm tl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
        </div>
      </div>

      <div className="splash-loader__core">
        <div className="splash-loader__core-glow" aria-hidden="true" />
        <div className="splash-loader__core-card">
          <div className="splash-loader__brand">PAYDA</div>
          <div className="splash-loader__tagline">payment services</div>
          <div className="splash-loader__dots" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div className="splash-loader__progress-wrap">
        <div className="splash-loader__progress-text">Loading...</div>
        <div className="splash-loader__progress-bar" aria-hidden="true">
          <div className="splash-loader__progress-fill" />
        </div>
      </div>

      <div className="splash-loader__star s1" aria-hidden="true" />
      <div className="splash-loader__star s2" aria-hidden="true" />
      <div className="splash-loader__star s3" aria-hidden="true" />
      <div className="splash-loader__star s4" aria-hidden="true" />
      <div className="splash-loader__star s5" aria-hidden="true" />
      <div className="splash-loader__star s6" aria-hidden="true" />
    </div>
  );
}

function ThemeToggle({ themeIdx, onToggle }) {
  const current = THEMES[themeIdx];

  return (
    <button
      type="button"
      className="p2p-header__theme-btn"
      aria-label={current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      {current === 'dark' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="9" cy="9" r="3.5" />
          <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" />
        </svg>
      )}
      {current === 'light' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 11A7 7 0 0 1 7 2.5a7 7 0 1 0 8.5 8.5z" />
        </svg>
      )}
    </button>
  );
}

const METHOD_META = {
  Revolut: { label: 'Revolut', country: 'UK' },
  Zelle:   { label: 'Zelle',   country: 'US' },
  SEPA:    { label: 'SEPA',    country: 'EU' },
};

const TxTile = memo(function TxTile({ item, type, onTap }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const meta = METHOD_META[item.method] || { country: 'Global' };

  return (
    <article
      role="button"
      tabIndex={0}
      className={`tx-tile ${isReceived ? 'tx-tile--received' : 'tx-tile--sent'}`}
      aria-label={`${type} ${sign}€${item.amount} ${item.name} via ${item.method}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onTap(item, type)}
    >
      <span className="tx-tile__glow" aria-hidden="true" />
      <span className="tx-tile__sheen" aria-hidden="true" />

      <span className="tx-tile__type" aria-hidden="true">
        {isReceived ? 'Received' : 'Send'}
      </span>

      <div className="tx-tile__amount">
        <span className="tx-tile__currency">€</span>
        <span className="tx-tile__value">{item.amount.toLocaleString()}</span>
      </div>

      <footer className="tx-tile__meta tx-tile__meta--abs">
        <span className="tx-tile__country">{meta.country}</span>
      </footer>
    </article>
  );
});

const FILTERS = [
  { id: 'all', label: 'All', cls: '' },
  { id: 'received', label: 'Received', cls: 'is-r' },
  { id: 'sent', label: 'Sent', cls: 'is-s' },
];

function FilterIcon({ id, active }) {
  const stroke = active
    ? id === 'received'
      ? 'var(--leaf-deep)'
      : id === 'sent'
      ? 'var(--amber-deep)'
      : 'var(--ink)'
    : 'var(--ink-mute)';

  if (id === 'all') {
    return (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={stroke} strokeWidth="1.4">
        <rect x="1.5" y="1.5" width="4" height="4" rx="1" />
        <rect x="7.5" y="1.5" width="4" height="4" rx="1" />
        <rect x="1.5" y="7.5" width="4" height="4" rx="1" />
        <rect x="7.5" y="7.5" width="4" height="4" rx="1" />
      </svg>
    );
  }

  if (id === 'received') {
    return (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 2v8M3.5 7l3 3 3-3" />
      </svg>
    );
  }

  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 11V3M3.5 6l3-3 3 3" />
    </svg>
  );
}

function LayoutToggleBtn({ layout, onToggle }) {
  const isTile = layout === 'tile';
  return (
    <button
      type="button"
      className="p2p-layout-btn"
      aria-label={isTile ? 'Switch to list view' : 'Switch to tile view'}
      onClick={onToggle}
    >
      {isTile ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="2" y1="3.5" x2="12" y2="3.5" />
          <line x1="2" y1="7" x2="12" y2="7" />
          <line x1="2" y1="10.5" x2="12" y2="10.5" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="1.5" y="1.5" width="4" height="4" rx="1" />
          <rect x="8.5" y="1.5" width="4" height="4" rx="1" />
          <rect x="1.5" y="8.5" width="4" height="4" rx="1" />
          <rect x="8.5" y="8.5" width="4" height="4" rx="1" />
        </svg>
      )}
    </button>
  );
}

function FilterBar({ active, onChange, layout, onToggleLayout }) {
  return (
    <div role="toolbar" aria-label="Filter transactions" className="p2p-filterbar">
      <LayoutToggleBtn layout={layout} onToggle={onToggleLayout} />
      <span className="p2p-filterbar__label">Filter</span>
      {FILTERS.map((filter) => {
        const isActive = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            aria-pressed={isActive}
            className={`p2p-filter-btn ${isActive ? `p2p-filter-btn--active ${filter.cls}` : ''}`}
          >
            <FilterIcon id={filter.id} active={isActive} />
            <span className="p2p-filter-btn__label">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const TxListItem = memo(function TxListItem({ item, type, onTap }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const meta = METHOD_META[item.method] || { country: 'Global' };

  return (
    <article
      role="button"
      tabIndex={0}
      className={`tx-card ${isReceived ? 'tx-card--received' : 'tx-card--sent'}`}
      aria-label={`${type} ${sign}€${item.amount} ${item.name} via ${item.method}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTap(item, type)}
    >
      <span className="tx-card__shimmer" aria-hidden="true" />
      <div className="tx-card__side" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          {isReceived
            ? <path d="M5 1.5v7M2 5.5l3 3 3-3" />
            : <path d="M5 8.5v-7M2 4.5l3-3 3 3" />}
        </svg>
      </div>
      <div className="tx-card__divider" />
      <div className="tx-card__body">
        <div className="tx-card__main">
          <div className="tx-card__method">
            <span className={`tx-card__method-dot tx-card__method-dot--${item.method.toLowerCase()}`} />
            <span className={`tx-card__method-text tx-card__method-text--${item.method.toLowerCase()}`}>
              {meta.country}
            </span>
          </div>
        </div>
        <div className="tx-card__right">
          <span className="tx-card__amount">€{item.amount.toLocaleString()}</span>
          <svg className="tx-card__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
        </div>
      </div>
    </article>
  );
});

function DetailSheet({ item, type, onClose }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const color = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__title">{isReceived ? 'Received' : 'Sent'}</div>
        <p className="sheet__sub">{isReceived ? `From ${item.name}` : `To ${item.name}`} · via {item.method}</p>

        <div className="detail-row">
          <span className="detail-row__label">Amount</span>
          <span className="detail-row__value detail-row__value--big" style={{ color }}>
            {sign}€{item.amount.toLocaleString()}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Method</span>
          <span className="detail-row__value">{item.method}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Reference</span>
          <span className="detail-row__value" style={{ fontVariantNumeric: 'tabular-nums' }}>
            #TX-{item.id.toUpperCase()}-{(item.amount * 7).toString(36).toUpperCase()}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Status</span>
          <span className="detail-row__value" style={{ color: 'var(--leaf-deep)' }}>Completed</span>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
          <button type="button" className="btn btn--primary">Download Receipt</button>
        </div>
      </div>
    </div>
  );
}

const CURRENCIES = [
  { id: 'EUR', label: 'Euro', symbol: '€', enabled: true },
  { id: 'USD', label: 'Dollar', symbol: '$', enabled: false },
  { id: 'CAD', label: 'CAD Dollar', symbol: 'CA$', enabled: false },
];

const EXCHANGE_METHODS = ['Revolut', 'Zelle', 'Paypal'];

const BONBAST_RATE = 160_000;
const URGENT_RATE  = 150_000;

function prefixPadding(symbol) {
  if (symbol.length >= 3) return '52px';
  if (symbol.length === 2) return '40px';
  return '34px';
}

function ExchangeModal({ onClose }) {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [direction, setDirection] = useState('send');
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [methods, setMethods] = useState([]);
  const [proposedAmount, setProposedAmount] = useState('');
  const [selectedRate, setSelectedRate] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Step 2 state
  const [rcvFirstName, setRcvFirstName] = useState('');
  const [rcvLastName, setRcvLastName] = useState('');
  const [rcvNationalId, setRcvNationalId] = useState('');
  const [rcvMobile, setRcvMobile] = useState('');
  const [rcvIban, setRcvIban] = useState('');

  const toggleMethod = (m) =>
    setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const currSymbol = CURRENCIES.find((c) => c.id === currency)?.symbol ?? '';

  const handleRateSelect = (key, value) => {
    if (selectedRate === key) {
      setSelectedRate(null);
      setProposedAmount('');
    } else {
      setSelectedRate(key);
      setProposedAmount(String(value));
    }
  };

  const handleShowCustom = () => {
    setShowCustomInput(true);
    setSelectedRate(null);
    setProposedAmount('');
  };

  const handleHideCustom = () => {
    setShowCustomInput(false);
    setProposedAmount('');
  };

  const step1Valid = !!amount && methods.length > 0;
  const step2Valid = rcvFirstName.trim() && rcvLastName.trim() && rcvNationalId.trim() && rcvMobile.trim() && rcvIban.trim();

  const handleSubmit = () => {
    if (!step2Valid) return;
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet exchange-modal" onClick={(event) => event.stopPropagation()}>
        <div className="sheet__handle" />

        {step === 1 ? (
          <>
            <div className="sheet__title">Exchange Request</div>
            <p className="sheet__sub">Submit a send or receive money request</p>

            <div className="exchange-modal__section">
              <div className="seg seg--full" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className={`seg__btn seg__btn--icon ${direction === 'send' ? 'is-active is-send' : ''}`}
                  onClick={() => setDirection('send')}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 11V3M3.5 6l3-3 3 3" />
                  </svg>
                  Send
                </button>
                <button
                  type="button"
                  className={`seg__btn seg__btn--icon ${direction === 'receive' ? 'is-active is-receive' : ''}`}
                  onClick={() => setDirection('receive')}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 2v8M3.5 7l3 3 3-3" />
                  </svg>
                  Receive
                </button>
              </div>
            </div>

            <div className="exchange-modal__section">
              <label className="input-label">Currency</label>
              <div className="seg seg--full">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!c.enabled}
                    className={`seg__btn ${currency === c.id ? 'is-active' : ''} ${!c.enabled ? 'seg__btn--disabled' : ''}`}
                    onClick={() => c.enabled && setCurrency(c.id)}
                  >
                    <span className="seg__btn-symbol">{c.symbol}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="exchange-modal__section">
              <label className="input-label">Amount</label>
              <div className="input-wrap">
                <span className="input-wrap__prefix">{currSymbol}</span>
                <input
                  className="input input--prefixed"
                  style={{ paddingLeft: prefixPadding(currSymbol) }}
                  type="number"
                  placeholder="0.00"
                  inputMode="decimal"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="exchange-modal__section">
              <label className="input-label">
                Method
                <span className="input-label__hint">Multiple allowed</span>
              </label>
              <div className="method-chips">
                {EXCHANGE_METHODS.map((m) => {
                  const active = methods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`method-chip ${active ? 'method-chip--active' : ''}`}
                      onClick={() => toggleMethod(m)}
                      aria-pressed={active}
                    >
                      {active && (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 5.5l2.5 2.5L9 3" />
                        </svg>
                      )}
                      {m}
                    </button>
                  );
                })}
              </div>
              {methods.length === 0 && (
                <p className="exchange-modal__hint">Select at least one payment method</p>
              )}
            </div>

            <div className="exchange-modal__section">
              <div className="price-row">
                <div className={`price-row__slider ${showCustomInput ? 'price-row__slider--shifted' : ''}`}>

                  <div className="price-row__panel">
                    <div className="price-col">
                      <p className="price-col__label">Bonbast Price</p>
                      <button
                        type="button"
                        className={`price-col__card ${selectedRate === 'bonbast' ? 'price-col__card--bonbast' : ''}`}
                        onClick={() => handleRateSelect('bonbast', BONBAST_RATE)}
                        aria-pressed={selectedRate === 'bonbast'}
                      >
                        <span className="price-col__check" aria-hidden="true">
                          {selectedRate === 'bonbast'
                            ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5l2.5 2.5L9 3" /></svg>
                            : <span className="price-col__dot" />}
                        </span>
                        <span className="price-col__value">{BONBAST_RATE.toLocaleString()}</span>
                      </button>
                    </div>

                    <div className="price-col">
                      <p className="price-col__label">Urgent Price</p>
                      <button
                        type="button"
                        className={`price-col__card ${selectedRate === 'urgent' ? 'price-col__card--urgent' : ''}`}
                        onClick={() => handleRateSelect('urgent', URGENT_RATE)}
                        aria-pressed={selectedRate === 'urgent'}
                      >
                        <span className="price-col__check" aria-hidden="true">
                          {selectedRate === 'urgent'
                            ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5l2.5 2.5L9 3" /></svg>
                            : <span className="price-col__dot" />}
                        </span>
                        <span className="price-col__value">{URGENT_RATE.toLocaleString()}</span>
                      </button>
                    </div>

                    <div className="price-col">
                      <p className="price-col__label">&nbsp;</p>
                      <button
                        type="button"
                        className="price-col__card price-col__card--custom"
                        onClick={handleShowCustom}
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6.5 2v9M2 6.5h9" />
                        </svg>
                        Custom
                      </button>
                    </div>
                  </div>

                  <div className="price-row__panel">
                    <div className="price-col" style={{ flex: 1 }}>
                      <p className="price-col__label">
                        Proposed Amount
                        <span className="input-label__hint" style={{ marginLeft: 4 }}>Rial</span>
                      </p>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="price-col__back-btn"
                          onClick={handleHideCustom}
                          aria-label="Back"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 2L4 7l5 5" />
                          </svg>
                        </button>
                        <div className="input-wrap" style={{ flex: 1 }}>
                          <input
                            className="input input--prefixed price-col__input"
                            type="number"
                            placeholder="0"
                            inputMode="numeric"
                            min="0"
                            value={proposedAmount}
                            onChange={(e) => setProposedAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="sheet-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="6.5" r="5" />
                  <path d="M4.5 6.5h4M7 4.5l2 2-2 2" />
                </svg>
                Receiver Information
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sheet__title">Receiver Information</div>
            <p className="sheet__sub">Enter the recipient's details to complete the request</p>

            <div className="exchange-modal__section">
              <div className="receiver-form">
                <div className="receiver-form__row">
                  <div className="receiver-form__field">
                    <label className="input-label">First Name</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="First name"
                      value={rcvFirstName}
                      onChange={(e) => setRcvFirstName(e.target.value)}
                    />
                  </div>
                  <div className="receiver-form__field">
                    <label className="input-label">Last Name</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Last name"
                      value={rcvLastName}
                      onChange={(e) => setRcvLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="receiver-form__field">
                  <label className="input-label">National ID</label>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    placeholder="10-digit national ID"
                    maxLength={10}
                    value={rcvNationalId}
                    onChange={(e) => setRcvNationalId(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="receiver-form__field">
                  <label className="input-label">Mobile Number</label>
                  <input
                    className="input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="09xxxxxxxxx"
                    maxLength={11}
                    value={rcvMobile}
                    onChange={(e) => setRcvMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div className="receiver-form__field">
                  <label className="input-label">IBAN</label>
                  <input
                    className="input receiver-form__iban"
                    type="text"
                    inputMode="numeric"
                    placeholder="IR000000000000000000000000"
                    maxLength={26}
                    value={rcvIban}
                    onChange={(e) => {
                      let v = e.target.value.toUpperCase();
                      if (!v.startsWith('IR')) v = 'IR' + v.replace(/[^0-9]/g, '');
                      else v = 'IR' + v.slice(2).replace(/[^0-9]/g, '');
                      setRcvIban(v.slice(0, 26));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sheet-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2L4 6.5 8 11" />
                </svg>
                Back
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!step2Valid}
                onClick={handleSubmit}
              >
                Submit Request
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared Layout ─────────────────────────────────────────────────

function BgOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
      <div className="bg-orb bg-orb--4" />
      <div className="bg-orb bg-orb--5" />
    </div>
  );
}

function PageHeader({ title, onBack }) {
  return (
    <header className="p2p-header p2p-header--sub">
      <button type="button" className="p2p-header__back" onClick={onBack} aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="11,4 6,9 11,14" />
        </svg>
      </button>
      <h1 className="p2p-header__page-title">{title}</h1>
      <div className="p2p-header__spacer" />
    </header>
  );
}

function AppTabBar({ activePage, onNavigate, onProfile, onExchange }) {
  return (
    <nav className="p2p-tabbar" aria-label="Main navigation">
      <button type="button" className={`p2p-tab ${activePage === 'home' ? 'is-active' : ''}`} onClick={() => onNavigate('home')} aria-label="Home">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,17 8,10 13,14 18,6 21,9" />
          <line x1="3" y1="17" x2="22" y2="17" />
        </svg>
        <span className="p2p-tab__label">Home</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>

      <button type="button" className={`p2p-tab ${activePage === 'wallet' ? 'is-active' : ''}`} onClick={() => onNavigate('wallet')} aria-label="Wallet">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="13" rx="2.5" />
          <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
          <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        <span className="p2p-tab__label">Wallet</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>

      <div className="p2p-tab p2p-tab--exchange">
        <button type="button" className="p2p-tab__exchange-btn" onClick={onExchange} aria-label="Exchange">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="11" cy="15" r="7" fill="rgba(255,255,255,0.95)" />
            <circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.50)" />
          </svg>
        </button>
        <span className="p2p-tab__label p2p-tab__label--exchange">Exchange</span>
      </div>

      <button type="button" className={`p2p-tab ${activePage === 'markets' ? 'is-active' : ''}`} onClick={() => onNavigate('markets')} aria-label="Markets">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
        <span className="p2p-tab__label">Markets</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>

      <button type="button" className="p2p-tab" onClick={onProfile} aria-label="Profile">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="13" rx="2" />
          <path d="M16 8V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <line x1="2" y1="14" x2="22" y2="14" />
        </svg>
        <span className="p2p-tab__label">Profile</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>
    </nav>
  );
}

function AppShell({ header, children, activePage, onNavigate, onProfile, onExchange }) {
  return (
    <>
      <BgOrbs />
      <div className="p2p-shell">
        {header}
        <div className="app-content">
          {children}
        </div>
        <AppTabBar
          activePage={activePage}
          onNavigate={onNavigate}
          onProfile={onProfile}
          onExchange={onExchange}
        />
      </div>
    </>
  );
}

function PlaceholderPage({ title, icon }) {
  const icons = {
    wallet: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="20" height="13" rx="2.5" />
        <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
        <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    markets: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  };
  return (
    <div className="placeholder-page">
      <span className="placeholder-page__icon">{icons[icon]}</span>
      <span className="placeholder-page__label">Coming soon</span>
    </div>
  );
}

function ProfileModal({ onClose, onIdentity }) {
  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="profile-modal__item" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-2.5 2-4.5 6-4.5s6 2 6 4.5" />
          </svg>
          Profile
        </button>
        <button type="button" className="profile-modal__item" onClick={() => { onClose(); onIdentity(); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="10" height="10" rx="2" />
            <path d="M7 9l2 2 4-4" />
          </svg>
          Identity
        </button>
        <button type="button" className="profile-modal__item" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="10" height="8" rx="1" />
            <path d="M8 2v2M3 8h10M3 10h6" />
          </svg>
          History
        </button>
      </div>
    </div>
  );
}

function CameraCapture({ label, facingMode, icon, onCapture, preview }) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  async function openCamera() {
    setError(null);
    setOpen(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(s);
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Camera not available on this device.');
    }
  }

  function closeCamera() {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setOpen(false);
    setError(null);
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      onCapture(URL.createObjectURL(blob));
      closeCamera();
    }, 'image/jpeg', 0.92);
  }

  return (
    <div className="id-camera-card">
      <span className="id-camera-card__label">{label}</span>
      <button
        type="button"
        className={`id-camera-btn${preview ? ' id-camera-btn--captured' : ''}`}
        onClick={openCamera}
      >
        {preview ? (
          <>
            <img className="id-camera-btn__preview" src={preview} alt={label} />
            <span className="id-camera-btn__retake">Retake</span>
          </>
        ) : (
          <>
            <span className="id-camera-btn__icon">{icon}</span>
            <span className="id-camera-btn__text">Tap to open camera</span>
          </>
        )}
      </button>

      {open && (
        <div className="cam-overlay">
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {error ? (
            <div className="cam-error">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="cam-error__text">{error}</p>
              <button type="button" className="cam-error__btn" onClick={closeCamera}>Close</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
              <div className="cam-label">{label}</div>
              <div className="cam-bar">
                <button type="button" className="cam-cancel" onClick={closeCamera}>Cancel</button>
                <button type="button" className="cam-shutter" onClick={takePhoto} aria-label="Take photo">
                  <span className="cam-shutter__ring" />
                </button>
                <div className="cam-spacer" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function DatePickerField({ id, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('calendar');
  const today = new Date();

  const parsed = value ? new Date(value + 'T12:00:00') : null;
  const [viewYear, setViewYear] = useState(() => parsed?.getFullYear() ?? today.getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(() => parsed?.getMonth() ?? today.getMonth());

  const displayValue = parsed
    ? `${String(parsed.getDate()).padStart(2,'0')} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`
    : '';

  function getDays() {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const pad = (firstDow + 6) % 7;
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = Array(pad).fill(null);
    for (let d = 1; d <= count; d++) cells.push(d);
    return cells;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day) {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  }

  function openPicker() {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
    setMode('calendar');
    setOpen(true);
  }

  const maxYear = today.getFullYear() - 5;
  const minYear = today.getFullYear() - 100;
  const yearList = [];
  for (let y = maxYear; y >= minYear; y--) yearList.push(y);

  const days = getDays();
  const selDay = parsed?.getDate();
  const selMonth = parsed?.getMonth();
  const selYear = parsed?.getFullYear();

  return (
    <div className="datepicker">
      <button type="button" id={id} className={`datepicker__trigger identity-field__input${!value ? ' datepicker__trigger--empty' : ''}`} onClick={openPicker}>
        <span>{value ? displayValue : 'Select date of birth'}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1v2M11 1v2M2 7h12" />
        </svg>
      </button>

      {open && (
        <div className="datepicker__overlay" onClick={() => setOpen(false)}>
          <div className="datepicker__panel" onClick={e => e.stopPropagation()}>
            {mode === 'year' ? (
              <>
                <div className="datepicker__top">
                  <span className="datepicker__heading">Select Year</span>
                  <button type="button" className="datepicker__close-btn" onClick={() => setMode('calendar')}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
                  </button>
                </div>
                <div className="datepicker__year-list">
                  {yearList.map(y => (
                    <button key={y} type="button" className={`datepicker__year-btn${y === viewYear ? ' is-active' : ''}`}
                      onClick={() => { setViewYear(y); setMode('calendar'); }}>
                      {y}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="datepicker__top">
                  <button type="button" className="datepicker__arrow" onClick={prevMonth}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="10,3 5,8 10,13"/></svg>
                  </button>
                  <button type="button" className="datepicker__month-btn" onClick={() => setMode('year')}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </button>
                  <button type="button" className="datepicker__arrow" onClick={nextMonth}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,3 11,8 6,13"/></svg>
                  </button>
                </div>

                <div className="datepicker__weekdays">
                  {WEEKDAY_LABELS.map(d => <span key={d} className="datepicker__weekday">{d}</span>)}
                </div>

                <div className="datepicker__grid">
                  {days.map((day, i) => (
                    <button key={i} type="button" disabled={!day}
                      className={`datepicker__day${!day ? ' datepicker__day--empty' : ''}${day && day === selDay && viewMonth === selMonth && viewYear === selYear ? ' is-selected' : ''}`}
                      onClick={() => day && selectDay(day)}>
                      {day ?? ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IdentityContent({ onDone }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [docPhoto, setDocPhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);

  const canSubmit = firstName.trim() && lastName.trim() && birthDay && docPhoto && selfiePhoto;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: send to API
    alert('Identity submitted successfully!');
    onDone();
  }

  return (
    <form className="page-scroll" onSubmit={handleSubmit}>
      <div className="identity-section">
        <p className="identity-section__label">Personal Info</p>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-firstname">First Name</label>
          <input
            id="id-firstname"
            className="identity-field__input"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-lastname">Last Name</label>
          <input
            id="id-lastname"
            className="identity-field__input"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-birthday">Birthday</label>
          <DatePickerField id="id-birthday" value={birthDay} onChange={setBirthDay} />
        </div>
      </div>

      <div className="identity-section">
        <p className="identity-section__label">Photo Verification</p>
        <div className="id-cameras">
          <CameraCapture
            label="Document Photo"
            facingMode="environment"
            preview={docPhoto}
            onCapture={setDocPhoto}
            icon={
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="26" height="18" rx="3" />
                <rect x="8" y="12" width="10" height="7" rx="1.5" />
                <circle cx="23" cy="20" r="1.5" fill="currentColor" stroke="none" />
                <path d="M10 6h12" />
              </svg>
            }
          />
          <CameraCapture
            label="Selfie Photo"
            facingMode="user"
            preview={selfiePhoto}
            onCapture={setSelfiePhoto}
            icon={
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="14" r="5" />
                <path d="M6 26c0-4.4 4.5-7.5 10-7.5s10 3.1 10 7.5" />
                <path d="M22 4l3 3-3 3" />
                <path d="M25 7h-4" />
              </svg>
            }
          />
        </div>
      </div>

      <button type="submit" className="identity-submit" disabled={!canSubmit}>
        Submit Verification
      </button>
    </form>
  );
}

const RECEIVED = [
  { id: 'r1', name: 'Kian M.', method: 'Revolut', amount: 100 },
  { id: 'r2', name: 'Sara R.', method: 'Zelle', amount: 50 },
  { id: 'r3', name: 'Mina H.', method: 'SEPA', amount: 200 },
  { id: 'r4', name: 'Parisa K.', method: 'Revolut', amount: 80 },
  { id: 'r5', name: 'Ali F.', method: 'Zelle', amount: 150 },
  { id: 'r6', name: 'Dina S.', method: 'SEPA', amount: 60 },
  { id: 'r7', name: 'Navid R.', method: 'Revolut', amount: 120 },
  { id: 'r8', name: 'Shirin A.', method: 'Zelle', amount: 95 },
  { id: 'r9', name: 'Babak M.', method: 'SEPA', amount: 175 },
  { id: 'r10', name: 'Yasmin H.', method: 'Revolut', amount: 40 },
  { id: 'r11', name: 'Kamran T.', method: 'Zelle', amount: 220 },
  { id: 'r12', name: 'Noushin P.', method: 'SEPA', amount: 65 },
  { id: 'r13', name: 'Amir E.', method: 'Revolut', amount: 310 },
  { id: 'r14', name: 'Golnaz F.', method: 'Zelle', amount: 88 },
  { id: 'r15', name: 'Cyrus B.', method: 'SEPA', amount: 130 },
  { id: 'r16', name: 'Saman K.', method: 'Revolut', amount: 55 },
  { id: 'r17', name: 'Ladan V.', method: 'Zelle', amount: 190 },
  { id: 'r18', name: 'Hooman D.', method: 'SEPA', amount: 70 },
  { id: 'r19', name: 'Farzad N.', method: 'Revolut', amount: 250 },
  { id: 'r20', name: 'Roxana J.', method: 'Zelle', amount: 45 },
  { id: 'r21', name: 'Dariush M.', method: 'SEPA', amount: 160 },
];

const SENT = [
  { id: 's1', name: 'Shahram K.', method: 'Revolut', amount: 200 },
  { id: 's2', name: 'Neda A.', method: 'Zelle', amount: 75 },
  { id: 's3', name: 'Reza P.', method: 'SEPA', amount: 120 },
  { id: 's4', name: 'Leila M.', method: 'Revolut', amount: 90 },
  { id: 's5', name: 'Omid T.', method: 'Zelle', amount: 45 },
  { id: 's6', name: 'Farid N.', method: 'SEPA', amount: 300 },
  { id: 's7', name: 'Tara S.', method: 'Revolut', amount: 135 },
  { id: 's8', name: 'Pouya L.', method: 'Zelle', amount: 60 },
  { id: 's9', name: 'Mahsa G.', method: 'SEPA', amount: 185 },
  { id: 's10', name: 'Siavash R.', method: 'Revolut', amount: 50 },
  { id: 's11', name: 'Nasim K.', method: 'Zelle', amount: 275 },
  { id: 's12', name: 'Behzad O.', method: 'SEPA', amount: 95 },
  { id: 's13', name: 'Marjan T.', method: 'Revolut', amount: 410 },
  { id: 's14', name: 'Arash C.', method: 'Zelle', amount: 72 },
  { id: 's15', name: 'Firouzeh B.', method: 'SEPA', amount: 115 },
  { id: 's16', name: 'Kaveh M.', method: 'Revolut', amount: 340 },
  { id: 's17', name: 'Zara P.', method: 'Zelle', amount: 83 },
  { id: 's18', name: 'Hamed V.', method: 'SEPA', amount: 155 },
  { id: 's19', name: 'Elnaz D.', method: 'Revolut', amount: 60 },
  { id: 's20', name: 'Morteza F.', method: 'Zelle', amount: 230 },
  { id: 's21', name: 'Shadi N.', method: 'SEPA', amount: 78 },
];

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [layoutMode, setLayoutMode] = useState('list');
  const [tallScreen, setTallScreen] = useState(() => window.matchMedia('(min-height: 500px)').matches);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', THEMES[themeIdx]);
  }, [themeIdx]);

  useEffect(() => {
    const mq = window.matchMedia('(min-height: 500px)');
    const handler = (e) => setTallScreen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Telegram Mini App initialization
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    // Prevent swipe-down minimize gesture
    tg.disableVerticalSwipes?.();
    applyTgSafeArea();

    // Re-expand if the user somehow collapses the app
    const onViewportChanged = () => {
      if (!tg.isExpanded) tg.expand();
    };

    tg.onEvent('safeAreaChanged',        applyTgSafeArea);
    tg.onEvent('contentSafeAreaChanged', applyTgSafeArea);
    tg.onEvent('viewportChanged',        onViewportChanged);
    return () => {
      tg.offEvent('safeAreaChanged',        applyTgSafeArea);
      tg.offEvent('contentSafeAreaChanged', applyTgSafeArea);
      tg.offEvent('viewportChanged',        onViewportChanged);
    };
  }, []);

  // Sync Telegram header/background color with theme
  useEffect(() => {
    if (!tg) return;
    const key = THEMES[themeIdx] ?? 'default';
    const colors = TG_THEME_COLORS[key] ?? TG_THEME_COLORS.default;
    tg.setHeaderColor?.(colors.header);
    tg.setBackgroundColor?.(colors.bg);
  }, [themeIdx]);

  // Telegram Back Button for sub-pages
  useEffect(() => {
    if (!tg?.BackButton) return;
    if (activePage !== 'home') {
      tg.BackButton.show();
      const onBack = () => setActivePage('home');
      tg.BackButton.onClick(onBack);
      return () => tg.BackButton.offClick(onBack);
    } else {
      tg.BackButton.hide();
    }
  }, [activePage]);

  const totalReceived = useMemo(() => RECEIVED.reduce((sum, item) => sum + item.amount, 0), []);
  const totalSent = useMemo(() => SENT.reduce((sum, item) => sum + item.amount, 0), []);

  const tiles = useMemo(() => {
    if (filter === 'received') return RECEIVED.map((data) => ({ data, type: 'received' }));
    if (filter === 'sent') return SENT.map((data) => ({ data, type: 'sent' }));
    const out = [];
    const max = Math.max(RECEIVED.length, SENT.length);
    for (let i = 0; i < max; i++) {
      if (RECEIVED[i]) out.push({ data: RECEIVED[i], type: 'received' });
      if (SENT[i]) out.push({ data: SENT[i], type: 'sent' });
    }
    return out;
  }, [filter]);

  const handleTap = useCallback((item, type) => setDetail({ item, type }), []);

  if (loading) return <SplashLoader />;

  const SUB_PAGES = { identity: 'Identity Verification' };
  const isSubPage = activePage in SUB_PAGES;

  const header = isSubPage
    ? <PageHeader title={SUB_PAGES[activePage]} onBack={() => setActivePage('home')} />
    : (
      <header className="p2p-header">
        <div className="p2p-header__text-group">
          <h1 className="p2p-header__title">P2P <b>PayDa</b></h1>
          <p className="p2p-header__sub">All transactions</p>
        </div>
        <div className="p2p-header__right">
          <div className="p2p-summary">
            <div className="p2p-summary__row">
              <span className="p2p-summary__pos">+€{totalReceived.toLocaleString()}</span>
              <span className="p2p-summary__neg">−€{totalSent.toLocaleString()}</span>
            </div>
            <span className="p2p-summary__label">this period</span>
          </div>
          <ThemeToggle themeIdx={themeIdx} onToggle={() => setThemeIdx(i => (i + 1) % THEMES.length)} />
          <button type="button" className="p2p-header__avatar" aria-label="Profile" onClick={() => setShowProfile(true)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="6.5" r="3" />
              <path d="M2.5 15.5c0-3.3 2.9-5.3 6.5-5.3s6.5 2 6.5 5.3" />
            </svg>
          </button>
        </div>
      </header>
    );

  return (
    <AppShell
      header={header}
      activePage={activePage}
      onNavigate={setActivePage}
      onProfile={() => setShowProfile(true)}
      onExchange={() => setShowAdd(true)}
    >
      {activePage === 'home' && (
        <>
          <FilterBar
            active={filter}
            onChange={setFilter}
            layout={layoutMode}
            onToggleLayout={() => setLayoutMode(m => m === 'tile' ? 'list' : 'tile')}
          />
          <main className="p2p-lists" aria-label="Transactions">
            {layoutMode === 'tile' ? (
              <div className="p2p-tiles-wrap p2p-scroll">
                <div className="p2p-tiles" role="list">
                  {tiles.map(({ data, type }) => (
                    <TxTile key={`${type}-${data.id}`} item={data} type={type} onTap={handleTap} />
                  ))}
                </div>
              </div>
            ) : filter === 'all' && tallScreen ? (
              <div className="p2p-list-wrap p2p-list-wrap--split">
                <div className="p2p-list-col" role="list" aria-label="Received">
                  <p className="p2p-list-col__head p2p-list-col__head--r">Received</p>
                  {RECEIVED.map((data) => (
                    <TxListItem key={data.id} item={data} type="received" onTap={handleTap} />
                  ))}
                </div>
                <div className="p2p-list-col" role="list" aria-label="Sent">
                  <p className="p2p-list-col__head p2p-list-col__head--s">Sent</p>
                  {SENT.map((data) => (
                    <TxListItem key={data.id} item={data} type="sent" onTap={handleTap} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p2p-list-wrap p2p-scroll" role="list">
                {tiles.map(({ data, type }) => (
                  <TxListItem key={`${type}-${data.id}`} item={data} type={type} onTap={handleTap} />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {activePage === 'identity' && (
        <IdentityContent onDone={() => setActivePage('home')} />
      )}

      {activePage === 'wallet' && <PlaceholderPage title="Wallet" icon="wallet" />}
      {activePage === 'markets' && <PlaceholderPage title="Markets" icon="markets" />}

      {detail && <DetailSheet item={detail.item} type={detail.type} onClose={() => setDetail(null)} />}
      {showAdd && <ExchangeModal onClose={() => setShowAdd(false)} />}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onIdentity={() => { setShowProfile(false); setActivePage('identity'); }}
        />
      )}
    </AppShell>
  );
}
