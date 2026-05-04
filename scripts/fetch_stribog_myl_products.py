#!/usr/bin/env python3
"""
Importa/actualiza productos desde Tienda Proveedor externo (MyL Primera Era + Primer Bloque)
en el catálogo admin de DondeSalem usando la API local.

Incluye:
- nombre, precio, imagen, descripción corta
- categoría destino por bloque
- upsert por slug determinístico (crea si no existe; actualiza si ya existe)

Uso:
  python3 scripts/fetch_stribog_myl_products.py
  python3 scripts/fetch_stribog_myl_products.py --api http://localhost:8080
"""

from __future__ import annotations

import argparse
import re
import unicodedata
from dataclasses import dataclass
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


@dataclass
class SourceCfg:
    list_url: str
    category_slug: str
    category_name: str


SOURCES = [
    SourceCfg(
        "https://tiendastribog.cl/categoria-producto/tcg/mitos-y-leyendas/myl-primera-era/",
        "proveedor-externo-myl-primera-era",
        "Proveedor externo · MyL Primera Era",
    ),
    SourceCfg(
        "https://tiendastribog.cl/categoria-producto/tcg/mitos-y-leyendas/myl-primer-bloque/",
        "proveedor-externo-myl-primer-bloque",
        "Proveedor externo · MyL Primer Bloque",
    ),
]


def slugify(text: str) -> str:
    t = unicodedata.normalize("NFD", text.lower())
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t


def clp_to_int(text: str | None) -> int:
    nums = re.findall(r"\d[\d\.]*", text or "")
    if not nums:
        return 0
    vals = [int(n.replace(".", "")) for n in nums]
    return min(vals)


def pick_description(session: requests.Session, url: str) -> str:
    try:
        r = session.get(url, timeout=30)
        if not r.ok:
            return ""
        s = BeautifulSoup(r.text, "html.parser")
        box = s.select_one(".woocommerce-product-details__short-description")
        if box:
            return box.get_text(" ", strip=True)
        meta = s.select_one('meta[name="description"]')
        if meta and meta.get("content"):
            return str(meta["content"]).strip()
    except Exception:
        return ""
    return ""


def parse_products(session: requests.Session, source: SourceCfg) -> list[dict[str, Any]]:
    r = session.get(source.list_url, timeout=40)
    r.raise_for_status()
    s = BeautifulSoup(r.text, "html.parser")
    cards = s.select("div.wd-product.product-grid-item")
    rows: list[dict[str, Any]] = []
    for card in cards:
        title_el = card.select_one(".wd-entities-title") or card.select_one("h3")
        title = title_el.get_text(" ", strip=True) if title_el else ""
        if not title:
            continue
        link_el = card.select_one('a[href*="/producto/"]')
        link = urljoin(source.list_url, link_el.get("href", "")) if link_el else ""
        img = card.select_one("img")
        image_url = (
            (img.get("data-wood-src") or img.get("data-src") or img.get("src")) if img else None
        )
        price_text = (card.select_one(".price").get_text(" ", strip=True) if card.select_one(".price") else "")
        text = card.get_text(" ", strip=True).lower()
        soldout = "agotado" in text
        preorder = "preventa" in text
        desc = pick_description(session, link) if link else ""
        if not desc:
            desc = f"Producto importado desde {source.category_name}."
        rows.append(
            {
                "name": title,
                "slug": f"proveedor-externo-{slugify(title)}",
                "description": desc,
                "price": clp_to_int(price_text),
                "stockQuantity": 0 if soldout else 5,
                "preorder": preorder,
                "imageUrl": image_url,
            }
        )
    return rows


def ensure_category(
    session: requests.Session, api: str, headers: dict[str, str], source: SourceCfg
) -> dict[str, Any]:
    cats = session.get(f"{api}/api/admin/categories", headers=headers, timeout=30).json()
    by_slug = {c["slug"]: c for c in cats}
    if source.category_slug in by_slug:
        return by_slug[source.category_slug]
    sort_order = max([int(c.get("sortOrder", 0)) for c in cats] or [0]) + 1
    r = session.post(
        f"{api}/api/admin/categories",
        headers=headers,
        json={
            "name": source.category_name,
            "slug": source.category_slug,
            "parentId": None,
            "sortOrder": sort_order,
        },
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def resolve_game_id(session: requests.Session, api: str, headers: dict[str, str]) -> int | None:
    games = session.get(f"{api}/api/admin/games", headers=headers, timeout=30).json()
    for g in games:
        if g.get("slug") == "mitos-y-leyendas":
            return g["id"]
    return None


def find_existing_id_by_slug(
    session: requests.Session,
    api: str,
    headers: dict[str, str],
    category_id: int,
    name: str,
    slug: str,
) -> int | None:
    r = session.get(
        f"{api}/api/admin/products",
        headers=headers,
        params={"search": name, "categoryId": category_id, "page": 0, "size": 50},
        timeout=30,
    )
    r.raise_for_status()
    for row in r.json().get("content", []):
        if row.get("slug") == slug:
            return int(row["id"])
    return None


def upsert_product(
    session: requests.Session,
    api: str,
    headers: dict[str, str],
    category_id: int,
    game_id: int | None,
    row: dict[str, Any],
) -> str:
    body = {
        "name": row["name"],
        "slug": row["slug"],
        "description": row["description"],
        "price": row["price"],
        "compareAtPrice": None,
        "stockQuantity": row["stockQuantity"],
        "sku": None,
        "categoryId": category_id,
        "gameId": game_id,
        "productType": "SEALED_TCG",
        "singleCardDetails": None,
        "preorder": row["preorder"],
        "preorderReleaseDate": None,
        "active": True,
        "featured": False,
        "imageUrls": [row["imageUrl"]] if row.get("imageUrl") else [],
        "tagIds": [],
    }
    create = session.post(f"{api}/api/admin/products", headers=headers, json=body, timeout=40)
    if create.status_code in (200, 201):
        return "created"
    if create.status_code != 409:
        raise RuntimeError(f"create {row['slug']}: {create.status_code} {create.text[:200]}")

    existing_id = find_existing_id_by_slug(session, api, headers, category_id, row["name"], row["slug"])
    if existing_id is None:
        return "conflict"
    update = session.put(
        f"{api}/api/admin/products/{existing_id}", headers=headers, json=body, timeout=40
    )
    if update.status_code in (200, 204):
        return "updated"
    raise RuntimeError(f"update {row['slug']}: {update.status_code} {update.text[:200]}")


def main() -> int:
    p = argparse.ArgumentParser(description="Import/update Proveedor externo MyL products to DondeSalem API")
    p.add_argument("--api", default="http://localhost:8080", help="Base URL API DondeSalem")
    p.add_argument("--email", default="admin@dondesalem.local", help="Admin email")
    p.add_argument("--password", default="Admin123!", help="Admin password")
    args = p.parse_args()

    session = requests.Session()
    login = session.post(
        f"{args.api}/api/auth/login",
        json={"email": args.email, "password": args.password},
        timeout=30,
    )
    login.raise_for_status()
    token = login.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    game_id = resolve_game_id(session, args.api, headers)
    created = updated = conflicts = 0
    for source in SOURCES:
        category = ensure_category(session, args.api, headers, source)
        rows = parse_products(session, source)
        print(f"{source.category_slug}: {len(rows)} productos encontrados")
        for row in rows:
            state = upsert_product(session, args.api, headers, int(category["id"]), game_id, row)
            if state == "created":
                created += 1
            elif state == "updated":
                updated += 1
            else:
                conflicts += 1

    print(
        f"Listo. created={created} updated={updated} unresolved_conflicts={conflicts}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

