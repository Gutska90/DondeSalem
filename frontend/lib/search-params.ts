/** Next.js App Router puede entregar cada query como string o string[]. */
export function spStr(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}
