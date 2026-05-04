#!/usr/bin/env python3
"""
Descarga páginas de un listado de productos Proveedor externo (Jumpseller) y genera un JSON
compatible con backend (misma forma que mylserena-pe-singles.json).

Por defecto: Singles Primera Era → backend/src/main/resources/seed/mylserena-pe-singles.json

Otro listado (misma plantilla HTML), ejemplo Singles Primer Bloque:
  ./scripts/fetch_mylserena_pe_singles.py \\
    --listing-url 'https://mylserena.cl/singles-pb-1?page={page}' \\
    -o backend/src/main/resources/seed/proveedor-externo-pb-singles.json \\
    --from 1 --to 120 --stop-on-empty

Campos por ítem: pathSlug, listingTitle, imageId, imageVersion, price, brandLine.
En el listado no hay párrafo “descripción”; el título de la tarjeta va en listingTitle.

Usa curl para HTTPS (evita problemas de certificados en algunos entornos).

Ejemplos:
  ./scripts/fetch_mylserena_pe_singles.py
  ./scripts/fetch_mylserena_pe_singles.py --from 1 --to 90 --stop-on-empty
  ./scripts/fetch_mylserena_pe_singles.py --from 12 --to 20 -o /tmp/out.json
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_LISTING_URL = "https://mylserena.cl/primera-era/singles-pe?page={page}"

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = REPO_ROOT / "backend/src/main/resources/seed/mylserena-pe-singles.json"


def ensure_seed_json_exists(path: Path) -> None:
    """Crea un array JSON vacío si el archivo no existe (misma ruta que el import del backend)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("[]\n", encoding="utf-8")
        print(
            "Archivo ausente: creado placeholder vacío:\n  "
            + str(path.resolve())
            + "\n(Ejecutá el scrape para rellenarlo; el API acepta [] sin romper la app.)",
            flush=True,
        )


def fetch_page(listing_url_template: str, page: int, timeout: int) -> str:
    url = listing_url_template.format(page=page)
    proc = subprocess.run(
        ["curl", "-sL", "--fail", url],
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"curl falló (exit {proc.returncode}) para {url}: {proc.stderr.strip()}"
        )
    return proc.stdout


def parse_products(html: str) -> list[dict]:
    articles = re.split(
        r"<article[^>]*product-block-product-feed[^>]*>", html, flags=re.I
    )[1:]
    rows: list[dict] = []
    for art in articles:
        hm = re.search(r'<h2[^>]*>\s*<a[^>]*href="/([^"]+)"', art)
        tm = re.search(r"<h2[^>]*>\s*<a[^>]*>([^<]+)</a>", art)
        if not hm or not tm:
            continue
        title = tm.group(1).strip()
        path = hm.group(1)
        # Misma tienda puede servir distintos tamaños (306/407, 251/335, etc.)
        img_m = re.search(
            r"cdnx\.jumpseller\.com/proveedor-externo/image/(\d+)/resize/\d+/\d+\?(\d+)",
            art,
        )
        if not img_m:
            continue
        iid, ver = img_m.groups()
        price_m = re.search(r"\$\s*([\d.]+)", art)
        raw = price_m.group(1).replace(".", "") if price_m else "0"
        price = int(raw)
        brand_m = re.search(
            r'product-block__brand[^>]*>([^<]+)</span>', art, flags=re.I
        )
        brand = brand_m.group(1).strip() if brand_m else None
        rows.append(
            {
                "pathSlug": path,
                "listingTitle": title,
                "imageId": iid,
                "imageVersion": ver,
                "price": price,
                "brandLine": brand,
            }
        )
    return rows


def main() -> int:
    p = argparse.ArgumentParser(
        description="Genera JSON de singles Proveedor externo (listado paginado Jumpseller)."
    )
    p.add_argument(
        "--listing-url",
        type=str,
        default=DEFAULT_LISTING_URL,
        metavar="URL",
        help=f"Plantilla con {{page}} (default: PE singles-pe). Ej. PB: "
        f"https://proveedor-externo.cl/singles-pb-1?page={{page}}",
    )
    p.add_argument(
        "--from",
        type=int,
        dest="page_from",
        default=1,
        metavar="N",
        help="Primera página a descargar (default: 1).",
    )
    p.add_argument(
        "--to",
        type=int,
        dest="page_to",
        default=90,
        metavar="N",
        help="Última página inclusive (default: 90; ~30 ítems/página ≈ catálogo completo del listado).",
    )
    p.add_argument(
        "--stop-on-empty",
        action="store_true",
        help="Detenerse en la primera página sin productos (útil con --to alto).",
    )
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Ruta del JSON (default: {DEFAULT_OUTPUT})",
    )
    p.add_argument(
        "--timeout",
        type=int,
        default=120,
        help="Timeout por petición curl en segundos (default: 120).",
    )
    args = p.parse_args()

    if args.page_from < 1 or args.page_to < args.page_from:
        print("Rango inválido: --from debe ser >= 1 y --to >= --from.", file=sys.stderr)
        return 2

    ensure_seed_json_exists(args.output)

    all_rows: list[dict] = []
    seen: set[str] = set()
    duplicates = 0

    for page in range(args.page_from, args.page_to + 1):
        print(f"Página {page} …", flush=True)
        html = fetch_page(args.listing_url, page, args.timeout)
        part = parse_products(html)
        print(f"  → {len(part)} productos", flush=True)
        if len(part) == 0:
            print(
                "  (vacío: posible fin de catálogo o cambio de HTML.)",
                flush=True,
            )
            if args.stop_on_empty:
                print("  Deteniendo (--stop-on-empty).", flush=True)
                break
        for row in part:
            slug = row["pathSlug"]
            if slug in seen:
                duplicates += 1
                print(f"  aviso: slug duplicado omitido: {slug}", flush=True)
                continue
            seen.add(slug)
            all_rows.append(row)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(all_rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"Listo: {len(all_rows)} filas → {args.output}"
        + (f" ({duplicates} duplicados omitidos)" if duplicates else ""),
        flush=True,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
