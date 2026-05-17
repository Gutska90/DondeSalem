"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** El alta de clientes es automática al iniciar sesión con Google. */
export default function RegistroPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);
  return (
    <p className="mx-auto max-w-md px-4 py-16 text-center text-zinc-500">
      Redirigiendo al inicio de sesión…
    </p>
  );
}
