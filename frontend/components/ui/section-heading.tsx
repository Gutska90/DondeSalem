import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  eyebrow?: string;
  children?: ReactNode;
};

export function SectionHeading({ title, subtitle, action, eyebrow, children }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ds-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-balance text-2xl font-bold tracking-tight text-ds-ink sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ds-muted">{subtitle}</p>
        )}
        {children}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group shrink-0 text-sm font-semibold text-ds-mint transition hover:text-ds-mint/90"
        >
          <span className="border-b border-ds-mint/35 pb-0.5 transition group-hover:border-ds-mint">
            {action.label}
          </span>
          <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}
