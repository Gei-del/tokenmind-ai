/**
 * TokenMind AI - Backend Server
 * Servidor Express con validación JWT de Auth0
 * Principio de mínimo privilegio por agente
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const orchestrator = require('./orchestrator');

require('dotenv').config();

const app = express();

// ─── Seguridad HTTP ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// Rate limiting: evitar abuso de la API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta más tarde.' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' })); // Prevenir payload attacks

// ─── Middleware JWT Auth0 ──────────────────────────────────────────────────────
/**
 * Valida el JWT emitido por Auth0 usando JWKS (clave pública).
 * NUNCA se expone client_secret en el frontend.
 * El backend valida la firma del token con la clave pública del JWKS endpoint.
 */
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// ─── Middleware de Scopes ──────────────────────────────────────────────────────
/**
 * Verifica que el token tenga los scopes requeridos.
 * Implementa el principio de mínimo privilegio.
 */
const checkScopes = (requiredScopes) => (req, res, next) => {
  const tokenScopes = (req.auth?.scope || '').split(' ');
  const hasAllScopes = requiredScopes.every(s => tokenScopes.includes(s));

  if (!hasAllScopes) {
    return res.status(403).json({
      error: 'insufficient_scope',
      message: `Scopes requeridos: ${requiredScopes.join(', ')}`,
      required: requiredScopes,
      provided: tokenScopes,
    });
  }
  next();
};

// ─── Rutas ─────────────────────────────────────────────────────────────────────

// Health check público
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TokenMind AI Backend', timestamp: new Date().toISOString() });
});

/**
 * POST /api/agents/execute
 * Punto de entrada principal para ejecutar agentes.
 * Requiere JWT válido + scope openid (mínimo).
 */
app.post('/api/agents/execute',
  checkJwt,
  checkScopes(['openid']),
  async (req, res) => {
    try {
      const { input } = req.body;
      const userId = req.auth.sub; // sub = ID del usuario en Auth0
      const tokenScopes = (req.auth.scope || '').split(' ');

      if (!input || typeof input !== 'string' || input.trim().length === 0) {
        return res.status(400).json({ error: 'El campo "input" es requerido.' });
      }

      if (input.length > 500) {
        return res.status(400).json({ error: 'El input no puede superar 500 caracteres.' });
      }

      console.log(`[SERVER] Usuario ${userId} ejecutando agentes con input: "${input}"`);

      // El orchestrator analiza el input y ejecuta los agentes apropiados
      const result = await orchestrator.execute({
        input: input.trim(),
        userId,
        tokenScopes,
        authToken: req.headers.authorization?.split(' ')[1],
      });

      res.json({
        success: true,
        userId,
        input,
        result,
        executedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error('[SERVER] Error ejecutando agentes:', error.message);
      res.status(500).json({
        error: 'internal_error',
        message: 'Error interno del servidor.',
      });
    }
  }
);

/**
 * GET /api/agents/available
 * Lista los agentes disponibles y sus scopes requeridos.
 * Protegido con JWT básico.
 */
app.get('/api/agents/available',
  checkJwt,
  (req, res) => {
    res.json({
      agents: [
        {
          id: 'email',
          name: 'EmailAgent',
          description: 'Lee y analiza correos electrónicos del usuario.',
          requiredScopes: ['read:email'],
          icon: '📧',
        },
        {
          id: 'calendar',
          name: 'CalendarAgent',
          description: 'Lee y resume eventos del calendario.',
          requiredScopes: ['read:calendar'],
          icon: '📅',
        },
        {
          id: 'summarizer',
          name: 'SummarizerAgent',
          description: 'Consolida y resume resultados de múltiples agentes.',
          requiredScopes: ['openid'],
          icon: '🧠',
        },
      ],
    });
  }
);

// ─── Manejo de errores JWT ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token JWT inválido o expirado. Por favor inicia sesión nuevamente.',
    });
  }
  next(err);
});

// Error genérico
app.use((err, req, res, next) => {
  console.error('[SERVER] Error no manejado:', err);
  res.status(500).json({ error: 'server_error', message: 'Error interno.' });
});

// ─── Iniciar servidor ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      TokenMind AI - Backend v1.0       ║
║   Servidor escuchando en puerto ${PORT}   ║
║   Auth0 Domain: ${process.env.AUTH0_DOMAIN || 'NO CONFIGURADO'}  ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
