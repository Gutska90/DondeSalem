# Despliegue económico (DondeSalem)

Objetivo: **mínimo costo fijo** para el comercio — sin depender de SaaS caros si no hace falta.

**Antes de producción:** revisá [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) y [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md) (perfil `prod`, variables, primer admin, backups, correo).

## Principios

1. **Un solo VPS pequeño** (o incluso el PC de la tienda con túnel en desarrollo) puede alojar API + PostgreSQL + frontend estático o Node.
2. **PostgreSQL** en el mismo servidor o en Docker (`docker compose` en la raíz del repo).
3. **Imágenes de productos**: URLs externas (gratis) o almacenamiento del proveedor de dominio; evitar CDNs de pago al inicio.
4. **Correo**: el SMTP del propio dominio (casi siempre incluido en el hosting) o capa gratuita de un proveedor transaccional. El backend hoy **solo registra pedidos en log**; no hay cobro por envíos de mail hasta que configures SMTP.
5. **Promociones**: se calculan **en el servidor** sobre la base de datos — sin fees por transacción.

## Variables típicas (API)

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | JDBC PostgreSQL |
| `DATABASE_USER` / `DATABASE_PASSWORD` | Credenciales |
| `JWT_SECRET` | ≥ 32 caracteres en producción |
| `CORS_ORIGINS` | Origen del front (ej. `https://tudominio.cl`) |
| `PORT` | Puerto HTTP (ej. 8080 detrás de nginx) |

## Frontend

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_API_URL` | URL pública del API |

Build estático o `next start` detrás de nginx; en el VPS más barato suele bastar **un reverse proxy** (Caddy o nginx) con HTTPS (Let’s Encrypt gratuito).

## CI

GitHub Actions (plan gratuito para repos públicos) ejecuta tests y build en cada push — evita regresiones sin servicios de pago extra.
