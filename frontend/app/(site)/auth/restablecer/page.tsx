"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RestablecerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-zinc-500">Redirigiendo al inicio de sesión…</p>
      <p className="mt-4 text-sm text-zinc-400">
        El restablecimiento por correo no aplica a cuentas que entran solo con Google.
      </p>
      <p className="mt-6">
        <Link href="/auth/login" className="ds-link">
          Continuar con Google
        </Link>
      </p>
    </div>
  );
}
