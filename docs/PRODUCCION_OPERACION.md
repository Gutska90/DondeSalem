# Producción: operación, correo, backups y primer admin

## Primer usuario administrador (sin seed en `prod`)

El registro público (`POST /api/auth/register`) crea usuarios con rol **CLIENTE**. Con perfil **`prod`**, el seed automático **no** corre, así que hay que definir el primer **ADMIN** manualmente.

**Opción A — SQL directo (PostgreSQL)**  
Generá un hash **BCrypt** para la contraseña elegida (mismo algoritmo que Spring: BCrypt). Podés usar una herramienta confiable o un snippet local con `BCryptPasswordEncoder`. Luego:

```sql
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
VALUES (
  'admin@tudominio.cl',
  '$2a$10$...TU_HASH_BCRYPT...',
  'Admin',
  'Tienda',
  NULL,
  'ADMIN',
  NOW(),
  NOW()
);
```

Iniciá sesión en el panel y **cambiá la contraseña** de inmediato.

**Opción B — Bootstrap por API (recomendado si podés aislar red)**  
Definí en el entorno `ADMIN_BOOTSTRAP_TOKEN` con un secreto largo y aleatorio. Llamá **una sola vez** desde una red de confianza:

`POST /api/auth/bootstrap-admin` con JSON: `email`, `password`, `firstName`, `lastName`, `bootstrapToken` (mismo valor que `ADMIN_BOOTSTRAP_TOKEN`).

El endpoint queda **deshabilitado** si no configurás el token (respuesta indicando que no está disponible). **Quitá o rotá** el token después de crear el admin.

**Opción C — Entorno privado temporal**  
Levantar el API **una sola vez** con perfil distinto de `prod` contra una BD de staging, dejar que el seed cree cuentas de demo, copiar solo lo necesario o migrar datos; **no** recomendado para producción pública sin aislar red.

## Correo SMTP (pedidos y notificaciones)

Si configurás `spring.mail.host`, usuario, contraseña y `app.mail.from`, el servicio puede enviar correos al confirmar pedidos (depende de `OrderNotificationService`). Si no hay SMTP, los pedidos quedan registrados y **solo en log**.

Ejemplo de variables (adaptar al proveedor):

```yaml
spring.mail.host: smtp.tudominio.cl
spring.mail.port: 587
spring.mail.username: ...
spring.mail.password: ...
spring.mail.properties.mail.smtp.auth: true
spring.mail.properties.mail.smtp.starttls.enable: true
```

`MAIL_FROM` / `app.mail.from` debe ser un remitente permitido por el servidor SMTP.

## Backups

Script: `scripts/backup-postgres.sh`.  
Programar con **cron** en el servidor (ej. diario) y subir copias a almacenamiento externo (S3, otro VPS, nube).  
**Probar** restaurar un `.sql.gz` en un entorno de prueba al menos una vez.

## Observabilidad mínima

- **Salud**: `GET /api/health` (API), `GET /api/health/ready` (API + base de datos), página principal (front).
- **Uptime**: servicio externo gratuito (UptimeRobot, etc.) con alerta por correo.
- **Logs**: rotación en disco (`logrotate`) o agente del proveedor; revisar espacio en disco.

## Pasarelas de pago (roadmap)

Hoy el checkout contempla transferencia, efectivo y un **demo visual** tipo Mercado Pago (`MERCADOPAGO_CHECKOUT`) descrito en [PASARELA_PAGO_DEMO.md](./PASARELA_PAGO_DEMO.md). También existe `WEB_PAY_MOCK` en el modelo como referencia técnica.

Una integración real (Webpay, Mercado Pago, Flow, etc.) implica:

- Contrato con el proveedor y credenciales en entorno seguro.
- Flujo redirect o API + **webhooks** firmados.
- Actualización de estados de pedido y pruebas en sandbox.

Documentar la decisión con el cliente antes de implementar.
