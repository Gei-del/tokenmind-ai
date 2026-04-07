# 🎥 TokenMind AI — Guion de Video Demo (3 minutos)

---

## 🎬 SEGMENTO 1: EL PROBLEMA (0:00 - 0:40)

**[Pantalla: Fondo oscuro con texto animado]**

**Narrador (voz en off):**

> "Los agentes de IA están transformando cómo trabajamos. Pueden revisar tus correos, gestionar tu agenda, acceder a tus archivos. Pero hay una pregunta crítica que nadie hace:"

**[Texto en pantalla: "¿Dónde viven tus tokens de acceso?"]**

> "Si el agente necesita acceder a tu Gmail, alguien tiene que guardar ese token. ¿En una base de datos? ¿En el código? Cada una de esas opciones es una vulnerabilidad esperando explotar."

**[Mostrar: Diagrama de 'tokens en DB propia' con ícono de riesgo 🔴]**

> "TokenMind AI resuelve esto con Auth0 Token Vault: los agentes actúan en tu nombre, pero tus credenciales nunca tocan nuestros servidores."

---

## 🎬 SEGMENTO 2: DEMO FUNCIONAL (0:40 - 2:00)

**[Pantalla: Navegador con la app TokenMind AI]**

**Narrador:**

> "Veamos cómo funciona. Aquí tenemos TokenMind AI cargado en el navegador."

**[Acción: Click en "Iniciar Sesión"]**

> "El usuario hace click en login. Notemos que somos redirigidos a auth0.com —no a nuestro servidor. Las credenciales nunca tocan nuestro código."

**[Acción: Login en Auth0 Universal Login]**

**[Mostrar: Pantalla de consentimiento de Auth0]**

> "Auth0 muestra los permisos que la aplicación solicita: leer correos y leer calendario. El usuario acepta explícitamente. Este es el principio de consentimiento informado de OAuth 2.0."

**[Acción: Login exitoso → Dashboard]**

> "Ahora estamos en el dashboard. Vemos los agentes disponibles, cada uno con su scope específico."

**[Mostrar: Cards de agentes con sus scopes]**

**[Acción: Escribir en el input: "Revisa mis correos y dime qué reuniones tengo hoy"]**

> "Escribimos: 'Revisa mis correos y dime qué reuniones tengo hoy'. El Orchestrator va a analizar este input y determinar que necesita AMBOS agentes."

**[Acción: Click en "Ejecutar Agentes"]**

**[Mostrar: Indicador de carga → Resultados apareciendo]**

> "En segundo plano: el access token viaja del frontend al backend. El backend lo valida contra la clave pública de Auth0. El Orchestrator detecta las intenciones 'email' y 'calendar'. Ambos agentes se ejecutan en PARALELO. Y vemos los resultados consolidados."

**[Mostrar: Resultados del EmailAgent + CalendarAgent lado a lado]**

> "3 correos sin leer, una factura por vencer, el standup en 40 minutos y la demo del hackathon mañana. Todo esto en menos de un segundo."

---

## 🎬 SEGMENTO 3: EXPLICACIÓN TÉCNICA (2:00 - 2:40)

**[Pantalla: Diagrama de arquitectura animado]**

**Narrador:**

> "¿Cómo funciona técnicamente? El token de Auth0 nunca pasa por el navegador como texto plano. Vive en una cookie HttpOnly —JavaScript no puede leerla."

**[Highlight del BFF layer en el diagrama]**

> "El frontend llama a un proxy interno de Next.js, que recupera el token de la sesión y lo adjunta al request del backend. El backend valida el JWT con la clave pública de Auth0 usando JWKS."

**[Highlight del Token Vault en el diagrama]**

> "Y lo más importante: cuando los agentes necesitan tokens de Gmail o Google Calendar, los recuperan desde Auth0 Token Vault. Nuestra base de datos no almacena ni un solo token de terceros."

**[Mostrar: Tabla comparativa Sin Token Vault vs Con Token Vault]**

> "Cada agente solo tiene el scope que necesita. EmailAgent tiene read:email. CalendarAgent tiene read:calendar. Mínimo privilegio en práctica."

---

## 🎬 SEGMENTO 4: IMPACTO Y CIERRE (2:40 - 3:00)

**[Pantalla: Logo TokenMind AI + métricas]**

**Narrador:**

> "TokenMind AI demuestra que los agentes de IA pueden ser poderosos Y seguros. Con Auth0 Token Vault:"

**[Texto animado apareciendo:]**
> "✅ Zero tokens en tu base de datos"
> "✅ Mínimo privilegio por agente"
> "✅ OAuth 2.0 estándar de la industria"
> "✅ Escalable a cientos de servicios"

> "Esto no es una demo de juguete. Es la arquitectura que debería usar cualquier sistema de agentes de IA en producción. TokenMind AI, construido para el Hackathon Auth0 2024."

**[Fade out con URL del repo]**

---

## 📋 NOTAS DE PRODUCCIÓN

- **Duración total**: 3:00 minutos exactos
- **Resolución recomendada**: 1920x1080
- **Herramienta de grabación**: OBS Studio o Loom
- **Música de fondo**: Instrumental minimalista (sin copyright)
- **Capturas de pantalla clave**:
  1. Auth0 Universal Login (0:45)
  2. Pantalla de consentimiento de scopes (0:55)
  3. Dashboard con agentes (1:10)
  4. Input + ejecución (1:20)
  5. Resultados consolidados (1:45)
  6. Diagrama de arquitectura (2:00)
  7. Token Vault visual (2:20)

---

*Tiempo de práctica recomendado: 3-4 ensayos antes de la grabación final*
