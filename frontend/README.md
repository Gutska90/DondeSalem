# DondeSalem — Frontend (Next.js)

## Estructura de carpetas

```
frontend/
├── app/                    # App Router: rutas, layouts y páginas
│   ├── layout.tsx          # Layout raíz (fuentes, header, footer)
│   ├── page.tsx            # Homepage
│   ├── tienda/             # Catálogo
│   ├── producto/[slug]/    # Ficha de producto
│   ├── carrito/            # Carrito
│   ├── checkout/
│   ├── auth/
│   ├── cuenta/
│   ├── eventos/
│   ├── preventas/
│   ├── ofertas/
│   ├── contacto/
│   └── admin/
├── components/
│   ├── layout/             # Cabecera, pie, menú móvil
│   ├── home/               # Bloques solo de la homepage
│   ├── product/            # Tarjetas y acciones de producto
│   └── ui/                 # Primitivos reutilizables (Container, títulos de sección)
├── lib/                    # Cliente API, tipos, auth context, utilidades
└── public/                 # Assets estáticos
```

## Desarrollo

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Cuentas de prueba (API en desarrollo)

Requiere backend arrancado y base con datos sembrados (ver `backend/README.md` — sección *Datos iniciales*):

- **Administrador:** `admin@dondesalem.local` / `Admin123!` → acceso a `/admin` (productos, stock, pedidos, etc.).
- **Cliente:** `cliente@dondesalem.local` / `Cliente123!` → tienda, carrito, `/cuenta` sin panel admin.
