import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { useTokenCountdown } from "../hooks/useTokenCountdown.ts";
import { refreshToken as apiRefreshToken } from "../api/auth.ts";

const TOTAL_SECONDS = 300;

export default function WelcomePage() {
  const { user, token, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const countdown = useTokenCountdown();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const expiresAtLabel =
    countdown.secondsLeft > 0
      ? new Date(Date.now() + countdown.secondsLeft * 1000).toLocaleTimeString(
          "en-US",
          { hour: "2-digit", minute: "2-digit", second: "2-digit" },
        )
      : "\u2014";

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    setRefreshError("");
    try {
      const data = await apiRefreshToken(token);
      signIn(data, user ?? "");
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const arcColor =
    countdown.secondsLeft <= 0
      ? "#dc2626"
      : countdown.isWarning
        ? "#f59e0b"
        : "#10b981";

  const isActive = countdown.secondsLeft > 0;

  return (
    <div style={s.root}>
      <div style={s.grid} aria-hidden="true" />
      <div style={s.orb} aria-hidden="true" />

      <header style={s.header}>
        <div style={s.logoRow}>
          <LogoMark />
          <span style={s.logoText}>FlowOps</span>
        </div>
        <div style={s.navRight}>
          <span style={s.headerTime}>{timeLabel}</span>
          <div style={s.divider} aria-hidden="true" />
          <div style={s.userChip}>
            <div style={s.avatar}>{(user ?? "U")[0].toUpperCase()}</div>
            <span style={s.userName}>{user}</span>
          </div>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.greetingBlock}>
          <p style={s.dateLabel}>
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 style={s.greetingTitle}>
            {greeting}, {user}.
          </h1>
          <p style={s.greetingSub}>Active JWT session \xb7 Bearer HS256</p>
        </div>

        {/* Unified session panel */}
        <div style={s.card}>
          {/* Left — arc timer */}
          <div style={s.arcSide}>
            <p style={s.arcLabel}>Token lifetime</p>
            <ArcTimer
              secondsLeft={countdown.secondsLeft}
              total={TOTAL_SECONDS}
              color={arcColor}
            />
            <div
              style={{
                ...s.statusPill,
                background: isActive
                  ? "rgba(16,185,129,0.08)"
                  : "rgba(220,38,38,0.08)",
                border: `0.8px solid ${
                  isActive ? "rgba(16,185,129,0.22)" : "rgba(220,38,38,0.22)"
                }`,
              }}
            >
              <span
                style={{
                  ...s.statusDot,
                  background: arcColor,
                  animation: isActive
                    ? "ping 1.5s ease-in-out infinite"
                    : "none",
                }}
              />
              <span style={{ ...s.statusText, color: arcColor }}>
                {isActive ? "Active" : "Expired"}
              </span>
            </div>
          </div>

          {/* Vertical separator */}
          <div style={s.vDivider} aria-hidden="true" />

          {/* Right — info + actions */}
          <div style={s.infoSide}>
            <p style={s.infoTitle}>Session details</p>

            <div style={s.rowGroup}>
              <DataRow label="User" value={user ?? "\u2014"} />
              <DataRow label="Token type" value="Bearer JWT (HS256)" />
              <DataRow label="Expires at" value={expiresAtLabel} />
            </div>

            {refreshError && (
              <div style={s.errorBox} role="alert">
                {refreshError}
              </div>
            )}

            <div style={s.actions}>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || !isActive}
                style={{
                  ...s.primaryBtn,
                  ...(refreshing || !isActive ? s.btnDisabled : {}),
                }}
              >
                {refreshing ? (
                  <span style={s.btnInner}>
                    <Spinner />
                    Refreshing\u2026
                  </span>
                ) : (
                  "Refresh token"
                )}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                style={s.ghostBtn}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── ArcTimer ────────────────────────────────────────────────────── */

function ArcTimer({
  secondsLeft,
  total,
  color,
}: {
  secondsLeft: number;
  total: number;
  color: string;
}) {
  const r = 72;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, secondsLeft / total));
  const offset = circumference * (1 - progress);

  const safe = Math.max(0, secondsLeft);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");

  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        aria-label={`${safe} seconds remaining`}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={String(circumference)}
          strokeDashoffset={String(offset)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 600ms ease",
          }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#111827",
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {mm}:{ss}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 300,
            color: "#9ca3af",
            letterSpacing: "0.5px",
            marginTop: "5px",
          }}
        >
          remaining
        </span>
      </div>
    </div>
  );
}

/* ── DataRow ─────────────────────────────────────────────────────── */

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={dr.row}>
      <span style={dr.label}>{label}</span>
      <span style={dr.value}>{value}</span>
    </div>
  );
}

const dr: Record<string, CSSProperties> = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "0.8px solid rgba(0,0,0,0.05)",
  },
  label: { fontSize: "13px", fontWeight: 300, color: "#9ca3af" },
  value: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#111827",
    fontVariantNumeric: "tabular-nums",
  },
};

/* ── Spinner ─────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.65s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── LogoMark ────────────────────────────────────────────────────── */

function LogoMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="9" height="9" fill="#111827" />
      <rect x="13" y="2" width="9" height="9" fill="#FFEDD5" />
      <rect x="2" y="13" width="9" height="9" fill="#E0E7FF" />
      <rect
        x="13"
        y="13"
        width="9"
        height="9"
        fill="#111827"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */

const CARD_SHADOW = [
  "rgba(0,0,0,0) 0px 0px 0px 0px",
  "rgba(0,0,0,0) 0px 0px 0px 0px",
  "rgba(0,0,0,0.06) 0px 0px 0px 1px",
  "rgba(0,0,0,0.06) 0px 1px 1px -0.5px",
  "rgba(0,0,0,0.06) 0px 3px 3px -1.5px",
  "rgba(0,0,0,0.06) 0px 6px 6px -3px",
  "rgba(0,0,0,0.06) 0px 12px 12px -6px",
  "rgba(0,0,0,0.06) 0px 24px 24px -12px",
].join(", ");

const s: Record<string, CSSProperties> = {
  root: {
    minHeight: "100%",
    background: "#ffffff",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  grid: {
    position: "fixed",
    inset: "0",
    backgroundImage: [
      "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px)",
      "linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "24px 24px",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb: {
    position: "fixed",
    top: "-25%",
    left: "25%",
    width: "900px",
    height: "700px",
    background:
      "radial-gradient(circle at 50% 40%, rgba(255,237,213,0.28) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 28px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "0.8px solid rgba(0,0,0,0.06)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "8px" },
  logoText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "0.35px",
  },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  headerTime: {
    fontSize: "12px",
    fontWeight: 300,
    color: "#9ca3af",
    fontVariantNumeric: "tabular-nums",
  },
  divider: { width: "1px", height: "16px", background: "#e5e7eb" },
  userChip: { display: "flex", alignItems: "center", gap: "6px" },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "9999px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "0.5px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    letterSpacing: "0.35px",
  },

  main: {
    position: "relative",
    zIndex: 1,
    padding: "52px 28px 72px",
    maxWidth: "780px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    animation: "fade-in 300ms cubic-bezier(0.4,0,0.2,1) both",
  },

  greetingBlock: {},
  dateLabel: {
    fontSize: "12px",
    fontWeight: 300,
    color: "#9ca3af",
    letterSpacing: "0.35px",
    marginBottom: "6px",
  },
  greetingTitle: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 500,
    color: "#111827",
    letterSpacing: "-0.025em",
    lineHeight: 1.15,
    marginBottom: "6px",
  },
  greetingSub: {
    fontSize: "13px",
    fontWeight: 300,
    color: "#9ca3af",
    letterSpacing: "0.35px",
  },

  card: {
    display: "flex",
    alignItems: "stretch",
    background: "rgba(255,255,255,0.95)",
    border: "0.8px solid rgba(0,0,0,0.07)",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: CARD_SHADOW,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  },

  arcSide: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "40px 36px",
    background: "rgba(0,0,0,0.015)",
    minWidth: "260px",
  },
  arcLabel: {
    fontSize: "10px",
    fontWeight: 300,
    color: "#9ca3af",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "9999px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "9999px",
    flexShrink: 0,
    display: "inline-block",
  },
  statusText: { fontSize: "12px", fontWeight: 500, letterSpacing: "0.35px" },

  vDivider: {
    width: "0.8px",
    background: "rgba(0,0,0,0.05)",
    flexShrink: 0,
  },

  infoSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "36px 32px",
    gap: "20px",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#111827",
    letterSpacing: "-0.015em",
  },
  rowGroup: { display: "flex", flexDirection: "column" },

  errorBox: {
    padding: "8px 12px",
    background: "rgba(220,38,38,0.08)",
    border: "0.8px solid rgba(220,38,38,0.2)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 300,
    color: "#dc2626",
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "auto",
  },
  primaryBtn: {
    padding: "11px 10px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: "#ffffff",
    background: "#111827",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "opacity 150ms ease",
    letterSpacing: "0.35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  btnInner: { display: "flex", alignItems: "center", gap: "8px" },
  ghostBtn: {
    padding: "0",
    fontSize: "13px",
    fontWeight: 300,
    fontFamily: "'Inter', sans-serif",
    color: "#9ca3af",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    transition: "color 150ms ease",
    letterSpacing: "0.35px",
  },
};
