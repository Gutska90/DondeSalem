import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { formatCLP } from "@/lib/format";
import { SafeImage } from "@/components/ui/safe-image";

export function HomeEventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ds-border bg-ds-surface/90 shadow-ds-card transition duration-300 ease-ds-out hover:border-ds-accent/30 hover:shadow-ds-card-hover">
      {event.imageUrl && (
        <div className="relative aspect-[16/9] w-full shrink-0 border-b border-ds-border bg-ds-elevated">
          <SafeImage
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ds-accent">Torneo · Actividad</p>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ds-ink">
        {event.title}
      </h3>
      <p className="mt-2 text-sm text-ds-muted">
        {new Date(event.startsAt).toLocaleString("es-CL", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      {event.entryFee != null && (
        <p className="mt-2 text-sm font-semibold tabular-nums text-ds-mint">
          Inscripción {formatCLP(event.entryFee)}
        </p>
      )}
      <Link
        href="/eventos"
        className="ds-link mt-auto pt-6 text-sm font-semibold"
      >
        Calendario completo →
      </Link>
      </div>
    </article>
  );
}
