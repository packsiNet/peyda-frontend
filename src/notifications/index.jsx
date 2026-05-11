import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Event bus — lets apiClient emit without importing React ───
const _listeners = new Set();
export const notificationBus = {
  emit: (n) => _listeners.forEach(fn => fn(n)),
  subscribe: (fn) => { _listeners.add(fn); return () => _listeners.delete(fn); },
};

// ── Context ───────────────────────────────────────────────────
const Ctx = createContext(null);

export function useNotification() {
  return useContext(Ctx);
}

// ── Icon set ──────────────────────────────────────────────────
const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7.5" />
      <path d="M5.5 9l2.5 2.5L12.5 6" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7.5" />
      <path d="M9 5.5v3.5M9 12.5h.01" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2.5L15.9 14.5H2.1z" />
      <path d="M9 7.5v3M9 13h.01" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7.5" />
      <path d="M9 8.5v4M9 5.5h.01" />
    </svg>
  ),
};

const TYPE_COLOR = {
  success: '#4f7d52',
  error:   '#c0392b',
  warning: '#d56b25',
  info:    '#5b8fd6',
};

// ── Single item ───────────────────────────────────────────────
function NotifItem({ notification, onDismiss }) {
  const { id, type = 'info', message, duration = 4000 } = notification;
  const color = TYPE_COLOR[type] ?? TYPE_COLOR.info;

  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const startRef  = useRef(Date.now());
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);
  const touchStartY = useRef(null);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [exiting, id, onDismiss]);

  useEffect(() => {
    const tick = () => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) { rafRef.current = requestAnimationFrame(tick); }
      else { dismiss(); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, dismiss]);

  function onTouchStart(e) { touchStartY.current = e.touches[0].clientY; }
  function onTouchEnd(e) {
    if (touchStartY.current === null) return;
    if (e.changedTouches[0].clientY - touchStartY.current > 36) dismiss();
    touchStartY.current = null;
  }

  return (
    <div
      className={`notif-item notif-item--${type}${exiting ? ' notif-item--exit' : ''}`}
      style={{ '--nc': color }}
      role="alert"
      aria-live="assertive"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; startRef.current = Date.now() - (1 - progress / 100) * duration; }}
    >
      <span className="notif-item__accent" />
      <span className="notif-item__icon" style={{ color }}>{ICONS[type]}</span>
      <span className="notif-item__msg">{message}</span>
      <button
        type="button"
        className="notif-item__close"
        onClick={dismiss}
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>
      <div className="notif-item__bar" style={{ width: `${progress}%`, background: color }} />
    </div>
  );
}

// ── Provider + portal ─────────────────────────────────────────
export function NotificationProvider({ children }) {
  const [list, setList] = useState([]);

  const notify = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setList(prev => {
      const next = prev.length >= 3 ? prev.slice(-2) : prev;
      return [...next, { ...notification, id }];
    });
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setList(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => notificationBus.subscribe(notify), [notify]);

  return (
    <Ctx.Provider value={{ notify, dismiss }}>
      {children}
      {list.length > 0 && createPortal(
        <div className="notif-stack" aria-label="Notifications">
          {list.map(n => (
            <NotifItem key={n.id} notification={n} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}
