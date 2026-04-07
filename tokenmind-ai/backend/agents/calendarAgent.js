/**
 * TokenMind AI - CalendarAgent
 * Agente especializado en lectura de eventos del calendario.
 * Scope requerido: read:calendar (principio de mínimo privilegio)
 *
 * En producción usaría Google Calendar API / Microsoft Graph API
 * con tokens almacenados de forma segura en Auth0 Token Vault.
 */

class CalendarAgent {
  constructor({ userId, authToken, input }) {
    this.userId = userId;
    this.authToken = authToken;
    this.input = input;
    this.agentName = 'CalendarAgent';
    this.requiredScope = 'read:calendar';
  }

  /**
   * Punto de entrada principal del agente.
   */
  async execute() {
    console.log(`[${this.agentName}] Ejecutando para usuario: ${this.userId}`);
    console.log(`[${this.agentName}] Scope utilizado: ${this.requiredScope}`);

    // ─── SIMULACIÓN (Demo Mode) ────────────────────────────────────────────────
    // En producción real:
    // const serviceToken = await auth0TokenVault.getToken(this.userId, 'google-calendar');
    // const response = await fetch(
    //   'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=...&maxResults=10',
    //   { headers: { Authorization: `Bearer ${serviceToken}` } }
    // );

    await this.simulateApiDelay();

    const events = this.generateMockEvents();
    const analysis = this.analyzeEvents(events);

    return {
      agent: this.agentName,
      scope: this.requiredScope,
      eventCount: events.length,
      events,
      analysis,
      source: 'Google Calendar API (simulado - Demo Mode)',
      tokenVaultNote: 'En producción usa Auth0 Token Vault para tokens de Google Calendar.',
    };
  }

  async simulateApiDelay() {
    const delay = Math.floor(Math.random() * 300) + 150;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  generateMockEvents() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return [
      {
        id: 'evt_001',
        title: 'Daily Standup - Equipo Dev',
        start: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),  // 9:00 AM hoy
        end: new Date(today.getTime() + 9.25 * 60 * 60 * 1000).toISOString(), // 9:15 AM hoy
        location: 'Google Meet',
        attendees: ['dev1@empresa.com', 'dev2@empresa.com', 'pm@empresa.com'],
        isUpcoming: true,
        type: 'meeting',
        status: 'confirmed',
      },
      {
        id: 'evt_002',
        title: 'Revisión de arquitectura - TokenMind AI',
        start: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 2:00 PM hoy
        end: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(),   // 3:00 PM hoy
        location: 'Sala de conferencias A',
        attendees: ['cto@empresa.com', 'lead@empresa.com'],
        isUpcoming: true,
        type: 'review',
        status: 'confirmed',
      },
      {
        id: 'evt_003',
        title: 'Demo Hackathon Auth0',
        start: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // mañana 10:00 AM
        end: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
        location: 'Zoom - Enlace en descripción',
        attendees: ['jueces@auth0.com', 'equipo@empresa.com'],
        isUpcoming: true,
        type: 'presentation',
        status: 'confirmed',
        notes: '⚠️ IMPORTANTE: Preparar demo de Token Vault',
      },
      {
        id: 'evt_004',
        title: 'Sprint Planning Q1',
        start: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(), // en 3 días
        end: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
        location: 'Sala principal',
        attendees: ['todo-el-equipo@empresa.com'],
        isUpcoming: true,
        type: 'planning',
        status: 'tentative',
      },
    ];
  }

  analyzeEvents(events) {
    const today = new Date();
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === today.toDateString();
    });

    const nextEvent = events.find(e => new Date(e.start) > today);
    const importantEvents = events.filter(e => e.type === 'presentation' || e.notes?.includes('IMPORTANTE'));

    return {
      totalEvents: events.length,
      todayCount: todayEvents.length,
      nextEvent: nextEvent ? {
        title: nextEvent.title,
        start: nextEvent.start,
        minutesUntil: Math.round((new Date(nextEvent.start) - today) / 60000),
      } : null,
      importantCount: importantEvents.length,
      insight: `Tienes ${todayEvents.length} eventos hoy. ` +
               (nextEvent ? `Próximo: "${nextEvent.title}" en ${Math.round((new Date(nextEvent.start) - today) / 60000)} minutos. ` : '') +
               (importantEvents.length > 0 ? `⚠️ ${importantEvents.length} evento(s) de alta importancia próximamente.` : ''),
    };
  }
}

module.exports = CalendarAgent;
