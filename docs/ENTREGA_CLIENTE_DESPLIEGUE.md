# Entrega al cliente: despliegue paso a paso

Este documento esta pensado para que el cliente pueda levantar el proyecto y ver lo mismo que en desarrollo, con backend + frontend + base de datos en produccion.

Configuracion objetivo de este proyecto:

- Sitio: `https://dondesalem.cl`
- API: `https://api.dondesalem.cl`

---

## 1) Resumen rapido de arquitectura

- Frontend: `Next.js` (carpeta `frontend/`)
- Backend: `Spring Boot` (carpeta `backend/`)
- Base de datos: `PostgreSQL`
- Dominio sugerido:
  - `https://dondesalem.cl` -> frontend
  - `https://api.dondesalem.cl` -> backend

---

## 2) Opcion recomendada: todo en un VPS

### 2.1 Requisitos del VPS

- Ubuntu 22.04+ (recomendado)
- 2 vCPU minimo, 4 GB RAM minimo
- 40+ GB disco
- Acceso SSH con usuario sudo
- Puertos abiertos: `22`, `80`, `443`

### 2.2 Instalar dependencias base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl unzip nginx certbot python3-certbot-nginx
```

Instalar Java 17 y Maven:

```bash
sudo apt install -y openjdk-17-jdk maven
java -version
mvn -version
```

Instalar Node 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Instalar PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2.3 Crear base de datos de produccion

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE DATABASE dondesalem;
CREATE USER dondesalem WITH ENCRYPTED PASSWORD 'cambiar_password_fuerte';
GRANT ALL PRIVILEGES ON DATABASE dondesalem TO dondesalem;
\q
```

### 2.4 Subir el codigo al VPS

```bash
cd /opt
sudo git clone <URL_DEL_REPO> dondesalem
sudo chown -R $USER:$USER /opt/dondesalem
cd /opt/dondesalem
```

---

## 3) Backend en produccion (Spring Boot)

### 3.1 Variables de entorno (obligatorias)

Crear archivo:

```bash
sudo nano /opt/dondesalem/backend/.env.prod
```

Contenido base:

```bash
SPRING_PROFILES_ACTIVE=prod
PORT=8080

DATABASE_URL=jdbc:postgresql://localhost:5432/dondesalem
DATABASE_USER=dondesalem
DATABASE_PASSWORD=cambiar_password_fuerte

JWT_SECRET=CAMBIAR_POR_UN_SECRETO_MUY_LARGO_MIN_32
JWT_EXPIRATION_MS=86400000

CORS_ORIGINS=https://dondesalem.cl
PUBLIC_FRONTEND_URL=https://dondesalem.cl

# Opcional (correo)
# MAIL_FROM=no-reply@dondesalem.cl
# SPRING_MAIL_HOST=smtp.tu-proveedor.cl
# SPRING_MAIL_PORT=587
# SPRING_MAIL_USERNAME=...
# SPRING_MAIL_PASSWORD=...
```

### 3.2 Build backend

```bash
cd /opt/dondesalem/backend
mvn -q -DskipTests package
```

### 3.3 Crear servicio systemd backend

```bash
sudo nano /etc/systemd/system/dondesalem-backend.service
```

Contenido:

```ini
[Unit]
Description=DondeSalem Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/dondesalem/backend
EnvironmentFile=/opt/dondesalem/backend/.env.prod
ExecStart=/usr/bin/java -jar /opt/dondesalem/backend/target/api-0.1.0-SNAPSHOT.jar
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dondesalem-backend
sudo systemctl start dondesalem-backend
sudo systemctl status dondesalem-backend
```

---

## 4) Frontend en produccion (Next.js)

### 4.1 Variables frontend

```bash
sudo nano /opt/dondesalem/frontend/.env.production
```

Contenido:

```bash
NEXT_PUBLIC_API_URL=https://api.dondesalem.cl
NEXT_PUBLIC_SITE_URL=https://dondesalem.cl
```

### 4.2 Build frontend

```bash
cd /opt/dondesalem/frontend
npm ci
npm run build
```

### 4.3 Servicio systemd frontend

```bash
sudo nano /etc/systemd/system/dondesalem-frontend.service
```

Contenido:

```ini
[Unit]
Description=DondeSalem Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/dondesalem/frontend
Environment=NODE_ENV=production
EnvironmentFile=/opt/dondesalem/frontend/.env.production
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dondesalem-frontend
sudo systemctl start dondesalem-frontend
sudo systemctl status dondesalem-frontend
```

---

## 5) Nginx + dominio + SSL

### 5.1 DNS

En el proveedor de dominio:

- `A` -> `dondesalem.cl` hacia IP del VPS
- `A` -> `api.dondesalem.cl` hacia la misma IP

### 5.2 Config Nginx

```bash
sudo nano /etc/nginx/sites-available/dondesalem.conf
```

Contenido:

```nginx
server {
    server_name dondesalem.cl www.dondesalem.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name api.dondesalem.cl;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/dondesalem.conf /etc/nginx/sites-enabled/dondesalem.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 5.3 Certificado SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d dondesalem.cl -d www.dondesalem.cl -d api.dondesalem.cl
```

---

## 6) Opcion mixta: hosting + VPS

Si el cliente quiere frontend en hosting/cPanel y backend en VPS:

- Backend: igual que seccion 3 (VPS)
- Frontend en hosting Node:
  - subir carpeta `frontend`
  - configurar variables:
    - `NEXT_PUBLIC_API_URL=https://api.dondesalem.cl`
    - `NEXT_PUBLIC_SITE_URL=https://dondesalem.cl`
  - ejecutar `npm ci && npm run build && npm run start`
- En backend, asegurar:
  - `CORS_ORIGINS=https://dondesalem.cl`
  - `PUBLIC_FRONTEND_URL=https://dondesalem.cl`

---

## 7) Verificacion final (checklist de aceptacion)

### Frontend

- [ ] `https://dondesalem.cl` carga home
- [ ] `/tienda` lista productos
- [ ] `/tienda/singles` muestra tabs PE/PB y filtros funcionando
- [ ] login cliente y admin operativos

### Backend

- [ ] `https://api.dondesalem.cl/api/health` responde `UP`
- [ ] login API funciona
- [ ] CRUD admin productos funciona
- [ ] filtros por `bloque` (PE/PB) responden correctamente

### Operacion

- [ ] reinicio servidor mantiene servicios arriba
- [ ] SSL activo en ambos dominios
- [ ] backup de base de datos programado

---

## 8) Comandos utiles de soporte

Logs backend:

```bash
sudo journalctl -u dondesalem-backend -f
```

Logs frontend:

```bash
sudo journalctl -u dondesalem-frontend -f
```

Reiniciar servicios:

```bash
sudo systemctl restart dondesalem-backend
sudo systemctl restart dondesalem-frontend
```

Estado de servicios:

```bash
sudo systemctl status dondesalem-backend
sudo systemctl status dondesalem-frontend
```

---

## 9) Recomendaciones para entrega al cliente

- Entregar este documento junto con:
  - acceso al repositorio
  - archivo de variables ejemplo (`.env`)
  - checklist de pruebas de negocio
- No entregar contraseñas por chat plano; usar gestor de secretos.
- Cambiar credenciales demo antes de exponer a internet.

---

## 10) Paquete final para el cliente (recomendado)

Entregar estos puntos en un solo correo/documento:

1. URL del repositorio y branch estable a desplegar.
2. Este archivo: `docs/ENTREGA_CLIENTE_DESPLIEGUE.md`.
3. Variables de entorno finales (sin secretos en texto plano; enviar por canal seguro).
4. Credenciales iniciales admin (forzar cambio en primer acceso).
5. Responsable tecnico de soporte y ventana de estabilizacion post go-live.
