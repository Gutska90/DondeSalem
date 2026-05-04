# Desarrollo local — datos de prueba y singles Proveedor externo

Guía breve para quien trabaja en el monorepo: credenciales de demo, seed automático y archivo JSON de singles **Primera Era** (Proveedor externo).

## Perfiles Spring

| Perfil | Seed `DataSeedConfig` | Uso típico |
|--------|------------------------|------------|
| `local` / sin `prod` | Sí (usuarios demo; carga base de catálogo **solo** si la BD está vacía al primer arranque) | Desarrollo |
| `prod` | **No** | Producción — ver [PRODUCCION_OPERACION.md](./PRODUCCION_OPERACION.md) para el primer admin |

La web no depende del seed en tiempo de ejecución del navegador: el seed solo puebla la API al arrancar el backend (perfil no productivo).

## Usuarios de prueba (solo desarrollo)

Se crean **solo si no existe** ya un usuario con ese email.

| Rol | Email | Contraseña |
|-----|--------|------------|
| Admin | `admin@dondesalem.local` | `Admin123!` |
| Cliente | `cliente@dondesalem.local` | `Cliente123!` |

No uses estas credenciales en entornos expuestos a internet.

## Qué más hace el seed

1. **Usuarios** anteriores (si faltan) — en cada arranque se comprueba, no se duplican emails.
2. **Solo en el estreno (BD sin ningún producto):** se crea la **carga base** para que la tienda no arranque vacía:
   - categorías, juegos, **~6 productos** demo, banner, evento, promoción;
   - **import único** de singles desde `proveedor-externo-pe-singles.json` (slugs `myl-pe-…` que no existan).
3. **Después del primer llenado:** el catálogo nuevo es **manual** (panel admin) o mediante **import explícito** (`POST` de seed). El arranque **no** vuelve a importar miles de singles solo por existir el JSON.

Si borrás todos los productos y reiniciás, el seed volverá a considerar la BD “vacía” y repetirá la carga base (útil en entornos de prueba; en producción evitá dejar la tabla a cero salvo que sea intencional).

Import manual por API (admin, JWT):

- `POST /api/admin/seed/proveedor-externo-pe-singles` — inserta slugs nuevos desde el JSON.
- `POST /api/admin/seed/proveedor-externo-pe-singles/sync` — **actualiza precio e imagen** de productos ya existentes con slug `myl-pe-*`, según el JSON en el classpath. No crea filas nuevas. El **stock** no viene del listado Proveedor externo en el scrape: se gestiona en el panel (o futura integración).

Sincronización **programada** (opcional): en `application.yml` / variables:

- `app.proveedor-externo.sync.enabled=true` — activa un job (`@Scheduled`) con cron por defecto `0 0 4 * * *` (04:00 UTC diario; ajustar según zona).
- `app.proveedor-externo.sync.cron=...` — expresión cron alternativa.

Flujo recomendado para datos al día: ejecutar `./scripts/fetch_proveedor-externo_pe_singles.sh`, commitear el JSON actualizado, desplegar, y usar **sync** en servidor o confiar en el cron si el JAR incluye el JSON nuevo.

Tras cada sync, el log **WARN** indica cuántos singles `myl-pe-*` tienen **stock 0** (revisión en admin / panel **Bajo stock** con umbral).

## Archivo JSON Proveedor externo (singles Primera Era)

**Ruta en el repositorio (donde guardar / versionar el scrape):**

```text
backend/src/main/resources/seed/proveedor-externo-pe-singles.json
```

Ruta absoluta típica si el repo está en la raíz del proyecto:

```text
<raíz-del-repo>/backend/src/main/resources/seed/proveedor-externo-pe-singles.json
```

- Formato: array JSON de objetos con `pathSlug`, `listingTitle`, `imageId`, `imageVersion`, `price`, `brandLine` (compatible con el import Java).
- Si el archivo **no existe**, el script de descarga puede **crear uno vacío** `[]` en esa ruta al ejecutarlo (ver `scripts/fetch_proveedor-externo_pe_singles.sh`). También podés crear solo el placeholder **sin** tocar un archivo ya existente:

```bash
chmod +x scripts/ensure_proveedor-externo_pe_json.sh   # una vez
./scripts/ensure_proveedor-externo_pe_json.sh
```
- Si el archivo es `[]`, el import no inserta singles; la aplicación sigue funcionando con el resto del catálogo.

### Regenerar el JSON desde la tienda Proveedor externo

Desde la raíz del monorepo:

```bash
./scripts/fetch_proveedor-externo_pe_singles.sh
```

Por defecto descarga páginas **1–90** y sobrescribe el archivo en la ruta anterior. Opciones: `--from`, `--to`, `-o /otra/ruta.json`, `--stop-on-empty`.

Si el archivo **no existe**, el script **crea primero** un `[]` vacío en esa ruta y luego descarga (así siempre hay un destino válido). Para crear solo el placeholder sin scrape:

```bash
mkdir -p backend/src/main/resources/seed
printf '%s\n' '[]' > backend/src/main/resources/seed/proveedor-externo-pe-singles.json
```

## PostgreSQL local (Docker)

`docker compose up -d` en la raíz: Postgres suele quedar en **localhost:5433** (usuario/contraseña en `docker-compose.yml`). El perfil `local` del backend usa `application-local.yml` alineado a ese puerto.
