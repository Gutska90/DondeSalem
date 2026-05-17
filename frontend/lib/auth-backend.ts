import type { TokenResponse } from "@/lib/api";

function apiBaseUrl(): string {
  const raw = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return raw.replace(/\/api\/?$/, "");
}

const API_URL = apiBaseUrl();

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    if (j?.error) return j.error;
  } catch {
    /* ignore */
  }
  return res.statusText || "Error";
}

export async function exchangeGoogleIdToken(idToken: string): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<TokenResponse>;
}

export async function completeTotpOnBackend(body: {
  pendingToken: string;
  code?: string;
  recoveryCode?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/auth/totp/complete`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<TokenResponse>;
}
