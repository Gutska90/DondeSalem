# DondeSalem - Guia de publicacion para cliente (version ejecutiva)

Este documento esta pensado para compartir con un cliente no tecnico.
Explica, de forma simple, como publicar el sitio para que se vea igual a la version actual.

## 1. Objetivo

Publicar:

- Sitio web: `https://dondesalem.cl`
- API (motor del sistema): `https://api.dondesalem.cl`

Con esto, el cliente podra usar:

- Tienda publica
- Buscador y filtros
- Singles PE/PB
- Panel administrador
- Gestion de productos, stock, pedidos y contenido

---

## 2. Que necesita el cliente

1. Un VPS activo (servidor cloud con Linux).
2. Dominio configurado (`dondesalem.cl` y `api.dondesalem.cl`).
3. Acceso SSH al VPS.
4. Acceso al repositorio del proyecto.

---

## 3. Resultado esperado (check simple)

Al terminar, debe cumplirse:

- `https://dondesalem.cl` abre correctamente.
- `https://api.dondesalem.cl/api/health` responde activo.
- Se puede iniciar sesion como admin.
- El panel admin permite editar productos.
- En `/tienda/singles` funcionan tabs PE y PB.

---

## 4. Pasos resumidos de publicacion

### Paso A - Preparar servidor

Instalar en VPS:

- Java 17
- Node 20
- PostgreSQL
- Nginx
- SSL (Let's Encrypt)

### Paso B - Subir proyecto

- Clonar repositorio en `/opt/dondesalem`.
- Crear base de datos `dondesalem`.

### Paso C - Configurar backend (API)

Configurar variables principales:

- `DATABASE_URL`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGINS=https://dondesalem.cl`
- `PUBLIC_FRONTEND_URL=https://dondesalem.cl`

Levantar backend como servicio para que inicie automaticamente.

### Paso D - Configurar frontend (web)

Configurar:

- `NEXT_PUBLIC_API_URL=https://api.dondesalem.cl`
- `NEXT_PUBLIC_SITE_URL=https://dondesalem.cl`

Compilar y levantar frontend como servicio.

### Paso E - Conectar dominios y SSL

- `dondesalem.cl` -> frontend
- `api.dondesalem.cl` -> backend
- Activar certificado HTTPS en ambos

---

## 5. Operacion recomendada post-publicacion

- Programar backup diario de base de datos.
- Definir responsable tecnico de soporte.
- Aplicar ventana de estabilizacion (3-7 dias) tras salida en vivo.
- Cambiar credenciales iniciales de administracion.

---

## 6. Entregables sugeridos al cliente

Entregar en carpeta o correo:

1. Este documento (version ejecutiva).
2. Guia tecnica completa:
   - `docs/ENTREGA_CLIENTE_DESPLIEGUE.md`
3. Datos de acceso:
   - dominio
   - VPS
   - admin inicial
4. Checklist de validacion final firmado por ambas partes.

---

## 7. Mensaje sugerido para enviar al cliente

"Se realizo la preparacion de despliegue de DondeSalem. Adjuntamos una guia ejecutiva y una guia tecnica para publicacion en VPS. Al completar los pasos, su equipo podra ver el sistema igual a la version de desarrollo actual, incluyendo tienda, filtros, panel admin y gestion completa de catalogo."

