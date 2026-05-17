"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { GoogleSignInPanel } from "@/components/google-sign-in-panel";
import { useAuth } from "@/components/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { pendingTotpToken: sessionPending } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totpPending, setTotpPending] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpUseRecovery, setTotpUseRecovery] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");

  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      setErr(
        oauthError === "Configuration"
          ? "Inicio con Google no está configurado (revisá GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET)."
          : "No se pudo completar el inicio de sesión con Google.",
      );
    }
  }, [oauthError]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.accessToken && !session?.pendingTotpToken) {
      router.replace("/cuenta");
      return;
    }
    if (session?.pendingTotpToken) {
      setTotpPending(session.pendingTotpToken);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (sessionPending && !totpPending) {
      setTotpPending(sessionPending);
    }
  }, [sessionPending, totpPending]);

  async function onTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!totpPending) return;
    setLoading(true);
    setErr(null);
    try {
      const result = await signIn("totp", {
        pendingToken: totpPending,
        code: totpUseRecovery ? "" : totpCode.trim(),
        recoveryCode: totpUseRecovery ? recoveryInput.trim() : "",
        redirect: false,
      });
      if (result?.error) {
        setErr("Código incorrecto o vencido. Intentá de nuevo.");
        return;
      }
      router.push("/cuenta");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onTotpBack() {
    setTotpPending(null);
    setTotpCode("");
    setRecoveryInput("");
    setTotpUseRecovery(false);
    setErr(null);
    await signOut({ redirect: false });
  }

  if (status === "loading") {
    return <p className="mx-auto max-w-md px-4 py-16 text-zinc-500">Cargando…</p>;
  }

  if (totpPending) {
    return (
      <TotpVerificationForm
        err={err}
        totpUseRecovery={totpUseRecovery}
        totpCode={totpCode}
        setTotpCode={setTotpCode}
        recoveryInput={recoveryInput}
        setRecoveryInput={setRecoveryInput}
        loading={loading}
        onTotpSubmit={onTotpSubmit}
        onToggleRecovery={() => setTotpUseRecovery((v) => !v)}
        onBack={onTotpBack}
      />
    );
  }

  return (
    <LoginShell err={err}>
      <GoogleSignInPanel callbackUrl="/auth/login" onError={setErr} />
      <p className="mt-8 text-center text-sm text-zinc-500">
        Al continuar aceptás que usamos tu cuenta de Google para identificarte. No guardamos tu
        contraseña de Gmail.
      </p>
    </LoginShell>
  );
}

function LoginShell({
  err,
  children,
}: {
  err: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Usá tu cuenta de Google para entrar a DondeSalem. Si es tu primera vez, creamos tu cuenta
        automáticamente.
      </p>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <div>{children}</div>
    </div>
  );
}

function TotpVerificationForm({
  err,
  totpUseRecovery,
  totpCode,
  setTotpCode,
  recoveryInput,
  setRecoveryInput,
  loading,
  onTotpSubmit,
  onToggleRecovery,
  onBack,
}: {
  err: string | null;
  totpUseRecovery: boolean;
  totpCode: string;
  setTotpCode: (v: string) => void;
  recoveryInput: string;
  setRecoveryInput: (v: string) => void;
  loading: boolean;
  onTotpSubmit: (e: React.FormEvent) => void;
  onToggleRecovery: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-white">Verificación en dos pasos</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {totpUseRecovery
          ? "Ingresá uno de tus códigos de recuperación (formato con guiones)."
          : "Abrí tu app (Google Authenticator u otra) e ingresá el código de 6 dígitos."}
      </p>
      {err && <p className="mt-4 text-red-400">{err}</p>}
      <form onSubmit={onTotpSubmit} className="mt-8 space-y-4">
        {!totpUseRecovery ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Código</span>
            <input
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-lg tracking-widest text-zinc-100"
              placeholder="000000"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Código de recuperación</span>
            <input
              value={recoveryInput}
              onChange={(e) =>
                setRecoveryInput(
                  e.target.value.toUpperCase().replace(/[^A-F0-9-]/g, "").slice(0, 14),
                )
              }
              autoComplete="off"
              required
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-zinc-100"
              placeholder="XXXX-XXXX-XXXX"
            />
          </label>
        )}
        <button
          type="submit"
          disabled={
            loading ||
            (!totpUseRecovery && totpCode.length < 6) ||
            (totpUseRecovery && recoveryInput.replace(/-/g, "").length < 12)
          }
          className="ds-btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Verificando…" : "Confirmar"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onToggleRecovery}
          className="w-full text-sm text-ds-accent underline-offset-2 hover:underline"
        >
          {totpUseRecovery ? "Usar código de la app" : "Usar código de recuperación"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onBack}
          className="w-full rounded-full border border-white/15 py-2 text-sm text-zinc-400"
        >
          Volver
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-md px-4 py-16 text-zinc-500">Cargando…</p>}>
      <LoginForm />
    </Suspense>
  );
}
