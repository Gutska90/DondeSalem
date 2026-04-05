import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {categories.slice(0, 8).map((c) => (
        <Link
          key={c.id}
          href={`/tienda?category=${encodeURIComponent(c.slug)}`}
          className="group relative overflow-hidden rounded-2xl border border-ds-border bg-ds-surface/80 p-5 shadow-ds-card transition duration-300 ease-ds-out hover:border-ds-accent/30 hover:shadow-ds-card-hover"
        >
          <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ds-accent-muted blur-3xl transition duration-500 group-hover:bg-ds-accent/20" />
          <span className="relative block text-sm font-semibold text-ds-ink">{c.name}</span>
          <span className="relative mt-2 block text-xs font-medium text-ds-subtle transition group-hover:text-ds-muted">
            Ver productos →
          </span>
        </Link>
      ))}
    </div>
  );
}
