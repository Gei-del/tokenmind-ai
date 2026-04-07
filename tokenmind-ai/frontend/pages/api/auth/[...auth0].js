/**
 * TokenMind AI - Auth0 API Route
 * pages/api/auth/[...auth0].js
 *
 * Este archivo maneja TODOS los endpoints de Auth0:
 * - /api/auth/login    → Inicia el flujo OAuth 2.0
 * - /api/auth/logout   → Cierra sesión
 * - /api/auth/callback → Recibe el authorization code de Auth0
 * - /api/auth/me       → Retorna el perfil del usuario (del token)
 *
 * SEGURIDAD: El client_secret solo vive en el servidor (variables de entorno).
 * El frontend NUNCA lo ve. El token se almacena en una cookie HttpOnly.
 */

import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  // Personalizar el login para solicitar scopes adicionales
  login: handleLogin({
    authorizationParams: {
      // Scopes necesarios para los agentes de IA
      // read:email y read:calendar son scopes personalizados definidos en Auth0
      scope: 'openid profile email read:email read:calendar',
      // audience es la identificación de nuestra API en Auth0
      audience: process.env.AUTH0_AUDIENCE,
    },
  }),
});
