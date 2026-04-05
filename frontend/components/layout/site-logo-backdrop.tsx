/**
 * Mosaico del logo en el fondo (solo sitio público). Muy suave para no competir con el contenido.
 */
export function SiteLogoBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-ds-page"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,61,255,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 opacity-[0.055] sm:opacity-[0.065]"
        style={{
          backgroundImage: "url(/logo-dondesalem.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "clamp(160px, 22vw, 280px)",
          backgroundPosition: "center",
        }}
      />
    </>
  );
}
