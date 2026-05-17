# DondeSalem — Plataforma ecommerce TCG / juegos de mesa

Monorepo con **frontend** (Next.js + TypeScript + Tailwind) y **backend** (Spring Boot + Java + API REST), base de datos **PostgreSQL**.

## Arquitectura

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────┐     JDBC      ┌──────────────┐
│  Next.js (web)  │ ◄──────────────► │  Spring Boot API │ ◄──────────► │ PostgreSQL   │
│  App Router     │   JWT en header    │  capas + DTOs    │              │ Flyway       │
└─────────────────┘                    └──────────────────┘              └──────────────┘
```

### Por qué no solo Next.js fullstack

El stack pedido (React/Next + Spring + SQL) encaja con un **BFF/cliente ligero** y un **dominio de negocio** en el servidor Java: inventario, pedidos y reglas (stock, estados) conviven en una API explícita, testeable y lista para integrar pasarelas, logística o jobs sin acoplar la UI. Next.js se centra en UX, SEO y panel admin; el backend centraliza seguridad y datos.

### Estructura de carpetas

| Ruta | Rol |
|------|-----|
| `frontend/` | Next.js: páginas, componentes, cliente HTTP, estado de carrito |
| `backend/` | Spring Boot: `controller` → `service` → `repository` → entidades JPA |
| `backend/src/main/resources/db/migration/` | Esquema versionado (Flyway) |
| `docs/DESARROLLO.md` | Desarrollo local: credenciales demo, seed, JSON Proveedor externo |
| `scripts/` | Utilidades (p. ej. `fetch_proveedor-externo_pe_singles.sh`, `ensure_proveedor-externo_pe_json.sh`) |

### Modelo de datos (resumen)

Entidades principales: `users`, `categories`, `games`, `products`, `product_images`, `tags`, `product_tags`, `inventory_movements`, `orders`, `order_items`, `carts`, `cart_items`, `events`, `banners`, `promotions`, `contact_messages`.

Roles: `ADMIN`, `CLIENTE`. Autenticación: **JWT** (Bearer).

### Cómo ejecutar

**1. PostgreSQL**  
Opción A — **Docker** (sin instalar Postgres en el host):

```bash
cp .env.example .env   # opcional
docker compose up -d
# Postgres en localhost:5433 (usuario/contraseña: dondesalem / dondesalem_dev).
# API: cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local
# Web: cd frontend && cp .env.local.example .env.local  # configurar Google + AUTH_SECRET
```

Login con Google: mismo OAuth Client ID en `GOOGLE_CLIENT_IDS` (backend) y `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (frontend); redirect en Google Cloud: `http://localhost:3000/api/auth/callback/google`.

Opción B — Postgres local: crea una base (por ejemplo `dondesalem`) y usuario con permisos.

**2. Backend**

```bash
cd backend
export DATABASE_URL=jdbc:postgresql://localhost:5432/dondesalem
export DATABASE_USER=tu_usuario
export DATABASE_PASSWORD=tu_password
export JWT_SECRET="cambia-esto-por-un-secreto-largo-en-produccion"
./mvnw spring-boot:run
```

API: `http://localhost:8080` · Swagger UI: `http://localhost:8080/swagger-ui.html`

**3. Frontend**

```bash
cd frontend
cp .env.local.example .env.local
# Ajusta NEXT_PUBLIC_API_URL si el API no está en localhost:8080
npm install
npm run dev
```

Web: `http://localhost:3000`

### CI y despliegue económico

- **GitHub Actions** (`.github/workflows/ci.yml`): compila API y frontend en cada push.
- Guía **bajo costo** (VPS): [docs/DESPLIEGUE_BAJO_COSTO.md](docs/DESPLIEGUE_BAJO_COSTO.md).
- **Checklist producción**: [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md).
- **Operación** (SMTP, backups, primer admin en `prod`, pasarelas): [docs/PRODUCCION_OPERACION.md](docs/PRODUCCION_OPERACION.md).
- **Pasarela demo** (Mercado Pago simulado, variables y endpoints): [docs/PASARELA_PAGO_DEMO.md](docs/PASARELA_PAGO_DEMO.md).
- Ejemplos de variables: `backend/.env.example`, `frontend/.env.local.example`.
- **Docker** (opcional): `backend/Dockerfile`, `frontend/Dockerfile` (Next `standalone`).

### Perfil de producción (API)

Con **`SPRING_PROFILES_ACTIVE=prod`**:

- Swagger / OpenAPI **desactivados**; respuestas de error **sin** mensajes detallados al cliente.
- **No** se ejecuta el seed de datos (`DataSeedConfig`). El primer administrador se define manualmente: ver [docs/PRODUCCION_OPERACION.md](docs/PRODUCCION_OPERACION.md).

### Desarrollo local: credenciales demo, seed y JSON Proveedor externo / Proveedor externo

Resumen en **[docs/DESARROLLO.md](docs/DESARROLLO.md)** (usuarios de prueba, perfil `prod` sin seed, rutas de JSON y scripts de regeneración/import).

Scripts útiles:

- Proveedor externo singles (JSON seed):  
  `python3 scripts/fetch_proveedor-externo_pe_singles.py`  
  (o variantes para otros listados, por ejemplo PB, con `--listing-url` y `-o`).
- Proveedor externo MyL (import/upsert por API admin):  
  `./scripts/fetch_proveedor-externo_myl_products.sh`

La **carga base** (productos demo + singles desde JSON) corre **solo** cuando la base está **vacía** en el primer arranque; después el catálogo es manual o por import admin. **No** uses credenciales demo en internet abierta.

### Frontend (`frontend/`)

- Next.js 15 (App Router), TypeScript, Tailwind CSS.
- Variables: copia `frontend/.env.local.example` a `frontend/.env.local`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` (URL pública del sitio; robots/sitemap).
- Scripts: `npm install`, `npm run dev`, `npm run build`.

### Promociones en checkout

Las promociones activas (admin → Promociones) se aplican **al confirmar el pedido**: descuentos por producto y promos “globales” sin producto asociado. El pedido guarda `discount_total` y precios de línea efectivos.

### Páginas legales (plantilla)

Rutas públicas: `/legal/terminos`, `/legal/privacidad`, `/legal/devoluciones`. El cliente debe revisar el texto con asesoría legal. Enlaces en el pie de página.

### Próximos pasos de negocio (opcionales)

Pasarela de pago real, wishlist, informes avanzados en admin — ver roadmap en [docs/PRODUCCION_OPERACION.md](docs/PRODUCCION_OPERACION.md).
