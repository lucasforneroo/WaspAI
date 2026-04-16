# Fase 2: Agentes Especializados y Next.js 16

En esta fase, **WaspAI** dejó de ser un juguete para convertirse en una plataforma de elite. Migramos todo a **Next.js 16 + React 19**.

## 🚀 Lo que añadimos
- **Migración a Next.js (App Router):** Unificamos el stack. Ahora el backend son **Route Handlers** y el frontend usa **Server Components**. Ganamos velocidad y simplicidad.
- **Agentes con Personalidad:** 
    - **Mapeo de Arquitectura:** Genera diagramas de flujo y mapas de componentes.
    - **Agente de Seguridad:** Realiza auditorías de código buscando vulnerabilidades (OWASP, inyecciones, etc.).
    - **Agente de Refactor:** Sugiere mejoras de performance y legibilidad sin cambiar la lógica.
- **Supabase Integration:** Pasamos a usar Supabase para Auth, Base de Datos (PostgreSQL) y almacenamiento vectorial (`pgvector`) para el RAG avanzado.
- **Tailwind 4:** Actualizamos a la última versión para aprovechar las nuevas capacidades de diseño y performance.

## 🛠️ ¿Cómo lo hicimos?
- **Contexto Centralizado:** Creamos una carpeta `src/prompts/` donde centralizamos toda la inteligencia de los agentes en archivos TypeScript tipados.
- **Vector Search:** Implementamos un script que genera embeddings de tu código y los guarda en Supabase, permitiendo que la IA responda sobre archivos que ni siquiera tenés abiertos.

## 🚧 Donde nos estancamos (The "Stuck" Moments)
- **React 19 & Types:** Al usar versiones tan nuevas, muchos tipos de librerías externas estaban rotos. Tuvimos que meterle mano a los `d.ts` y usar `overrides` en el `package.json` para que todo compile.
- **Hydration Errors:** Con el App Router y componentes pesados de Three.js, tuvimos errores de hidratación donde el server renderizaba una cosa y el cliente otra. Lo arreglamos usando `dynamic` imports y chequeando el montaje del componente.
- **Streaming de Respuestas:** Hacer que la IA "escriba" en tiempo real con Next.js Route Handlers fue un desafío técnico de cabeceras HTTP y `ReadableStream`.

---
*Alexa: "Si no te rompe algo al migrar a la última versión, es que no estás innovando lo suficiente. Next 16 es el futuro, y WaspAI ya está ahí."*
