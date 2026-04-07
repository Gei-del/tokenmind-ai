# Cómo construimos TokenMind AI: Agentes de IA seguros con Auth0 Token Vault

*Por el equipo TokenMind AI — Hackathon Auth0 2024*

---

## El problema que queríamos resolver

Cuando empezamos a diseñar TokenMind AI, nos enfrentamos a una pregunta que creemos define el futuro de los agentes de IA: **¿cómo puede un agente actuar en nombre del usuario sin comprometer la seguridad de sus credenciales?**

La respuesta fácil —y peligrosa— es almacenar los tokens de acceso en tu propia base de datos. Cientos de startups lo hacen así. El problema es que esta aproximación convierte tu base de datos en un tesoro para atacantes: un solo breach expone las cuentas de Gmail, Google Calendar y cualquier otro servicio de todos tus usuarios.

Auth0 Token Vault resuelve exactamente este problema. Y usarlo nos cambió la forma de pensar sobre la arquitectura de agentes de IA.

---

## La arquitectura de Auth0 que implementamos

El corazón de TokenMind AI está en cómo manejamos la autenticación. Utilizamos el **Authorization Code Flow con PKCE**, el estándar recomendado para aplicaciones web modernas.

El flujo funciona así: cuando el usuario hace clic en "Iniciar Sesión", lo redirigimos a Auth0 Universal Login —una pantalla de login alojada por Auth0, no por nosotros. Esto significa que las credenciales del usuario nunca tocan nuestros servidores. Auth0 las maneja, las valida y nos devuelve un `authorization_code` que intercambiamos por tokens.

El access token que recibimos es un JWT firmado con RS256, un algoritmo de firma asimétrica. La clave privada de firma vive en Auth0. Nosotros solo validamos con la clave pública, disponible en el endpoint JWKS de nuestro tenant. Esta separación es fundamental: incluso si un atacante obtiene nuestro código, no puede generar tokens válidos.

---

## Cómo manejamos los tokens: el patrón BFF

Una de las decisiones de diseño más importantes fue implementar el patrón **BFF (Backend For Frontend)**. En lugar de que el browser haga peticiones directas al backend con el token, creamos un proxy interno en Next.js.

El flujo es:
1. El frontend llama a `/api/agents/execute` (una ruta de Next.js, no el backend)
2. El proxy recupera el access token de la sesión Auth0 (almacenada en una **cookie HttpOnly**)
3. El proxy adjunta el token al request hacia el backend
4. El backend valida el JWT y ejecuta los agentes

La cookie HttpOnly es clave: el JavaScript del navegador no puede leerla. Esto elimina vectores de ataque XSS que podrían robar tokens si estuvieran en localStorage.

---

## Token Vault: la pieza que cambia todo

Auth0 Token Vault nos permite almacenar los tokens de terceros —Gmail, Google Calendar, GitHub— directamente en Auth0, cifrados y asociados al usuario. Los agentes los recuperan en tiempo de ejecución a través de la Management API.

El beneficio de seguridad es enorme: nuestro código **nunca almacena** tokens de Gmail. No hay tabla de tokens en nuestra base de datos. No hay riesgo de leak en un backup. Los tokens viven en la infraestructura de Auth0, con toda la seguridad empresarial que eso implica.

```javascript
// En lugar de buscar en nuestra DB:
// const token = await db.query('SELECT gmail_token FROM users WHERE id = ?', [userId])

// Recuperamos de Token Vault de forma segura:
const serviceToken = await auth0TokenVault.getToken(userId, 'google-oauth2');
```

---

## El principio de mínimo privilegio en la práctica

Cada agente de TokenMind AI tiene un scope específico y solo ese. El EmailAgent requiere `read:email`, el CalendarAgent requiere `read:calendar`. El Orchestrator, que solo coordina y no accede a datos externos, solo necesita `openid`.

Este diseño tiene consecuencias prácticas importantes. Si el usuario quiere ejecutar el EmailAgent pero no ha autorizado `read:email`, el sistema lo indica claramente y puede solicitar el consentimiento adicional. No hay acceso silencioso a recursos no autorizados.

En el backend, el middleware de validación de scopes es explícito y trazable:

```javascript
const checkScopes = (requiredScopes) => (req, res, next) => {
  const tokenScopes = (req.auth?.scope || '').split(' ');
  const hasAllScopes = requiredScopes.every(s => tokenScopes.includes(s));
  if (!hasAllScopes) return res.status(403).json({ error: 'insufficient_scope' });
  next();
};
```

---

## Beneficios de seguridad que medimos

Al adoptar esta arquitectura, eliminamos varias categorías enteras de vulnerabilidades:

**Token theft via XSS**: Los tokens en cookies HttpOnly no son accesibles desde JavaScript, eliminando este vector de ataque completamente.

**Credential exposure**: Los secrets de Auth0 solo viven en variables de entorno del servidor. El `client_secret` nunca toca el browser.

**Privilege escalation**: Los scopes están validados en cada request por el backend. Un agente no puede "pedir prestados" los permisos de otro.

**Token replay**: Los JWTs de Auth0 tienen expiración corta. La rotación automática reduce la ventana de exposición si un token es interceptado.

---

## Aprendizajes y reflexiones

Construir TokenMind AI nos enseñó que la seguridad en agentes de IA no es un add-on, es la arquitectura base. Auth0 Token Vault convierte un problema complejo —manejar tokens de decenas de servicios externos de miles de usuarios— en una solución elegante que delega la responsabilidad de seguridad a expertos.

Lo más valioso no fue el código que escribimos, sino el código que no tuvimos que escribir: no hay lógica de cifrado de tokens, no hay rotación manual, no hay infraestructura de secrets management. Auth0 lo maneja todo.

Para cualquier equipo construyendo agentes de IA con acceso a servicios externos, nuestra recomendación es clara: no intenten reinventar la rueda de la seguridad. Auth0 Token Vault existe precisamente para este caso de uso, y usarlo es la diferencia entre una arquitectura que un CTO aprobaría y una que lo mantendría despierto por las noches.

---

*TokenMind AI — Hackathon Auth0 2024 | github.com/tu-usuario/tokenmind-ai*
