import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

interface TokenCountdown {
  secondsLeft: number;
  isExpired: boolean;
  isWarning: boolean; // last 60 s
  label: string;
}

/**
 * Returns a live countdown to token expiry, refreshed every second.
 * Automatically signs out when the token expires.
 */
export function useTokenCountdown(): TokenCountdown {
  const { expiresAt, signOut } = useAuth();

  const calc = (): number => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calc);

  useEffect(() => {
    const id = setInterval(() => {
      const s = calc();
      setSecondsLeft(s);
      if (s === 0) signOut();
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, signOut]);

  const isExpired = secondsLeft === 0;
  const isWarning = secondsLeft <= 60 && !isExpired;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const label = isExpired
    ? "Expired"
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return { secondsLeft, isExpired, isWarning, label };
}
