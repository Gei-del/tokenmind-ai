# 🚀 Guía de Despliegue — TokenMind AI

> GitHub + Vercel (Frontend) + Railway (Backend)  
> Tiempo estimado: 20–30 minutos

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Subir a GitHub](#2-subir-a-github)
3. [Configurar Auth0](#3-configurar-auth0)
4. [Desplegar Backend en Railway](#4-desplegar-backend-en-railway)
5. [Desplegar Frontend en Vercel](#5-desplegar-frontend-en-vercel)
6. [Conectar todo](#6-conectar-todo)
7. [CI/CD automático](#7-cicd-automático)
8. [Verificar el despliegue](#8-verificar-el-despliegue)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Requisitos previos

- [ ] Node.js 18+ instalado
- [ ] Git instalado y configurado
- [ ] Cuenta en [GitHub](https://github.com)
- [ ] Cuenta en [Auth0](https://auth0.com) (gratis)
- [ ] Cuenta en [Vercel](https://vercel.com) (gratis)
- [ ] Cuenta en [Railway](https://railway.app) (gratis con $5 crédito)

---

## 2. Subir a GitHub

### 2.1 Crear el repositorio en GitHub

1. Ir a [github.com/new](https://github.com/new)
2. Nombre: `tokenmind-ai`
3. Visibilidad: **Public** (requerido para hackathon)
4. **No** inicializar con README (ya tienes uno)
5. Click en **Create repository**

### 2.2 Inicializar Git y hacer push

```bash
# Desde la raíz del proyecto tokenmind-ai/
cd tokenmind-ai

# Inicializar repositorio
git init
git branch -M main

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "feat: initial TokenMind AI — Auth0 Token Vault hackathon project

- Multi-agent orchestration (EmailAgent + CalendarAgent)
- Auth0 OAuth 2.0 with JWT RS256 validation
- BFF pattern with HttpOnly cookie token storage
- Least privilege per agent (scoped access tokens)
- Token Vault integration architecture"

# Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/tokenmind-ai.git

# Subir
git push -u origin main
```

### 2.3 Verificar en GitHub

Abre `https://github.com/TU_USUARIO/tokenmind-ai` y confirma que todos los archivos están visibles.

---

## 3. Configurar Auth0

### 3.1 Crear la aplicación Auth0

1. Ir a [manage.auth0.com](https://manage.auth0.com)
2. **Applications → Create Application**
   - Name: `TokenMind AI`
   - Type: **Regular Web Application**
   - Click **Create**

3. En la pestaña **Settings** de la app, anotar:
   - `Domain` → tu `AUTH0_DOMAIN`
   - `Client ID` → tu `AUTH0_CLIENT_ID`
   - `Client Secret` → tu `AUTH0_CLIENT_SECRET`

4. En **Allowed Callback URLs** agregar:
   ```
   http://localhost:3000/api/auth/callback,
   https://tokenmind-ai.vercel.app/api/auth/callback
   ```

5. En **Allowed Logout URLs** agregar:
   ```
   http://localhost:3000,
   https://tokenmind-ai.vercel.app
   ```

6. En **Allowed Web Origins** agregar:
   ```
   http://localhost:3000,
   https://tokenmind-ai.vercel.app
   ```

7. Click **Save Changes**

### 3.2 Crear la API en Auth0

1. **Applications → APIs → Create API**
   - Name: `TokenMind API`
   - Identifier: `https://tokenmind-api`  ← Este es tu `AUTH0_AUDIENCE`
   - Algorithm: **RS256**
   - Click **Create**

2. En la pestaña **Permissions** de la API, agregar:

   | Permission | Description |
   |---|---|
   | `read:email` | Lee correos del usuario |
   | `read:calendar` | Lee calendario del usuario |

3. Volver a la app Auth0 → pestaña **APIs** → activar `TokenMind API` y habilitar ambos scopes

### 3.3 Generar AUTH0_SECRET

```bash
# En tu terminal, ejecuta:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copia el output → es tu AUTH0_SECRET
```

---

## 4. Desplegar Backend en Railway

### 4.1 Crear proyecto en Railway

1. Ir a [railway.app](https://railway.app) → **New Project**
2. Seleccionar **Deploy from GitHub repo**
3. Conectar tu cuenta GitHub y seleccionar `tokenmind-ai`
4. Railway detectará la carpeta — seleccionar **backend** como root

### 4.2 Configurar variables de entorno en Railway

En el panel del servicio → **Variables**, agregar:

```
AUTH0_DOMAIN        = tu-tenant.auth0.com
AUTH0_AUDIENCE      = https://tokenmind-api
FRONTEND_URL        = https://tokenmind-ai.vercel.app
NODE_ENV            = production
PORT                = 4000
```

### 4.3 Configurar el build command

En Railway → **Settings**:
- **Root Directory**: `backend`
- **Start Command**: `node server.js`
- **Build Command**: `npm install`

### 4.4 Obtener la URL del backend

Una vez desplegado, Railway asigna una URL tipo:
```
https://tokenmind-ai-backend.railway.app
```
Anótala — la necesitarás para el frontend.

---

## 5. Desplegar Frontend en Vercel

### Opción A — Desde el dashboard de Vercel (recomendado)

1. Ir a [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → seleccionar `tokenmind-ai`
3. En **Configure Project**:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: `frontend` ← ¡Importante!
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Expandir **Environment Variables** y agregar **todas** las siguientes:

```
AUTH0_SECRET          = <output del comando de la sección 3.3>
AUTH0_BASE_URL        = https://tokenmind-ai.vercel.app
AUTH0_ISSUER_BASE_URL = https://tu-tenant.auth0.com
AUTH0_CLIENT_ID       = <tu client id de Auth0>
AUTH0_CLIENT_SECRET   = <tu client secret de Auth0>
AUTH0_AUDIENCE        = https://tokenmind-api
BACKEND_URL           = https://tokenmind-ai-backend.railway.app
NEXT_PUBLIC_AUTH0_DOMAIN = tu-tenant.auth0.com
```

5. Click **Deploy**

⏱️ El build tarda ~2 minutos.

### Opción B — Desde CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la carpeta frontend/
cd frontend
vercel

# Seguir el asistente:
# → Set up and deploy? Y
# → Which scope? (tu cuenta)
# → Link to existing project? N
# → Project name: tokenmind-ai
# → Directory: ./  (ya estás en frontend/)
# → Override settings? N

# Agregar variables de entorno
vercel env add AUTH0_SECRET production
vercel env add AUTH0_BASE_URL production
vercel env add AUTH0_ISSUER_BASE_URL production
vercel env add AUTH0_CLIENT_ID production
vercel env add AUTH0_CLIENT_SECRET production
vercel env add AUTH0_AUDIENCE production
vercel env add BACKEND_URL production
vercel env add NEXT_PUBLIC_AUTH0_DOMAIN production

# Re-desplegar con las variables
vercel --prod
```

---

## 6. Conectar todo

### 6.1 Actualizar FRONTEND_URL en Railway

Una vez que Vercel te da la URL final (ej: `https://tokenmind-ai.vercel.app`):

1. Railway → tu servicio → **Variables**
2. Actualizar `FRONTEND_URL` con la URL real de Vercel
3. Railway re-despliega automáticamente

### 6.2 Actualizar Auth0 con URLs reales

En Auth0 → tu App → Settings, verificar que las URLs de producción estén en:
- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins

### 6.3 Verificar la conexión

```bash
# Health check del backend
curl https://tokenmind-ai-backend.railway.app/health

# Respuesta esperada:
# {"status":"ok","service":"TokenMind AI Backend","timestamp":"..."}
```

---

## 7. CI/CD Automático

### 7.1 Secrets en GitHub

Para que el workflow de deploy automático funcione, agrega estos secrets en:
`GitHub → Settings → Secrets and variables → Actions`

| Secret | Cómo obtenerlo |
|--------|---------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | `vercel env ls` o en `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `vercel env ls` o en `.vercel/project.json` |

```bash
# Para obtener IDs de Vercel después del primer deploy:
cd frontend
cat .vercel/project.json
# {"orgId":"team_xxx","projectId":"prj_xxx"}
```

### 7.2 Flujo automático resultante

```
Push a main
    ↓
GitHub Actions: CI (lint + build + security audit)
    ↓ si pasa
GitHub Actions: Deploy a Vercel
    ↓
Vercel: live en producción
```

---

## 8. Verificar el despliegue

### Checklist final

```bash
# 1. Backend health
curl https://TU-BACKEND.railway.app/health

# 2. Frontend cargando
# Abrir: https://tokenmind-ai.vercel.app

# 3. Login con Auth0
# Click "Iniciar sesión" → debe redirigir a Auth0 Universal Login

# 4. Ejecutar agentes
# Escribir: "Revisa mis correos y agenda"
# → Deben aparecer resultados de EmailAgent + CalendarAgent

# 5. Verificar que JWT funciona
# En DevTools → Network → filtrar /api/agents/execute
# → debe tener status 200, no 401
```

---

## 9. Troubleshooting

### Error: `Missing required parameter: client_id`
→ Falta `AUTH0_CLIENT_ID` en las variables de entorno de Vercel. Verifica en Vercel → Settings → Environment Variables.

### Error: `invalid_client`
→ El `AUTH0_CLIENT_SECRET` es incorrecto. Cópialo directamente desde Auth0 sin espacios.

### Error: `Callback URL mismatch`
→ La URL de producción no está en Auth0 → Allowed Callback URLs. Agrega `https://tu-dominio.vercel.app/api/auth/callback`.

### Error `401 Unauthorized` en el backend
→ El `AUTH0_AUDIENCE` del backend no coincide con el de Auth0. Deben ser idénticos: `https://tokenmind-api`.

### Error: `CORS`
→ Actualiza `FRONTEND_URL` en Railway con la URL exacta de Vercel (con https y sin slash final).

### El build de Vercel falla
→ Verifica que el **Root Directory** en Vercel sea `frontend`, no la raíz del repo.


### Error: `NOT_FOUND` en Vercel
→ Vercel está desplegando la raíz del repo en lugar de `frontend`.

Checklist rápido:
1. En Vercel → Project Settings → **Root Directory** debe ser `frontend`.
2. Si ya existe el proyecto, haz **Redeploy** después de cambiar el Root Directory.
3. Este ajuste **no** se puede forzar desde código (`vercel.json` no define Root Directory del proyecto). Debes configurarlo en Vercel UI.

---

## URLs finales de referencia

| Servicio | URL |
|----------|-----|
| Frontend (Vercel) | `https://tokenmind-ai.vercel.app` |
| Backend (Railway) | `https://tokenmind-backend.railway.app` |
| Auth0 Dashboard | `https://manage.auth0.com` |
| GitHub Repo | `https://github.com/TU_USUARIO/tokenmind-ai` |
| CI/CD (Actions) | `https://github.com/TU_USUARIO/tokenmind-ai/actions` |

---

*TokenMind AI — Hackathon Auth0 2024*
