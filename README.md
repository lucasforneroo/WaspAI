# 🐝 WaspAI: The Engineering Terminal

![WaspAI Banner](/public/logo.png)

> **WaspAI** no es solo otro chat de IA; es una terminal de ingeniería avanzada diseñada para arquitectos y desarrolladores que buscan precisión, observabilidad y una identidad visual disruptiva.

---

## 🚀 Visión General

WaspAI es una plataforma "AI-First" construida sobre **Next.js 16**, optimizada para flujos de trabajo de ingeniería de software. Utiliza un ecosistema de agentes especializados para tareas de arquitectura, auditoría de seguridad y refactorización, todo bajo una infraestructura blindada.

## 🛠️ Stack Tecnológico (The Power House)

### Core
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Runtime:** Node.js 20+
- **Lenguaje:** TypeScript (Strict Mode)
- **Estilos:** Tailwind CSS 4 + Framer Motion (Animaciones de alto rendimiento)

### IA & Agentes
- **LLM Engine:** Google Gemini Pro / Flash
- **Observabilidad:** [Helicone](https://helicone.ai) (Monitoreo de latencia, costos y trazabilidad de prompts)
- **Arquitectura:** Agentes especializados con capacidades de renderizado Mermaid.js en tiempo real.

### Backend & Persistencia
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase SSR Auth
- **Real-time:** WebSockets / SSE para streaming de respuestas.

---

## 🛡️ Infraestructura de Calidad (Zero Trust Engineering)

En WaspAI, la estabilidad no es negociable. Hemos implementado un ecosistema de herramientas para asegurar la resiliencia del sistema:

### 1. Monitoreo & Error Tracking (Sentry)
- **Integración:** SDK oficial `@sentry/nextjs`.
- **Alcance:** Captura de errores en el Cliente, Servidor y Edge Runtime.
- **Source Maps:** Subida automática de mapas de código en cada build para debugueo preciso.
- **Session Replay:** Grabación visual de errores para una reproducción exacta del problema.

### 2. Observabilidad de LLMs (Helicone)
- Proxy inteligente para trackear cada token gastado.
- Análisis de performance de prompts y detección de cuellos de botella en la IA.

### 3. Testing E2E (Playwright)
- Suite completa de tests de extremo a extremo.
- Pruebas automáticas de flujos de chat, login y cambio de agentes.
- Reportes HTML generados automáticamente en fallos.

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

Cada `push` a la rama principal dispara un flujo de trabajo automatizado que actúa como el "patovica" del código:

1.  **Instalación Limpia:** Verificación de integridad de dependencias.
2.  **Linting:** Validación de estándares de código (ESLint).
3.  **Type-check:** Validación estricta de tipos de TypeScript.
4.  **Build Check:** Verificación de que la aplicación compila correctamente.
5.  **E2E Validation:** Ejecución de la suite de Playwright en un entorno de producción simulado.

---

## 🎨 Identidad Visual (The Wasp Identity)

WaspAI utiliza una estética **Cyberpunk-Minimalista**.
- **Colores:** Violeta Profundo, Gris Carbón y Amarillo Eléctrico (Wasp Yellow).
- **UX:** Animaciones de "flotado" dinámico, Light Pillars procesados por WebGL y efectos de Glassmorphism.

---

## 📂 Estructura del Proyecto

```bash
WaspAI/
├── .github/workflows/    # Automatización CI/CD
├── public/               # Assets estáticos (Logo, Iconos)
├── src/
│   ├── app/             # Rutas, API y Lógica de servidor
│   ├── components/      # Componentes UI (Atomic Design)
│   ├── hooks/           # Lógica de estado y Chat
│   ├── prompts/         # "Cerebro" de los agentes
│   └── utils/           # Clientes de Supabase y Helpers
├── tests/               # Suite de Playwright
└── sentry.*.config.ts   # Configuraciones de monitoreo
```

## 🚀 Instalación y Desarrollo

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Configurar variables de entorno (`.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `HELICONE_API_KEY`
   - `SENTRY_AUTH_TOKEN`
4. Correr en desarrollo: `npm run dev`.
5. Correr calidad local: `npm run lint` && `npm run type-check`.

---

## 📄 Licencia

Desarrollado con ❤️ para ingenieros que no se conforman con lo básico. WaspAI es una herramienta de alta precisión.

---
*Este proyecto está bajo monitoreo constante. Los errores son una oportunidad de mejora.* 🐝🚀
