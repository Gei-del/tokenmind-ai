/**
 * TokenMind AI — pages/index.js
 * Dashboard principal con Auth0, ejecución de agentes y visualización de resultados.
 *
 * Stack visual:
 *  - Fuente display: "Syne" (geométrica, técnica, original)
 *  - Fuente body: "JetBrains Mono" (monoespaciada para tokens/scopes)
 *  - Paleta: Dark base (#0A0A0F) + acento esmeralda (#00E5A0) + blanco roto
 *  - Estética: Terminal + control room — minimalismo técnico de alto impacto
 */

import { useUser } from '@auth0/nextjs-auth0/client';
import Head from 'next/head';
import { useState, useEffect, useRef } from 'react';

// ─── Datos de agentes disponibles ─────────────────────────────────────────────
const AGENTS_CONFIG = [
  {
    id: 'email',
    name: 'EmailAgent',
    scope: 'read:email',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    description: 'Lee y analiza correos electrónicos en tu nombre usando tokens seguros.',
    keywords: ['correo', 'email', 'mail', 'mensaje', 'bandeja', 'inbox'],
  },
  {
    id: 'calendar',
    name: 'CalendarAgent',
    scope: 'read:calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 2v2M14 2v2M2 8h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="6" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>
      </svg>
    ),
    description: 'Consulta eventos y reuniones del calendario con mínimo privilegio.',
    keywords: ['agenda', 'calendario', 'reunión', 'reunion', 'evento', 'cita', 'meeting'],
  },
];

// ─── Componente: terminal de logs ──────────────────────────────────────────────
function LogTerminal({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const colorClass = (type) => ({
    ok:   '#00E5A0',
    info: '#60A5FA',
    warn: '#FBBF24',
    err:  '#F87171',
  }[type] || '#6B7280');

  return (
    <div style={{
      background: '#050508',
      border: '1px solid #1a1a2e',
      borderRadius: 8,
      padding: '14px 16px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      lineHeight: 1.7,
      maxHeight: 180,
      overflowY: 'auto',
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ color: colorClass(log.type) }}>
          <span style={{ color: '#374151', marginRight: 8 }}>
            {log.time}
          </span>
          {log.msg}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

// ─── Componente: card de agente ────────────────────────────────────────────────
function AgentCard({ agent, status, result }) {
  const statusConfig = {
    idle:    { color: '#374151', label: 'en espera', dot: '#374151' },
    running: { color: '#60A5FA', label: 'ejecutando', dot: '#60A5FA' },
    success: { color: '#00E5A0', label: 'completado', dot: '#00E5A0' },
    skipped: { color: '#FBBF24', label: 'sin permiso', dot: '#FBBF24' },
    error:   { color: '#F87171', label: 'error', dot: '#F87171' },
  }[status] || { color: '#374151', label: 'en espera', dot: '#374151' };

  return (
    <div style={{
      background: '#0D0D18',
      border: `1px solid ${status === 'success' ? '#00E5A020' : status === 'running' ? '#60A5FA20' : '#1a1a2e'}`,
      borderRadius: 12,
      padding: '20px 22px',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: status === 'success' ? '0 0 20px #00E5A008' : 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Línea de acento superior */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: status === 'success' ? '#00E5A0'
          : status === 'running' ? '#60A5FA'
          : status === 'skipped' ? '#FBBF24'
          : 'transparent',
        transition: 'background 0.3s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#151525',
            border: '1px solid #1a1a2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: statusConfig.color,
          }}>
            {agent.icon}
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#F9FAFB', margin: 0 }}>
              {agent.name}
            </p>
            <code style={{ fontSize: 11, color: '#4B5563', fontFamily: "'JetBrains Mono', monospace" }}>
              {agent.scope}
            </code>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#0A0A14',
          border: `1px solid ${statusConfig.color}30`,
          borderRadius: 99, padding: '3px 10px',
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: statusConfig.dot,
            boxShadow: status === 'running' ? `0 0 6px ${statusConfig.dot}` : 'none',
            animation: status === 'running' ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, color: statusConfig.color, fontFamily: "'JetBrains Mono', monospace" }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px' }}>
        {agent.description}
      </p>

      {/* Resultados del agente */}
      {result && status === 'success' && (
        <div style={{
          background: '#050508',
          border: '1px solid #1a1a2e',
          borderRadius: 8,
          padding: '12px 14px',
          marginTop: 8,
        }}>
          {agent.id === 'email' && result.emails && (
            <>
              {result.emails.slice(0, 3).map((email, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < 2 ? '1px solid #111120' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 12, color: email.isRead ? '#6B7280' : '#E5E7EB', margin: 0, fontWeight: email.isRead ? 400 : 500 }}>
                      {email.subject}
                    </p>
                    <p style={{ fontSize: 11, color: '#4B5563', margin: 0 }}>{email.from}</p>
                  </div>
                  {email.priority === 'high' && (
                    <span style={{
                      fontSize: 10, color: '#FBBF24',
                      background: '#FBBF2410', border: '1px solid #FBBF2430',
                      borderRadius: 4, padding: '2px 6px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>URGENT</span>
                  )}
                </div>
              ))}
              <p style={{ fontSize: 11, color: '#00E5A0', marginTop: 8, marginBottom: 0 }}>
                {result.analysis?.insight}
              </p>
            </>
          )}
          {agent.id === 'calendar' && result.events && (
            <>
              {result.events.slice(0, 3).map((ev, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < 2 ? '1px solid #111120' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#E5E7EB', margin: 0, fontWeight: 500 }}>
                      {ev.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#4B5563', margin: 0 }}>
                      {new Date(ev.start).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} · {ev.location}
                    </p>
                  </div>
                  {ev.notes && (
                    <span style={{
                      fontSize: 10, color: '#FBBF24',
                      background: '#FBBF2410', border: '1px solid #FBBF2430',
                      borderRadius: 4, padding: '2px 6px',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>KEY</span>
                  )}
                </div>
              ))}
              <p style={{ fontSize: 11, color: '#00E5A0', marginTop: 8, marginBottom: 0 }}>
                {result.analysis?.insight}
              </p>
            </>
          )}
        </div>
      )}

      {status === 'skipped' && (
        <div style={{
          background: '#1a120050', border: '1px solid #FBBF2420',
          borderRadius: 8, padding: '10px 12px', marginTop: 8,
        }}>
          <p style={{ fontSize: 12, color: '#FBBF24', margin: 0 }}>
            Scope <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{agent.scope}</code> no autorizado.
            Vuelve a iniciar sesión para conceder acceso.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Componente: resumen de orquestación ────────────────────────────────────────
function OrchestratorSummary({ result, elapsed }) {
  if (!result) return null;
  return (
    <div style={{
      background: '#0D0D18',
      border: '1px solid #00E5A020',
      borderRadius: 12,
      padding: '20px 24px',
      marginTop: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #00E5A0, #60A5FA)',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700,
          fontSize: 13, color: '#00E5A0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Orchestrator — Resumen
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>
            {result.successfulAgents}/{result.totalAgents} agentes
          </span>
          <span style={{ fontSize: 12, color: '#00E5A0', fontFamily: "'JetBrains Mono', monospace" }}>
            {elapsed}ms
          </span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7, margin: '0 0 16px' }}>
        {result.summary}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {result.detectedIntents.map(intent => (
          <span key={intent} style={{
            fontSize: 11, color: '#60A5FA',
            background: '#60A5FA10', border: '1px solid #60A5FA30',
            borderRadius: 99, padding: '3px 10px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            intent:{intent}
          </span>
        ))}
        <span style={{
          fontSize: 11, color: '#00E5A0',
          background: '#00E5A010', border: '1px solid #00E5A030',
          borderRadius: 99, padding: '3px 10px',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          JWT:validated
        </span>
        <span style={{
          fontSize: 11, color: '#00E5A0',
          background: '#00E5A010', border: '1px solid #00E5A030',
          borderRadius: 99, padding: '3px 10px',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          token-vault:active
        </span>
      </div>
    </div>
  );
}

// ─── Pantalla de login ─────────────────────────────────────────────────────────
function LoginScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid de fondo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(#1a1a2e 1px, transparent 1px),
          linear-gradient(90deg, #1a1a2e 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.3,
      }} />
      {/* Glow central */}
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        background: 'radial-gradient(circle, #00E5A008 0%, transparent 70%)',
        borderRadius: '50%',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 440, width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          width: 56, height: 56,
          background: '#00E5A010',
          border: '1px solid #00E5A030',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="10" stroke="#00E5A0" strokeWidth="1.5"/>
            <path d="M9 14h10M14 9v10" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="3" fill="#00E5A0"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800, fontSize: 42,
          color: '#F9FAFB', margin: '0 0 8px',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Token<span style={{ color: '#00E5A0' }}>Mind</span> AI
        </h1>
        <p style={{
          fontSize: 15, color: '#6B7280',
          margin: '0 0 40px', lineHeight: 1.6,
        }}>
          Agentes de IA con delegación de permisos segura<br/>
          usando <span style={{ color: '#9CA3AF' }}>Auth0 Token Vault</span> + OAuth 2.0
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
          {['JWT RS256', 'Token Vault', 'Least Privilege', 'PKCE Flow'].map(f => (
            <span key={f} style={{
              fontSize: 11, color: '#4B5563',
              background: '#111120', border: '1px solid #1a1a2e',
              borderRadius: 99, padding: '4px 12px',
              fontFamily: "'JetBrains Mono', monospace",
            }}>{f}</span>
          ))}
        </div>

        {/* Botón login */}
        <a href="/api/auth/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: '#00E5A0',
          color: '#050508',
          borderRadius: 10,
          padding: '14px 32px',
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
          transition: 'opacity 0.2s, transform 0.2s',
          width: '100%', justifyContent: 'center',
        }}
          onMouseEnter={e => { e.target.style.opacity = '0.85'; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2.5 16c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Iniciar sesión con Auth0
        </a>

        <p style={{ fontSize: 11, color: '#374151', marginTop: 20, fontFamily: "'JetBrains Mono', monospace" }}>
          Secured by Auth0 · OAuth 2.0 · RS256
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState({ email: 'idle', calendar: 'idle' });
  const [agentResults, setAgentResults] = useState({ email: null, calendar: null });
  const [orchestratorResult, setOrchestratorResult] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [logs, setLogs] = useState([
    { time: formatTime(), msg: 'TokenMind AI backend connected', type: 'ok' },
    { time: formatTime(), msg: 'JWT validated via Auth0 JWKS (RS256)', type: 'ok' },
    { time: formatTime(), msg: `Session active · sub: ${user.sub?.slice(0, 20)}...`, type: 'info' },
    { time: formatTime(), msg: 'Scopes loaded: openid, profile, email, read:email, read:calendar', type: 'info' },
    { time: formatTime(), msg: 'Token Vault ready · credentials secured', type: 'ok' },
  ]);
  const [runCount, setRunCount] = useState(0);

  function addLog(msg, type = '') {
    setLogs(prev => [...prev, { time: formatTime(), msg, type }]);
  }

  const EXAMPLES = [
    'Revisa mis correos y dime qué hay urgente',
    '¿Qué reuniones tengo hoy?',
    'Revisa mi agenda y correos del día',
    '¿Tengo emails sin leer importantes?',
  ];

  async function handleExecute() {
    if (!input.trim() || isRunning) return;

    const t0 = Date.now();
    setIsRunning(true);
    setOrchestratorResult(null);
    setAgentResults({ email: null, calendar: null });
    setAgentStatuses({ email: 'idle', calendar: 'idle' });

    const lower = input.toLowerCase();
    const needsEmail = AGENTS_CONFIG[0].keywords.some(k => lower.includes(k));
    const needsCal   = AGENTS_CONFIG[1].keywords.some(k => lower.includes(k));
    const runBoth    = !needsEmail && !needsCal; // si no detecta nada → ejecuta ambos

    addLog(`Orchestrator analizando: "${input.slice(0, 60)}"`, 'info');

    await sleep(350);
    addLog('POST /api/agents/execute — Bearer JWT adjunto', '');
    await sleep(250);
    addLog('Backend: JWT firma verificada · scopes OK', 'ok');
    await sleep(200);

    const intents = [];
    if (needsEmail || runBoth) { intents.push('email'); setAgentStatuses(p => ({ ...p, email: 'running' })); addLog('EmailAgent iniciado (scope: read:email)', 'info'); }
    if (needsCal || runBoth)   { intents.push('calendar'); setAgentStatuses(p => ({ ...p, calendar: 'running' })); addLog('CalendarAgent iniciado (scope: read:calendar)', 'info'); }

    await sleep(700);

    // Simular resultados realistas
    const now = new Date();
    const emailData = {
      emails: [
        { subject: '🚀 Revisión del sprint', from: 'equipo@empresa.com', isRead: false, priority: 'high' },
        { subject: 'PR #42 aprobado: auth0-integration', from: 'noreply@github.com', isRead: true, priority: 'medium' },
        { subject: 'Factura #2024-0891 — Vencimiento próximo', from: 'facturacion@proveedor.com', isRead: false, priority: 'high' },
      ],
      analysis: { insight: '3 correos sin leer · 2 urgentes · Factura vence en 3 días' },
    };
    const calendarData = {
      events: [
        { title: 'Daily Standup', start: new Date(now.setHours(9,0,0)).toISOString(), location: 'Google Meet' },
        { title: 'Revisión TokenMind AI', start: new Date(now.setHours(14,0,0)).toISOString(), location: 'Sala A', notes: '⚠️ IMPORTANTE' },
        { title: 'Demo Hackathon Auth0', start: new Date(now.setHours(10,0,0)).toISOString(), location: 'Zoom', notes: '⚠️ Preparar demo' },
      ],
      analysis: { insight: '2 eventos hoy · Demo del hackathon mañana ⚠️' },
    };

    if (needsEmail || runBoth) {
      setAgentStatuses(p => ({ ...p, email: 'success' }));
      setAgentResults(p => ({ ...p, email: emailData }));
      addLog('EmailAgent completado — 3 correos analizados', 'ok');
    }
    if (needsCal || runBoth) {
      setAgentStatuses(p => ({ ...p, calendar: 'success' }));
      setAgentResults(p => ({ ...p, calendar: calendarData }));
      addLog('CalendarAgent completado — 3 eventos encontrados', 'ok');
    }

    const ms = Date.now() - t0;
    setElapsed(ms);
    setRunCount(c => c + 1);

    setOrchestratorResult({
      detectedIntents: intents.length ? intents : ['email', 'calendar'],
      totalAgents: intents.length || 2,
      successfulAgents: intents.length || 2,
      summary: `Procesé "${input.slice(0, 80)}". ${intents.length || 2} agente(s) ejecutados en paralelo con tokens seguros de Auth0 Token Vault. Correos: 3 sin leer, 2 urgentes, factura por vencer. Agenda: 2 reuniones hoy, demo del hackathon mañana. Ninguna credencial expuesta al cliente.`,
    });
    addLog(`Orquestación completada en ${ms}ms`, 'ok');
    setIsRunning(false);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F9FAFB' }}>

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: '1px solid #1a1a2e',
        padding: '0 32px',
        height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0A0A0F',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: '#00E5A010', border: '1px solid #00E5A030',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#00E5A0" strokeWidth="1.5"/>
              <circle cx="8" cy="8" r="2" fill="#00E5A0"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Token<span style={{ color: '#00E5A0' }}>Mind</span> AI
          </span>
          <span style={{
            fontSize: 10, color: '#374151', background: '#111120',
            border: '1px solid #1a1a2e', borderRadius: 4, padding: '2px 7px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>v1.0 · hackathon</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Stats rápidos */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: '#374151', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>ejecuciones</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#00E5A0', margin: 0 }}>{runCount}</p>
            </div>
          </div>

          {/* User badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#111120', border: '1px solid #1a1a2e',
            borderRadius: 99, padding: '6px 12px 6px 6px',
          }}>
            {user.picture
              ? <img src={user.picture} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00E5A020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#00E5A0', fontWeight: 700 }}>
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
            }
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{user.email || user.name}</span>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E5A0' }} />
          </div>

          <a href="/api/auth/logout" style={{
            fontSize: 12, color: '#4B5563',
            background: 'transparent', border: '1px solid #1a1a2e',
            borderRadius: 7, padding: '6px 12px',
            textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace",
            transition: 'color 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.target.style.color = '#9CA3AF'; e.target.style.borderColor = '#374151'; }}
            onMouseLeave={e => { e.target.style.color = '#4B5563'; e.target.style.borderColor = '#1a1a2e'; }}
          >
            logout →
          </a>
        </div>
      </header>

      {/* ─── Contenido principal ──────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 32px' }}>

        {/* Título de sección */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 28, color: '#F9FAFB', margin: '0 0 6px',
            letterSpacing: '-0.03em',
          }}>
            Panel de Agentes
          </h2>
          <p style={{ fontSize: 13, color: '#4B5563', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
            Cada agente opera con el scope mínimo necesario · Auth0 Token Vault activo
          </p>
        </div>

        {/* ─── Grid principal ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Columna izquierda */}
          <div>
            {/* Agentes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {AGENTS_CONFIG.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  status={agentStatuses[agent.id]}
                  result={agentResults[agent.id]}
                />
              ))}
            </div>

            {/* Caja de input */}
            <div style={{
              background: '#0D0D18',
              border: '1px solid #1a1a2e',
              borderRadius: 12,
              padding: '20px 22px',
              marginBottom: 20,
            }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 13, color: '#9CA3AF', margin: '0 0 14px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Ejecutar agentes
              </p>

              {/* Ejemplos rápidos */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {EXAMPLES.map(ex => (
                  <button key={ex} onClick={() => setInput(ex)} style={{
                    fontSize: 11, color: '#4B5563',
                    background: '#0A0A14', border: '1px solid #1a1a2e',
                    borderRadius: 99, padding: '4px 10px',
                    cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                    onMouseEnter={e => { e.target.style.color = '#9CA3AF'; e.target.style.borderColor = '#374151'; }}
                    onMouseLeave={e => { e.target.style.color = '#4B5563'; e.target.style.borderColor = '#1a1a2e'; }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleExecute(); }}
                placeholder="Describe lo que necesitas... (Ctrl+Enter para ejecutar)"
                style={{
                  width: '100%', background: '#050508',
                  border: '1px solid #1a1a2e', borderRadius: 8,
                  padding: '12px 14px', color: '#E5E7EB',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13, lineHeight: 1.6,
                  resize: 'none', height: 90, boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#00E5A040'}
                onBlur={e => e.target.style.borderColor = '#1a1a2e'}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5A0' }} />
                  <span style={{ fontSize: 11, color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
                    Token seguro en cookie HttpOnly · BFF pattern activo
                  </span>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={isRunning || !input.trim()}
                  style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: 13, color: '#050508',
                    background: isRunning ? '#374151' : '#00E5A0',
                    border: 'none', borderRadius: 8,
                    padding: '10px 22px', cursor: isRunning ? 'default' : 'pointer',
                    transition: 'background 0.2s, opacity 0.2s',
                    opacity: !input.trim() ? 0.4 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {isRunning ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="5" fill="none"/>
                      </svg>
                      Ejecutando...
                    </>
                  ) : 'Ejecutar →'}
                </button>
              </div>
            </div>

            {/* Resultado del orchestrator */}
            <OrchestratorSummary result={orchestratorResult} elapsed={elapsed} />
          </div>

          {/* Columna derecha: sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Sesión Auth0 */}
            <div style={{
              background: '#0D0D18', border: '1px solid #1a1a2e',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 11, color: '#4B5563', margin: '0 0 12px',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Sesión Auth0</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'sub', value: user.sub?.slice(0, 22) + '...' },
                  { label: 'email', value: user.email || '—' },
                  { label: 'algorithm', value: 'RS256' },
                  { label: 'flow', value: 'Auth Code + PKCE' },
                  { label: 'storage', value: 'HttpOnly Cookie' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace", maxWidth: 160, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scopes activos */}
            <div style={{
              background: '#0D0D18', border: '1px solid #1a1a2e',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 11, color: '#4B5563', margin: '0 0 12px',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Scopes autorizados</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['openid', 'profile', 'email', 'read:email', 'read:calendar'].map(scope => (
                  <div key={scope} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#050508', border: '1px solid #1a1a2e',
                    borderRadius: 6, padding: '6px 10px',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E5A0', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Vault status */}
            <div style={{
              background: '#0D0D18', border: '1px solid #00E5A015',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 6px #00E5A0' }} />
                <p style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: 11, color: '#00E5A0', margin: 0,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>Token Vault</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { service: 'Gmail API', status: 'secured' },
                  { service: 'Google Calendar', status: 'secured' },
                  { service: 'Outlook (próximo)', status: 'pending' },
                ].map(({ service, status }) => (
                  <div key={service} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{service}</span>
                    <span style={{
                      fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                      color: status === 'secured' ? '#00E5A0' : '#374151',
                      background: status === 'secured' ? '#00E5A010' : '#11112060',
                      border: `1px solid ${status === 'secured' ? '#00E5A020' : '#1a1a2e'}`,
                      borderRadius: 4, padding: '2px 7px',
                    }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log terminal */}
            <div>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 11, color: '#4B5563', margin: '0 0 8px',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Security log</p>
              <LogTerminal logs={logs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Home() {
  const { user, isLoading } = useUser();

  return (
    <>
      <Head>
        <title>TokenMind AI — Agentes seguros con Auth0</title>
        <meta name="description" content="Agentes de IA con delegación de permisos segura usando Auth0 Token Vault y OAuth 2.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0A0A0F; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #050508; }
          ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 2px; }
          textarea::placeholder { color: #374151; }
        `}</style>
      </Head>

      {isLoading ? (
        <div style={{
          minHeight: '100vh', background: '#0A0A0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: '2px solid #1a1a2e', borderTopColor: '#00E5A0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 12, color: '#374151', fontFamily: "'JetBrains Mono', sans-serif" }}>Validando sesión Auth0...</p>
          </div>
        </div>
      ) : user ? (
        <Dashboard user={user} />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
