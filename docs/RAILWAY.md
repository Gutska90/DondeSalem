# Desplegar el API en Railway

Monorepo: **Root Directory** del servicio = `backend` (no la raíz del repo).

## Variables obligatorias

Copia **valores reales** de Supabase (Settings → Database). No uses textos de ejemplo como `HOST.pooler` ni `PROJECT_REF`.

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_USER=postgres.aoibeshwznsnaptkfbjh
DATABASE_PASSWORD=tu_password_real
JWT_SECRET=cadena_larga_minimo_32_caracteres
GOOGLE_CLIENT_IDS=tu_client_id.apps.googleusercontent.com
CORS_ORIGINS=https://tu-frontend.vercel.app
PUBLIC_FRONTEND_URL=https://tu-frontend.vercel.app
PASSWORD_LOGIN_ENABLED=false
```

**No configures** `PORT=8080`: Railway asigna `PORT` automáticamente.

Si `DATABASE_URL` contiene `HOST.pooler` o falta alguna variable, la app **no arranca** y el log muestra un mensaje `[DondeSalem prod] ...`.

### Contraseña con `$` o `#`

Usa el editor **normal** de variables (campo secreto). En Raw Editor, entre comillas: `DATABASE_PASSWORD="..."`.

### Si Flyway falla con el pooler

Prueba la URL **directa** (Supabase → Connection string → Direct):

```env
DATABASE_URL=jdbc:postgresql://db.aoibeshwznsnaptkfbjh.supabase.co:5432/postgres?sslmode=require
```

## Redeploy

**Deployments → Redeploy** después de cambiar variables.

## Comprobar

Log:

```txt
The following 1 profile is active: "prod"
```

```bash
curl https://TU-SERVICIO.up.railway.app/api/health
```

Respuesta: `{"status":"ok"}`.

## Dominio

**Settings → Networking → Generate Domain** → `NEXT_PUBLIC_API_URL` en Vercel.
