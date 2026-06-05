import { useState, type CSSProperties } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { loginUser } from "../api/auth.ts";

type FocusedField = "username" | "password" | null;

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);

  if (isAuthenticated) return <Navigate to="/welcome" replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      signIn(data, username);
      navigate("/welcome");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* Decorative background */}
      <div style={s.grid} aria-hidden="true" />
      <div style={s.orbWarm} aria-hidden="true" />
      <div style={s.orbCool} aria-hidden="true" />

      <main style={s.card}>
        {/* Brand */}
        <div style={s.logoRow}>
          <LogoMark />
          <span style={s.logoText}>FlowOps</span>
        </div>

        {/* Heading */}
        <div style={s.header}>
          <h1 style={s.title}>Sign in</h1>
          <p style={s.subtitle}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form} noValidate>
          <div style={s.field}>
            <label htmlFor="username" style={s.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused("username")}
              onBlur={() => setFocused(null)}
              required
              autoComplete="username"
              autoFocus
              style={{
                ...s.input,
                ...(focused === "username" ? s.inputFocused : {}),
              }}
              placeholder="admin"
            />
          </div>

          <div style={s.field}>
            <label htmlFor="password" style={s.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
              autoComplete="current-password"
              style={{
                ...s.input,
                ...(focused === "password" ? s.inputFocused : {}),
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={s.errorBox} role="alert">
              <span style={s.errorDot} aria-hidden="true" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
          >
            {loading ? (
              <span style={s.buttonInner}>
                <Spinner />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p style={s.hint}>FlowOps · Surgical Precision Dashboard</p>
      </main>
    </div>
  );
}

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
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const s: Record<string, CSSProperties> = {
  root: {
    minHeight: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: [
      "linear-gradient(rgba(0,0,0,0.027) 1px, transparent 1px)",
      "linear-gradient(90deg, rgba(0,0,0,0.027) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "24px 24px",
    pointerEvents: "none",
  },
  orbWarm: {
    position: "absolute",
    top: "-15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "900px",
    height: "700px",
    background:
      "radial-gradient(circle at 50% 30%, rgba(255, 237, 213, 0.38) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  orbCool: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: "500px",
    height: "500px",
    background:
      "radial-gradient(circle at center, rgba(224, 231, 255, 0.28) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.92)",
    border: "0.8px solid rgba(255, 255, 255, 0.9)",
    borderRadius: "32px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: [
      "rgba(0, 0, 0, 0) 0px 0px 0px 0px",
      "rgba(0, 0, 0, 0) 0px 0px 0px 0px",
      "rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
      "rgba(0, 0, 0, 0.06) 0px 1px 1px -0.5px",
      "rgba(0, 0, 0, 0.06) 0px 3px 3px -1.5px",
      "rgba(0, 0, 0, 0.06) 0px 6px 6px -3px",
      "rgba(0, 0, 0, 0.06) 0px 12px 12px -6px",
      "rgba(0, 0, 0, 0.06) 0px 24px 24px -12px",
    ].join(", "),
    animation: "fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1) both",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "32px",
  },
  logoText: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "0.35px",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 500,
    color: "#111827",
    letterSpacing: "-0.025em",
    lineHeight: 1.2,
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    fontWeight: 300,
    color: "#6b7280",
    lineHeight: "22.75px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    letterSpacing: "0.35px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 300,
    fontFamily: "'Inter', sans-serif",
    color: "#111827",
    background: "#ffffff",
    border: "0.8px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    lineHeight: "22.75px",
  },
  inputFocused: {
    border: "1.6px solid #6496ff",
    boxShadow: "rgba(100, 150, 255, 0.12) 0px 0px 0px 3px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#fff7f7",
    border: "0.8px solid #fecaca",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 300,
    color: "#dc2626",
  },
  errorDot: {
    flexShrink: 0,
    width: "6px",
    height: "6px",
    borderRadius: "9999px",
    background: "#dc2626",
    display: "inline-block",
  },
  button: {
    marginTop: "8px",
    padding: "11px 10px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    color: "#ffffff",
    background: "#111827",
    border: "none",
    borderRadius: "9999px",
    cursor: "pointer",
    transition: "opacity 150ms ease, transform 150ms ease",
    letterSpacing: "0.35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  buttonInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  hint: {
    marginTop: "24px",
    fontSize: "12px",
    fontWeight: 300,
    color: "#9ca3af",
    textAlign: "center",
    letterSpacing: "0.35px",
  },
};
