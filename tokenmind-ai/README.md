# 🧠 TokenMind AI

> **Agentes de IA seguros con Auth0 Token Vault — Hackathon Auth0 2024**

[![Auth0](https://img.shields.io/badge/Auth0-Token%20Vault-orange?logo=auth0)](https://auth0.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![OAuth 2.0](https://img.shields.io/badge/OAuth-2.0-blue)](https://oauth.net/2/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🎯 El Problema

Los agentes de IA necesitan acceder a servicios externos en nombre del usuario (correo, calendario, archivos) para ser verdaderamente útiles. Sin embargo, el manejo inseguro de tokens presenta riesgos críticos:

- 🔴 **Tokens expuestos en el frontend** → robo de identidad
- 🔴 **Credenciales hardcodeadas** → vulnerabilidades en el código
- 🔴 **Sin control de permisos** → agentes con acceso excesivo
- 🔴 **Sin auditoría** → imposible rastrear qué agente hizo qué

**¿Cómo damos a los agentes de IA acceso a servicios externos de forma segura?**

---

## 💡 La Solución: TokenMind AI

TokenMind AI es una plataforma de agentes de IA que utiliza **Auth0 Token Vault** para manejar credenciales de terceros de forma segura. Los agentes actúan en nombre del usuario sin que las credenciales pasen por el frontend o el código de los agentes.

### ✅ Principios de seguridad implementados:

| Principio | Implementación |
|-----------|---------------|
| **Mínimo privilegio** | Cada agente solo recibe el scope que necesita |
| **Zero Trust** | Cada request valida el JWT completo |
| **Secrets nunca en frontend** | client_secret solo en variables de servidor |
| **Token Vault** | Credenciales de Gmail/Calendar en Auth0 (no en DB propia) |
| **BFF Pattern** | Frontend llama proxy Next.js, nunca al backend directamente |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO (Browser)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FRONTEND (Next.js)                           │   │
│  │                                                           │   │
│  │  ① Login Button ──────────────→ Auth0 Universal Login    │   │
│  │  ② Token en cookie HttpOnly ←── Auth0 (post-login)       │   │
│  │  ③ Input del usuario                                      │   │
│  │  ④ POST /api/agents/execute (proxy interno)               │   │
│  │       ↓ Recupera access_token de la sesión               │   │
│  │       ↓ Adjunta Bearer token                             │   │
│  │       ↓                                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS + JWT
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
│                                                                  │
│  ⑤ Valida JWT con JWKS de Auth0 (clave pública)                 │
│  ⑥ Verifica scopes del token                                    │
│  ⑦ Llama al Orchestrator                                        │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ORCHESTRATOR                           │   │
│  │  - Analiza intent del input                               │   │
│  │  - Verifica scopes disponibles                            │   │
│  │  - Ejecuta agentes en paralelo                            │   │
│  │  - Consolida resultados                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                    ↓                                   │
│  ┌──────────────┐   ┌──────────────────┐                        │
│  │  EmailAgent  │   │  CalendarAgent   │                        │
│  │ read:email   │   │ read:calendar    │                        │
│  └──────┬───────┘   └────────┬─────────┘                        │
│         │                    │                                   │
└─────────┼────────────────────┼─────────────────────────────────┘
          │                    │  (Token Vault en producción)
          ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│              AUTH0 TOKEN VAULT                                   │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  Gmail Token     │    │  Google Calendar Token           │   │
│  │  (cifrado)       │    │  (cifrado)                       │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
│                                                                  │
│  → Los tokens de servicios externos viven aquí, seguros         │
│  → Los agentes los recuperan en el momento de ejecutar          │
│  → El usuario los autorizó durante el login (consent screen)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad OAuth 2.0

```
Usuario          Frontend         Auth0           Backend         Servicio Externo
   │                │               │                │                  │
   │──── Click ────→│               │                │                  │
   │    "Login"     │               │                │                  │
   │                │──── Redirect ─→│               │                  │
   │                │   /authorize  │                │                  │
   │                │               │                │                  │
   │←─────────── Universal Login ──│                │                  │
   │           (Auth0 UI)           │                │                  │
   │─── Credenciales ──────────────→│               │                  │
   │                │               │                │                  │
   │                │←── Auth Code ─│               │                  │
   │                │               │                │                  │
   │                │── Code ───────→│               │                  │
   │                │ + Secret       │                │                  │
   │                │               │                │                  │
   │                │←── access_token (JWT) ─────────│                  │
   │                │    + id_token  │                │                  │
   │                │    (HttpOnly Cookie)            │                  │
   │                │               │                │                  │
   │── Input ──────→│               │                │                  │
   │  "revisa mis   │               │                │                  │
   │   correos"     │               │                │                  │
   │                │──── POST ─────────────────────→│                  │
   │                │  + Bearer JWT │                │                  │
   │                │               │                │                  │
   │                │               │←── Validar JWT ─│                 │
   │                │               │  (JWKS pública) │                  │
   │                │               │─── ✅ Válido ──→│                  │
   │                │               │                │                  │
   │                │               │                │─── Token Vault ─→│
   │                │               │                │  (Gmail token)   │
   │                │               │                │←── Emails ───────│
   │                │               │                │                  │
   │←─────────────── Resultados ────────────────────│                  │
```

---

## 🚀 Tecnologías

### Backend
- **Node.js 18+** + **Express.js** — Servidor API REST
- **express-jwt** + **jwks-rsa** — Validación de JWT de Auth0
- **helmet** — Headers de seguridad HTTP
- **express-rate-limit** — Protección contra abuso
- **auth0** (Management SDK) — Integración con Auth0 API

### Frontend
- **Next.js 14** — Framework React con SSR
- **@auth0/nextjs-auth0** — SDK oficial de Auth0 para Next.js
- **Tailwind CSS** — Estilos utilitarios
- **BFF Pattern** — API proxy que protege tokens en el servidor

### Seguridad
- **OAuth 2.0** con Authorization Code Flow + PKCE
- **JWT RS256** — Tokens firmados con clave asimétrica
- **JWKS** — Validación de firma con clave pública
- **HttpOnly Cookies** — Tokens no accesibles desde JavaScript
- **Auth0 Token Vault** — Almacenamiento seguro de tokens de terceros

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Cuenta en [Auth0](https://auth0.com) (gratuita)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tokenmind-ai.git
cd tokenmind-ai
```

### 2. Configurar Auth0

1. Crear una aplicación en [Auth0 Dashboard](https://manage.auth0.com):
   - Tipo: **Regular Web Application**
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`

2. Crear una **API** en Auth0:
   - Name: `TokenMind API`
   - Identifier (Audience): `https://tokenmind-api`

3. Agregar **Scopes** personalizados a la API:
   - `read:email` — Permite leer correos
   - `read:calendar` — Permite leer calendario

4. En la app Auth0 → Pestaña **APIs** → habilitar la API creada y activar los scopes.

### 3. Configurar el Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Auth0
npm install
npm run dev
```

Variables requeridas en `backend/.env`:
```env
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_AUDIENCE=https://tokenmind-api
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar el Frontend

```bash
cd frontend
cp .env.example .env.local
# Editar .env.local con tus credenciales
npm install
npm run dev
```

Variables requeridas en `frontend/.env.local`:
```env
AUTH0_SECRET=<ejecuta: openssl rand -hex 32>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://tu-tenant.auth0.com
AUTH0_CLIENT_ID=<tu client id>
AUTH0_CLIENT_SECRET=<tu client secret>
AUTH0_AUDIENCE=https://tokenmind-api
BACKEND_URL=http://localhost:4000
```

### 5. Ejecutar

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Abrir: http://localhost:3000

---

## 🎮 Uso del Sistema

1. **Login**: Click en "Iniciar Sesión" → Auth0 Universal Login
2. **Dashboard**: Ver agentes disponibles y sus scopes
3. **Ejecutar**: Escribir una solicitud natural como:
   - `"Revisa mis correos"` → EmailAgent
   - `"¿Qué tengo en el calendario hoy?"` → CalendarAgent
   - `"Revisa mis correos y agenda"` → EmailAgent + CalendarAgent (paralelo)
4. **Resultados**: Ver el análisis consolidado de todos los agentes

---

## 🔒 Modelo de Seguridad

### ¿Por qué Auth0 Token Vault?

| Sin Token Vault | Con Token Vault |
|-----------------|-----------------|
| Tokens de Gmail en tu DB | Tokens en Auth0 (cifrados) |
| Tu código accede tokens | Solo Auth0 Management API |
| Riesgo en cada deploy | Tokens aislados del código |
| Rotación manual | Rotación automática |

### Scopes por Agente (Mínimo Privilegio)

```
EmailAgent    → read:email     (solo leer, no escribir)
CalendarAgent → read:calendar  (solo leer, no modificar)
Orchestrator  → openid         (solo orquestar)
```

---

## 📁 Estructura del Proyecto

```
tokenmind-ai/
├── backend/
│   ├── server.js              # Express + JWT middleware
│   ├── orchestrator.js        # Coordinador de agentes
│   ├── agents/
│   │   ├── emailAgent.js      # Agente de correo
│   │   └── calendarAgent.js   # Agente de calendario
│   ├── services/
│   │   └── auth0Service.js    # Helper Auth0 + Token Vault
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   ├── _app.js            # UserProvider global
│   │   ├── index.js           # Página principal (dashboard)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...auth0].js  # Endpoints Auth0
│   │       └── agents/
│   │           └── execute.js     # Proxy BFF
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🏆 Evaluación Hackathon

| Criterio | Implementación |
|----------|---------------|
| **Uso de Auth0** | ✅ SDK oficial, Universal Login, JWT validation |
| **Token Vault** | ✅ Arquitectura diseñada para Token Vault, servicio documentado |
| **OAuth 2.0** | ✅ Authorization Code Flow + PKCE |
| **Seguridad** | ✅ Mínimo privilegio, JWKS, HttpOnly cookies, BFF Pattern |
| **Multi-agente** | ✅ EmailAgent + CalendarAgent + Orchestrator |
| **Escalabilidad** | ✅ Fácil agregar nuevos agentes con nuevos scopes |

---

## 📄 Licencia

MIT License — Ver [LICENSE](LICENSE)

---

*Construido con ❤️ para el Hackathon Auth0 2024*
*Equipo: TokenMind AI*
