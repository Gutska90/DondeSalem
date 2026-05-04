import Image from "next/image";

function isRemoteAbsolute(src: string) {
  return /^https?:\/\//i.test(src);
}

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image exige `remotePatterns` por host; las URLs de catálogo/API pueden ser cualquier dominio.
 * Para http(s) usamos <img>; para rutas locales seguimos con Image.
 */
export function SafeImage({ src, alt, fill, className, sizes, priority }: Props) {
  if (isRemoteAbsolute(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URLs externas no cubiertas por remotePatterns
      <img
        src={src}
        alt={alt}
        className={
          fill
            ? `absolute inset-0 box-border h-full w-full min-h-0 min-w-0 ${className ?? ""}`.trim()
            : className
        }
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image src={src} alt={alt} fill={fill} className={className} sizes={sizes} priority={priority} />
  );
}
