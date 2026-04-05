import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export function LegalPageShell({
  title,
  eyebrow = "Información legal",
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <Container as="article" className="py-10 md:py-16">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ds-accent">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ds-ink md:text-4xl">{title}</h1>
      <div className="mt-10 max-w-3xl space-y-5 text-sm leading-relaxed text-ds-muted [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ds-ink [&_h2]:first:mt-0 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </Container>
  );
}
