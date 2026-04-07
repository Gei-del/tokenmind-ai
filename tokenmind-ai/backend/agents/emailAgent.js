/**
 * TokenMind AI - EmailAgent
 * Agente especializado en lectura de correos electrónicos.
 * Scope requerido: read:email (principio de mínimo privilegio)
 *
 * En producción, este agente usaría el token almacenado en Auth0 Token Vault
 * para llamar a la API de Gmail/Outlook sin exponer credenciales.
 */

class EmailAgent {
  constructor({ userId, authToken, input }) {
    this.userId = userId;
    this.authToken = authToken;
    this.input = input;
    this.agentName = 'EmailAgent';
    this.requiredScope = 'read:email';
  }

  /**
   * Punto de entrada principal del agente.
   * En producción llamaría a Gmail API / Outlook API usando el token de Auth0 Token Vault.
   */
  async execute() {
    console.log(`[${this.agentName}] Ejecutando para usuario: ${this.userId}`);
    console.log(`[${this.agentName}] Scope utilizado: ${this.requiredScope}`);

    // ─── SIMULACIÓN (Demo Mode) ────────────────────────────────────────────────
    // En producción real:
    // 1. Recuperar el token de servicio desde Auth0 Token Vault
    // 2. Llamar a Gmail API: GET https://gmail.googleapis.com/gmail/v1/users/me/messages
    // 3. Parsear y retornar correos
    //
    // Ejemplo de cómo sería con Token Vault:
    // const serviceToken = await auth0TokenVault.getToken(this.userId, 'gmail');
    // const gmailResponse = await fetch('https://gmail.googleapis.com/...', {
    //   headers: { Authorization: `Bearer ${serviceToken}` }
    // });

    await this.simulateApiDelay();

    const emails = this.generateMockEmails();
    const analysis = this.analyzeEmails(emails);

    return {
      agent: this.agentName,
      scope: this.requiredScope,
      emailCount: emails.length,
      emails,
      analysis,
      source: 'Gmail API (simulado - Demo Mode)',
      tokenVaultNote: 'En producción usa Auth0 Token Vault para almacenar tokens de Gmail de forma segura.',
    };
  }

  /**
   * Simula latencia de API real (200-600ms)
   */
  async simulateApiDelay() {
    const delay = Math.floor(Math.random() * 400) + 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Genera correos mock realistas para la demo
   */
  generateMockEmails() {
    const now = new Date();
    return [
      {
        id: 'msg_001',
        from: 'equipo@empresa.com',
        subject: '🚀 Revisión del sprint - Esta semana',
        preview: 'Hola equipo, adjunto el resumen del sprint anterior y los objetivos para esta semana...',
        date: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // hace 2h
        isRead: false,
        priority: 'high',
        labels: ['trabajo', 'sprint'],
      },
      {
        id: 'msg_002',
        from: 'noreply@github.com',
        subject: '[GitHub] PR #42 aprobado: Feature/auth0-integration',
        preview: 'Tu Pull Request ha sido aprobado por 2 revisores. Listo para merge.',
        date: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // hace 5h
        isRead: true,
        priority: 'medium',
        labels: ['github', 'desarrollo'],
      },
      {
        id: 'msg_003',
        from: 'facturacion@proveedor.com',
        subject: 'Factura #2024-0891 - Vencimiento próximo',
        preview: 'Su factura por $1,250 USD vence en 3 días. Por favor realice el pago...',
        date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), // hace 1 día
        isRead: false,
        priority: 'high',
        labels: ['facturación', 'urgente'],
      },
      {
        id: 'msg_004',
        from: 'newsletter@hackernews.com',
        subject: 'Top stories: AI Agents & OAuth 2.0 best practices',
        preview: 'Esta semana: cómo los agentes de IA están cambiando la forma en que interactuamos...',
        date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // hace 2 días
        isRead: true,
        priority: 'low',
        labels: ['newsletter'],
      },
    ];
  }

  /**
   * Analiza los correos y genera insights
   */
  analyzeEmails(emails) {
    const unread = emails.filter(e => !e.isRead);
    const highPriority = emails.filter(e => e.priority === 'high');

    return {
      totalEmails: emails.length,
      unreadCount: unread.length,
      highPriorityCount: highPriority.length,
      actionRequired: highPriority.filter(e => !e.isRead).length,
      insight: `Tienes ${unread.length} correos sin leer, ${highPriority.length} de alta prioridad. ` +
               `Atención: hay una factura por vencer en 3 días.`,
    };
  }
}

module.exports = EmailAgent;
