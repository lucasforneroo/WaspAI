# WaspAI — Fase inicial del proyecto

> Asistente de IA especializado en herramientas para desarrolladores.
> Stack: React + Node.js + Anthropic API · Objetivo: portafolio profesional diferenciador.

---

## Visión del proyecto

WaspAI es un AI chat especializado en dev tools, diseñado para que los desarrolladores obtengan reviews de código, asistencia en debugging y explicaciones técnicas con la precisión de un Staff Engineer. No es un chatbot genérico: cada modo tiene un comportamiento, estructura de output y contexto específico que lo hace sentir como un producto real.

---

## Objetivos de la fase inicial (semanas 1–3)

El MVP tiene un único criterio de éxito: **ser demostrable**. Al final de esta fase, WaspAI debe estar deployado, funcional y con al menos un modo completo que impresione en una revisión de portafolio.

### Entregables concretos

- Chat funcional con syntax highlighting en el input y output
- Code Review Mode operativo con estructura de respuesta parseada
- System prompt especializado configurado y documentado
- Deploy en Vercel con URL pública
- README inicial con descripción del proyecto y decisiones técnicas

---

## Arquitectura del MVP

```
waspai/
├── client/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx         # Componente principal de conversación
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── CodeBlock.jsx    # Syntax highlighting con highlight.js
│   │   │   └── ModeSelector.jsx # Switcher entre Review / Debug / Explain
│   │   ├── hooks/
│   │   │   └── useChat.js       # Lógica de mensajes y estado
│   │   └── App.jsx
│   └── vite.config.js
│
├── server/                  # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.js          # POST /api/chat
│   │   ├── prompts/
│   │   │   ├── review.js        # System prompt: Code Review
│   │   │   ├── debug.js         # System prompt: Debug Assistant
│   │   │   └── explain.js       # System prompt: Explain Mode
│   │   └── index.js
│   └── .env
│
└── README.md
```

---

## Stack técnico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React + Vite | Rápido para iterar, conocido, fácil de deployar |
| Estilos | Tailwind CSS | Utilidades sin perder tiempo en CSS custom |
| Syntax highlight | highlight.js | Liviano, sin dependencias pesadas |
| Backend | Node.js + Express | Mismo lenguaje que el frontend, API REST simple |
| IA | Anthropic API (claude-sonnet-4) | Mejor relación calidad/costo para dev tasks |
| Deploy | Vercel (client) + Railway (server) | Gratis en tier inicial, fácil CI/CD |

---

## System prompt — diseño en capas

El system prompt es el diferenciador central del proyecto. Se construye en cuatro capas:

**Capa 1 — Identidad:** Define quién es WaspAI y su estilo de comunicación. Directo, constructivo, con nivel de Staff Engineer.

**Capa 2 — Estructura de output:** Obliga al modelo a responder siempre con secciones fijas (`## Summary`, `## Issues`, `## Complexity`, `## Positives`). Esto permite parsear la respuesta en el cliente y renderizar cada sección con su propio componente.

**Capa 3 — Detección de lenguaje:** El modelo detecta automáticamente Python, JS/TS, Go, etc. y adapta las convenciones de su review. Nunca le pregunta al usuario qué lenguaje usa.

**Capa 4 — Reglas de comportamiento:** Define límites negativos: no reproducir el código completo, no dar respuestas genéricas, asumir contexto de producción siempre.

El sistema soporta múltiples modos mediante un switcher de prompts en el backend:

```js
const PROMPTS = { review, debug, explain, refactor };

app.post('/api/chat', async (req, res) => {
  const { messages, mode = 'review' } = req.body;
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: PROMPTS[mode],
    messages,
  });
  res.json(response);
});
```

---

## Checklist de la fase inicial

### Semana 1 — Fundación

- [ ] Crear repositorio con estructura de carpetas definida
- [ ] Configurar Vite + React + Tailwind
- [ ] Configurar Express + dotenv + cors
- [ ] Integrar Anthropic SDK en el backend
- [ ] Endpoint `POST /api/chat` funcional
- [ ] Componente `Chat.jsx` básico conectado al backend

### Semana 2 — Code Review Mode

- [ ] Diseñar y testear system prompt de Code Review
- [ ] Implementar `CodeBlock.jsx` con syntax highlighting
- [ ] Parsear respuesta del modelo por secciones (Summary / Issues / Complexity / Positives)
- [ ] Renderizar badges de severidad (CRITICAL / WARNING / SUGGESTION)
- [ ] `ModeSelector.jsx` que switchea el system prompt en el backend

### Semana 3 — Deploy y pulido

- [ ] Variables de entorno configuradas para producción
- [ ] Deploy del cliente en Vercel
- [ ] Deploy del servidor en Railway
- [ ] Testing manual completo con código real
- [ ] README inicial con: descripción, demo link, stack, decisiones técnicas
- [ ] Screenshot o GIF del producto funcionando

---

## Decisiones técnicas documentadas

Documentar estas decisiones en el README es lo que diferencia un portafolio amateur de uno profesional. Para cada decisión, el formato es: **qué se eligió → por qué → qué se descartó y por qué no**.

**Por qué Anthropic API y no OpenAI:** El acceso a `claude-sonnet-4` ofrece mejor razonamiento en tareas de análisis de código, y el formato de respuesta es más predecible para parsear secciones estructuradas.

**Por qué un backend propio y no llamadas directas desde el cliente:** Protección de la API key, posibilidad de agregar rate limiting, logging de sesiones y autenticación en fases posteriores sin refactorizar el cliente.

**Por qué modos con system prompts distintos y no un prompt genérico:** Un prompt especializado por modo produce respuestas con estructura diferente, tono diferente y contexto diferente. El resultado es más preciso y la UI puede adaptarse a cada modo.

---

## Próximos pasos (fase 2 — semanas 4–6)

Una vez deployado el MVP, la siguiente fase incorpora:

- Autenticación con Clerk
- Historial de conversaciones persistente en PostgreSQL
- Debug Assistant con interpretación de stack traces
- Mejoras de UI: diff visual de código, animaciones de carga

---

*Documento generado como guía de desarrollo. Última actualización: fase inicial.*