"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import {
  totpConfirm,
  totpDisable,
  totpRegenerateRecovery,
  totpSetup,
  type TotpSetupResponse,
} from "@/lib/api";
import type { User } from "@/lib/types";

type Props = {
  token: string;
  user: User;
  onUserRefresh: () => Promise<void>;
};

export function TwoFaSettings({ token, user, onUserRefresh }: Props) {
  const [setup, setSetup] = useState<TotpSetupResponse | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disablePwd, setDisablePwd] = useState("");
  const [disableTotp, setDisableTotp] = useState("");
  const [regenPwd, setRegenPwd] = useState("");
  const [regenTotp, setRegenTotp] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totpOn = user.totpEnabled === true;

  async function onStartSetup() {
    setErr(null);
    setOk(null);
    setRecoveryCodes(null);
    setLoading(true);
    try {
      const s = await totpSetup(token);
      setSetup(s);
      setConfirmCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!setup) return;
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await totpConfirm(token, confirmCode.trim());
      setSetup(null);
      setRecoveryCodes(res.recoveryCodes);
      setOk("2FA activado. Guardá los códigos de recuperación: solo se muestran ahora.");
      await onUserRefresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onRegenerate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const body =
        user.passwordConfigured === false
          ? { totpCode: regenTotp.trim() }
          : { totpCode: regenTotp.trim(), currentPassword: regenPwd };
      const res = await totpRegenerateRecovery(token, body);
      setRecoveryCodes(res.recoveryCodes);
      setRegenPwd("");
      setRegenTotp("");
      setOk("Nuevos códigos generados. Los anteriores ya no sirven.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onDisable(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setRecoveryCodes(null);
    setLoading(true);
    try {
      const body =
        user.passwordConfigured === false
          ? { totpCode: disableTotp.trim() }
          : { totpCode: disableTotp.trim(), currentPassword: disablePwd };
      await totpDisable(token, body);
      setDisablePwd("");
      setDisableTotp("");
      setOk("2FA desactivado.");
      await onUserRefresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 max-w-md">
      <h2 className="font-display text-xl font-semibold text-white">Autenticación en dos pasos</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Compatible con Google Authenticator y apps similares (código de 6 dígitos). Incluye
        códigos de recuperación por si perdés el teléfono.
      </p>
      {recoveryCodes && recoveryCodes.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-100">
            Códigos de recuperación (un solo uso c/u). Guardalos en lugar seguro; no volverán a
            mostrarse.
          </p>
          <ul className="mt-3 grid gap-1 font-mono text-sm text-amber-50">
            {recoveryCodes.map((c, i) => (
              <li key={`${i}-${c}`}>{c}</li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setRecoveryCodes(null)}
            className="ds-btn-primary mt-4 justify-center px-4 py-2 text-xs"
          >
            Los guardé
          </button>
        </div>
      )}
      {ok && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100/95">
          {ok}
        </p>
      )}
      {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

      {!totpOn && !setup && (
        <button
          type="button"
          disabled={loading}
          onClick={onStartSetup}
          className="ds-btn-primary mt-4 justify-center px-4 py-2 text-sm disabled:opacity-50"
        >
          Activar 2FA
        </button>
      )}

      {setup && (
        <form onSubmit={onConfirm} className="mt-6 space-y-4">
          <p className="text-sm text-zinc-400">
            Escaneá el código con tu app o ingresá el secreto manualmente.
          </p>
          <div className="flex justify-center rounded-xl border border-white/10 bg-white p-3">
            <QRCodeSVG value={setup.otpauthUri} size={200} level="M" />
          </div>
          <p className="break-all font-mono text-xs text-zinc-500">{setup.secret}</p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Código de 6 dígitos</span>
            <input
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-zinc-100 tracking-widest"
              placeholder="000000"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading || confirmCode.length < 6}
              className="ds-btn-primary justify-center px-4 py-2 text-sm disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setSetup(null);
                setErr(null);
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {totpOn && (
        <>
          <form onSubmit={onRegenerate} className="mt-6 space-y-3 rounded-xl border border-white/10 bg-[#0c0e14]/50 p-4">
            <h3 className="text-sm font-semibold text-zinc-200">Nuevos códigos de recuperación</h3>
            <p className="text-xs text-zinc-500">
              Invalida los códigos viejos y genera otros diez. Necesitás un código TOTP actual
              {user.passwordConfigured !== false ? " y tu contraseña" : ""}.
            </p>
            {user.passwordConfigured !== false && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Contraseña</span>
                <input
                  type="password"
                  value={regenPwd}
                  onChange={(e) => setRegenPwd(e.target.value)}
                  autoComplete="current-password"
                  className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Código TOTP</span>
              <input
                value={regenTotp}
                onChange={(e) => setRegenTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-zinc-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading || regenTotp.length < 6}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
            >
              Regenerar códigos
            </button>
          </form>

          <form onSubmit={onDisable} className="mt-6 space-y-3">
            <p className="text-sm text-amber-200/90">
              Para desactivar 2FA necesitás un código válido de la app
              {user.passwordConfigured !== false ? " y tu contraseña" : ""}.
            </p>
            {user.passwordConfigured !== false && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Contraseña</span>
                <input
                  type="password"
                  value={disablePwd}
                  onChange={(e) => setDisablePwd(e.target.value)}
                  autoComplete="current-password"
                  className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 text-zinc-100"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Código TOTP</span>
              <input
                value={disableTotp}
                onChange={(e) => setDisableTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                className="rounded-lg border border-white/10 bg-[#0c0e14] px-3 py-2 font-mono text-zinc-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading || disableTotp.length < 6}
              className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200 disabled:opacity-50"
            >
              Desactivar 2FA
            </button>
          </form>
        </>
      )}
    </section>
  );
}
