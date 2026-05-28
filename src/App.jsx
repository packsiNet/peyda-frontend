import { useState, useEffect, useLayoutEffect, useRef, memo, useCallback, useMemo, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useLang, useT, LANGUAGES } from './i18n/index.jsx';
import { tokenStore } from './api/apiClient.js';
import { authApi } from './api/auth.js';
import { usersApi } from './api/users.js';
import { exchangeRatesApi } from './api/exchangeRates.js';
import { requestsApi } from './api/requests.js';
import { receiversApi } from './api/receivers.js';
import { transactionsApi } from './api/transactions.js';
import { matchesApi } from './api/matches.js';
import { notificationBus } from './notifications/index.jsx';

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
  // Write to --tg-sa-* so CSS max() can pick the larger of Telegram vs env()
  root.style.setProperty('--tg-sa-top',    `${top}px`);
  root.style.setProperty('--tg-sa-bottom', `${bottom}px`);
  root.style.setProperty('--tg-sa-left',   `${left}px`);
  root.style.setProperty('--tg-sa-right',  `${right}px`);
}

// Theme → Telegram header/bg color map
const TG_THEME_COLORS = {
  dark:    { header: '#050A14', bg: '#050A14' },
  light:   { header: '#EEEDE8', bg: '#EEEDE8' },
  default: { header: '#EEEDE8', bg: '#EEEDE8' },
};

const THEMES = ['light', 'dark'];

const SUB_PAGES = { identity: 'kyc.title', profile: 'nav.profile', 'my-requests': 'nav.myRequests' };

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
  const t = useT();
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const firstMethod = item.methods[0] ?? null;
  const meta = (firstMethod && METHOD_META[firstMethod]) || { country: 'Global' };

  return (
    <article
      role="button"
      tabIndex={0}
      className={`tx-tile ${isReceived ? 'tx-tile--received' : 'tx-tile--sent'}`}
      aria-label={`${type} ${sign}€${item.amount} ${item.name}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onTap(item, type)}
    >
      <span className="tx-tile__glow" aria-hidden="true" />
      <span className="tx-tile__sheen" aria-hidden="true" />

      <span className="tx-tile__type" aria-hidden="true">
        {isReceived ? t('tx.received') : t('tx.sent')}
      </span>

      <div className="tx-tile__amount">
        <span className="tx-tile__currency">{item.currencySymbol}</span>
        <span className="tx-tile__value">{item.amount.toLocaleString()}</span>
      </div>

      <footer className="tx-tile__meta tx-tile__meta--abs">
        <span className="tx-tile__country">{meta.country}</span>
      </footer>
    </article>
  );
});

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
  const t = useT();
  const sorts = [
    { id: 'highest', label: t('sort.highest') },
    { id: 'lowest',  label: t('sort.lowest')  },
  ];
  return (
    <div role="toolbar" aria-label="Sort transactions" className="p2p-filterbar">
      <LayoutToggleBtn layout={layout} onToggle={onToggleLayout} />
      <span className="p2p-filterbar__label">{t('sort.label')}</span>
      {sorts.map((s) => {
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
  const t = useT();
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountColor = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';
  const methodsLabel = item.methods.length ? item.methods.join(' · ') : '—';

  return (
    <article
      role="button"
      tabIndex={0}
      className={`match-card ${isReceived ? 'match-card--received' : 'match-card--sent'}`}
      aria-label={`${type} ${sign}€${item.amount} ${item.name}`}
      onClick={() => onTap(item, type)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onTap(item, type)}
    >
      <div className="match-card__top">
        <div className="match-card__avatar" aria-hidden="true">
          {item.avatarPhoto
            ? <img src={item.avatarPhoto} alt={item.name} className="match-card__avatar-img" />
            : item.avatarInitials}
        </div>

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
            {item.tierName && <span className="match-card__level">{item.tierName}</span>}
            {item.tierName && <span className="match-card__sep" aria-hidden="true" />}
            <span className="match-card__method">{methodsLabel}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__date">{fmtDate(item.date)}</span>
          </div>
        </div>

        <div className="match-card__right">
          <span className="match-card__amount" style={{ color: amountColor }}>
            {sign}{item.currencySymbol}{item.amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="match-card__footer">
        <div className="match-card__rate-wrap">
          <span className="match-card__rate-label">{t('common.rate')}</span>
          <span className="match-card__rate">{item.rate.toLocaleString()} T</span>
        </div>
        {(() => {
          const s = TX_STATUS_DISPLAY[item.status];
          const isDone = item.status === 3;
          return (
            <span className={`match-badge ${isDone ? 'match-badge--done' : 'match-badge--pending'}`} style={{ color: s?.color }}>
              {s ? t(s.labelKey) : '?'}
            </span>
          );
        })()}
      </div>
    </article>
  );
});

const TransactionListPage = memo(function TransactionListPage({ data, type, sort, layout, onSort, onLayoutToggle, onTap, loading }) {
  const t = useT();
  const sorted = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => sort === 'highest' ? b.amount - a.amount : a.amount - b.amount);
  }, [data, sort]);

  if (loading) {
    return (
      <div className="page-scroll kyc-status-loading">
        <div className="kyc-loading-spinner">
          <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="22" stroke="var(--amber)" strokeOpacity="0.15" strokeWidth="4" />
            <path d="M26 4a22 22 0 0 1 22 22" stroke="var(--amber-deep)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state__card">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <p className="empty-state__text">{t('empty.noTransactions', { type: t('tx.' + type) })}</p>
          <p className="empty-state__sub">{t('empty.txSub')}</p>
        </div>
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
  0: { labelKey: 'status.0', color: 'var(--amber-deep)' },
  1: { labelKey: 'status.1', color: 'var(--amber-deep)' },
  2: { labelKey: 'status.2', color: 'var(--leaf-deep)'  },
  3: { labelKey: 'status.3', color: 'var(--leaf-deep)'  },
  4: { labelKey: 'status.4', color: 'var(--rose-deep)'  },
};

const CURRENCY_SYMBOL = { 0: '€', 1: '$', 2: 'CA$' };

// ── Bottom Sheet ─────────────────────────────────────────────
// Single reusable component that handles:
//   • Smooth open animation via CSS class toggle (double-rAF technique)
//   • Gesture-driven close with momentum detection
//   • visualViewport-based keyboard detection → hides tab bar
//   • Backdrop opacity tied to drag progress

const BottomSheetClose = createContext(null);

function BottomSheet({ onClose, children, backdropDismissible = true, sheetClassName = '', showHandle = true }) {
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Drag tracking in refs — avoids re-renders during each touchmove
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragLastY = useRef(0);
  const dragLastTime = useRef(0);
  const dragVelocity = useRef(0); // px/s, positive = downward
  const dragCurrentOffset = useRef(0);
  const [dragOffset, setDragOffset] = useState(null); // null = CSS controls transform
  const dragRafId = useRef(null);
  const isClosingRef = useRef(false);

  // Double-rAF: browser paints translateY(100%) before transition fires → no jank on open
  useEffect(() => {
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setIsOpen(true));
    });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
  }, []);

  // Animate out, then hand off to parent
  const closeSheet = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsOpen(false);
    setDragOffset(null);
    backdropRef.current?.style.removeProperty('--sheet-bg-a');
    setTimeout(onClose, 360);
  }, [onClose]);

  // Keyboard detection: resize the backdrop to match visualViewport so the sheet
  // stays visible above the keyboard instead of hiding behind it.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const initialHeight = vv.height;

    const update = () => {
      const keyboardVisible = vv.height < initialHeight - 100;
      document.documentElement.classList.toggle('keyboard-open', keyboardVisible);

      // Reposition the backdrop to exactly the visible portion of the screen
      const bd = backdropRef.current;
      if (bd) {
        bd.style.top = `${vv.offsetTop}px`;
        bd.style.height = `${vv.height}px`;
      }
      // Clamp sheet max-height to the visible area
      const sh = sheetRef.current;
      if (sh) {
        sh.style.maxHeight = keyboardVisible ? `${vv.height - 32}px` : '';
      }
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.classList.remove('keyboard-open');
      const bd = backdropRef.current;
      if (bd) { bd.style.removeProperty('top'); bd.style.removeProperty('height'); }
      const sh = sheetRef.current;
      if (sh) { sh.style.removeProperty('max-height'); }
    };
  }, []);

  // Scroll focused inputs into view after keyboard animation settles
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const onFocusIn = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, []);

  // ── Handle drag ─────────────────────────────────────────────
  const onHandleTouchStart = useCallback((e) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    dragLastY.current = e.touches[0].clientY;
    dragLastTime.current = Date.now();
    dragVelocity.current = 0;
    dragCurrentOffset.current = 0;
  }, []);

  const onHandleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    const now = Date.now();
    const clientY = e.touches[0].clientY;
    const dt = now - dragLastTime.current;
    if (dt > 0) dragVelocity.current = (clientY - dragLastY.current) / dt * 1000;
    dragLastY.current = clientY;
    dragLastTime.current = now;

    const offset = Math.max(0, clientY - dragStartY.current);
    dragCurrentOffset.current = offset;

    // Tie backdrop alpha to drag progress
    const sheetH = sheetRef.current?.offsetHeight || 400;
    const progress = Math.max(0, 1 - offset / sheetH);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    backdropRef.current?.style.setProperty('--sheet-bg-a', String((isDark ? 0.72 : 0.25) * progress));

    if (dragRafId.current) cancelAnimationFrame(dragRafId.current);
    dragRafId.current = requestAnimationFrame(() => setDragOffset(offset));
  }, []);

  const onHandleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const sheetH = sheetRef.current?.offsetHeight || 400;

    if (dragVelocity.current > 500 || dragCurrentOffset.current > sheetH * 0.4) {
      // Flick or crossed 40% threshold → close with CSS transition
      closeSheet();
    } else {
      // Snap back: CSS transition animates from current position to translateY(0)
      setDragOffset(null);
      backdropRef.current?.style.removeProperty('--sheet-bg-a');
    }
  }, [closeSheet]);

  const sheetStyle = dragOffset !== null
    ? { transform: `translateY(${dragOffset}px)`, transition: 'none' }
    : {};

  return (
    <BottomSheetClose.Provider value={closeSheet}>
      <div
        ref={backdropRef}
        className={`sheet-backdrop${isOpen ? ' sheet-backdrop--open' : ''}`}
        onClick={backdropDismissible ? closeSheet : undefined}
      >
        <div
          ref={sheetRef}
          className={`sheet${sheetClassName ? ' ' + sheetClassName : ''}`}
          style={sheetStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {showHandle && (
            <div
              className="sheet__handle"
              onTouchStart={onHandleTouchStart}
              onTouchMove={onHandleTouchMove}
              onTouchEnd={onHandleTouchEnd}
            />
          )}
          {children}
        </div>
      </div>
    </BottomSheetClose.Provider>
  );
}

function DetailSheet({ item, type, onClose, onCreateMatch }) {
  const t = useT();
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const color = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';
  const statusInfo = TX_STATUS_DISPLAY[item.status];

  return (
    <BottomSheet onClose={onClose}>
      <div className="sheet__title">{isReceived ? t('detail.received') : t('detail.sent')}</div>
      <p className="sheet__sub">{`${isReceived ? t('common.from') : t('common.to')} ${item.name}`}</p>

      <div className="detail-row">
        <span className="detail-row__label">{t('common.amount')}</span>
        <span className="detail-row__value detail-row__value--big" style={{ color }}>
          {sign}{item.currencySymbol}{item.amount.toLocaleString()}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.methods')}</span>
        <span className="detail-row__value">{item.methods.length ? item.methods.join(', ') : '—'}</span>
      </div>
      {item.reference && (
        <div className="detail-row">
          <span className="detail-row__label">{t('common.reference')}</span>
          <span className="detail-row__value" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {item.reference}
          </span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-row__label">{t('common.status')}</span>
        <span className="detail-row__value" style={{ color: statusInfo?.color ?? 'var(--muted)' }}>
          {statusInfo ? t(statusInfo.labelKey) : String(item.status ?? '?')}
        </span>
      </div>

      <div className="sheet-actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>{t('common.close')}</button>
        {onCreateMatch && (
          <button type="button" className="btn btn--primary" onClick={onCreateMatch}>
            {t('detail.createMatch')}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

function MatchConfirmSheet({ item, userDirection, onClose, onConfirmed }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const isSend = userDirection === 'send';
  const amountColor = isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)';
  const sign = isSend ? '−' : '+';

  async function handleConfirm() {
    setLoading(true);
    try {
      await matchesApi.create({ requestId: item.id, foreignAccounts: null, receiverInfo: null });
      onConfirmed();
    } catch {
      // error shown via notification bus
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="sheet__title">{t('confirmSheet.title')}</div>
      <p className="sheet__sub">
        {isSend ? t('confirmSheet.youSend', { name: item.name }) : t('confirmSheet.youRecv', { name: item.name })} · {t('confirmSheet.via', { method: item.method })}
      </p>

      <div className="detail-row">
        <span className="detail-row__label">{t('common.amount')}</span>
        <span className="detail-row__value detail-row__value--big" style={{ color: amountColor }}>
          {sign}€{item.amount.toLocaleString()}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.rate')}</span>
        <span className="detail-row__value">{item.rate.toLocaleString()} T</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.methods')}</span>
        <span className="detail-row__value">{item.method}</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.userLevel')}</span>
        <span className="detail-row__value">
          {t('confirmSheet.level', { n: item.level })}
          {item.trusted && <span className="match-card__trust" style={{ marginLeft: 6 }}>Trust</span>}
        </span>
      </div>

      <div className="sheet-actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </button>
        <button type="button" className="btn btn--primary" onClick={handleConfirm} disabled={loading}>
          {loading ? t('confirmSheet.busy') : t('confirmSheet.btn')}
        </button>
      </div>
    </BottomSheet>
  );
}

// ── Step 1: Browse Detail Modal (market card detail) ──────────
function BrowseDetailModal({ item, myDirection, onClose, onMatch }) {
  const t = useT();
  const currSym = CURRENCY_SYMBOL[item.currency] ?? '€';
  const otherType = myDirection === 'send' ? t('common.receive') : t('common.send');

  return (
    <BottomSheet onClose={onClose}>
      <div className="sheet__title">{t('browse.title')}</div>
      <p className="sheet__sub">{otherType} · {currSym}{item.amount.toLocaleString()}</p>

      <div className="match-card__top" style={{ paddingBottom: 16 }}>
        <div className="match-card__avatar" aria-hidden="true">{item.initials}</div>
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
            <span className="match-card__level">{item.levelTitle}</span>
          </div>
        </div>
      </div>

      <div className="detail-row">
        <span className="detail-row__label">{t('common.amount')}</span>
        <span className="detail-row__value detail-row__value--big">{currSym}{item.amount.toLocaleString()}</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.rate')}</span>
        <span className="detail-row__value">{item.rate.toLocaleString()} T</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.methods')}</span>
        <span className="detail-row__value">{(item.paymentMethods ?? []).join(', ') || '—'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">{t('common.posted')}</span>
        <span className="detail-row__value">{fmtDate(item.date)}</span>
      </div>

      <div className="sheet-actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>{t('common.close')}</button>
        <button type="button" className="btn btn--primary" onClick={onMatch}>
          {t('browse.matchBtn')}
        </button>
      </div>
    </BottomSheet>
  );
}

// ── Create Match modal ────────────────────────────────────────
function MatchAccountModal({ item, myDirection, userSentRequests = [], userReceivedRequests = [], onClose, onMatchCreated, onKycNeeded, onRequestGone }) {
  const t = useT();
  const isSender = myDirection === 'send';
  const availableMethods = item.paymentMethods ?? [];

  const itemCurrency = typeof item.currency === 'number' ? item.currency : (CURRENCY_ENUM[item.currency] ?? 0);
  const pendingList = isSender ? userSentRequests : userReceivedRequests;
  const hasPendingReverse = pendingList.some(
    r => r.status === 0 && r.currency === itemCurrency && r.amount === item.amount
  );

  const [mode, setMode] = useState(() =>
    hasPendingReverse ? 'confirm' : (isSender ? 'receiverInfo' : 'foreignAccounts')
  );

  const [chosenMethod, setChosenMethod] = useState(() =>
    availableMethods.length === 1 ? availableMethods[0] : null
  );
  const [foreignFields, setForeignFields] = useState({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [iban, setIban] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fields = chosenMethod ? (FOREIGN_ACCOUNT_FIELDS[chosenMethod] ?? []) : [];
  const foreignValid = chosenMethod
    ? fields.filter(f => !f.optional).every(f => foreignFields[f.id]?.trim())
    : false;

  const ibanValid = iban.startsWith('IR') && iban.length === 26;
  const nationalIdValid = /^\d{10}$/.test(nationalId);
  const receiverValid = !!(firstName.trim() && lastName.trim() && nationalIdValid && mobileNumber.trim() && ibanValid);

  const isValid = mode === 'confirm' ? true
    : mode === 'foreignAccounts' ? foreignValid
    : receiverValid;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      let foreignAccounts = null;
      let receiverInfo = null;

      if (mode === 'foreignAccounts') {
        foreignAccounts = [{
          method: PAYMENT_METHOD_ENUM[chosenMethod] ?? 0,
          fullName: foreignFields.fullName ?? null,
          username: foreignFields.username ?? null,
          email: foreignFields.email ?? null,
          emailOrPhone: foreignFields.emailOrPhone ?? null,
          iban: foreignFields.iban ?? null,
          bic: foreignFields.bic ?? null,
          bankName: foreignFields.bankName ?? null,
          accountNum: foreignFields.accountNum ?? null,
          swift: foreignFields.swift ?? null,
          bankAddress: foreignFields.bankAddress ?? null,
        }];
      } else if (mode === 'receiverInfo') {
        receiverInfo = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nationalId: nationalId.trim(),
          mobileNumber: mobileNumber.trim(),
          iban: iban.trim(),
        };
      }

      const result = await matchesApi.create({
        requestId: item.id,
        foreignAccounts,
        receiverInfo,
      });

      onMatchCreated?.(result?.matchId);
    } catch (err) {
      const status = err?.status;
      const msg = (err?.message ?? '').toLowerCase();

      if (status === 404) {
        onRequestGone?.();
        onClose?.();
      } else if (status === 403) {
        if (msg.includes('kyc')) onKycNeeded?.();
      } else if (status === 400) {
        if (msg.includes('foreignaccounts')) setMode('foreignAccounts');
        else if (msg.includes('receiverinfo')) setMode('receiverInfo');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currSym = CURRENCY_SYMBOL[itemCurrency] ?? '€';

  const title = mode === 'confirm' ? t('match.confirmTitle')
    : mode === 'foreignAccounts' ? t('match.accountTitle')
    : t('match.receiverTitle');

  const subtitle = mode === 'confirm'
    ? t('match.confirmSub')
    : mode === 'foreignAccounts'
    ? t('match.accountSub')
    : t('match.receiverSub');

  return (
    <BottomSheet onClose={onClose} backdropDismissible={!submitting} sheetClassName="exchange-modal">
        <div className="sheet__title">{title}</div>
        <p className="sheet__sub">{subtitle}</p>

        <div className="exchange-summary">
          <div className="exchange-summary__row">
            <span>{currSym}{item.amount.toLocaleString()}</span>
            <span className="exchange-summary__eq">@</span>
            <span>{item.rate.toLocaleString()} T</span>
          </div>
        </div>

        {mode === 'foreignAccounts' && (
          <>
            <div className="exchange-modal__section">
              <label className="input-label">{t('match.paymentMethod')}</label>
              <div className="method-chips">
                {availableMethods.map(m => (
                  <button key={m} type="button"
                    className={`method-chip ${chosenMethod === m ? 'method-chip--active' : ''}`}
                    onClick={() => { setChosenMethod(m); setForeignFields({}); }}
                    aria-pressed={chosenMethod === m}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {chosenMethod && (
              <div className="exchange-modal__section">
                {fields.map(f => (
                  <div key={f.id} className="receiver-form__field">
                    <label className="input-label">
                      {f.label}{f.optional && <span className="input-label__hint">{t('exchange.optional')}</span>}
                    </label>
                    <input className="input" type={f.type} placeholder={f.placeholder}
                      value={foreignFields[f.id] ?? ''}
                      onChange={e => setForeignFields(prev => ({ ...prev, [f.id]: e.target.value }))} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'receiverInfo' && (
          <div className="exchange-modal__section">
            <div className="receiver-form__field">
              <label className="input-label">{t('match.firstName')}</label>
              <input className="input" type="text" placeholder="علی"
                value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="receiver-form__field">
              <label className="input-label">{t('match.lastName')}</label>
              <input className="input" type="text" placeholder="محمدی"
                value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div className="receiver-form__field">
              <label className="input-label">
                {t('match.nationalId')} <span className="input-label__hint">{t('match.nationalIdHint')}</span>
              </label>
              <input className="input" type="text" inputMode="numeric" placeholder="1234567890" maxLength={10}
                value={nationalId}
                onChange={e => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              {nationalId && !nationalIdValid && (
                <span className="exchange-modal__hint" style={{ color: 'var(--rose-deep)' }}>{t('match.nationalIdError')}</span>
              )}
            </div>
            <div className="receiver-form__field">
              <label className="input-label">{t('match.mobile')}</label>
              <input className="input" type="tel" placeholder="09121234567"
                value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
            </div>
            <div className="receiver-form__field">
              <label className="input-label">
                {t('match.iban')} <span className="input-label__hint">{t('match.ibanHint')}</span>
              </label>
              <input className="input" type="text" placeholder="IR123456789012345678901234" maxLength={26}
                value={iban}
                onChange={e => setIban(e.target.value.toUpperCase())} />
              {iban && !ibanValid && (
                <span className="exchange-modal__hint" style={{ color: 'var(--rose-deep)' }}>{t('match.ibanError')}</span>
              )}
            </div>
          </div>
        )}

        <div className="sheet-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>{t('common.cancel')}</button>
          <button type="button" className="btn btn--primary" disabled={!isValid || submitting} onClick={handleSubmit}>
            {submitting ? t('match.creating') : mode === 'confirm' ? t('match.confirmBtn') : t('match.matchBtn')}
          </button>
        </div>
    </BottomSheet>
  );
}

// ── Create Match from own request (sent/received list) ────────
function DirectMatchModal({ item, itemType, onClose, onMatched }) {
  const t = useT();
  const searchType = itemType === 'sent' ? 'Send' : 'Receive';
  const currSym = item.currencySymbol ?? '€';
  const currencyStr = currSym === '$' ? 'USD' : currSym === 'CA$' ? 'CAD' : 'EUR';

  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [selected, setSelected] = useState(null);
  const [matching, setMatching] = useState(false);

  const doSearch = () => {
    setLoadingSearch(true);
    setSelected(null);
    requestsApi.search({ type: searchType, currency: currencyStr, amount: item.amount })
      .then((data) => setResults(data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoadingSearch(false));
  };

  useEffect(() => { doSearch(); }, []);

  const handleMatch = async () => {
    if (!selected || matching) return;
    setMatching(true);
    try {
      await matchesApi.create({ requestId: selected.requestId, foreignAccounts: null, receiverInfo: null });
      onMatched?.();
    } catch (err) {
      if (err?.status === 404) {
        notificationBus.emit({ type: 'error', message: 'این درخواست توسط کاربر دیگری پیش گرفته شد. لطفاً درخواست دیگری انتخاب کنید.' });
        doSearch();
      }
    } finally {
      setMatching(false);
    }
  };

  return (
    <BottomSheet onClose={onClose} backdropDismissible={!matching} sheetClassName="exchange-modal">
      <div className="sheet__title">{t('direct.title')}</div>
      <p className="sheet__sub">{t('direct.sub', { type: itemType })}</p>

      <div className="exchange-summary">
        <div className="exchange-summary__row">
          <span>{currSym}{item.amount.toLocaleString()}</span>
          <span className="exchange-summary__eq">@</span>
          <span>{(item.rate ?? 0).toLocaleString()} T</span>
        </div>
      </div>

      {loadingSearch ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div className="kyc-loading-spinner">
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="22" stroke="var(--amber)" strokeOpacity="0.15" strokeWidth="4" />
              <path d="M26 4a22 22 0 0 1 22 22" stroke="var(--amber-deep)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ) : results.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, padding: '24px 0' }}>
          {t('direct.noResults')}
        </p>
      ) : (
        <div className="exchange-modal__section">
          <div className="rcv-list">
            {results.map((r) => {
              const isSel = selected?.requestId === r.requestId;
              const initials = (r.userDisplayName ?? '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <button key={r.requestId} type="button"
                  className={`rcv-item${isSel ? ' rcv-item--selected' : ''}`}
                  onClick={() => setSelected(r)}>
                  <span className="rcv-item__radio" aria-hidden="true">
                    {isSel
                      ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="9" r="4.5" fill="currentColor"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  </span>
                  <span className="rcv-item__info">
                    <span className="rcv-item__name">{initials} · {r.userDisplayName} {r.isTrusted ? '★' : ''}</span>
                    <span className="rcv-item__iban">
                      {currSym}{(r.amount ?? 0).toLocaleString()} @ {(r.rateValue ?? 0).toLocaleString()} T · {(r.paymentMethods ?? []).join(', ')}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="sheet-actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={matching}>{t('common.cancel')}</button>
        <button type="button" className="btn btn--primary" disabled={!selected || matching} onClick={handleMatch}>
          {matching ? t('direct.busy') : t('direct.btn')}
        </button>
      </div>
    </BottomSheet>
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
const PRICE_PREFERENCE_ENUM = { Fair: 0, Urgent: 1 };
const PAYMENT_METHOD_ENUM = { Revolut: 0, Zelle: 1, PayPal: 2, SEPA: 3, Wire: 4 };

const BONBAST_RATE = 160_000;
const URGENT_RATE  = 150_000;

const FOREIGN_ACCOUNT_FIELDS = {
  Revolut: [
    { id: 'fullName', label: 'Full Name',         placeholder: 'John Doe',              type: 'text'  },
    { id: 'username', label: 'Username / Phone',  placeholder: '@username or +1234…',   type: 'text'  },
    { id: 'email',    label: 'Email',             placeholder: 'john@example.com',      type: 'email', optional: true },
  ],
  Zelle: [
    { id: 'fullName',     label: 'Full Name',     placeholder: 'John Doe',              type: 'text' },
    { id: 'emailOrPhone', label: 'Email or Phone',placeholder: 'john@email.com or +1…', type: 'text' },
  ],
  PayPal: [
    { id: 'fullName', label: 'Full Name',         placeholder: 'John Doe',              type: 'text'  },
    { id: 'email',    label: 'PayPal Email',      placeholder: 'john@example.com',      type: 'email' },
  ],
  SEPA: [
    { id: 'fullName',  label: 'Full Name',        placeholder: 'John Doe',              type: 'text' },
    { id: 'iban',      label: 'IBAN',             placeholder: 'GB29NWBK60161331926819',type: 'text' },
    { id: 'bic',       label: 'BIC / SWIFT',      placeholder: 'NWBKGB2L',             type: 'text' },
    { id: 'bankName',  label: 'Bank Name',        placeholder: 'Barclays Bank',         type: 'text' },
  ],
  Wire: [
    { id: 'fullName',    label: 'Full Name',      placeholder: 'John Doe',              type: 'text' },
    { id: 'accountNum',  label: 'Account Number', placeholder: '123456789',             type: 'text' },
    { id: 'swift',       label: 'SWIFT / BIC',    placeholder: 'NWBKGB2L',             type: 'text' },
    { id: 'bankName',    label: 'Bank Name',      placeholder: 'Chase Bank',            type: 'text' },
    { id: 'bankAddress', label: 'Bank Address',   placeholder: '270 Park Ave, NY',      type: 'text', optional: true },
  ],
};

function prefixPadding(symbol) {
  if (symbol.length >= 3) return '52px';
  if (symbol.length === 2) return '40px';
  return '34px';
}

function ExchangeModal({ onClose, onCreated }) {
  const t = useT();
  const { lang } = useLang();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [direction, setDirection] = useState('send');
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [methods, setMethods] = useState([]);
  const [proposedAmount, setProposedAmount] = useState('');
  const [selectedRate, setSelectedRate] = useState(null);

  // Step 2 state — send direction (Iranian receiver)
  const [showNewReceiverForm, setShowNewReceiverForm] = useState(false);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);

  // Step 2 state — receive direction (foreign accounts)
  const [foreignAccounts, setForeignAccounts] = useState({});
  const [openAccordions, setOpenAccordions] = useState(new Set());
  const [rcvFirstName, setRcvFirstName] = useState('');
  const [rcvLastName, setRcvLastName] = useState('');
  const [rcvNationalId, setRcvNationalId] = useState('');
  const [rcvMobile, setRcvMobile] = useState('');
  const [rcvIban, setRcvIban] = useState('');

  // API state
  const [allRates, setAllRates] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [savedReceivers, setSavedReceivers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load exchange rates on mount
  useEffect(() => {
    exchangeRatesApi.getAll()
      .then((data) => { if (Array.isArray(data)) setAllRates(data); })
      .catch(() => {});
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

    const pricePreference = selectedRate === 'bonbast' ? 'Fair'
      : selectedRate === 'urgent'  ? 'Urgent'
      : null;
    if (!pricePreference) { setPreviewData(null); return; }

    const timer = setTimeout(async () => {
      try {
        const result = await requestsApi.preview({
          type: REQUEST_TYPE_ENUM[direction],
          currency: CURRENCY_ENUM[currency],
          amount: amtNum,
          pricePreference: PRICE_PREFERENCE_ENUM[pricePreference],
        });
        setPreviewData(result);
      } catch { setPreviewData(null); }
    }, 400);
    return () => clearTimeout(timer);
  }, [amount, currency, direction, selectedRate, methods.length]);

  const currentRates = allRates.find(r => r.currency === (CURRENCY_ENUM[currency] ?? 0));
  const bonbastRate = currentRates?.marketRate  ?? BONBAST_RATE;
  const urgentRate  = currentRates?.instantRate ?? URGENT_RATE;

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

  // Step 1: only needs amount + methods; rate is chosen in step 2
  const step1Valid = !!amount && methods.length > 0;

  const foreignValid = methods.every(m => {
    const fields = FOREIGN_ACCOUNT_FIELDS[m] ?? [];
    const acc = foreignAccounts[m] ?? {};
    return fields.filter(f => !f.optional).every(f => acc[f.id]?.trim());
  });

  // Step 2: also needs a rate selection (moved from step 1)
  const step2Valid = !!selectedRate && !submitting && (
    direction === 'receive'
      ? foreignValid
      : showNewReceiverForm
          ? !!(rcvFirstName.trim() && rcvLastName.trim() && rcvNationalId.trim() && rcvMobile.trim() && rcvIban.trim())
          : !!selectedReceiverId
  );

  const setForeignField = (method, fieldId, value) =>
    setForeignAccounts(prev => ({ ...prev, [method]: { ...(prev[method] ?? {}), [fieldId]: value } }));

  const toggleAccordion = (method) =>
    setOpenAccordions(prev => { const s = new Set(prev); s.has(method) ? s.delete(method) : s.add(method); return s; });


  const handleGoToStep2 = () => {
    setSelectedRate(null);
    setPreviewData(null);
    setOpenAccordions(new Set());
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
      const pricePreferenceStr = selectedRate === 'bonbast' ? 'Fair' : 'Urgent';
      const createPayload = {
        type: REQUEST_TYPE_ENUM[direction],
        currency: CURRENCY_ENUM[currency],
        amount: parseFloat(amount),
        pricePreference: PRICE_PREFERENCE_ENUM[pricePreferenceStr],
        paymentMethods: methods.map((m) => PAYMENT_METHOD_ENUM[m]),
        ...(direction === 'send'
          ? { receiverId }
          : { foreignAccounts: methods.map(m => ({ method: PAYMENT_METHOD_ENUM[m], ...foreignAccounts[m] })) }
        ),
      };
      await requestsApi.create(createPayload);
      onCreated?.();
    } catch {
      // error shown via notification bus
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet onClose={onClose} backdropDismissible={false} sheetClassName="exchange-modal" showHandle={false}>
        {step === 1 ? (
          <>
            <div className="sheet__title-row">
              <div className="sheet__title">{t('exchange.title')}</div>
              <ExchangeHelp />
            </div>

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
                  {t('common.send')}
                </button>
                <button
                  type="button"
                  className={`seg__btn seg__btn--icon ${direction === 'receive' ? 'is-active is-receive' : ''}`}
                  onClick={() => setDirection('receive')}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6.5 2v8M3.5 7l3 3 3-3" />
                  </svg>
                  {t('common.receive')}
                </button>
              </div>
            </div>

            <div className="exchange-modal__section">
              <label className="input-label">{t('exchange.currency')}</label>
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
              <label className="input-label">{t('exchange.amount')}</label>
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
                {t('exchange.method')}
                <span className="input-label__hint">{t('exchange.methodHint')}</span>
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
                      {m}
                    </button>
                  );
                })}
              </div>
              <p className="exchange-modal__hint" style={{ visibility: methods.length === 0 ? 'visible' : 'hidden' }}>
                {t('exchange.methodReq')}
              </p>
            </div>

            <div className="sheet-actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>{t('common.cancel')}</button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!step1Valid}
                onClick={handleGoToStep2}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6.5" cy="6.5" r="5" />
                  <path d="M4.5 6.5h4M7 4.5l2 2-2 2" />
                </svg>
                {t('exchange.step1Btn')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sheet__title">
              {direction === 'receive' ? t('exchange.step2TitleReceive') : t('exchange.step2TitleSend')}
            </div>
            <p className="sheet__sub">
              {direction === 'receive' ? t('exchange.step2SubReceive') : t('exchange.step2SubSend')}
            </p>

            <div className="exchange-modal__section">
              <div className="rate-options">
                <button
                  type="button"
                  className={`rate-option${selectedRate === 'bonbast' ? ' rate-option--active' : ''}`}
                  onClick={() => handleRateSelect('bonbast', bonbastRate)}
                  aria-pressed={selectedRate === 'bonbast'}
                >
                  <span className="rate-option__radio" aria-hidden="true">
                    {selectedRate === 'bonbast'
                      ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="5" fill="currentColor"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  </span>
                  <span className="rate-option__body">
                    <span className="rate-option__label">{lang === 'fa' ? 'منصفانه' : 'Fair'}</span>
                    <span className="rate-option__desc">{lang === 'fa' ? '۱٪ تا ۳٪ کارمزد' : '1% – 3% fee'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`rate-option rate-option--urgent${selectedRate === 'urgent' ? ' rate-option--active' : ''}`}
                  onClick={() => handleRateSelect('urgent', urgentRate)}
                  aria-pressed={selectedRate === 'urgent'}
                >
                  <span className="rate-option__radio" aria-hidden="true">
                    {selectedRate === 'urgent'
                      ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="5" fill="currentColor"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  </span>
                  <span className="rate-option__body">
                    <span className="rate-option__label">{lang === 'fa' ? 'فوری' : 'Urgent'}</span>
                    <span className="rate-option__desc">{lang === 'fa' ? '۳٪ تا ۶٪، حداکثر ۱ ساعت' : '3% – 6%, max 1 hour'}</span>
                  </span>
                </button>
              </div>
            </div>

            {direction === 'receive' ? (
              <div className="exchange-modal__section">
                {methods.map(method => {
                  const fields = FOREIGN_ACCOUNT_FIELDS[method] ?? [];
                  const acc = foreignAccounts[method] ?? {};
                  const isOpen = openAccordions.has(method);
                  const filled = fields.filter(f => !f.optional).every(f => acc[f.id]?.trim());
                  return (
                    <div key={method} className={`fac${isOpen ? ' fac--open' : ''}`}>
                      <button type="button" className="fac__header" onClick={() => toggleAccordion(method)}>
                        <span className="fac__title">
                          {filled && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--leaf-deep)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 6l2.5 2.5L10 3" />
                            </svg>
                          )}
                          {method}
                        </span>
                        <svg className="fac__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 5l4 4 4-4" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="fac__body">
                          {fields.map(f => (
                            <div key={f.id} className="receiver-form__field">
                              <label className="input-label">
                                {f.label}
                                {f.optional && <span className="input-label__hint">{t('exchange.optional')}</span>}
                              </label>
                              <input
                                className="input"
                                type={f.type}
                                placeholder={f.placeholder}
                                value={acc[f.id] ?? ''}
                                onChange={e => setForeignField(method, f.id, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : showNewReceiverForm ? (
              <div className="exchange-modal__section">
                <button
                  type="button"
                  className="rcv-back-btn"
                  onClick={() => setShowNewReceiverForm(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2L4 6.5 8 11" />
                  </svg>
                  {t('exchange.savedReceivers')}
                </button>
                <div className="receiver-form">
                  <div className="receiver-form__row">
                    <div className="receiver-form__field">
                      <label className="input-label">{t('exchange.receiverName')}</label>
                      <input
                        className="input"
                        type="text"
                        placeholder={t('match.firstName')}
                        value={rcvFirstName}
                        onChange={(e) => setRcvFirstName(e.target.value)}
                      />
                    </div>
                    <div className="receiver-form__field">
                      <label className="input-label">{t('kyc.lastName')}</label>
                      <input
                        className="input"
                        type="text"
                        placeholder={t('match.lastName')}
                        value={rcvLastName}
                        onChange={(e) => setRcvLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="receiver-form__field">
                    <label className="input-label">{t('exchange.nationalId')}</label>
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
                    <label className="input-label">{t('exchange.mobile')}</label>
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
                    <label className="input-label">{t('exchange.ibanLabel')}</label>
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
                  {t('exchange.addReceiver')}
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
                {t('exchange.back')}
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!step2Valid}
                onClick={handleSubmit}
              >
                {submitting ? t('exchange.submitting') : t('exchange.submit')}
              </button>
            </div>
          </>
        )}
    </BottomSheet>
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
    <header className="p2p-header p2p-header--sub" dir="ltr">
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

const AppTabBar = memo(function AppTabBar({ activePage, onNavigate, onProfile, onExchange, exchangeOpen = false, matchCount = 0 }) {
  const t = useT();
  const dragRef = useRef({ startY: 0, dragging: false });
  const [orbDrag, setOrbDrag] = useState(0);
  const exchangeOpenRef = useRef(exchangeOpen);
  const onExchangeRef = useRef(onExchange);
  useEffect(() => { exchangeOpenRef.current = exchangeOpen; }, [exchangeOpen]);
  useEffect(() => { onExchangeRef.current = onExchange; }, [onExchange]);

  const handlePointerDown = useCallback((e) => {
    dragRef.current = { startY: e.clientY, dragging: true };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const raw = dragRef.current.startY - e.clientY;
    const isOpen = exchangeOpenRef.current;
    const clamped = isOpen
      ? Math.min(0, Math.max(-38, raw))
      : Math.max(0, Math.min(38, raw));
    setOrbDrag(clamped);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const raw = dragRef.current.startY - e.clientY;
    dragRef.current.dragging = false;
    setOrbDrag(0);
    const isOpen = exchangeOpenRef.current;
    if (Math.abs(raw) < 12) {
      onExchangeRef.current();
    } else if (raw > 28 && !isOpen) {
      onExchangeRef.current();
    } else if (raw < -28 && isOpen) {
      onExchangeRef.current();
    }
  }, []);

  const handlePointerCancel = useCallback(() => {
    dragRef.current.dragging = false;
    setOrbDrag(0);
  }, []);

  const orbStyle = orbDrag !== 0
    ? { transition: 'none', transform: `translateY(${-orbDrag}px)` }
    : undefined;

  return (
    <nav className="p2p-tabbar" dir="ltr" aria-label="Main navigation">
      <button type="button" className={`p2p-tab ${activePage === 'home' ? 'is-active' : ''}`} onClick={() => onNavigate('home')} aria-label={t('tab.matches')}>
        <div className="p2p-tab__icon-wrap">
          <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
          {matchCount > 0 && (
            <span className="p2p-tab__badge" aria-hidden="true">
              {matchCount > 99 ? '99+' : matchCount}
            </span>
          )}
        </div>
        <span className="p2p-tab__label">{t('tab.matches')}</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>

      <div className="p2p-tab p2p-tab--exchange">
        <button
          type="button"
          className={`p2p-exchange-toggle${exchangeOpen ? ' is-on' : ' is-off'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-label={t('tab.exchange')}
          aria-pressed={exchangeOpen}
        >
          <div className="p2p-exchange-toggle__orb" style={orbStyle} />
        </button>
        <span className="p2p-tab__label p2p-tab__label--exchange">{t('tab.exchange')}</span>
      </div>

      <button type="button" className={`p2p-tab ${activePage === 'ticketing' ? 'is-active' : ''}`} onClick={() => onNavigate('ticketing')} aria-label={t('tab.ticketing')}>
        <svg className="p2p-tab__icon" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4V9z" />
          <line x1="9" y1="8" x2="9" y2="16" strokeDasharray="2 2" />
        </svg>
        <span className="p2p-tab__label">{t('tab.ticketing')}</span>
        <span className="p2p-tab__bar" aria-hidden="true" />
      </button>
    </nav>
  );
});

function AppShell({ header, children, activePage, onNavigate, onProfile, onExchange, exchangeOpen, matchCount }) {
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
            exchangeOpen={exchangeOpen}
            matchCount={matchCount}
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

const ProfileModal = memo(function ProfileModal({ onClose, onProfile, onIdentity, onMyRequests }) {
  const t = useT();
  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="profile-modal__item" onClick={() => { onClose(); onProfile(); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-2.5 2-4.5 6-4.5s6 2 6 4.5" />
          </svg>
          {t('nav.profile')}
        </button>
        <button type="button" className="profile-modal__item" onClick={() => { onClose(); onIdentity(); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="10" height="10" rx="2" />
            <path d="M7 9l2 2 4-4" />
          </svg>
          {t('nav.identity')}
        </button>
        <button type="button" className="profile-modal__item" onClick={() => { onClose(); onMyRequests(); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <line x1="5" y1="6.5" x2="11" y2="6.5" />
            <line x1="5" y1="9" x2="9" y2="9" />
          </svg>
          {t('nav.myRequests')}
        </button>
        <button type="button" className="profile-modal__item" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="10" height="8" rx="1" />
            <path d="M8 2v2M3 8h10M3 10h6" />
          </svg>
          {t('nav.history')}
        </button>
      </div>
    </div>
  );
});

const MY_REQUEST_STATUS = {
  0: { labelKey: 'reqStatus.0', color: 'var(--amber-deep)' },
  1: { labelKey: 'reqStatus.1', color: 'var(--leaf-deep)'  },
  2: { labelKey: 'reqStatus.2', color: 'var(--leaf-deep)'  },
  3: { labelKey: 'reqStatus.3', color: 'var(--rose-deep)'  },
  4: { labelKey: 'reqStatus.4', color: 'var(--muted)'      },
};

function MyRequestsPage() {
  const t = useT();
  const MY_REQUEST_TYPE_FILTER = [
    { id: null,      label: t('common.all')     },
    { id: 'Send',    label: t('common.send')    },
    { id: 'Receive', label: t('common.receive') },
  ];
  const [typeFilter, setTypeFilter] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    requestsApi.mine(typeFilter)
      .then(data => setItems(data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (cancelling) return;
    setCancelling(id);
    try {
      await requestsApi.cancel(id);
      setItems(prev => prev.filter(r => r.id !== id));
    } catch {
      // error shown via notification bus
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="page-scroll">
      <div className="p2p-filterbar" style={{ paddingTop: 8 }}>
        {MY_REQUEST_TYPE_FILTER.map(f => (
          <button key={String(f.id)} type="button"
            className={`p2p-filter-btn ${typeFilter === f.id ? 'p2p-filter-btn--active' : ''}`}
            onClick={() => setTypeFilter(f.id)}
            aria-pressed={typeFilter === f.id}>
            <span className="p2p-filter-btn__label">{f.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="kyc-status-loading">
          <div className="kyc-loading-spinner">
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="22" stroke="var(--amber)" strokeOpacity="0.15" strokeWidth="4" />
              <path d="M26 4a22 22 0 0 1 22 22" stroke="var(--amber-deep)" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state" role="status">
          <div className="empty-state__card">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <p className="empty-state__text">{t('myReq.empty')}</p>
            <p className="empty-state__sub">{t('myReq.emptySub')}</p>
          </div>
        </div>
      ) : (
        <div className="p2p-list-wrap p2p-scroll" role="list">
          {items.map(r => {
            const isSend = r.type === 'Send' || r.type === 0;
            const currNum = typeof r.currency === 'number' ? r.currency : (CURRENCY_ENUM[r.currency] ?? 0);
            const sym = CURRENCY_SYMBOL[currNum] ?? '€';
            const statusInfo = MY_REQUEST_STATUS[r.status] ?? { label: String(r.status), color: 'var(--muted)' };
            const isPending = r.status === 0;
            const methods = r.paymentMethods ?? [];

            return (
              <article key={r.id} className={`match-card ${isSend ? 'match-card--sent' : 'match-card--received'}`} role="listitem">
                <div className="match-card__top">
                  <div className="match-card__avatar" aria-hidden="true">
                    {isSend
                      ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14V4M5 8l4-4 4 4"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v10M5 10l4 4 4-4"/></svg>}
                  </div>
                  <div className="match-card__info">
                    <div className="match-card__name-row">
                      <span className="match-card__name">{isSend ? t('common.send') : t('common.receive')} · {sym}{(r.amount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="match-card__meta">
                      <span className="match-card__method">{methods.join(' · ') || '—'}</span>
                      <span className="match-card__sep" aria-hidden="true" />
                      <span className="match-card__date">{fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="match-card__right">
                    <span className="match-card__amount" style={{ color: isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)' }}>
                      {sym}{(r.amount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="match-card__footer">
                  <div className="match-card__rate-wrap">
                    <span className="match-card__rate-label">{t('common.rate')}</span>
                    <span className="match-card__rate">{(r.rateValue ?? 0).toLocaleString()} T</span>
                  </div>
                  <span className="match-badge match-badge--pending" style={{ color: statusInfo.color }}>
                    {statusInfo ? t(statusInfo.labelKey) : String(r.status ?? '?')}
                  </span>
                </div>

                {isPending && (
                  <div className="matching-card__actions">
                    <button type="button"
                      className="btn btn--ghost btn--sm matching-card__action-btn"
                      disabled={cancelling === r.id}
                      onClick={() => handleCancel(r.id)}>
                      {cancelling === r.id ? t('myReq.cancelling') : t('myReq.cancelBtn')}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

const KYC_STATUS_DISPLAY = {
  0: { labelKey: 'kyc.0', color: 'var(--ink-soft)'   },
  1: { labelKey: 'kyc.1', color: 'var(--amber-deep)' },
  2: { labelKey: 'kyc.2', color: 'var(--leaf-deep)'  },
  3: { labelKey: 'kyc.3', color: 'var(--rose-deep)'  },
};

function ProfileContent({ profile }) {
  const t = useT();
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
          {photo ? t('profile.photoUploaded') : t('profile.photoNotUploaded')}
        </span>
      </div>
    </div>
  );

  return (
    <div className="page-scroll profile-page">
      <div className="identity-section">
        <p className="identity-section__label">{t('profile.personalInfo')}</p>
        <div className="identity-field">
          <label className="identity-field__label">{t('kyc.firstName')}</label>
          <div className={`profile-value${!firstName ? ' profile-value--empty' : ''}`}>
            {firstName || t('profile.notProvided')}
          </div>
        </div>
        <div className="identity-field">
          <label className="identity-field__label">{t('kyc.lastName')}</label>
          <div className={`profile-value${!lastName ? ' profile-value--empty' : ''}`}>
            {lastName || t('profile.notProvided')}
          </div>
        </div>
      </div>

      <div className="identity-section">
        <p className="identity-section__label">{t('profile.contact')}</p>
        <div className="identity-field">
          <label className="identity-field__label">{t('profile.mobileLabel')}</label>
          <div className="profile-value profile-value--phone">
            <span className={phoneVerified ? '' : 'profile-value--empty'}>
              {phoneVerified ? t('profile.verifiedTg') : t('profile.notVerifiedPhone')}
            </span>
            {phoneVerified && (
              <span className="profile-verified-badge">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 5.5l2.8 2.8L9.5 2" />
                </svg>
                {t('kyc.2')}
              </span>
            )}
          </div>
        </div>
      </div>

      {kycStatus && (
        <div className="identity-section">
          <p className="identity-section__label">{t('kyc.status')}</p>
          <div className="identity-field">
            <label className="identity-field__label">{t('profile.kycVerif')}</label>
            <div className="profile-value" style={{ color: KYC_STATUS_DISPLAY[kycStatus]?.color ?? 'var(--muted)' }}>
              {KYC_STATUS_DISPLAY[kycStatus] ? t(KYC_STATUS_DISPLAY[kycStatus].labelKey) : String(kycStatus)}
            </div>
          </div>
        </div>
      )}

      <div className="identity-section">
        <p className="identity-section__label">{t('profile.photoVerif')}</p>
        <div className="profile-photos">
          <PhotoItem label={t('profile.selfiePhoto')} photo={selfiePhoto} />
          <PhotoItem label={t('profile.idDocument')} photo={docPhoto} />
        </div>
      </div>
    </div>
  );
}

function CameraCapture({ label, facingMode, icon, onCapture, preview }) {
  const t = useT();
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
            <span className="id-camera-btn__retake">{t('kyc.retake')}</span>
          </>
        ) : (
          <>
            <span className="id-camera-btn__icon">{icon}</span>
            <span className="id-camera-btn__text">{t('kyc.tapCamera')}</span>
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
              <button type="button" className="cam-error__btn" onClick={closeCamera}>{t('common.close')}</button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="cam-video" autoPlay playsInline muted />
              <div className="cam-label">{label}</div>
              <div className="cam-bar">
                <button type="button" className="cam-cancel" onClick={closeCamera}>{t('common.cancel')}</button>
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

const KYC_STATUS = { NOT_SUBMITTED: 0, PENDING: 1, APPROVED: 2, REJECTED: 3 };

const KYC_STATUS_BANNER = {
  [KYC_STATUS.PENDING]: {
    color: 'var(--amber-deep)',
    bg: 'rgba(245,145,72,0.10)',
    border: 'rgba(245,145,72,0.30)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <path d="M11 7v4.5l3 1.5" />
      </svg>
    ),
    titleKey: 'kyc.banner.1.title',
    msgKey:   'kyc.banner.1.msg',
  },
  [KYC_STATUS.APPROVED]: {
    color: 'var(--leaf-deep)',
    bg: 'rgba(79,125,82,0.10)',
    border: 'rgba(79,125,82,0.30)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <path d="M7 11l3 3 5-5" />
      </svg>
    ),
    titleKey: 'kyc.banner.2.title',
    msgKey:   'kyc.banner.2.msg',
  },
  [KYC_STATUS.REJECTED]: {
    color: 'var(--rose-deep)',
    bg: 'rgba(185,74,74,0.10)',
    border: 'rgba(185,74,74,0.30)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <path d="M8 8l6 6M14 8l-6 6" />
      </svg>
    ),
    titleKey: 'kyc.banner.3.title',
    msgKey:   'kyc.banner.3.msg',
  },
};

function IdentityContent({ profile, onDone, onSave }) {
  const t = useT();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [docPhoto, setDocPhoto] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [phoneVerified, setPhoneVerified] = useState(profile?.phoneVerified ?? false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycInfo, setKycInfo] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);

  useEffect(() => {
    usersApi.getKycStatus()
      .then((res) => setKycInfo(res))
      .catch(() => setKycInfo(null))
      .finally(() => setKycLoading(false));
  }, []);

  const isLocked = kycInfo?.status === KYC_STATUS.PENDING || kycInfo?.status === KYC_STATUS.APPROVED;
  const canSubmit = !isLocked && firstName.trim() && lastName.trim() && birthDay && phoneVerified && docPhoto && selfiePhoto && !submitting;

  async function handleVerifyPhone() {
    const tgApp = window.Telegram?.WebApp;
    if (!tgApp?.requestContact) {
      setPhoneVerified(true);
      return;
    }
    setVerifyingPhone(true);
    tgApp.requestContact(async (success, result) => {
      if (!success) { setVerifyingPhone(false); return; }
      const raw = result?.responseUnsafe?.contact?.phone_number
        ?? result?.contact?.phone_number
        ?? result?.phone_number
        ?? '';
      const normalized = raw.startsWith('+') ? raw : `+${raw}`;
      try {
        await usersApi.verifyPhone(normalized);
        setPhoneNumber(normalized);
        setPhoneVerified(true);
      } catch {
        // error shown via notification bus
      } finally {
        setVerifyingPhone(false);
      }
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

  if (kycLoading) {
    return (
      <div className="page-scroll kyc-status-loading">
        <div className="kyc-loading-spinner">
          <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="22" stroke="var(--amber)" strokeOpacity="0.15" strokeWidth="4" />
            <path d="M26 4a22 22 0 0 1 22 22" stroke="var(--amber-deep)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  const banner = kycInfo != null ? KYC_STATUS_BANNER[kycInfo.status] : null;

  return (
    <form className="page-scroll" onSubmit={handleSubmit}>

      {banner && (
        <div className="kyc-status-banner" style={{ '--banner-color': banner.color, '--banner-bg': banner.bg, '--banner-border': banner.border }}>
          <span className="kyc-status-banner__icon">{banner.icon}</span>
          <div>
            <p className="kyc-status-banner__title">{t(banner.titleKey)}</p>
            <p className="kyc-status-banner__msg">{t(banner.msgKey)}</p>
          </div>
        </div>
      )}

      <div className={`identity-section${isLocked ? ' identity-section--locked' : ''}`}>
        <p className="identity-section__label">{t('kyc.personalInfo')}</p>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-firstname">{t('kyc.firstName')}</label>
          <input
            id="id-firstname"
            className="identity-field__input"
            type="text"
            placeholder={t('kyc.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            disabled={isLocked}
          />
        </div>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-lastname">{t('kyc.lastName')}</label>
          <input
            id="id-lastname"
            className="identity-field__input"
            type="text"
            placeholder={t('kyc.lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            disabled={isLocked}
          />
        </div>
        <div className="identity-field">
          <label className="identity-field__label">{t('kyc.mobileNumber')}</label>
          <button
            type="button"
            className={`identity-verify-btn${phoneVerified ? ' identity-verify-btn--verified' : ''}`}
            onClick={handleVerifyPhone}
            disabled={isLocked || phoneVerified || verifyingPhone}
          >
            {phoneVerified ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7l3.5 3.5L12 3" />
                </svg>
                {phoneNumber || t('kyc.2')}
              </>
            ) : verifyingPhone ? (
              t('kyc.verifying')
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2l3 3-3 3" />
                  <path d="M12 5H6a3 3 0 0 0 0 6h1" />
                </svg>
                {t('kyc.verifyTelegram')}
              </>
            )}
          </button>
        </div>
        <div className="identity-field">
          <label className="identity-field__label" htmlFor="id-birthday">{t('kyc.birthday')}</label>
          <DatePickerField id="id-birthday" value={birthDay} onChange={setBirthDay} disabled={isLocked} />
        </div>
      </div>

      <div className={`identity-section${isLocked ? ' identity-section--locked' : ''}`}>
        <p className="identity-section__label">{t('kyc.photoVerification')}</p>
        <div className="id-cameras">
          <CameraCapture
            label={t('kyc.documentPhoto')}
            facingMode="environment"
            preview={docPhoto}
            onCapture={isLocked ? undefined : setDocPhoto}
            disabled={isLocked}
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
            label={t('kyc.selfiePhoto')}
            facingMode="user"
            preview={selfiePhoto}
            onCapture={isLocked ? undefined : setSelfiePhoto}
            disabled={isLocked}
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

      {!isLocked && (
        <button type="submit" className="identity-submit" disabled={!canSubmit}>
          {t('kyc.submitBtn')}
        </button>
      )}

      {submitting && (
        <div className="kyc-loading-overlay">
          <div className="kyc-loading-card">
            <div className="kyc-loading-spinner">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="22" stroke="var(--amber)" strokeOpacity="0.15" strokeWidth="4" />
                <path d="M26 4a22 22 0 0 1 22 22" stroke="var(--amber-deep)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <p className="kyc-loading-title">{t('kyc.submittingTitle')}</p>
            <p className="kyc-loading-sub">{t('kyc.submittingSub')}</p>
          </div>
        </div>
      )}
    </form>
  );
}

const LEVEL_LABELS = ['', 'Starter', 'Basic', 'Advanced', 'Expert', 'Elite'];

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const MatchCard = memo(function MatchCard({ item, type, ratio, onTap, onCreateMatch }) {
  const t = useT();
  const isReceived = type === 'received';
  const sign = isReceived ? '+' : '−';
  const amountColor = isReceived ? 'var(--leaf-deep)' : 'var(--amber-deep)';

  const matchInfo = ratio <= 0.05 ? { label: t('match.quality.exact'), cls: 'match-badge--exact' }
    : ratio <= 0.20              ? { label: t('match.quality.great'), cls: 'match-badge--great' }
    : ratio <= 0.35              ? { label: t('match.quality.good'),  cls: 'match-badge--good'  }
    :                              { label: t('match.quality.fair'),  cls: 'match-badge--fair'  };

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
            {sign}{item.currencySymbol}{item.amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="match-card__footer">
        <div className="match-card__rate-wrap">
          <span className="match-card__rate-label">{t('common.rate')}</span>
          <span className="match-card__rate">{item.rate.toLocaleString()} T</span>
        </div>
        <span className={`match-badge ${matchInfo.cls}`}>{matchInfo.label}</span>
      </div>
      {/* <div className="matching-card__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm matching-card__action-btn"
          onClick={(e) => { e.stopPropagation(); onTap(item, type); }}
        >
          Details
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm matching-card__action-btn"
          onClick={(e) => { e.stopPropagation(); onCreateMatch ? onCreateMatch() : onTap(item, type); }}
        >
          Create Match
        </button>
      </div> */}
    </article>
  );
});

function daysLeft(expiresAt) {
  const now = new Date(); now.setHours(0,0,0,0);
  const exp = new Date(expiresAt); exp.setHours(0,0,0,0);
  return Math.round((exp - now) / 86400000);
}

const MatchingCard = memo(function MatchingCard({ item, onTap }) {
  const t = useT();
  const isSend = item.direction === 'send';
  const amountColor = isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)';
  const sign = isSend ? '−' : '+';
  const cpName = item.counterpart?.name ?? '—';
  const initials = cpName !== '—'
    ? cpName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const left = daysLeft(item.expiresAt);
  const expiryCls = left > 1 ? 'matching-expiry--ok' : left === 1 ? 'matching-expiry--warn' : left === 0 ? 'matching-expiry--urgent' : 'matching-expiry--expired';
  const expiryLabel = left > 0 ? t('expiry.dLeft', { n: left }) : left === 0 ? t('expiry.today') : t('expiry.expired');


  return (
    <article
      className={`match-card matching-card matching-card--${item.direction}`}
      onClick={() => onTap?.(item)}
      style={{ cursor: 'pointer' }}
    >
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
              {isSend ? t('matching.dirSend') : t('matching.dirReceive')}
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
          <span className="match-card__rate" style={{ marginTop: 4 }}>{(item.rate ?? 0).toLocaleString()} T</span>
        </div>
      </div>

      <div className="match-card__footer matching-card__footer">
        <div className="matching-card__dates">
          <span className="matching-card__date-row">
            <span className="matching-card__date-label">{t('matching.requested')}</span>
            <span className="matching-card__date-val">{fmtDate(item.requestDate)}</span>
          </span>
          <span className="matching-card__date-sep" aria-hidden="true" />
          <span className="matching-card__date-row">
            <span className="matching-card__date-label">{t('matching.matched')}</span>
            <span className="matching-card__date-val">{fmtDate(item.matchDate)}</span>
          </span>
        </div>
        <span className={`matching-expiry ${expiryCls}`}>{expiryLabel}</span>
      </div>
    </article>
  );
});

const MatchDetailSheet = memo(function MatchDetailSheet({ item, onClose, onUploadScreenshot }) {
  const t = useT();
  if (!item) return null;

  const isSend = item.direction === 'send';
  const amountColor = isSend ? 'var(--amber-deep)' : 'var(--leaf-deep)';
  const sign = isSend ? '−' : '+';
  const cpName = item.counterpart?.name ?? '—';
  const initials = cpName !== '—'
    ? cpName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const left = daysLeft(item.expiresAt);
  const expiryCls = left > 1 ? 'matching-expiry--ok' : left === 1 ? 'matching-expiry--warn' : left === 0 ? 'matching-expiry--urgent' : 'matching-expiry--expired';
  const expiryLabel = left > 0 ? t('expiry.dLeft', { n: left }) : left === 0 ? t('expiry.today') : t('expiry.expired');

  const canUpload = isSend && item.transactionStatus === 0;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div className="match-card__avatar" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }} aria-hidden="true">{initials}</div>
        <div style={{ flex: 1 }}>
          <div className="match-card__name-row" style={{ marginBottom: 4 }}>
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
              {isSend ? t('matching.dirSend') : t('matching.dirReceive')}
            </span>
          </div>
          <div className="match-card__meta">
            <span className="match-card__level">Lv {item.counterpart?.level ?? 0} · {LEVEL_LABELS[item.counterpart?.level ?? 0]}</span>
            <span className="match-card__sep" aria-hidden="true" />
            <span className="match-card__method">{item.counterpart?.method ?? '—'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="match-card__amount" style={{ color: amountColor, fontSize: 18, fontWeight: 700 }}>
            {sign}€{item.amount.toLocaleString()}
          </div>
          <div className="match-card__rate" style={{ fontSize: 12, marginTop: 2 }}>{(item.rate ?? 0).toLocaleString()} T</div>
        </div>
      </div>

      <div className="matching-card__dates" style={{ marginBottom: 12 }}>
        <span className="matching-card__date-row">
          <span className="matching-card__date-label">{t('matching.requested')}</span>
          <span className="matching-card__date-val">{fmtDate(item.requestDate)}</span>
        </span>
        <span className="matching-card__date-sep" aria-hidden="true" />
        <span className="matching-card__date-row">
          <span className="matching-card__date-label">{t('matching.matched')}</span>
          <span className="matching-card__date-val">{fmtDate(item.matchDate)}</span>
        </span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span className={`matching-expiry ${expiryCls}`}>{expiryLabel}</span>
      </div>

      {canUpload && (
        <div className="matching-card__actions">
          <label className="btn btn--primary matching-card__action-btn">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6.5 9V3M4 5.5l2.5-2.5L9 5.5" />
              <path d="M2 10.5h9" />
            </svg>
            {t('matching.uploadReceipt')}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { onUploadScreenshot?.(item.transactionId, f); onClose(); }
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}
    </BottomSheet>
  );
});

function TicketConfirmSheet({ item, onClose, onConfirm, onReject, submitting }) {
  const t = useT();
  if (!item) return null;

  const cpName = item.counterpartName ?? '—';
  const initials = cpName !== '—'
    ? cpName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';
  const currencySymbol = { EUR: '€', USD: '$', CAD: 'CA$' }[item.currency] ?? item.currency;

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="match-card__avatar" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }} aria-hidden="true">{initials}</div>
        <div style={{ flex: 1 }}>
          <div className="match-card__name-row" style={{ marginBottom: 4 }}>
            <span className="match-card__name">{cpName}</span>
            {item.counterpartIsTrusted && (
              <span className="match-card__trust" aria-label={t('ticketing.trust')}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                  <path d="M5 0.5L6.18 3.32L9.24 3.55L7.04 5.44L7.73 8.45L5 6.8L2.27 8.45L2.96 5.44L0.76 3.55L3.82 3.32L5 0.5Z"/>
                </svg>
                {t('ticketing.trust')}
              </span>
            )}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {currencySymbol}{item.amount?.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('ticketing.price')}</span>
          <span style={{ fontWeight: 600 }}>{item.price?.toLocaleString()} T</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('ticketing.priceSetAt')}</span>
          <span>{fmtDate(item.priceSetAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{t('ticketing.deadline')}</span>
          <span style={{ color: 'var(--amber-deep)', fontWeight: 600 }}>{fmtDate(item.confirmationDeadline)}</span>
        </div>
      </div>

      {item.myConfirmation ? (
        <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--leaf-deep)', fontWeight: 600 }}>
          {t('ticketing.alreadyConfirmed')}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ flex: 1 }}
            disabled={submitting}
            onClick={() => onReject(item.matchId)}
          >
            {t('ticketing.reject')}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            style={{ flex: 1 }}
            disabled={submitting}
            onClick={() => onConfirm(item.matchId)}
          >
            {t('ticketing.confirm')}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

const TicketingPage = memo(function TicketingPage() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    matchesApi.getPendingConfirmation()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = useCallback(async (matchId) => {
    setSubmitting(true);
    try {
      await matchesApi.confirm(matchId);
      setSelected(null);
      load();
    } catch {} finally { setSubmitting(false); }
  }, [load]);

  const handleReject = useCallback(async (matchId) => {
    setSubmitting(true);
    try {
      await matchesApi.reject(matchId);
      setSelected(null);
      load();
    } catch {} finally { setSubmitting(false); }
  }, [load]);

  if (loading) {
    return (
      <div className="page-scroll kyc-status-loading">
        <div className="kyc-loading-spinner" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" dir="ltr" role="status">
        <div className="empty-state__card">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
            <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4V9z" />
            <line x1="9" y1="8" x2="9" y2="16" strokeDasharray="2 2" />
          </svg>
          <p className="empty-state__text">{t('ticketing.empty')}</p>
          <p className="empty-state__sub">{t('ticketing.emptySub')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-scroll matching-page" dir="ltr">
        {items.map(item => {
          const cpName = item.counterpartName ?? '—';
          const initials = cpName !== '—'
            ? cpName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
            : '??';
          const currencySymbol = { EUR: '€', USD: '$', CAD: 'CA$' }[item.currency] ?? item.currency;
          const deadline = item.confirmationDeadline;
          const dLeft = deadline ? daysLeft(deadline) : null;
          const expiryCls = dLeft == null ? '' : dLeft > 1 ? 'matching-expiry--ok' : dLeft === 1 ? 'matching-expiry--warn' : dLeft === 0 ? 'matching-expiry--urgent' : 'matching-expiry--expired';
          const expiryLabel = dLeft == null ? '' : dLeft > 0 ? t('expiry.dLeft', { n: dLeft }) : dLeft === 0 ? t('expiry.today') : t('expiry.expired');

          return (
            <article
              key={item.matchId}
              className="match-card matching-card"
              onClick={() => setSelected(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="match-card__top">
                <div className="match-card__avatar" aria-hidden="true">{initials}</div>
                <div className="match-card__info">
                  <div className="match-card__name-row">
                    <span className="match-card__name">{cpName}</span>
                    {item.counterpartIsTrusted && (
                      <span className="match-card__trust" aria-label={t('ticketing.trust')}>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                          <path d="M5 0.5L6.18 3.32L9.24 3.55L7.04 5.44L7.73 8.45L5 6.8L2.27 8.45L2.96 5.44L0.76 3.55L3.82 3.32L5 0.5Z"/>
                        </svg>
                        {t('ticketing.trust')}
                      </span>
                    )}
                    {item.myConfirmation && (
                      <span style={{ fontSize: 10, color: 'var(--leaf-deep)', fontWeight: 600 }}>
                        {t('ticketing.alreadyConfirmed')}
                      </span>
                    )}
                  </div>
                  <div className="match-card__meta">
                    <span style={{ fontSize: 12 }}>{t('ticketing.price')}: {item.price?.toLocaleString()} T</span>
                  </div>
                </div>
                <div className="match-card__right">
                  <span className="match-card__amount" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {currencySymbol}{item.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="match-card__footer matching-card__footer">
                <div className="matching-card__dates">
                  <span className="matching-card__date-row">
                    <span className="matching-card__date-label">{t('ticketing.priceSetAt')}</span>
                    <span className="matching-card__date-val">{fmtDate(item.priceSetAt)}</span>
                  </span>
                </div>
                <span className={`matching-expiry ${expiryCls}`}>{expiryLabel}</span>
              </div>
            </article>
          );
        })}
      </div>
      {selected && (
        <TicketConfirmSheet
          item={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          submitting={submitting}
        />
      )}
    </>
  );
});

const MatchingPage = memo(function MatchingPage({ matches, onUploadScreenshot }) {
  const t = useT();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const sends    = matches.filter(m => m.direction === 'send');
  const receives = matches.filter(m => m.direction === 'receive');

  const Section = ({ title, items, cls }) => items.length === 0 ? null : (
    <div className="matching-section">
      <p className={`matching-section__title ${cls}`}>{title}</p>
      {items.map(item => (
        <MatchingCard
          key={item.id}
          item={item}
          onTap={setSelectedMatch}
        />
      ))}
    </div>
  );

  if (sends.length === 0 && receives.length === 0) {
    return (
      <div className="empty-state" dir="ltr" role="status">
        <div className="empty-state__card">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            <path d="M15 5l4 4" />
          </svg>
          <p className="empty-state__text">{t('matching.empty')}</p>
          <p className="empty-state__sub">{t('matching.emptySub')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-scroll matching-page" dir="ltr">
        <Section title={t('matching.sendSection')} cls="matching-section__title--send" items={sends} />
        <Section title={t('matching.receiveSection')} cls="matching-section__title--receive" items={receives} />
      </div>
      {selectedMatch && (
        <MatchDetailSheet
          item={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onUploadScreenshot={onUploadScreenshot}
        />
      )}
    </>
  );
});

const HomeSearch = memo(function HomeSearch() {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__card">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="empty-state__icon" aria-hidden="true">
          <polyline points="3,17 8,10 13,14 18,6 21,9" />
          <line x1="3" y1="17" x2="22" y2="17" />
        </svg>
        <p className="empty-state__text">P2P PayDa</p>
        <p className="empty-state__sub">برای ثبت درخواست از دکمه Exchange استفاده کنید.</p>
      </div>
    </div>
  );
});

function mapRequest(r) {
  return {
    id:             r.id,
    name:           r.ownerDisplayName      ?? '—',
    avatarInitials: r.ownerAvatarInitials   ?? '?',
    avatarPhoto:    r.ownerProfilePhotoUrl  ?? null,
    methods:        r.paymentMethods        ?? [],
    amount:         r.amount,
    currency:       r.currency              ?? 0,
    currencySymbol: CURRENCY_SYMBOL[r.currency] ?? '€',
    tierName:       r.ownerTierName         ?? '',
    tierOrder:      r.ownerTierOrder        ?? 0,
    trusted:        r.ownerIsTrusted        ?? false,
    rate:           r.rateValue,
    date:           r.expiresAt ?? r.createdAt,
    status:         r.status,
    reference:      r.referenceCode ?? null,
  };
}

export default function App() {
  const { lang, toggleLang } = useLang();
  const t = useT();

  // Lock initial viewport height so modals don't shrink when keyboard opens
  useLayoutEffect(() => {
    const set = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    set();
    window.addEventListener('orientationchange', set);
    return () => window.removeEventListener('orientationchange', set);
  }, []);
  const [activePage, setActivePage] = useState('home');
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [browseDetail, setBrowseDetail] = useState(null);
  const [matchAccount, setMatchAccount] = useState(null);
  const [directMatch, setDirectMatch] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [themeIdx, setThemeIdx] = useState(() => {
    const saved = localStorage.getItem('payda_theme');
    return saved !== null ? Number(saved) : 1; // dark by default
  });
  const [sentLayout, setSentLayout] = useState('list');
  const [receivedLayout, setReceivedLayout] = useState('list');
  const [sentSort, setSentSort] = useState(null);
  const [receivedSort, setReceivedSort] = useState(null);
  const [tallScreen, setTallScreen] = useState(() => window.matchMedia('(min-height: 500px)').matches);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(() => localStorage.getItem(TERMS_KEY) === 'true');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [myMatches, setMyMatches] = useState([]);

  const loadMatches = useCallback(() => {
    matchesApi.getMy().then((data) => {
      setMyMatches((data ?? []).map((m) => ({
        id: m.matchId,
        direction: m.myRequestType === 0 ? 'send' : 'receive',
        counterpart: {
          name:    m.counterpartDisplayName,
          level:   m.counterpartLevel,
          trusted: m.counterpartIsTrusted,
          method:  m.counterpartPaymentMethods?.[0] ?? '—',
        },
        amount:            m.amount,
        rate:              m.matchPrice,
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

  // eslint-disable-next-line no-unused-vars
  const loadSentRequests = useCallback(() => {}, []);
  // eslint-disable-next-line no-unused-vars
  const loadReceivedRequests = useCallback(() => {}, []);

  // Load data when tabs are activated
  useEffect(() => {
    if (activePage === 'home') loadMatches();
  }, [activePage, loadMatches]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', THEMES[themeIdx]);
    localStorage.setItem('payda_theme', themeIdx);
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
  const handleMatchTap = useCallback((item, direction) => setBrowseDetail({ item, direction }), []);
  const handleBrowseMatch = useCallback(() => {
    setMatchAccount(browseDetail);
    setBrowseDetail(null);
  }, [browseDetail]);
  const handleBrowseClose = useCallback(() => setBrowseDetail(null), []);
  const handleMatchAccountClose = useCallback(() => setMatchAccount(null), []);
  const handleMatchCreated = useCallback((matchId) => {
    setMatchAccount(null);
    setActivePage('matches');
    loadMatches();
    loadSentRequests();
    loadReceivedRequests();
  }, [loadMatches, loadSentRequests, loadReceivedRequests]);
  const handleKycNeeded = useCallback(() => {
    setMatchAccount(null);
    setBrowseDetail(null);
    setActivePage('identity');
  }, []);
  const handleRequestGone = useCallback(() => {
    setMatchAccount(null);
    setBrowseDetail(null);
  }, []);
  const handleDirectCreateMatch = useCallback((item, direction) => {
    setMatchAccount({ item, direction });
  }, []);
  const handleDirectMatch = useCallback((item, type) => setDirectMatch({ item, itemType: type }), []);
  const handleDirectMatchClose = useCallback(() => setDirectMatch(null), []);
  const handleDirectMatched = useCallback(() => {
    setDirectMatch(null);
    setActivePage('matches');
    loadMatches();
  }, [loadMatches]);
  const handleNavigate = useCallback((p) => setActivePage(p), []);
  const handleNavigateHome = useCallback(() => setActivePage('home'), []);
  const handleProfileOpen = useCallback(() => setShowProfile(true), []);
  const handleProfileClose = useCallback(() => setShowProfile(false), []);
  const handleExchangeOpen = useCallback(() => setShowAdd(true), []);
  const handleExchangeClose = useCallback(() => setShowAdd(false), []);
  const handleExchangeToggle = useCallback(() => setShowAdd(v => !v), []);
  const handleRequestCreated = useCallback(() => {
    setShowAdd(false);
    loadSentRequests();
    loadReceivedRequests();
  }, [loadSentRequests, loadReceivedRequests]);
  const handleDetailClose = useCallback(() => setDetail(null), []);
  const handleDetailCreateMatch = useCallback(() => {
    if (!detail) return;
    const { item, type } = detail;
    setDetail(null);
    // type 'sent'     = other person is sending     = I receive → foreignAccounts
    // type 'received' = other person is receiving   = I send    → receiverInfo
    const myDirection = type === 'sent' ? 'receive' : 'send';
    setMatchAccount({
      item: { ...item, paymentMethods: item.paymentMethods ?? item.methods ?? [] },
      direction: myDirection,
    });
  }, [detail]);
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
  const handleMyRequestsNav = useCallback(() => {
    setShowProfile(false);
    setActivePage('my-requests');
  }, []);
  const handleIdentitySave = useCallback((data) => setUserProfile(data), []);

  if (loading) return <SplashLoader />;

  if (!termsAccepted) {
    return <TermsModal onAccept={handleAcceptTerms} />;
  }

  const isSubPage = activePage in SUB_PAGES;

  const header = isSubPage
    ? <PageHeader title={t(SUB_PAGES[activePage])} onBack={handleNavigateHome} />
    : (
      <header className="p2p-header" dir="ltr">
        <div className="p2p-header__text-group">
          <div className="p2p-header__title-row">
            <h1 className="p2p-header__title">P2P <b>PayDa</b></h1>
            <HeaderHelp />
          </div>
          <p className="p2p-header__sub">{t('header.sub')}</p>
        </div>
        <div className="p2p-header__right">
          <div className="p2p-summary">
            <div className="p2p-summary__row">
              <span className="p2p-summary__pos">+€{totalReceived.toLocaleString()}</span>
              <span className="p2p-summary__neg">−€{totalSent.toLocaleString()}</span>
            </div>
            <span className="p2p-summary__label">{t('header.thisPeriod')}</span>
          </div>
          <ThemeToggle themeIdx={themeIdx} onToggle={handleThemeToggle} />
          <button
            type="button"
            className="p2p-header__theme-btn"
            aria-label={`Language: ${LANGUAGES[lang]?.name}`}
            onClick={toggleLang}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0 }}
          >
            {(() => {
              const keys = Object.keys(LANGUAGES);
              const next = keys[(keys.indexOf(lang) + 1) % keys.length];
              return LANGUAGES[next]?.label;
            })()}
          </button>
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
      onExchange={handleExchangeToggle}
      exchangeOpen={showAdd}
      matchCount={myMatches.length}
    >
      {activePage === 'home' && (
        <MatchingPage
          matches={myMatches}
          onUploadScreenshot={handleUploadScreenshot}
        />
      )}

      {activePage === 'ticketing' && (
        <TicketingPage />
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

      {activePage === 'my-requests' && (
        <MyRequestsPage />
      )}

      {detail && <DetailSheet item={detail.item} type={detail.type} onClose={handleDetailClose} onCreateMatch={handleDetailCreateMatch} />}
      {browseDetail && (
        <BrowseDetailModal
          item={browseDetail.item}
          myDirection={browseDetail.direction}
          onClose={handleBrowseClose}
          onMatch={handleBrowseMatch}
        />
      )}
      {matchAccount && (
        <MatchAccountModal
          item={matchAccount.item}
          myDirection={matchAccount.direction}
          userSentRequests={sentRequests}
          userReceivedRequests={receivedRequests}
          onClose={handleMatchAccountClose}
          onMatchCreated={handleMatchCreated}
          onKycNeeded={handleKycNeeded}
          onRequestGone={handleRequestGone}
        />
      )}
      {directMatch && (
        <DirectMatchModal
          item={directMatch.item}
          itemType={directMatch.itemType}
          onClose={handleDirectMatchClose}
          onMatched={handleDirectMatched}
        />
      )}
      {showAdd && <ExchangeModal onClose={handleExchangeClose} onCreated={handleRequestCreated} />}
      {showProfile && (
        <ProfileModal
          onClose={handleProfileClose}
          onProfile={handleProfileNav}
          onIdentity={handleIdentityNav}
          onMyRequests={handleMyRequestsNav}
        />
      )}
    </AppShell>
  );
}
