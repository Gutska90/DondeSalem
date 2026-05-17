# Desplegar el API en Railway

Monorepo: **Root Directory** del servicio = `backend` (no la raíz del repo).

## Variables obligatorias

En el editor **normal** de variables (no Raw Editor), salvo que indiquemos lo contrario:

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://HOST.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_USER=postgres.PROJECT_REF
DATABASE_PASSWORD=tu_password
JWT_SECRET=cadena_larga_minimo_32_caracteres
GOOGLE_CLIENT_IDS=tu_client_id.apps.googleusercontent.com
CORS_ORIGINS=https://tu-frontend.vercel.app
PUBLIC_FRONTEND_URL=https://tu-frontend.vercel.app
PASSWORD_LOGIN_ENABLED=false
```

**No configures** `PORT=8080`: Railway asigna `PORT` automáticamente.

### Contraseña con `$` o `#`

En el editor normal de variables, pega el valor tal cual en el campo de contraseña.

En **Raw Editor**, usa comillas:

```env
DATABASE_PASSWORD="m$ejemplo#123"
```

Para producción, rota la contraseña en Supabase si se expuso y usa una sin caracteres especiales.

### Si Flyway falla con el pooler

Prueba la URL **directa** (Supabase → Database → Connection string → Direct):

```env
DATABASE_URL=jdbc:postgresql://db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

## Redeploy

**Deployments → Redeploy** después de cambiar variables.

## Comprobar

En el log debe aparecer:

```txt
The following 1 profile is active: "prod"
```

Si ves `localhost:5432`, las variables no están llegando al contenedor.

```bash
curl https://TU-SERVICIO.up.railway.app/api/health
```

Respuesta esperada: `{"status":"ok"}`.

## Dominio

**Settings → Networking → Generate Domain** → usar esa URL como `NEXT_PUBLIC_API_URL` en Vercel.
