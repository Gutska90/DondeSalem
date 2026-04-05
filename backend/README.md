# DondeSalem API (Spring Boot)

API REST para la tienda TCG / juegos de mesa: catálogo, carrito, pedidos, JWT, roles `ADMIN` y `CLIENTE`, Swagger UI.

## Requisitos

- **Java 17+**
- **Maven 3.9+**
- **PostgreSQL 14+** (base de datos creada, p. ej. `dondesalem`)

## Configuración

La aplicación lee por defecto `src/main/resources/application.yml`. Puedes sobreescribir con variables de entorno (recomendado en servidores):

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | JDBC, p. ej. `jdbc:postgresql://localhost:5432/dondesalem` |
| `DATABASE_USER` | Usuario PostgreSQL |
| `DATABASE_PASSWORD` | Contraseña |
| `JWT_SECRET` | Secreto **largo** (≥ 32 caracteres UTF-8) para firmar JWT |
| `JWT_EXPIRATION_MS` | Duración del token (por defecto 86400000 = 24h) |
| `PORT` | Puerto HTTP (por defecto 8080) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma (p. ej. `http://localhost:3000`) |

Ejemplo de archivo comentado: `src/main/resources/application-example.yml`.

## Cómo ejecutar

### Opción rápida (Docker + perfil `local`)

En la raíz del monorepo: `docker compose up -d` (PostgreSQL en **localhost:5433**). Luego en esta carpeta:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

El archivo `application-local.yml` apunta a ese puerto y define texto de ejemplo para **transferencia bancaria** (`app.transfer.bank-instructions`). Ajustá credenciales o el texto si tu contenedor usa otras variables.

### Opción manual

1. Crea la base en PostgreSQL:

   ```sql
   CREATE DATABASE dondesalem;
   ```

2. Exporta variables (o usa valores por defecto del `application.yml` solo en desarrollo):

   ```bash
   export DATABASE_URL=jdbc:postgresql://localhost:5432/dondesalem
   export DATABASE_USER=postgres
   export DATABASE_PASSWORD=tu_password
   export JWT_SECRET="tu-secreto-muy-largo-de-al-menos-32-caracteres"
   ```

3. Desde la carpeta `backend/`:

   ```bash
   mvn spring-boot:run
   ```

   O empaquetar y ejecutar:

   ```bash
   mvn -q -DskipTests package
   java -jar target/api-0.1.0-SNAPSHOT.jar
   ```

4. Comprueba salud y documentación:

   - Health: `GET http://localhost:8080/api/health`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - OpenAPI JSON: `http://localhost:8080/api-docs`

## Datos iniciales (desarrollo)

Con el perfil **`prod`**, el seed **no** se ejecuta (ni usuarios ni catálogo). Para el primer administrador en producción ver [../docs/PRODUCCION_OPERACION.md](../docs/PRODUCCION_OPERACION.md).

Sin perfil `prod` (desarrollo local típico), al arrancar la API:

1. **Usuarios de prueba** (se crean solo si no existe ya esa dirección de correo):
   | Rol | Email | Contraseña | Uso |
   |-----|--------|------------|-----|
   | `ADMIN` | `admin@dondesalem.local` | `Admin123!` | Panel admin: productos, stock, pedidos, CMS, etc. |
   | `CLIENTE` | `cliente@dondesalem.local` | `Cliente123!` | Tienda pública: carrito, checkout, cuenta, pedidos propios |

2. **Catálogo de ejemplo** (categorías, juegos, productos con stock, banner, evento, promoción): solo si **no hay productos** en la base (`products` vacío).

En el frontend (`http://localhost:3000`): entra en **Entrar** / `/auth/login` con una de las cuentas anteriores. Con admin verás enlace **Admin** al panel; con cliente, la tienda y **Cuenta** sin acceso al panel.

**No uses estas credenciales en producción.**

### Mitos y Leyendas (MYL) y categorías PE / PB

La migración `V5__myl_tcg_game_and_categories.sql` añade de forma idempotente:

- Juego TCG **Mitos y Leyendas** (`slug`: `mitos-y-leyendas`).
- Categoría raíz **Mitos y Leyendas** y subcategorías **PE** y **PB** (`myl-pe`, `myl-pb`) para clasificar productos MYL.

Para **añadir o quitar otros juegos TCG** en producción, usa el panel admin del frontend (**Juegos TCG**) o la API `/api/admin/games`.

## Endpoints principales (resumen)

| Área | Rutas |
|------|--------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Público | `GET /api/products`, `GET /api/categories`, `GET /api/games`, `GET /api/events`, … |
| Cliente (JWT) | `GET /api/me`, `PUT /api/me/password`, `GET/POST/PATCH/DELETE /api/cart`, `POST /api/orders/checkout`, `GET /api/orders/mine` |
| Contacto | `POST /api/contact` |
| Admin (JWT + rol ADMIN) | `GET/POST/PUT/DELETE /api/admin/products`, `/api/admin/games` (juegos TCG), `/api/admin/categories`, `/api/admin/events`, `/api/admin/orders`, … |

En **Swagger UI** (solo si está habilitado; desactivado con perfil `prod`), pulsa **Authorize**, introduce `Bearer <token>` tras hacer login.

## Arquitectura del código

- `controller` — REST, DTOs de entrada/salida  
- `service` — reglas de negocio y transacciones  
- `repository` — Spring Data JPA  
- `domain` — entidades  
- `dto` — records de request/response  
- `security` — JWT y filtro  
- `config` — Security, CORS, OpenAPI, datos de prueba  
