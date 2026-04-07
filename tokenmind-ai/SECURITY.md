# Política de Seguridad — TokenMind AI

## Versiones soportadas

| Versión | Soporte |
|---------|---------|
| 1.x     | ✅ Activo |

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en TokenMind AI:

1. **NO abrir un issue público** — podría exponer la vulnerabilidad antes de ser corregida.
2. Enviar un email a: `security@tokenmind.ai` (o al maintainer del repo)
3. Incluir descripción detallada, pasos para reproducir y impacto estimado.
4. Responderemos en un máximo de 48 horas.

## Modelo de seguridad implementado

### Autenticación
- **OAuth 2.0 Authorization Code Flow + PKCE** para todas las sesiones
- Tokens JWT firmados con **RS256** (clave asimétrica)
- Validación de firma con **JWKS** (clave pública de Auth0) — el `client_secret` nunca sale del servidor

### Almacenamiento de tokens
- Access tokens almacenados en **cookies HttpOnly** (inaccesibles desde JavaScript)
- Implementación del patrón **BFF (Backend For Frontend)**: el browser nunca recibe el access token directamente
- Tokens de servicios externos (Gmail, Calendar) almacenados en **Auth0 Token Vault**

### Control de acceso
- **Principio de mínimo privilegio**: cada agente solo recibe el scope estrictamente necesario
- Validación de scopes en cada endpoint del backend
- Rate limiting en todas las rutas `/api/`

### Headers de seguridad
- `Strict-Transport-Security` — fuerza HTTPS
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` — previene clickjacking
- `Content-Security-Policy` — restringe recursos externos
- `X-XSS-Protection`

### Secrets
- **Ningún secret** está hardcodeado en el código
- Todas las credenciales se cargan desde variables de entorno
- El archivo `.env` está en `.gitignore` y nunca se sube al repositorio
