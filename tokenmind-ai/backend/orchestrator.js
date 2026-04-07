/**
 * TokenMind AI - Orchestrator
 * Analiza el input del usuario y delega a los agentes correctos.
 * Implementa lógica de orquestación basada en keywords + scopes disponibles.
 */

const EmailAgent = require('./agents/emailAgent');
const CalendarAgent = require('./agents/calendarAgent');

// ─── Mapa de intenciones → agentes ────────────────────────────────────────────
const INTENT_MAP = [
  {
    intent: 'email',
    keywords: ['correo', 'email', 'mail', 'mensaje', 'inbox', 'bandeja', 'correos', 'emails'],
    agent: 'email',
    requiredScope: 'read:email',
  },
  {
    intent: 'calendar',
    keywords: ['agenda', 'calendario', 'evento', 'reunión', 'cita', 'horario', 'schedule', 'meeting', 'calendar'],
    agent: 'calendar',
    requiredScope: 'read:calendar',
  },
];

/**
 * Detecta qué agentes se necesitan según el input del usuario.
 * @param {string} input - Texto del usuario
 * @param {string[]} tokenScopes - Scopes disponibles en el token
 * @returns {Array} Lista de agentes a ejecutar
 */
function detectIntents(input, tokenScopes) {
  const inputLower = input.toLowerCase();
  const detectedAgents = [];

  for (const mapping of INTENT_MAP) {
    const hasKeyword = mapping.keywords.some(kw => inputLower.includes(kw));
    const hasScope = tokenScopes.includes(mapping.requiredScope);

    if (hasKeyword) {
      detectedAgents.push({
        agentId: mapping.agent,
        intent: mapping.intent,
        hasPermission: hasScope,
        requiredScope: mapping.requiredScope,
      });
    }
  }

  // Si no se detectó ninguna intención específica, usar agente de resumen general
  if (detectedAgents.length === 0) {
    detectedAgents.push({
      agentId: 'general',
      intent: 'general',
      hasPermission: true,
      requiredScope: 'openid',
    });
  }

  return detectedAgents;
}

/**
 * Ejecuta un agente individual con manejo de errores robusto.
 */
async function runAgent(agentId, context) {
  const agents = {
    email: EmailAgent,
    calendar: CalendarAgent,
  };

  const AgentClass = agents[agentId];
  if (!AgentClass) {
    return {
      agentId,
      status: 'error',
      error: `Agente "${agentId}" no encontrado.`,
    };
  }

  try {
    const agent = new AgentClass(context);
    const result = await agent.execute();
    return { agentId, status: 'success', data: result };
  } catch (err) {
    console.error(`[ORCHESTRATOR] Error en agente ${agentId}:`, err.message);
    return { agentId, status: 'error', error: err.message };
  }
}

/**
 * Genera un resumen consolidado de los resultados de múltiples agentes.
 */
function consolidateResults(agentResults, input) {
  const successful = agentResults.filter(r => r.status === 'success');
  const failed = agentResults.filter(r => r.status === 'error');
  const skipped = agentResults.filter(r => r.status === 'skipped');

  let summary = `Procesé tu solicitud: "${input}"\n\n`;

  if (successful.length > 0) {
    summary += `✅ Agentes ejecutados exitosamente: ${successful.map(r => r.agentId).join(', ')}\n`;
  }
  if (failed.length > 0) {
    summary += `❌ Agentes con error: ${failed.map(r => r.agentId).join(', ')}\n`;
  }
  if (skipped.length > 0) {
    summary += `⚠️ Agentes sin permiso (scope faltante): ${skipped.map(r => r.agentId).join(', ')}\n`;
  }

  return summary;
}

// ─── Función principal del Orchestrator ───────────────────────────────────────
/**
 * Punto de entrada del orchestrator.
 * @param {Object} params
 * @param {string} params.input - Input del usuario
 * @param {string} params.userId - ID del usuario (sub de JWT)
 * @param {string[]} params.tokenScopes - Scopes del token
 * @param {string} params.authToken - JWT para llamadas a servicios externos
 */
async function execute({ input, userId, tokenScopes, authToken }) {
  console.log(`[ORCHESTRATOR] Analizando input: "${input}"`);
  console.log(`[ORCHESTRATOR] Scopes disponibles: ${tokenScopes.join(', ')}`);

  // 1. Detectar intenciones
  const intents = detectIntents(input, tokenScopes);
  console.log(`[ORCHESTRATOR] Intenciones detectadas: ${intents.map(i => i.intent).join(', ')}`);

  // 2. Preparar contexto para los agentes
  const context = { userId, authToken, input };

  // 3. Ejecutar agentes en paralelo (solo los que tienen permiso)
  const agentPromises = intents.map(async (intent) => {
    if (!intent.hasPermission) {
      console.warn(`[ORCHESTRATOR] Sin scope "${intent.requiredScope}" para agente "${intent.agentId}"`);
      return {
        agentId: intent.agentId,
        status: 'skipped',
        reason: `Scope requerido: ${intent.requiredScope}`,
        requiredScope: intent.requiredScope,
      };
    }

    console.log(`[ORCHESTRATOR] Ejecutando agente: ${intent.agentId}`);
    return await runAgent(intent.agentId, context);
  });

  const agentResults = await Promise.all(agentPromises);

  // 4. Consolidar resultados
  const summary = consolidateResults(agentResults, input);

  return {
    detectedIntents: intents.map(i => i.intent),
    agentResults,
    summary,
    totalAgents: intents.length,
    successfulAgents: agentResults.filter(r => r.status === 'success').length,
  };
}

module.exports = { execute };
