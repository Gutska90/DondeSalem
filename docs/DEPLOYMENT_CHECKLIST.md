# Checklist de despliegue a producción (DondeSalem)

Usar junto con [DESPLIEGUE_BAJO_COSTO.md](./DESPLIEGUE_BAJO_COSTO.md), [RAILWAY.md](./RAILWAY.md) y [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md). Desarrollo local (seed, JSON Proveedor externo): [DESARROLLO.md](./DESARROLLO.md).

## 1. Backend (API)

- [ ] **Perfil `prod`**: `SPRING_PROFILES_ACTIVE=prod` (o `--spring.profiles.active=prod`).
- [ ] **PostgreSQL**: base creada, usuario con permisos, migraciones Flyway aplicadas al arrancar.
- [ ] **Variables obligatorias**
  - `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`
  - `JWT_SECRET`: cadena larga y aleatoria (≥ 32 caracteres), **única por entorno**
  - `CORS_ORIGINS`: origen HTTPS del frontend, **sin** wildcard (`https://tudominio.cl`)
- [ ] **Opcionales**: `PORT`, `JWT_EXPIRATION_MS`, `MAIL_FROM`, `spring.mail.*` (correo), límites `RATE_LIMIT_*`.
- [ ] **Checkout demo / enlaces al front**: `PUBLIC_FRONTEND_URL` = URL pública del Next.js (misma idea que `NEXT_PUBLIC_SITE_URL`), para que `paymentRedirectUrl` del flujo Mercado Pago demo sea correcta.
- [ ] **Transferencia**: `TRANSFER_BANK_INSTRUCTIONS` (texto multilínea) — datos de cuenta visibles en checkout vía `GET /api/config/public` y en el correo de pedido si hay SMTP.
- [ ] **Primer admin (alternativa al SQL)**: `ADMIN_BOOTSTRAP_TOKEN` + `POST /api/auth/bootstrap-admin` — ver [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md); rotar o quitar el token después.
- [ ] **Swagger / OpenAPI**: con perfil `prod` quedan **desactivados** (no exponer documentación pública).
- [ ] **Seed de datos**: con perfil `prod` **no** se ejecuta `DataSeedConfig`. Ver primer usuario administrador en [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md).
- [ ] **HTTPS**: terminar TLS en reverse proxy (nginx, Caddy, balanceador) y hablar con el API por HTTP interno o HTTPS según arquitectura.

## 2. Frontend (Next.js)

- [ ] `NEXT_PUBLIC_API_URL`: URL **pública** del API (ej. `https://api.tudominio.cl` o mismo host bajo `/api` si aplica).
- [ ] `NEXT_PUBLIC_SITE_URL`: URL **pública** del sitio (ej. `https://tudominio.cl`) — usada en `robots.txt` y `sitemap.xml`.
- [ ] Build: `npm run build` (o imagen Docker con `--build-arg` para las variables `NEXT_PUBLIC_*`).
- [ ] Revisar textos legales en `/legal/*` y datos de contacto en el footer.

## 3. Seguridad y secretos

- [ ] No commitear `.env` reales; rotar credenciales de demo si alguna vez se usaron en un entorno público.
- [ ] Restringir acceso SSH al VPS y firewall (solo 80/443 públicos si aplica).

## 4. Operación

- [ ] Respaldo periódico de PostgreSQL: `scripts/backup-postgres.sh` + cron — ver [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md).
- [ ] Probar **una restauración** de backup en entorno de prueba.
- [ ] Monitor de disponibilidad (uptime) sobre `/` del front, `GET /api/health` y, si aplica, `GET /api/health/ready` del API (este último valida la base).

## 5. Imágenes Docker (opcional)

- `backend/Dockerfile`: build multi-stage Maven → JRE 17.
- `frontend/Dockerfile`: requiere `output: "standalone"` en `next.config.ts`.

Ejemplo build frontend con URLs de producción:

```bash
docker build -f frontend/Dockerfile frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.ejemplo.cl \
  --build-arg NEXT_PUBLIC_SITE_URL=https://ejemplo.cl \
  -t dondesalem-web
```
