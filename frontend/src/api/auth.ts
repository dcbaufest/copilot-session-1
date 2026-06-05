const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * POST /token — authenticate with username + password, returns JWT token data.
 */
export async function loginUser(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const response = await fetch(`${BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = "Login failed";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) message = data.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<TokenResponse>;
}

/**
 * POST /token/refresh — exchange a valid JWT for a fresh one.
 */
export async function refreshToken(
  currentToken: string,
): Promise<TokenResponse> {
  const response = await fetch(`${BASE_URL}/token/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${currentToken}` },
  });

  if (!response.ok) {
    let message = "Token refresh failed";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) message = data.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<TokenResponse>;
}
