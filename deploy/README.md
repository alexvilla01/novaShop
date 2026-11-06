# Producción — novaShop

Pipeline de deploy a un VPS con Docker Compose: **Postgres + backend (Spring Boot) + Caddy (frontend estático + proxy `/api` + HTTPS automático)**.

## 1. Provisión del VPS (Ubuntu 22+)

```bash
ssh root@TU_VPS
# instalar docker compose plugin
curl -fsSL https://get.docker.com | sh

# crear usuario de deploy (opcional pero recomendado)
adduser deploy && usermod -aG docker deploy
mkdir -p /opt/novashop && chown deploy:deploy /opt/novashop
```

## 2. Clonar el repo y preparar `.env`

```bash
# con GitHub (agrega la llave pública del VPS a los deploy keys del repo)
su - deploy
git clone git@github.com:alexvilla01/novaShop.git /opt/novashop
cd /opt/novashop/deploy
cp .env.example .env
nano .env   # rellena DOMAIN, POSTGRES_PASSWORD, NS_ADMIN_PASSWORD_HASH, NS_ADMIN_SECRET, NS_WA_PHONE
```

Generadores:

```bash
openssl rand -base64 24      # POSTGRES_PASSWORD
openssl rand -hex 32         # NS_ADMIN_SECRET
# hash bcrypt de la contraseña admin (elige una):
python3 -c 'import bcrypt;print(bcrypt.hashpw("TU_PASSWORD".encode(),bcrypt.gensalt()).decode())'
# o: node -e "require('bcryptjs').hash('TU_PASSWORD',10).then(console.log)"
```

## 3. DNS

Apunta un record `A` del dominio (ej. `store.novashop.mx`) a la IP del VPS. Caddy emite y renueva el certificado automáticamente al arrancar con esa `DOMAIN`.

## 4. Primer arranque

```bash
cd /opt/novashop
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
curl http://localhost/api/health   # {"status":"UP"}
```

- Sitemap/robots (`frontend/public/sitemap.xml`) usan placeholder `https://store.novashop.mx` — actualízales al dominio real y re-deploya.

## 5. CI/CD (cada push a `main`)

`.github/workflows/deploy.yml` entra por SSH al VPS (secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `PROJECT_DIR`) y hace:

```
git fetch origin main && git reset --hard origin/main
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build backend web
```

El `.env` vive SOLO en el VPS (nunca en el repo). Para añadir los secrets:

```bash
gh secret set SSH_HOST ...; gh secret set SSH_USER ...; gh secret set SSH_KEY < llave.pem; gh secret set PROJECT_DIR -b "/opt/novashop"
```

## 6. Nombre de cuenta /船只 admin

- Panel: `https://TU_DOMINIO/admin/login` con `NS_ADMIN_USER` + contraseña cuyo hash es `NS_ADMIN_PASSWORD_HASH`.
- Para cambiarla: genera un hash nuevo, edita `NS_ADMIN_PASSWORD_HASH` en `deploy/.env` y `docker compose ... up -d backend` (recrea con nueva env).

## Rollback

```bash
cd /opt/novashop && git log --oneline -5     # elegir commit bueno
git reset --hard <commit>   && docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build backend web
```
