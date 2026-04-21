# Decisiones de Arquitectura y Stack Tecnológico (Rationale)

Este documento detalla los fundamentos de ingeniería detrás de la selección del stack de **WaspAI**. Cada decisión fue tomada priorizando la escalabilidad, la observabilidad y la velocidad de entrega (Time-to-Market).

## 🚀 Core: Next.js 16 + TypeScript
**¿Por qué?**
- **Full-Stack Power**: Next.js es la herramienta más robusta del ecosistema JS para manejar tanto el renderizado de alta performance como la lógica de backend (Edge Functions / API Routes) en un solo lugar.
- **Type Safety**: El uso de TypeScript en modo estricto no es opcional. Para una plataforma de ingeniería, garantizar que los contratos de datos (interfaces) sean sólidos es vital para evitar errores en producción.
- **Server-Sent Events (SSE)**: La capacidad de manejar streaming nativo en las rutas de la API es clave para la experiencia "real-time" del chat de IA.

## 🛠️ Backend & Persistencia: Supabase (PostgreSQL)
**¿Por qué?**
- **Potencia sin Complejidad**: Supabase ofrece la potencia de una base de datos relacional madura (Postgres) sin la sobrecarga de gestionar infraestructura.
- **pgvector & RAG**: La integración nativa con extensiones de vectores permite que el "Local Brain" de WaspAI funcione de forma eficiente, permitiendo búsquedas semánticas sobre el código del usuario.
- **Auth SSR**: Se implementó una autenticación robusta del lado del servidor, eliminando vulnerabilidades comunes de seguridad (como guardar tokens sensibles en `localStorage`).

## 👁️ Observabilidad: Helicone & Sentry
**¿Por qué?**
- **Helicone (LLM Ops)**: Un sistema basado en IA que no se monitorea es una caja negra. Helicone nos permite trazar cada token, medir latencias y depurar prompts en tiempo real.
- **Sentry (Error Tracking)**: Implementamos Sentry en todos los niveles (Client, Server, Edge). Esto nos permite capturar errores de ejecución y ver "replays" de las sesiones de usuario para una reproducción exacta de los bugs.

## 🛡️ Calidad: Playwright & CI/CD
**¿Por qué?**
- **Playwright**: Los tests unitarios no bastan para flujos de IA. Playwright garantiza que el flujo completo (Login -> Chat -> Agent Switch) sea resiliente.
- **GitHub Actions**: Automatizamos el "patovica" del código. Nada llega a producción sin pasar el linting, el type-check y la suite de tests E2E.

---
*Criterio Técnico: Priorizar herramientas que ofrezcan observabilidad nativa y escalabilidad horizontal.*
