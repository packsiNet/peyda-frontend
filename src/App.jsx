import { useState, useEffect } from 'react';

const THEMES = ['dark', 'pink'];

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
        <div className="splash-loader__progress-text">در حال پردازش پرداخت</div>
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
      aria-label={current === 'dark' ? 'Switch to pink theme' : 'Switch to dark theme'}
      onClick={onToggle}
    >
      {current === 'dark' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="9" cy="9" r="3.5" />
          <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.2 3.2l1.4 1.4M13.4 13.4l1.4 1.4M3.2 14.8l1.4-1.4M13.4 4.6l1.4-1.4" />
        </svg>
      )}
      {current === 'pink' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 11A7 7 0 0 1 7 2.5a7 7 0 1 0 8.5 8.5z" />
        </svg>
      )}
    </button>
  );
}

const METHOD_META = {
  Revolut: { color: '#8a5a76', label: 'Revolut', country: 'UK' },
  Zelle:   { color: '#d97a8c', label: 'Zelle',   country: 'US' },
  SEPA:    { color: '#c89262', label: 'SEPA',    country: 'EU' },
};

function TxTile({ item, type, onTap }) {
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
        <span className="tx-tile__method">{item.method}</span>
        <span className="tx-tile__sep" aria-hidden="true">·</span>
        <span className="tx-tile__country">{meta.country}</span>
      </footer>
    </article>
  );
}

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

function TxListItem({ item, type, onTap }) {
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const meta = METHOD_META[item.method] || { country: 'Global' };
  const color = METHOD_META[item.method]?.color;

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
          <div className="tx-card__name">{item.name}</div>
          <div className="tx-card__method">
            <span className="tx-card__method-dot" style={{ background: color || 'var(--ink-mute)' }} />
            <span className="tx-card__method-text" style={{ color: color || 'var(--ink-mute)' }}>
              {item.method} · {meta.country}
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
}

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

function AddSheet({ onClose }) {
  const [type, setType] = useState('send');
  const [method, setMethod] = useState('Revolut');

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__title">New transfer</div>
        <p className="sheet__sub">Move money to a friend, fast.</p>

        <div className="seg" style={{ marginTop: 4 }}>
          <button type="button" className={`seg__btn ${type === 'send' ? 'is-active' : ''}`} onClick={() => setType('send')}>Send</button>
          <button type="button" className={`seg__btn ${type === 'request' ? 'is-active' : ''}`} onClick={() => setType('request')}>Request</button>
        </div>

        <label className="input-label">Recipient</label>
        <input className="input" placeholder="Search name, email, IBAN…" />

        <label className="input-label">Amount</label>
        <input className="input" type="number" placeholder="€ 0.00" inputMode="decimal" />

        <label className="input-label">Method</label>
        <div className="seg">
          {['Revolut', 'Zelle', 'SEPA'].map((option) => (
            <button
              key={option}
              type="button"
              className={`seg__btn ${method === option ? 'is-active' : ''}`}
              onClick={() => setMethod(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--primary">Continue</button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ onClose }) {
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
        <button type="button" className="profile-modal__item" onClick={onClose}>
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
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [themeIdx, setThemeIdx] = useState(0);
  const [layoutMode, setLayoutMode] = useState('tile');
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

  const totalReceived = RECEIVED.reduce((sum, item) => sum + item.amount, 0);
  const totalSent = SENT.reduce((sum, item) => sum + item.amount, 0);

  const tiles = (() => {
    if (filter === 'received') return RECEIVED.map((data) => ({ data, type: 'received' }));
    if (filter === 'sent') return SENT.map((data) => ({ data, type: 'sent' }));
    const out = [];
    const max = Math.max(RECEIVED.length, SENT.length);
    for (let i = 0; i < max; i++) {
      if (RECEIVED[i]) out.push({ data: RECEIVED[i], type: 'received' });
      if (SENT[i]) out.push({ data: SENT[i], type: 'sent' });
    }
    return out;
  })();

  if (loading) {
    return <SplashLoader />;
  }

  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
        <div className="bg-orb bg-orb--4" />
        <div className="bg-orb bg-orb--5" />
      </div>

      <div className="p2p-shell">
        <header className="p2p-header">
          <div className="p2p-header__text-group">
            <h1 className="p2p-header__title">
              P2P <b>PayDa</b>
            </h1>
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
                  <TxTile
                    key={`${type}-${data.id}`}
                    item={data}
                    type={type}
                    onTap={(item, t) => setDetail({ item, type: t })}
                  />
                ))}
              </div>
            </div>
          ) : filter === 'all' && tallScreen ? (
            <div className="p2p-list-wrap p2p-list-wrap--split">
              <div className="p2p-list-col" role="list" aria-label="Received">
                <p className="p2p-list-col__head p2p-list-col__head--r">Received</p>
                {RECEIVED.map((data) => (
                  <TxListItem key={data.id} item={data} type="received" onTap={(item, t) => setDetail({ item, type: t })} />
                ))}
              </div>
              <div className="p2p-list-col" role="list" aria-label="Sent">
                <p className="p2p-list-col__head p2p-list-col__head--s">Sent</p>
                {SENT.map((data) => (
                  <TxListItem key={data.id} item={data} type="sent" onTap={(item, t) => setDetail({ item, type: t })} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p2p-list-wrap p2p-scroll" role="list">
              {tiles.map(({ data, type }) => (
                <TxListItem
                  key={`${type}-${data.id}`}
                  item={data}
                  type={type}
                  onTap={(item, t) => setDetail({ item, type: t })}
                />
              ))}
            </div>
          )}
        </main>

        <nav className="p2p-tabbar" aria-label="Main navigation">
          <button type="button" className={`p2p-tab ${activeTab === 'home' ? 'is-active' : ''}`} onClick={() => setActiveTab('home')} aria-label="Home">
            <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,17 8,10 13,14 18,6 21,9" />
              <line x1="3" y1="17" x2="22" y2="17" />
            </svg>
            <span className="p2p-tab__label">Home</span>
            <span className="p2p-tab__bar" aria-hidden="true" />
          </button>

          <button type="button" className={`p2p-tab ${activeTab === 'wallet' ? 'is-active' : ''}`} onClick={() => setActiveTab('wallet')} aria-label="Wallet">
            <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="20" height="13" rx="2.5" />
              <path d="M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
              <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="p2p-tab__label">Wallet</span>
            <span className="p2p-tab__bar" aria-hidden="true" />
          </button>

          <div className="p2p-tab p2p-tab--exchange">
            <button type="button" className="p2p-tab__exchange-btn" onClick={() => setShowAdd(true)} aria-label="Exchange">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="11" cy="15" r="7" fill="rgba(255,255,255,0.95)" />
                <circle cx="20" cy="15" r="7" fill="rgba(255,255,255,0.50)" />
              </svg>
            </button>
            <span className="p2p-tab__label p2p-tab__label--exchange">Exchange</span>
          </div>

          <button type="button" className={`p2p-tab ${activeTab === 'markets' ? 'is-active' : ''}`} onClick={() => setActiveTab('markets')} aria-label="Markets">
            <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span className="p2p-tab__label">Markets</span>
            <span className="p2p-tab__bar" aria-hidden="true" />
          </button>

          <button type="button" className={`p2p-tab ${activeTab === 'profile' ? 'is-active' : ''}`} onClick={() => { setActiveTab('profile'); setShowProfile(true); }} aria-label="Profile">
            <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="20" height="13" rx="2" />
              <path d="M16 8V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              <line x1="2" y1="14" x2="22" y2="14" />
            </svg>
            <span className="p2p-tab__label">Profile</span>
            <span className="p2p-tab__bar" aria-hidden="true" />
          </button>
        </nav>

        {detail && <DetailSheet item={detail.item} type={detail.type} onClose={() => setDetail(null)} />}
        {showAdd && <AddSheet onClose={() => setShowAdd(false)} />}
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </div>
    </>
  );
}
