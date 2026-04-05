# Pasarela de pago — flujo demo (Mercado Pago simulado)

Este proyecto incluye un **flujo de prueba** que imita la redirección a una pasarela (estilo Mercado Pago) **sin** llamar a la API real de Mercado Pago ni cobrar. Sirve para desarrollo, demos y como base antes de integrar Webpay, Mercado Pago, Flow, etc.

## Qué hace el demo

1. En el checkout, el usuario elige **Mercado Pago (demo)**.
2. El backend crea el pedido en estado **PENDIENTE**, guarda un `paymentSessionToken` y devuelve **`paymentRedirectUrl`**: URL absoluta al front, por ejemplo  
   `https://tudominio.cl/checkout/pago-simulado?orderNumber=ORD-...&token=...`
3. El front redirige el navegador a esa URL.
4. En `/checkout/pago-simulado`, el usuario confirma con un botón; el front llama a **`POST /api/orders/payment/demo/confirm`** con JWT.
5. El backend valida pedido, usuario y token, pasa el pedido a **PAGADO** y limpia el token de sesión.

## Variables de entorno (backend)

| Variable | Uso |
|----------|-----|
| `PUBLIC_FRONTEND_URL` | Base URL del sitio Next.js (sin barra final). El API arma el enlace de redirección. En **producción** debe coincidir con la URL pública del front (misma que `NEXT_PUBLIC_SITE_URL`). |
| `ADMIN_BOOTSTRAP_TOKEN` | Opcional: primer admin vía `POST /api/auth/bootstrap-admin` — ver [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md). |

Si `PUBLIC_FRONTEND_URL` está vacío o mal configurado, el checkout puede completarse pero **no** habrá `paymentRedirectUrl` útil.

## Endpoints relevantes

| Método | Ruta | Auth |
|--------|------|------|
| `POST` | `/api/orders/checkout` | JWT — body con `paymentMethod: "MERCADOPAGO_CHECKOUT"` |
| `POST` | `/api/orders/payment/demo/confirm` | JWT — body JSON `{ "orderNumber", "sessionToken" }` (coincide con query de la URL) |
| `GET` | `/api/health/ready` | Público — comprueba conexión a la base |

## Hacia una integración real

- Credenciales del proveedor solo en el servidor (env / secret manager).
- Preferentemente **webhooks** firmados para marcar pagos; el redirect del navegador solo como UX.
- Idempotencia y reconciliación (el usuario puede cerrar la pestaña antes de volver).
- Sustituir o desactivar el demo en producción si no debe estar expuesto.

Más contexto operativo: [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md) (sección pasarelas).
