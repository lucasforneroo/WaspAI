# AGENT.md — WaspAI (Fase 2)

Instrucciones de comportamiento para el agente de Antigravity trabajando en este repositorio.
Este archivo es la fuente de verdad sobre cómo operar en este proyecto.

---

## Identidad del proyecto

**WaspAI** es una plataforma de ingeniería de software avanzada (AI Staff Engineer Assistant) construida con **Next.js 15 + TypeScript + Supabase + Gemini API**.
El objetivo es un portafolio profesional diferenciador para un estudiante de Ingeniería en Computación.
No es un chatbot genérico: cada decisión técnica debe reflejar criterio de ingeniería, coherencia arquitectónica y escalabilidad.

---

## Principios de trabajo

### 1. Contexto antes de actuar

Antes de modificar cualquier archivo, leer:
- Este `AGENT.md`
- `Fase-2-WaspAI.md`
- Los archivos directamente relacionados con la tarea

No asumir el estado del proyecto. Verificar.

Con las respuestas que des, QUE CONSUMAN LA MENOR CANTIDAD DE TOKENS POSIBLE.

### 2. Cambios mínimos y enfocados

Hacer exactamente lo que se pide. No refactorizar código no relacionado con la tarea.
Si se detecta un problema fuera del scope, reportarlo en un comentario pero no tocarlo sin instrucción explícita.

### 3. Tipado Estricto (TypeScript)

Todo el nuevo código debe estar tipado. Evitar `any` salvo en integraciones externas donde los tipos estén rotos o sean excesivamente complejos (ej. SDKs de IA en transición).

### 4. Código production-ready por defecto

Todo el código generado debe asumir contexto de producción:
- Variables sensibles siempre en `.env.local`, nunca hardcodeadas
- Manejo de errores con `try/catch` y `Error Boundaries`
- Sin `console.log` de debug en código que va a producción
- Comentarios solo donde la lógica no es obvia

### 5. Preservar las decisiones de arquitectura

La estructura de carpetas y la separación de responsabilidades son decisiones intencionales. No reorganizar sin justificación explícita.

---

## Estructura del repositorio (Next.js App Router)

```
waspai/
├── src/
│   ├── app/            # Next.js App Router (Páginas y API Routes)
│   ├── components/     # Componentes de UI en TypeScript (.tsx)
│   ├── hooks/          # Hooks personalizados (.ts)
│   ├── prompts/        # System Prompts centralizados (.ts)
│   └── utils/          # Funciones de utilidad y configuración
├── public/             # Assets estáticos
├── _legacy/            # Código de la Fase 1 (Vite/Express) para referencia
├── next.config.ts
├── tailwind.config.ts
└── AGENT.md            # Este archivo
```

Trabajar siempre desde la raíz del repositorio. Rutas relativas desde ahí.

---


```js
// Funciones nombradas, no arrow functions en el módulo raíz
async function handleChat(req, res) { ... }

// Destructuring en parámetros y returns
const { messages, mode = 'review' } = req.body;

// Early return para manejo de errores
if (!messages?.length) {
  return res.status(400).json({ error: 'messages required' });
}

// try/catch en toda llamada a Anthropic API
try {
  const response = await anthropic.messages.create({ ... });
  res.json(response);
} catch (error) {
  console.error('[chat] Anthropic error:', error.message);
  res.status(500).json({ error: 'API error' });
}
```

### React

```jsx
// Componentes funcionales con nombre explícito
export default function CodeBlock({ code, language }) { ... }

// Props desestructuradas en la firma
// Estado local con useState, efectos con useEffect
// Lógica de negocio en hooks custom (hooks/), no en componentes
```

### Nombrado

- Archivos de componentes: `PascalCase.jsx`
- Hooks: `useCamelCase.js`
- Utilidades y rutas del servidor: `camelCase.js`
- Variables de entorno: `SCREAMING_SNAKE_CASE`
- Constantes de módulo: `SCREAMING_SNAKE_CASE`

---

## Sistema de prompts — reglas críticas

Los system prompts viven en `server/src/prompts/`. Son el corazón del producto.

### No modificar la estructura de output de los prompts sin actualizar el parser del cliente

El cliente parsea la respuesta buscando secciones específicas (`## Summary`, `## Issues`, etc.).
Si se cambia el formato en el prompt, hay que actualizar `client/src/utils/parseResponse.js` también.

### Formato de un system prompt válido

```js
// server/src/prompts/review.js
export const REVIEW_PROMPT = `
You are WaspAI, a senior software engineer assistant specialized in code review.
[...]

When reviewing code, ALWAYS structure your response as:
## Summary
## Issues
## Complexity
## Positives
`;
```

### Modos disponibles

| Modo | Archivo | Descripción |
|---|---|---|
| `review` | `prompts/review.js` | Análisis de código con severidades |
| `debug` | `prompts/debug.js` | Interpretación de stack traces |
| `explain` | `prompts/explain.js` | Explicación paso a paso |
| `refactor` | `prompts/refactor.js` | Mejora sin cambiar funcionalidad |

Agregar un modo nuevo requiere: crear el archivo de prompt + registrarlo en el objeto `PROMPTS` del endpoint + agregar la opción en `ModeSelector.jsx`.

---

## Variables de entorno

### Servidor (`server/.env`)

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Cliente (`client/.env`)

```env
VITE_API_URL=http://localhost:3001
```

Nunca commitear archivos `.env`. Verificar que `.gitignore` los excluya antes de cualquier commit.

---

## Flujo de trabajo para tareas

### Antes de empezar

1. Leer la tarea completa
2. Identificar qué archivos se van a tocar
3. Verificar si hay dependencias que actualizar
4. Si la tarea es ambigua, listar las asunciones antes de ejecutar

### Durante

1. Implementar el cambio mínimo necesario
2. Si se encuentran bugs no relacionados, documentarlos pero no tocarlos
3. Mantener consistencia con el estilo del archivo que se edita

### Al terminar

1. Verificar que no quedaron `console.log` de debug
2. Verificar que las variables de entorno no están hardcodeadas
3. Resumir qué se hizo y por qué en el mensaje de commit

### Formato de commits

```
tipo(scope): descripción corta en imperativo

feat(server): agregar modo refactor al endpoint de chat
fix(client): corregir parseo de respuestas con bloques de código vacíos
docs: actualizar README con instrucciones de deploy
refactor(prompts): separar prompts de review y debug en archivos individuales
```

Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Lo que NO hacer

- No agregar dependencias sin evaluar el impacto en bundle size (cliente) o cold start (servidor)
- No usar `any` en TypeScript si el proyecto migra a TS
- No modificar el system prompt de producción sin crear primero una versión de test
- No hacer llamadas directas a la Anthropic API desde el cliente (expone la API key)
- No cambiar la estructura de carpetas sin actualizar este archivo
- No asumir que el código existente está correcto — verificar antes de extender

---

## Criterio de calidad

Una tarea está completa cuando:

- El código funciona según lo pedido
- Maneja los casos de error obvios
- Es consistente con el resto del codebase
- No introduce deuda técnica innecesaria
- Está documentado si la lógica no es autoevidente

El objetivo de WaspAI es ser un proyecto de portafolio que demuestre criterio de ingeniería.
Cada archivo, cada decisión y cada commit contribuye a esa narrativa.

---

*Mantener este archivo actualizado cuando cambie la arquitectura, el stack o las convenciones.*