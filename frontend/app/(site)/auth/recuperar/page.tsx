"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RecuperarPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-zinc-500">Redirigiendo…</p>
      <p className="mt-4 text-sm text-zinc-400">
        Las cuentas de clientes usan solo Google. Si sos administrador con contraseña local, contactá
        soporte.
      </p>
      <p className="mt-6">
        <Link href="/auth/login" className="ds-link">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
