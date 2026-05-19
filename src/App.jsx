import { useState, useEffect, useLayoutEffect, useRef, memo, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { tokenStore } from './api/apiClient.js';
import { authApi } from './api/auth.js';
import { usersApi } from './api/users.js';
import { exchangeRatesApi } from './api/exchangeRates.js';
import { requestsApi } from './api/requests.js';
import { receiversApi } from './api/receivers.js';
import { transactionsApi } from './api/transactions.js';
import { matchesApi } from './api/matches.js';

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
  dark:    { header: '#050A14', bg: '#050A14' },
  light:   { header: '#EEEDE8', bg: '#EEEDE8' },
  default: { header: '#EEEDE8', bg: '#EEEDE8' },
};

const THEMES = ['light', 'dark'];

const SUB_PAGES = { identity: 'Identity Verification', profile: 'Profile' };

const SplashLoader = memo(function SplashLoader() {
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
});

const ThemeToggle = memo(function ThemeToggle({ themeIdx, onToggle }) {
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
});

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

const SORTS = [
  { id: 'highest', label: 'Highest' },
  { id: 'lowest', label: 'Lowest' },
];

const LayoutToggleBtn = memo(function LayoutToggleBtn({ layout, onToggle }) {
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
});

const SortBar = memo(function SortBar({ sort, onSort, layout, onToggleLayout }) {
  return (
    <div role="toolbar" aria-label="Sort transactions" className="p2p-filterbar">
      <LayoutToggleBtn layout={layout} onToggle={onToggleLayout} />
      <span className="p2p-filterbar__label">Sort</span>
      {SORTS.map((s) => {
        const isActive = sort === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSort(isActive ? null : s.id)}
            aria-pressed={isActive}
            className={`p2p-filter-btn ${isActive ? 'p2p-filter-btn--active' : ''}`}
          >
            <span className="p2p-filter-btn__label">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
});

const TxListItem = memo(function TxListItem({ item, type, onTap }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountColor = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';
  const initials = item.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <article
      role="button"
      tabIndex={0}
      className={`match-card ${isReceived ? 'match-card--received' : 'match-card--sent'}`}
      aria-label={`${type} ${sign}€${item.amount} ${item.name} via ${item.method}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTap(item, type)}
    >
      <div className="match-card__top">
        <div className="match-card__avatar" aria-hidden="true">{initials}</div>

        <div className="match-card__info">
          <div className="match-card__name-row">
            <span className="match-card__name">{item.name}</span>
            {item.trusted && (
              <span className="match-card__trust" aria-label="Trusted">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <path d="M5 0.5L6.18 3.32L9.24 3.55L7.04 5.44L7.73 8.45L5 6.8L2.27 8.45L2.96 5.44L0.76 3.55L3.82 3.32L5 0.5Z"/>
                </svg>
                Trust
              </span>
            )}
          </div>
          <div className="match-card__meta">
            <span className="match-card__level">Lv {item.level} · {LEVEL_LABELS[item.level]}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__method">{item.method}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__date">{fmtDate(item.date)}</span>
          </div>
        </div>

        <div className="match-card__right">
          <span className="match-card__amount" style={{ color: amountColor }}>
            {sign}€{item.amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="match-card__footer">
        <div className="match-card__rate-wrap">
          <span className="match-card__rate-label">Rate</span>
          <span className="match-card__rate">{item.rate.toLocaleString()} T</span>
        </div>
        <span className="match-badge match-badge--done">Completed</span>
      </div>
    </article>
  );
});

const TransactionListPage = memo(function TransactionListPage({ data, type, sort, layout, onSort, onLayoutToggle, onTap }) {
  const sorted = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => sort === 'highest' ? b.amount - a.amount : a.amount - b.amount);
  }, [data, sort]);

  if (data.length === 0) {
    return (
      <div className="empty-state" role="status">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        <p className="empty-state__text">No {type} transactions yet</p>
        <p className="empty-state__sub">Your completed transactions will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <SortBar sort={sort} onSort={onSort} layout={layout} onToggleLayout={onLayoutToggle} />
      <main className="p2p-lists" aria-label="Transactions">
        {layout === 'tile' ? (
          <div className="p2p-tiles-wrap p2p-scroll">
            <div className="p2p-tiles" role="list">
              {sorted.map((item) => (
                <TxTile key={item.id} item={item} type={type} onTap={onTap} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p2p-list-wrap p2p-scroll" role="list">
            {sorted.map((item) => (
              <TxListItem key={item.id} item={item} type={type} onTap={onTap} />
            ))}
          </div>
        )}
      </main>
    </>
  );
});

const TX_STATUS_DISPLAY = {
  Pending:            { label: 'Pending',         color: 'var(--amber-deep)' },
  ScreenshotUploaded: { label: 'Payment Uploaded', color: 'var(--amber-deep)' },
  Confirmed:          { label: 'Confirmed',        color: 'var(--leaf-deep)'  },
  Settled:            { label: 'Completed',        color: 'var(--leaf-deep)'  },
  Disputed:           { label: 'Disputed',         color: 'var(--rose-deep)'  },
};

function DetailSheet({ item, type, onClose }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const color = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';
  const statusInfo = TX_STATUS_DISPLAY[item.status] ?? { label: item.status ?? 'Unknown', color: 'var(--muted)' };

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
        {item.reference && (
          <div className="detail-row">
            <span className="detail-row__label">Reference</span>
            <span className="detail-row__value" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.reference}
            </span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-row__label">Status</span>
          <span className="detail-row__value" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function MatchConfirmSheet({ item, userDirection, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  const isSend = userDirection === 'send';
  const amountColor = isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)';
  const sign = isSend ? '−' : '+';

  async function handleConfirm() {
    setLoading(true);
    try {
      await matchesApi.create({ requestId: item.id });
      onConfirmed();
    } catch {
      // error shown via notification bus
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__title">Confirm Match</div>
        <p className="sheet__sub">
          {isSend ? `You send to ${item.name}` : `You receive from ${item.name}`} · via {item.method}
        </p>

        <div className="detail-row">
          <span className="detail-row__label">Amount</span>
          <span className="detail-row__value detail-row__value--big" style={{ color: amountColor }}>
            {sign}€{item.amount.toLocaleString()}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Rate</span>
          <span className="detail-row__value">{item.rate.toLocaleString()} T</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">Method</span>
          <span className="detail-row__value">{item.method}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row__label">User Level</span>
          <span className="detail-row__value">
            Lv {item.level}
            {item.trusted && <span className="match-card__trust" style={{ marginLeft: 6 }}>Trust</span>}
          </span>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Creating…' : 'Create Match'}
          </button>
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

const EXCHANGE_METHODS = ['Revolut', 'Zelle', 'PayPal', 'SEPA', 'Wire'];

const CURRENCY_ENUM       = { EUR: 0, USD: 1, CAD: 2 };
const REQUEST_TYPE_ENUM   = { send: 0, receive: 1 };
const RATE_TYPE_ENUM      = { Market: 0, Instant: 1, Custom: 2 };
const PAYMENT_METHOD_ENUM = { Revolut: 0, Zelle: 1, PayPal: 2, SEPA: 3, Wire: 4 };

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
  const [showNewReceiverForm, setShowNewReceiverForm] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [rcvFirstName, setRcvFirstName] = useState('');
  const [rcvLastName, setRcvLastName] = useState('');
  const [rcvNationalId, setRcvNationalId] = useState('');
  const [rcvMobile, setRcvMobile] = useState('');
  const [rcvIban, setRcvIban] = useState('');

  // API state
  const [eurRates, setEurRates] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [savedReceivers, setSavedReceivers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load exchange rates on mount
  useEffect(() => {
    exchangeRatesApi.getAll().then((data) => {
      const eur = data?.find?.((r) => r.currency === 'EUR');
      if (eur) setEurRates(eur);
    }).catch(() => {});
  }, []);

  // Load receivers when reaching step 2
  useEffect(() => {
    if (step === 2) {
      receiversApi.getAll().then(setSavedReceivers).catch(() => {});
    }
  }, [step]);

  // Call preview API whenever pricing inputs change
  useEffect(() => {
    const amtNum = parseFloat(amount);
    if (!amtNum || !methods.length) { setPreviewData(null); return; }

    const rateType = selectedRate === 'bonbast' ? 'Market'
      : selectedRate === 'urgent'  ? 'Instant'
      : showCustomInput            ? 'Custom'
      : null;
    if (!rateType) { setPreviewData(null); return; }

    const customRateVal = rateType === 'Custom' ? parseFloat(proposedAmount) || null : null;
    if (rateType === 'Custom' && !customRateVal) { setPreviewData(null); return; }

    const timer = setTimeout(async () => {
      try {
        const result = await requestsApi.preview({
          type: REQUEST_TYPE_ENUM[direction],
          currency: CURRENCY_ENUM[currency],
          amount: amtNum,
          rateType: RATE_TYPE_ENUM[rateType],
          customRate: customRateVal,
        });
        setPreviewData(result);
      } catch { setPreviewData(null); }
    }, 400);
    return () => clearTimeout(timer);
  }, [amount, currency, direction, selectedRate, proposedAmount, showCustomInput, methods.length]);

  const bonbastRate = eurRates?.marketRate  ?? BONBAST_RATE;
  const urgentRate  = eurRates?.instantRate ?? URGENT_RATE;

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
  const step2Valid = (showNewReceiverForm
    ? !!(rcvFirstName.trim() && rcvLastName.trim() && rcvNationalId.trim() && rcvMobile.trim() && rcvIban.trim())
    : !!selectedReceiverId) && !submitting;

  const amtNum        = previewData?.amount           ?? (parseFloat(amount) || 0);
  const exchangeAmt   = previewData ? (previewData.amount * (previewData.rateValue || 1)) : 0;
  const commissionAmt = previewData?.commissionAmount ?? 0;
  const totalAmt      = previewData?.totalAmount      ?? 0;
  const rateDisplay   = previewData?.rateValue        ?? (parseFloat(proposedAmount) || 0);

  const handleGoToStep2 = async () => {
    const amtNum = parseFloat(amount);
    const rateType = selectedRate === 'bonbast' ? 'Market'
      : selectedRate === 'urgent'  ? 'Instant'
      : showCustomInput            ? 'Custom'
      : null;
    const customRateVal = rateType === 'Custom' ? parseFloat(proposedAmount) || null : null;

    if (amtNum && rateType && (rateType !== 'Custom' || customRateVal)) {
      setPreviewLoading(true);
      try {
        const result = await requestsApi.preview({
          type: REQUEST_TYPE_ENUM[direction],
          currency: CURRENCY_ENUM[currency],
          amount: amtNum,
          rateType: RATE_TYPE_ENUM[rateType],
          customRate: customRateVal,
        });
        setPreviewData(result);
      } catch {
        setPreviewData(null);
      } finally {
        setPreviewLoading(false);
      }
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!step2Valid) return;
    setSubmitting(true);
    try {
      let receiverId = selectedReceiverId;
      if (showNewReceiverForm) {
        const created = await receiversApi.create({
          firstName: rcvFirstName,
          lastName: rcvLastName,
          nationalId: rcvNationalId,
          mobileNumber: rcvMobile,
          iban: rcvIban,
        });
        receiverId = created?.id;
      }
      const rateTypeStr = selectedRate === 'bonbast' ? 'Market'
        : selectedRate === 'urgent'  ? 'Instant'
        : 'Custom';
      await requestsApi.create({
        type: REQUEST_TYPE_ENUM[direction],
        currency: CURRENCY_ENUM[currency],
        amount: parseFloat(amount),
        rateType: RATE_TYPE_ENUM[rateTypeStr],
        customRate: rateTypeStr === 'Custom' ? parseFloat(proposedAmount) || null : null,
        paymentMethods: methods.map((m) => PAYMENT_METHOD_ENUM[m]),
        receiverId,
      });
      onClose();
    } catch {
      // error shown via notification bus
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet exchange-modal" onClick={(event) => event.stopPropagation()}>
        <div className="sheet__handle" />

        {step === 1 ? (
          <>
            <div className="sheet__title-row">
              <div className="sheet__title">Exchange Request</div>
              <ExchangeHelp />
            </div>
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
              <p className="exchange-modal__hint" style={{ visibility: methods.length === 0 ? 'visible' : 'hidden' }}>
                Select at least one payment method
              </p>
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
                        onClick={() => handleRateSelect('bonbast', bonbastRate)}
                        aria-pressed={selectedRate === 'bonbast'}
                      >
                        <span className="price-col__check" aria-hidden="true">
                          {selectedRate === 'bonbast'
                            ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5l2.5 2.5L9 3" /></svg>
                            : <span className="price-col__dot" />}
                        </span>
                        <span className="price-col__value">{bonbastRate.toLocaleString()}</span>
                      </button>
                    </div>

                    <div className="price-col">
                      <p className="price-col__label">Urgent Price</p>
                      <button
                        type="button"
                        className={`price-col__card ${selectedRate === 'urgent' ? 'price-col__card--urgent' : ''}`}
                        onClick={() => handleRateSelect('urgent', urgentRate)}
                        aria-pressed={selectedRate === 'urgent'}
                      >
                        <span className="price-col__check" aria-hidden="true">
                          {selectedRate === 'urgent'
                            ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5l2.5 2.5L9 3" /></svg>
                            : <span className="price-col__dot" />}
                        </span>
                        <span className="price-col__value">{urgentRate.toLocaleString()}</span>
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
                disabled={!step1Valid || previewLoading}
                onClick={handleGoToStep2}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="6.5" r="5" />
                  <path d="M4.5 6.5h4M7 4.5l2 2-2 2" />
                </svg>
                {previewLoading ? 'Loading…' : 'Receiver Information'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sheet__title">Receiver Information</div>
            <p className="sheet__sub">Enter the recipient's details to complete the request</p>

            <div className="exchange-summary">
              <div className="exchange-summary__row">
                <span>{amtNum.toLocaleString()} {currSymbol}</span>
                <span className="exchange-summary__eq">{'×'}</span>
                <span>{rateDisplay.toLocaleString()}</span>
              </div>
              <div className="exchange-summary__row exchange-summary__row--commission">
                <span>{previewData ? `${previewData.commissionPercent}% commission` : 'Commission'}</span>
                <span className="exchange-summary__eq">{'='}</span>
                <span>{commissionAmt.toLocaleString()}</span>
              </div>
              <div className="exchange-summary__divider" />
              <div className="exchange-summary__row exchange-summary__row--total">
                <span>TOTAL</span>
                <span className="exchange-summary__eq">{'='}</span>
                <span>{totalAmt.toLocaleString()}</span>
              </div>
            </div>

            {showNewReceiverForm ? (
              <div className="exchange-modal__section">
                <button
                  type="button"
                  className="rcv-back-btn"
                  onClick={() => setShowNewReceiverForm(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2L4 6.5 8 11" />
                  </svg>
                  Saved Receivers
                </button>
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
            ) : (
              <div className="exchange-modal__section">
                <button
                  type="button"
                  className="rcv-add-btn"
                  onClick={() => setShowNewReceiverForm(true)}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 2v9M2 6.5h9" />
                  </svg>
                  Add New Receiver
                </button>
                <div className="rcv-list">
                  {savedReceivers.map((r) => {
                    const isSelected = selectedReceiverId === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={`rcv-item${isSelected ? ' rcv-item--selected' : ''}`}
                        onClick={() => setSelectedReceiverId(r.id)}
                      >
                        <span className="rcv-item__radio" aria-hidden="true">
                          {isSelected
                            ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="9" r="4.5" fill="currentColor"/></svg>
                            : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5"/></svg>
                          }
                        </span>
                        <span className="rcv-item__info">
                          <span className="rcv-item__name">{r.firstName} {r.lastName}</span>
                          <span className="rcv-item__iban">{r.iban}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Help Balloon (reusable) ───────────────────────────────────
const SCREEN_GAP = 12;

function calcPos(btnRect, balloonW, balloonH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = btnRect.left - 8;
  if (left + balloonW > vw - SCREEN_GAP) left = vw - balloonW - SCREEN_GAP;
  if (left < SCREEN_GAP) left = SCREEN_GAP;

  const spaceBelow = vh - btnRect.bottom - 10;
  const top = spaceBelow >= balloonH
    ? btnRect.bottom + 10
    : btnRect.top - balloonH - 10;

  const btnCenterX = btnRect.left + btnRect.width / 2;
  const arrowLeft = Math.max(12, Math.min(btnCenterX - left - 6, balloonW - 24));

  return { top, left, arrowLeft };
}

function HelpBalloon({ anchorRef, onClose, title, children }) {
  const ref = useRef(null);
  // Render off-screen first so useLayoutEffect can measure real dimensions
  const [pos, setPos] = useState({ top: -9999, left: -9999, arrowLeft: 16, ready: false });

  // useLayoutEffect: runs sync after DOM paint — no visible flash
  useLayoutEffect(() => {
    if (!ref.current || !anchorRef?.current) return;
    const btn = anchorRef.current.getBoundingClientRect();
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    setPos({ ...calcPos(btn, w, h), ready: true });
  }, [anchorRef]);

  useEffect(() => {
    function onPointerDown(e) {
      if (
        ref.current && !ref.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose();
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [onClose, anchorRef]);

  return createPortal(
    <div
      className="help-balloon"
      ref={ref}
      style={{
        top: pos.top,
        left: pos.left,
        opacity: pos.ready ? 1 : 0,
        pointerEvents: pos.ready ? 'auto' : 'none',
      }}
      role="dialog"
      aria-label="Help"
    >
      <div className="help-balloon__arrow" style={{ left: pos.arrowLeft }} aria-hidden="true" />
      <div className="help-balloon__head">
        <span className="help-balloon__title">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.5v3.5M7 9.5h.01" />
          </svg>
          {title}
        </span>
        <button type="button" className="help-balloon__close" onClick={onClose} aria-label="Close help">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>
      </div>
      {children}
    </div>,
    document.body
  );
}

// ── Help button + balloon for the main header ─────────────────
const HeaderHelp = memo(function HeaderHelp() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  return (
    <div className="help-anchor">
      <button
        ref={btnRef}
        type="button"
        className={`help-btn${open ? ' help-btn--active' : ''}`}
        aria-label="Help"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M4.5 4.8a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.2-1.5 2.2M6 9h.01" />
        </svg>
      </button>
      {open && (
        <HelpBalloon anchorRef={btnRef} onClose={() => setOpen(false)} title="About PayDa">
          <p className="help-balloon__desc">
            PayDa is a peer-to-peer payment platform for fast and secure currency exchange.
          </p>
          <ul className="help-balloon__list">
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Send &amp; receive money internationally
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Exchange via Revolut, Zelle, SEPA &amp; more
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Track all transactions in real-time
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Verified identity &amp; secure transfers
            </li>
          </ul>
        </HelpBalloon>
      )}
    </div>
  );
});

// ── Help button + balloon for Exchange modal ──────────────────
const ExchangeHelp = memo(function ExchangeHelp() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  return (
    <div className="help-anchor">
      <button
        ref={btnRef}
        type="button"
        className={`help-btn help-btn--dark${open ? ' help-btn--active' : ''}`}
        aria-label="Exchange help"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="4.5" />
          <path d="M4.5 4.8a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.2-1.5 2.2M6 9h.01" />
        </svg>
      </button>
      {open && (
        <HelpBalloon anchorRef={btnRef} onClose={() => setOpen(false)} title="Exchange Guide">
          <p className="help-balloon__desc">
            Submit a currency exchange request in two steps.
          </p>
          <ul className="help-balloon__list">
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Choose Send or Receive direction
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Enter amount &amp; select payment method
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Pick Bonbast, Urgent, or custom rate
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
              Add receiver info &amp; confirm — 1% commission applies
            </li>
          </ul>
        </HelpBalloon>
      )}
    </div>
  );
});

// ── Terms & Conditions Modal ──────────────────────────────────
const TERMS_KEY = 'payda_terms_v1';

const TermsModal = memo(function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="terms-backdrop">
      <div className="terms-sheet">
        <div className="terms-sheet__handle" />

        <div className="terms-header">
          <div className="terms-header__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <path d="M10 9h8M10 13h8M10 17h5" />
            </svg>
          </div>
          <h2 className="terms-header__title">Terms &amp; Conditions</h2>
          <p className="terms-header__sub">Please read carefully before continuing</p>
        </div>

        <div className="terms-body" dir="ltr" lang="fa">
          <p className="terms-body__greeting">Dear User</p>
          <p className="terms-body__text">
            We are very happy that you have joined the<span className="terms-body__brand">Payda</span> group.
          </p>
        </div>

        <div className="terms-footer">
          <label className="terms-check">
            <input
              type="checkbox"
              className="terms-check__input"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="terms-check__box" aria-hidden="true">
              {checked && (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5l3 3L9.5 2" />
                </svg>
              )}
            </span>
            <span className="terms-check__label">I have read and accept the terms and conditions</span>
          </label>

          <button
            type="button"
            className="terms-confirm-btn"
            disabled={!checked}
            onClick={onAccept}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Shared Layout ─────────────────────────────────────────────────

const BgOrbs = memo(function BgOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
      <div className="bg-orb bg-orb--4" />
      <div className="bg-orb bg-orb--5" />
    </div>
  );
});

const PageHeader = memo(function PageHeader({ title, onBack }) {
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
});

const AppTabBar = memo(function AppTabBar({ activePage, onNavigate, onProfile, onExchange }) {
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

      <button type="button" className={`p2p-tab ${activePage === 'sent' ? 'is-active' : ''}`} onClick={() => onNavigate('sent')} aria-label="Sent">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5,12 12,5 19,12" />
        </svg>
        <span className="p2p-tab__label">Sent</span>
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

      <button type="button" className={`p2p-tab ${activePage === 'received' ? 'is-active' : ''}`} onClick={() => onNavigate('received')} aria-label="Received">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19,12 12,19 5,12" />
        </svg>
        <span className="p2p-tab__label">Received</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>

      <button type="button" className={`p2p-tab ${activePage === 'matches' ? 'is-active' : ''}`} onClick={() => onNavigate('matches')} aria-label="Matches">
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          <path d="M15 5l4 4" />
        </svg>
        <span className="p2p-tab__label">Matches</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>
    </nav>
  );
});

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

const PlaceholderPage = memo(function PlaceholderPage({ title, icon }) {
  const icons = {
    home: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,17 8,10 13,14 18,6 21,9" />
        <line x1="3" y1="17" x2="22" y2="17" />
      </svg>
    ),
  };
  return (
    <div className="placeholder-page">
      <span className="placeholder-page__icon">{icons[icon]}</span>
      <span className="placeholder-page__label">Coming soon</span>
    </div>
  );
});

const ProfileModal = memo(function ProfileModal({ onClose, onProfile, onIdentity }) {
  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="profile-modal__item" onClick={() => { onClose(); onProfile(); }}>
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
});

const KYC_STATUS_DISPLAY = {
  Pending:  { label: 'Under Review', color: 'var(--amber-deep)' },
  Approved: { label: 'Verified',     color: 'var(--leaf-deep)'  },
  Rejected: { label: 'Rejected',     color: 'var(--rose-deep)'  },
};

function ProfileContent({ profile }) {
  const { firstName, lastName, phoneVerified, selfiePhoto, docPhoto, kycStatus } = profile ?? {};

  const PhotoItem = ({ label, photo }) => (
    <div className="profile-photo-item">
      <div className="profile-photo-thumb-wrap">
        {photo ? (
          <img className="profile-photo-thumb" src={photo?.url ?? photo} alt={label} />
        ) : (
          <div className="profile-photo-placeholder">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="18" height="14" rx="2.5" />
              <circle cx="11" cy="12" r="3.5" />
              <path d="M7 5V4a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
          </div>
        )}
      </div>
      <div className="profile-photo-info">
        <span className="profile-photo-label">{label}</span>
        <span className={`profile-photo-status${photo ? ' profile-photo-status--ok' : ''}`}>
          {photo ? 'Uploaded' : 'Not uploaded yet'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="page-scroll profile-page">
      <div className="identity-section">
        <p className="identity-section__label">Personal Info</p>
        <div className="identity-field">
          <label className="identity-field__label">First Name</label>
          <div className={`profile-value${!firstName ? ' profile-value--empty' : ''}`}>
            {firstName || 'Not provided'}
          </div>
        </div>
        <div className="identity-field">
          <label className="identity-field__label">Last Name</label>
          <div className={`profile-value${!lastName ? ' profile-value--empty' : ''}`}>
            {lastName || 'Not provided'}
          </div>
        </div>
      </div>

      <div className="identity-section">
        <p className="identity-section__label">Contact</p>
        <div className="identity-field">
          <label className="identity-field__label">Mobile Number</label>
          <div className="profile-value profile-value--phone">
            <span className={phoneVerified ? '' : 'profile-value--empty'}>
              {phoneVerified ? 'Verified via Telegram' : 'Not verified'}
            </span>
            {phoneVerified && (
              <span className="profile-verified-badge">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5l2.8 2.8L9.5 2" />
                </svg>
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {kycStatus && (
        <div className="identity-section">
          <p className="identity-section__label">KYC Status</p>
          <div className="identity-field">
            <label className="identity-field__label">Verification</label>
            <div className="profile-value" style={{ color: KYC_STATUS_DISPLAY[kycStatus]?.color ?? 'var(--muted)' }}>
              {KYC_STATUS_DISPLAY[kycStatus]?.label ?? kycStatus}
            </div>
          </div>
        </div>
      )}

      <div className="identity-section">
        <p className="identity-section__label">Photo Verification</p>
        <div className="profile-photos">
          <PhotoItem label="Selfie Photo" photo={selfiePhoto} />
          <PhotoItem label="Identity Document" photo={docPhoto} />
        </div>
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
      onCapture({ url: URL.createObjectURL(blob), blob });
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
            <img className="id-camera-btn__preview" src={preview?.url ?? preview} alt={label} />
            <span className="id-camera-btn__retake">Retake</span>
          </>
        ) : (
          <>
            <span className="id-camera-btn__icon">{icon}</span>
            <span className="id-camera-btn__text">Tap to open camera</span>
          </>
        )}
      </button>

      {open && createPortal(
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
        </div>,
        document.querySelector('.app-content') ?? document.body
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
        <span>{value ? displayValue : 'Select date'}</span>
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

function IdentityContent({ profile, onDone, onSave }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [docPhoto, setDocPhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(profile?.phoneVerified ?? false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = firstName.trim() && lastName.trim() && birthDay && phoneVerified && docPhoto && selfiePhoto && !submitting;

  async function handleVerifyPhone() {
    const tgApp = window.Telegram?.WebApp;
    if (!tgApp?.requestContact) {
      setPhoneVerified(true);
      return;
    }
    setVerifyingPhone(true);
    tgApp.requestContact(async (success, result) => {
      if (!success) { setVerifyingPhone(false); return; }
      const raw = result?.contact?.phone_number ?? result?.phone_number ?? '';
      const normalized = raw.startsWith('+') ? raw : `+${raw}`;
      alert(`DEBUG – raw: ${raw}\nnormalized: ${normalized}\nfull result: ${JSON.stringify(result)}`);
      setVerifyingPhone(false);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('dateOfBirth', birthDay);
      if (selfiePhoto?.blob) formData.append('selfieImage', selfiePhoto.blob, 'selfie.jpg');
      if (docPhoto?.blob)    formData.append('documentImage', docPhoto.blob, 'document.jpg');
      await usersApi.submitKyc(formData);
      onSave?.({ firstName, lastName, birthDay, phoneVerified, selfiePhoto: selfiePhoto?.url, docPhoto: docPhoto?.url });
      onDone();
    } catch {
      // error shown via notification bus
    } finally {
      setSubmitting(false);
    }
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
          <label className="identity-field__label">Mobile Number</label>
          <button
            type="button"
            className={`identity-verify-btn${phoneVerified ? ' identity-verify-btn--verified' : ''}`}
            onClick={handleVerifyPhone}
            disabled={phoneVerified || verifyingPhone}
          >
            {phoneVerified ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7l3.5 3.5L12 3" />
                </svg>
                {phoneNumber || 'Verified'}
              </>
            ) : verifyingPhone ? (
              'Verifying…'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2l3 3-3 3" />
                  <path d="M12 5H6a3 3 0 0 0 0 6h1" />
                </svg>
                Verify via Telegram
              </>
            )}
          </button>
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
        {submitting ? 'Submitting…' : 'Submit Verification'}
      </button>
    </form>
  );
}

const LEVEL_LABELS = ['', 'Starter', 'Basic', 'Advanced', 'Expert', 'Elite'];

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const MatchCard = memo(function MatchCard({ item, type, ratio, onTap }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountColor = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';

  const matchInfo = ratio <= 0.05 ? { label: 'Exact', cls: 'match-badge--exact' }
    : ratio <= 0.20              ? { label: 'Great', cls: 'match-badge--great' }
    : ratio <= 0.35              ? { label: 'Good',  cls: 'match-badge--good'  }
    :                              { label: 'Fair',  cls: 'match-badge--fair'  };

  const initials = item.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <article
      role="button"
      tabIndex={0}
      className={`match-card ${isReceived ? 'match-card--received' : 'match-card--sent'}`}
      aria-label={`${matchInfo.label} match · ${item.name} · €${item.amount}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTap(item, type)}
    >
      <div className="match-card__top">
        <div className="match-card__avatar" aria-hidden="true">{initials}</div>

        <div className="match-card__info">
          <div className="match-card__name-row">
            <span className="match-card__name">{item.name}</span>
            {item.trusted && (
              <span className="match-card__trust" aria-label="Trusted">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <path d="M5 0.5L6.18 3.32L9.24 3.55L7.04 5.44L7.73 8.45L5 6.8L2.27 8.45L2.96 5.44L0.76 3.55L3.82 3.32L5 0.5Z"/>
                </svg>
                Trust
              </span>
            )}
          </div>
          <div className="match-card__meta">
            <span className="match-card__level">Lv {item.level} · {LEVEL_LABELS[item.level]}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__method">{item.method}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__date">{fmtDate(item.date)}</span>
          </div>
        </div>

        <div className="match-card__right">
          <span className="match-card__amount" style={{ color: amountColor }}>
            {sign}€{item.amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="match-card__footer">
        <div className="match-card__rate-wrap">
          <span className="match-card__rate-label">Rate</span>
          <span className="match-card__rate">{item.rate.toLocaleString()} T</span>
        </div>
        <span className={`match-badge ${matchInfo.cls}`}>{matchInfo.label}</span>
      </div>
    </article>
  );
});

function daysLeft(expiresAt) {
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(expiresAt); exp.setHours(0,0,0,0);
  return Math.round((exp - now) / 86400000);
}

const MatchingCard = memo(function MatchingCard({ item, onUploadScreenshot, onConfirm, onSettle }) {
  const isSend = item.direction === 'send';
  const amountColor = isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)';
  const sign = isSend ? '−' : '+';
  const cpName = item.counterpart?.name ?? '—';
  const initials = cpName !== '—'
    ? cpName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const left = daysLeft(item.expiresAt);
  const expiryCls = left > 1 ? 'matching-expiry--ok' : left === 1 ? 'matching-expiry--warn' : left === 0 ? 'matching-expiry--urgent' : 'matching-expiry--expired';
  const expiryLabel = left > 0 ? `${left}d left` : left === 0 ? 'Today' : 'Expired';

  const txStatus = item.transactionStatus;
  const canUpload  = isSend  && txStatus === 'Pending';
  const canConfirm = !isSend && txStatus === 'ScreenshotUploaded';
  const canSettle  = txStatus === 'Confirmed';
  const isSettled  = txStatus === 'Settled';
  const isDisputed = txStatus === 'Disputed';

  return (
    <article className={`match-card matching-card matching-card--${item.direction}`}>
      <div className="match-card__top">
        <div className="match-card__avatar" aria-hidden="true">{initials}</div>

        <div className="match-card__info">
          <div className="match-card__name-row">
            <span className="match-card__name">{cpName}</span>
            {item.counterpart?.trusted && (
              <span className="match-card__trust" aria-label="Trusted">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <path d="M5 0.5L6.18 3.32L9.24 3.55L7.04 5.44L7.73 8.45L5 6.8L2.27 8.45L2.96 5.44L0.76 3.55L3.82 3.32L5 0.5Z"/>
                </svg>
                Trust
              </span>
            )}
            <span className={`matching-dir matching-dir--${item.direction}`}>
              {isSend ? '↑ Send' : '↓ Receive'}
            </span>
          </div>
          <div className="match-card__meta">
            <span className="match-card__level">Lv {item.counterpart?.level ?? 0} · {LEVEL_LABELS[item.counterpart?.level ?? 0]}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__method">{item.counterpart?.method ?? '—'}</span>
          </div>
        </div>

        <div className="match-card__right">
          <span className="match-card__amount" style={{ color: amountColor }}>
            {sign}€{item.amount.toLocaleString()}
          </span>
          <span className="match-card__rate" style={{ marginTop: 4 }}>{item.rate.toLocaleString()} T</span>
        </div>
      </div>

      <div className="match-card__footer matching-card__footer">
        <div className="matching-card__dates">
          <span className="matching-card__date-row">
            <span className="matching-card__date-label">Requested</span>
            <span className="matching-card__date-val">{fmtDate(item.requestDate)}</span>
          </span>
          <span className="matching-card__date-sep" aria-hidden="true" />
          <span className="matching-card__date-row">
            <span className="matching-card__date-label">Matched</span>
            <span className="matching-card__date-val">{fmtDate(item.matchDate)}</span>
          </span>
        </div>
        <span className={`matching-expiry ${expiryCls}`}>{expiryLabel}</span>
      </div>

      {(canUpload || canConfirm || canSettle || isSettled || isDisputed) && (
        <div className="matching-card__actions">
          {canUpload && (
            <label className="btn btn--primary btn--sm matching-card__action-btn">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.5 9V3M4 5.5l2.5-2.5L9 5.5" />
                <path d="M2 10.5h9" />
              </svg>
              Upload Receipt
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadScreenshot?.(item.transactionId, f);
                  e.target.value = '';
                }}
              />
            </label>
          )}
          {canConfirm && (
            <button
              type="button"
              className="btn btn--primary btn--sm matching-card__action-btn"
              onClick={() => onConfirm?.(item.transactionId)}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 6.5l3 3 6-6" />
              </svg>
              Confirm Receipt
            </button>
          )}
          {canSettle && (
            <button
              type="button"
              className="btn btn--primary btn--sm matching-card__action-btn"
              onClick={() => onSettle?.(item.transactionId)}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 6.5l3 3 6-6" />
                <path d="M9 2.5v8" />
              </svg>
              Settle
            </button>
          )}
          {isSettled && (
            <span className="matching-card__status-badge matching-card__status-badge--settled">
              ✓ Settled
            </span>
          )}
          {isDisputed && (
            <span className="matching-card__status-badge matching-card__status-badge--disputed">
              ⚠ Disputed
            </span>
          )}
        </div>
      )}
    </article>
  );
});

const MatchingPage = memo(function MatchingPage({ matches, onUploadScreenshot, onConfirm, onSettle }) {
  const sends    = matches.filter(m => m.direction === 'send');
  const receives = matches.filter(m => m.direction === 'receive');

  const Section = ({ title, items, cls }) => items.length === 0 ? null : (
    <div className="matching-section">
      <p className={`matching-section__title ${cls}`}>{title}</p>
      {items.map(item => (
        <MatchingCard
          key={item.id}
          item={item}
          onUploadScreenshot={onUploadScreenshot}
          onConfirm={onConfirm}
          onSettle={onSettle}
        />
      ))}
    </div>
  );

  if (sends.length === 0 && receives.length === 0) {
    return (
      <div className="empty-state" role="status">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          <path d="M15 5l4 4" />
        </svg>
        <p className="empty-state__text">No active matches</p>
        <p className="empty-state__sub">Create an exchange request to get matched with another user.</p>
      </div>
    );
  }

  return (
    <div className="page-scroll matching-page">
      <Section title="↑ My Send Requests" cls="matching-section__title--send" items={sends} />
      <Section title="↓ My Receive Requests" cls="matching-section__title--receive" items={receives} />
    </div>
  );
});

const HomeSearch = memo(function HomeSearch({ onMatchTap }) {
  const [direction, setDirection] = useState('send');
  const [amount, setAmount] = useState('');
  const [openHelp, setOpenHelp] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const helpBtnRef = useRef(null);

  const amountNum = parseFloat(amount) || 0;
  const matchType = direction === 'send' ? 'received' : 'sent';

  useEffect(() => {
    if (!amountNum) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await requestsApi.search({
          type: direction === 'send' ? 'Send' : 'Receive',
          currency: 'EUR',
          amount: amountNum,
        });
        setSearchResults((data ?? []).map((r) => ({
          id: r.requestId,
          name: r.userDisplayName,
          method: r.paymentMethods?.[0] ?? '—',
          amount: r.amount,
          level: r.userLevel,
          trusted: r.isTrusted,
          rate: r.rateValue,
          date: r.createdAt,
          ratio: Math.abs(r.amount - amountNum) / amountNum,
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [amountNum, direction]);

  const getMatch = (ratio) => {
    if (ratio <= 0.05) return { label: 'Exact', cls: 'match-badge--exact' };
    if (ratio <= 0.20) return { label: 'Great', cls: 'match-badge--great' };
    if (ratio <= 0.35) return { label: 'Good',  cls: 'match-badge--good'  };
    return                    { label: 'Fair',  cls: 'match-badge--fair'  };
  };

  return (
    <div className="home-search">
      <div className="home-search__card">
        <span className="home-search__glow" aria-hidden="true" />

        <div className="home-search__eyebrow-row">
          <p className="home-search__eyebrow">Find a match</p>
          <div className="help-anchor">
            <button
              ref={helpBtnRef}
              type="button"
              className={`help-btn help-btn--dark${openHelp ? ' help-btn--active' : ''}`}
              aria-label="Find a match help"
              aria-expanded={openHelp}
              onClick={() => setOpenHelp(v => !v)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="4.5" />
                <path d="M4.5 4.8a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.2-1.5 2.2M6 9h.01" />
              </svg>
            </button>
            {openHelp && (
              <HelpBalloon anchorRef={helpBtnRef} onClose={() => setOpenHelp(false)} title="Find a Match">
                <p className="help-balloon__desc">
                  Find users who want to exchange in the opposite direction at a matching amount.
                </p>
                <ul className="help-balloon__list">
                  <li>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
                    Choose <strong>Send</strong> or <strong>Receive</strong> direction
                  </li>
                  <li>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
                    Enter the euro amount you want to exchange
                  </li>
                  <li>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
                    Browse matches within ±50% of your amount
                  </li>
                  <li>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 6l2.5 2.5L10 3" /></svg>
                    Tap a card to start a transaction
                  </li>
                </ul>
              </HelpBalloon>
            )}
          </div>
        </div>

        <div className="seg seg--full home-search__seg">
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

        <div className="home-search__amount-row">
          <span className="home-search__currency">€</span>
          <input
            type="number"
            inputMode="decimal"
            className="home-search__amount-input"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            aria-label="Amount"
          />
        </div>

        <p className={`home-search__hint${amountNum > 0 ? ' home-search__hint--active' : ''}`}>
          {amountNum > 0
            ? `Searching ${direction === 'send' ? 'receivers' : 'senders'} near €${amountNum.toLocaleString()}`
            : 'Enter an amount to find matching users'}
        </p>
      </div>

      {amountNum === 0 && (
        <div className="home-search__intro">
          <span className="home-search__intro-arrow" aria-hidden="true">↑</span>
          <p className="home-search__intro-text">
            Type an amount above to find users ready to exchange in the opposite direction.
          </p>
          <p className="home-search__intro-sub">
            Send → finds receivers &nbsp;·&nbsp; Receive → finds senders
          </p>
        </div>
      )}

      {amountNum > 0 && (
        <div className="match-results">
          <div className="match-results__header">
            <span className="match-results__title">
              {searching ? 'Searching…'
                : searchResults.length > 0
                  ? `${searchResults.length} match${searchResults.length !== 1 ? 'es' : ''} found`
                  : 'No matches found'}
            </span>
            <span className="match-results__sub">±50% · €{amountNum.toLocaleString()}</span>
          </div>
          {searchResults.map((item) => (
            <MatchCard key={item.id} item={item} type={matchType} ratio={item.ratio} onTap={() => onMatchTap(item, direction)} />
          ))}
        </div>
      )}
    </div>
  );
});

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [matchConfirm, setMatchConfirm] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [sentLayout, setSentLayout] = useState('list');
  const [receivedLayout, setReceivedLayout] = useState('list');
  const [sentSort, setSentSort] = useState(null);
  const [receivedSort, setReceivedSort] = useState(null);
  const [tallScreen, setTallScreen] = useState(() => window.matchMedia('(min-height: 500px)').matches);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(() => localStorage.getItem(TERMS_KEY) === 'true');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [myMatches, setMyMatches] = useState([]);

  const loadMatches = useCallback(() => {
    matchesApi.getMy().then((data) => {
      setMyMatches((data ?? []).map((m) => ({
        id: m.matchId,
        direction: m.myRequestType === 'Send' ? 'send' : 'receive',
        counterpart: {
          name:    m.counterpartDisplayName,
          level:   m.counterpartLevel,
          trusted: m.counterpartIsTrusted,
          method:  m.counterpartPaymentMethods?.[0] ?? '—',
        },
        amount:            m.amount,
        rate:              m.rateValue,
        requestDate:       m.requestDate,
        matchDate:         m.matchDate,
        expiresAt:         m.expiresAt,
        transactionId:     m.transactionId,
        transactionStatus: m.transactionStatus,
      })));
    }).catch(() => {});
  }, []);

  const handleUploadScreenshot = useCallback(async (transactionId, file) => {
    try {
      await transactionsApi.uploadScreenshot(transactionId, file);
      loadMatches();
    } catch {}
  }, [loadMatches]);

  const handleConfirmReceipt = useCallback(async (transactionId) => {
    try {
      await transactionsApi.confirm(transactionId);
      loadMatches();
    } catch {}
  }, [loadMatches]);

  const handleSettle = useCallback(async (transactionId) => {
    try {
      await transactionsApi.settle(transactionId);
      loadMatches();
    } catch {}
  }, [loadMatches]);

  // Auth + user profile on startup
  useEffect(() => {
    async function init() {
      try {
        const initData = tg?.initData;
        if (initData) {
          const { token } = await authApi.telegramLogin(initData);
          tokenStore.set(token);
        }
        const userData = await usersApi.getMe();
        if (userData) {
          setUserProfile({
            firstName:     userData.firstName,
            lastName:      userData.lastName,
            kycStatus:     userData.kycStatus,
            phoneVerified: userData.phoneVerified ?? false,
            phoneNumber:   userData.phoneNumber   ?? '',
            selfiePhoto:   userData.selfieImageUrl   ?? null,
            docPhoto:      userData.documentImageUrl ?? null,
          });
        }
      } catch {
        // not authenticated yet — continue as guest
      } finally {
        setLoading(false);
      }
    }
    // Keep 2s minimum splash for UX, then init
    const splash = new Promise((r) => setTimeout(r, 2000));
    splash.then(init);
  }, []);

  // Load sent/received requests when those tabs are activated
  useEffect(() => {
    function mapTx(r) {
      return {
        id:        r.id,
        name:      r.counterpartDisplayName ?? '—',
        method:    r.paymentMethod          ?? '—',
        amount:    r.amount,
        level:     r.counterpartLevel       ?? 0,
        trusted:   r.counterpartIsTrusted   ?? false,
        rate:      r.rateValue,
        date:      r.settledAt ?? r.createdAt,
        status:    r.status,
        reference: r.referenceCode ?? null,
      };
    }

    if (activePage === 'sent') {
      transactionsApi.getAll({ type: 'Send' })
        .then((data) => setSentRequests((data ?? []).map(mapTx)))
        .catch(() => {});
    }
    if (activePage === 'received') {
      transactionsApi.getAll({ type: 'Receive' })
        .then((data) => setReceivedRequests((data ?? []).map(mapTx)))
        .catch(() => {});
    }
    if (activePage === 'matches') {
      loadMatches();
    }
  }, [activePage]);

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
    if (activePage in SUB_PAGES) {
      tg.BackButton.show();
      const onBack = () => setActivePage('home');
      tg.BackButton.onClick(onBack);
      return () => tg.BackButton.offClick(onBack);
    } else {
      tg.BackButton.hide();
    }
  }, [activePage]);

  const totalReceived = useMemo(() => receivedRequests.reduce((sum, item) => sum + item.amount, 0), [receivedRequests]);
  const totalSent     = useMemo(() => sentRequests.reduce((sum, item) => sum + item.amount, 0), [sentRequests]);

  const handleTap = useCallback((item, type) => setDetail({ item, type }), []);
  const handleMatchTap = useCallback((item, direction) => setMatchConfirm({ item, direction }), []);
  const handleMatchConfirmed = useCallback(() => {
    setMatchConfirm(null);
    setActivePage('matches');
    loadMatches();
  }, [loadMatches]);
  const handleMatchConfirmClose = useCallback(() => setMatchConfirm(null), []);
  const handleNavigate = useCallback((p) => setActivePage(p), []);
  const handleNavigateHome = useCallback(() => setActivePage('home'), []);
  const handleProfileOpen = useCallback(() => setShowProfile(true), []);
  const handleProfileClose = useCallback(() => setShowProfile(false), []);
  const handleExchangeOpen = useCallback(() => setShowAdd(true), []);
  const handleExchangeClose = useCallback(() => setShowAdd(false), []);
  const handleDetailClose = useCallback(() => setDetail(null), []);
  const handleThemeToggle = useCallback(() => setThemeIdx(i => (i + 1) % THEMES.length), []);
  const handleSentLayoutToggle = useCallback(() => setSentLayout(m => m === 'tile' ? 'list' : 'tile'), []);
  const handleReceivedLayoutToggle = useCallback(() => setReceivedLayout(m => m === 'tile' ? 'list' : 'tile'), []);
  const handleSentSort = useCallback((s) => setSentSort(s), []);
  const handleReceivedSort = useCallback((s) => setReceivedSort(s), []);
  const handleAcceptTerms = useCallback(() => {
    localStorage.setItem(TERMS_KEY, 'true');
    setTermsAccepted(true);
  }, []);
  const handleProfileNav = useCallback(() => {
    setShowProfile(false);
    setActivePage('profile');
  }, []);
  const handleIdentityNav = useCallback(() => {
    setShowProfile(false);
    setActivePage('identity');
  }, []);
  const handleIdentitySave = useCallback((data) => setUserProfile(data), []);

  if (loading) return <SplashLoader />;

  if (!termsAccepted) {
    return <TermsModal onAccept={handleAcceptTerms} />;
  }

  const isSubPage = activePage in SUB_PAGES;

  const header = isSubPage
    ? <PageHeader title={SUB_PAGES[activePage]} onBack={handleNavigateHome} />
    : (
      <header className="p2p-header">
        <div className="p2p-header__text-group">
          <div className="p2p-header__title-row">
            <h1 className="p2p-header__title">P2P <b>PayDa</b></h1>
            <HeaderHelp />
          </div>
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
          <ThemeToggle themeIdx={themeIdx} onToggle={handleThemeToggle} />
          <button type="button" className="p2p-header__avatar" aria-label="Profile" onClick={handleProfileOpen}>
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
      onNavigate={handleNavigate}
      onProfile={handleProfileOpen}
      onExchange={handleExchangeOpen}
    >
      {activePage === 'home' && (
        <HomeSearch onMatchTap={handleMatchTap} />
      )}

      {activePage === 'identity' && (
        <IdentityContent
          profile={userProfile}
          onDone={handleNavigateHome}
          onSave={handleIdentitySave}
        />
      )}

      {activePage === 'profile' && (
        <ProfileContent profile={userProfile} />
      )}

      {activePage === 'sent' && (
        <TransactionListPage
          data={sentRequests}
          type="sent"
          sort={sentSort}
          layout={sentLayout}
          onSort={handleSentSort}
          onLayoutToggle={handleSentLayoutToggle}
          onTap={handleTap}
        />
      )}
      {activePage === 'received' && (
        <TransactionListPage
          data={receivedRequests}
          type="received"
          sort={receivedSort}
          layout={receivedLayout}
          onSort={handleReceivedSort}
          onLayoutToggle={handleReceivedLayoutToggle}
          onTap={handleTap}
        />
      )}

      {activePage === 'matches' && (
        <MatchingPage
          matches={myMatches}
          onUploadScreenshot={handleUploadScreenshot}
          onConfirm={handleConfirmReceipt}
          onSettle={handleSettle}
        />
      )}

      {detail && <DetailSheet item={detail.item} type={detail.type} onClose={handleDetailClose} />}
      {matchConfirm && (
        <MatchConfirmSheet
          item={matchConfirm.item}
          userDirection={matchConfirm.direction}
          onClose={handleMatchConfirmClose}
          onConfirmed={handleMatchConfirmed}
        />
      )}
      {showAdd && <ExchangeModal onClose={handleExchangeClose} />}
      {showProfile && (
        <ProfileModal
          onClose={handleProfileClose}
          onProfile={handleProfileNav}
          onIdentity={handleIdentityNav}
        />
      )}
    </AppShell>
  );
}
