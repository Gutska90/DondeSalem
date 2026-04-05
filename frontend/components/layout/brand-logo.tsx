import Image from "next/image";
import Link from "next/link";

/** Logo oficial PNG transparente — ~2× respecto al tamaño anterior; halo violeta al hover */
export function BrandLogoLink({
  size = "header",
  priority = false,
  className = "",
  onClick,
}: {
  size?: "header" | "footer" | "drawer";
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const img =
    size === "footer"
      ? "h-[min(9rem,30vw)] w-auto max-w-[min(100%,480px)] sm:h-[min(11rem,28vw)] md:h-[min(13rem,26vw)] lg:h-[min(16rem,24vw)] lg:max-w-[720px]"
      : size === "drawer"
        ? "h-24 w-auto max-w-[min(100%,480px)] sm:h-28"
        : "h-14 w-auto max-w-[min(88vw,400px)] sm:h-16 sm:max-w-[min(90vw,460px)] md:h-28 md:max-w-[min(52vw,640px)] lg:h-36 lg:max-w-[min(48vw,760px)] xl:h-[10rem] xl:max-w-[min(42vw,860px)]";

  const pad = size === "footer" ? "py-1" : size === "drawer" ? "py-1" : "py-0.5";

  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group inline-flex min-w-0 max-w-full items-center rounded-2xl ${pad} transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ds-page hover:drop-shadow-[0_0_28px_rgba(139,61,255,0.5)] ${className}`}
    >
      <Image
        src="/logo-dondesalem.png"
        alt="Donde Salem — TCG Store"
        width={1200}
        height={480}
        className={`${img} object-contain object-left drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]`}
        priority={priority}
        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 640px, (max-width: 1536px) 760px, 860px"
      />
    </Link>
  );
}
