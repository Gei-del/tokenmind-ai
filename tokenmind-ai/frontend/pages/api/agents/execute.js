/**
 * TokenMind AI - API Proxy para agentes
 * pages/api/agents/execute.js
 *
 * Este proxy server-side:
 * 1. Recupera el access token de la sesión Auth0 (cookie HttpOnly)
 * 2. Lo adjunta al request hacia el backend
 * 3. El token NUNCA se expone al cliente (browser)
 *
 * Esto es el patrón BFF (Backend For Frontend) recomendado con OAuth 2.0
 */

import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtiene el access token de la sesión segura (cookie HttpOnly)
    // El token incluye los scopes solicitados durante el login
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['openid'],
    });

    const { input } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input inválido' });
    }

    // Llamar al backend con el token de Auth0
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/agents/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // El token se envía como Bearer token al backend
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('[API Proxy] Error:', error.message);
    res.status(500).json({
      error: 'proxy_error',
      message: 'Error al comunicarse con el backend.',
    });
  }
});
