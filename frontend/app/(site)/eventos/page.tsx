import Link from "next/link";
import { fetchEvents } from "@/lib/api";
import { SafeImage } from "@/components/ui/safe-image";
import { formatCLP } from "@/lib/format";

export default async function EventosPage() {
  const events = await fetchEvents().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-white">Eventos y torneos</h1>
      <p className="mt-2 text-zinc-500">Inscripciones y detalle en tienda o WhatsApp.</p>
      <div className="mt-10 space-y-6">
        {events.length === 0 && <p className="text-zinc-500">Pronto habrá nuevas fechas.</p>}
        {events.map((e) => (
          <article key={e.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e14]">
            {e.imageUrl && (
              <div className="relative aspect-[21/9] w-full border-b border-white/10 bg-black/40 md:aspect-[2.5/1]">
                <SafeImage
                  src={e.imageUrl}
                  alt={e.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 72rem"
                />
              </div>
            )}
            <div className="p-6">
            <h2 className="font-display text-xl font-semibold text-white">{e.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {new Date(e.startsAt).toLocaleString("es-CL", { dateStyle: "full", timeStyle: "short" })} —{" "}
              {new Date(e.endsAt).toLocaleTimeString("es-CL", { timeStyle: "short" })}
            </p>
            {e.description && <p className="mt-3 text-zinc-300">{e.description}</p>}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
              {e.capacity != null && <span>Cupos: {e.capacity}</span>}
              {e.entryFee != null && <span>Inscripción: {formatCLP(e.entryFee)}</span>}
            </div>
            <div className="mt-4">
              <Link href="/contacto" className="ds-link">
                Consultar por inscripción
              </Link>
              {e.externalUrl && (
                <a
                  href={e.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ds-link ml-4"
                >
                  Enlace externo
                </a>
              )}
            </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
