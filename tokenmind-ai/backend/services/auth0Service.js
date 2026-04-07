/**
 * TokenMind AI - Auth0Service
 * Servicio de autenticación y manejo de tokens para el backend.
 *
 * SEGURIDAD CRÍTICA:
 * - El client_secret NUNCA se expone al frontend
 * - Los tokens se validan con la clave pública de Auth0 (JWKS)
 * - Las credenciales solo viven en variables de entorno del servidor
 */

const { ManagementClient } = require('auth0');

class Auth0Service {
  constructor() {
    this.domain = process.env.AUTH0_DOMAIN;
    this.audience = process.env.AUTH0_AUDIENCE;

    // Management API client (solo backend, NUNCA exponer al frontend)
    // Usado para operaciones administrativas si fueran necesarias
    if (process.env.AUTH0_MGMT_CLIENT_ID && process.env.AUTH0_MGMT_CLIENT_SECRET) {
      this.mgmtClient = new ManagementClient({
        domain: this.domain,
        clientId: process.env.AUTH0_MGMT_CLIENT_ID,
        clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET, // ← SOLO en backend
        scope: 'read:users read:user_idp_tokens',
      });
    }
  }

  /**
   * Extrae y valida los scopes del JWT decodificado.
   * @param {Object} decodedToken - JWT decodificado por express-jwt
   * @returns {string[]} Lista de scopes
   */
  extractScopes(decodedToken) {
    const scopeString = decodedToken?.scope || '';
    return scopeString.split(' ').filter(Boolean);
  }

  /**
   * Verifica si un token tiene un scope específico.
   * @param {Object} decodedToken - JWT decodificado
   * @param {string} requiredScope - Scope a verificar
   * @returns {boolean}
   */
  hasScope(decodedToken, requiredScope) {
    const scopes = this.extractScopes(decodedToken);
    return scopes.includes(requiredScope);
  }

  /**
   * Obtiene el perfil del usuario usando el Management API.
   * En producción, este método podría recuperar tokens de servicios
   * almacenados en Auth0 Token Vault para el usuario.
   *
   * @param {string} userId - Sub del JWT (ej: "auth0|abc123")
   * @returns {Promise<Object>} Perfil del usuario
   */
  async getUserProfile(userId) {
    if (!this.mgmtClient) {
      throw new Error('Management API client no configurado.');
    }

    try {
      const user = await this.mgmtClient.getUser({ id: userId });
      return {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        lastLogin: user.last_login,
      };
    } catch (error) {
      console.error('[Auth0Service] Error obteniendo perfil:', error.message);
      throw new Error('No se pudo obtener el perfil del usuario.');
    }
  }

  /**
   * TOKEN VAULT - Concepto clave del proyecto
   *
   * En un sistema real con Auth0 Token Vault, este método recuperaría
   * los tokens de terceros (Gmail, Google Calendar, etc.) almacenados
   * de forma segura por Auth0 en nombre del usuario.
   *
   * Flujo:
   * 1. Usuario autoriza acceso a Gmail durante el login (consent screen)
   * 2. Auth0 almacena el refresh_token de Gmail en Token Vault
   * 3. El agente llama a getServiceToken() para obtener un access_token fresco
   * 4. El agente usa ese token para llamar a la API externa
   * 5. El token NUNCA pasa por el frontend
   *
   * @param {string} userId - ID del usuario
   * @param {string} connection - Nombre de la conexión (ej: 'google-oauth2')
   * @returns {Promise<string>} Access token para el servicio externo
   */
  async getServiceToken(userId, connection) {
    if (!this.mgmtClient) {
      // Demo mode: retornar token simulado
      console.warn('[Auth0Service] Token Vault en modo demo - retornando token simulado');
      return `demo_token_${connection}_${Date.now()}`;
    }

    try {
      // En producción con Token Vault habilitado:
      const identity = await this.mgmtClient.getUser({ id: userId });
      const targetIdentity = identity.identities?.find(id => id.connection === connection);

      if (!targetIdentity?.access_token) {
        throw new Error(`No hay token almacenado para la conexión: ${connection}`);
      }

      return targetIdentity.access_token;
    } catch (error) {
      console.error(`[Auth0Service] Error recuperando token de ${connection}:`, error.message);
      throw error;
    }
  }

  /**
   * Genera la URL de autorización de Auth0.
   * NOTA: En Next.js con @auth0/nextjs-auth0, esto se maneja automáticamente.
   * Este método es solo de referencia para documentación.
   */
  getAuthorizationUrl({ redirectUri, scopes = [] }) {
    const defaultScopes = ['openid', 'profile', 'email'];
    const allScopes = [...new Set([...defaultScopes, ...scopes])];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.AUTH0_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: allScopes.join(' '),
      audience: this.audience,
    });

    return `https://${this.domain}/authorize?${params.toString()}`;
  }
}

module.exports = new Auth0Service(); // Singleton
