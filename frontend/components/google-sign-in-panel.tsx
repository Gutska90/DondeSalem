"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type Props = {
  /** Tras Google, volver aquí para 2FA o redirigir a cuenta. */
  callbackUrl?: string;
  onError?: (msg: string) => void;
};

export function GoogleSignInPanel({
  callbackUrl = "/auth/login",
  onError,
}: Props) {
  const [busy, setBusy] = useState(false);

  async function onGoogleClick() {
    setBusy(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "No se pudo iniciar sesión con Google");
      setBusy(false);
    }
  }

  return <GoogleSignInButton busy={busy} onClick={onGoogleClick} />;
}

function GoogleSignInButton({
  busy,
  onClick,
}: {
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-[#13151c] px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-[#1a1d28] disabled:opacity-60"
    >
      <GoogleGlyph />
      {busy ? "Conectando…" : "Continuar con Google"}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.522 0-10-4.477-10-10s4.478-10 10-10c2.837 0 5.402 1.192 7.207 3.093l5.657-5.657C34.046 10.053 29.268 8 24 8 12.955 8 4 16.955 4 28s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.837 0 5.402 1.192 7.207 3.093l5.657-5.657C34.046 10.053 29.268 8 24 8c-7.682 0-14.348 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 39.091 26.715 40 24 40c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 43.556 16.227 48 24 48z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c1.649 4.657 6.33 8 11.697 8 3.292 0 6.267-1.256 8.528-3.303l6.317 6.317C42.802 44.768 38.116 48 32 48c-7.682 0-14.348-4.337-17.694-10.691z"
      />
    </svg>
  );
}
