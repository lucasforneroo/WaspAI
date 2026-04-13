# Fase 2: Robustez, Persistencia y RAG (Retrieval-Augmented Generation)

Bienvenido a la segunda fase de evolucion de **WaspAI**. En esta etapa, dejamos de ser un "chat de una sola página" para convertirnos en una **plataforma de ingeniería de software** robusta y escalable.

## Objetivos Principales

1.  **Migración a Arquitectura Unificada**: Transición de React+Express (cliente/servidor separado) a **Next.js (App Router)** para mejorar el rendimiento, el SEO y la facilidad de despliegue.
2.  **Infraestructura con Supabase**: Integrar una capa de persistencia profesional que incluya Autenticación, Base de Datos Relacional y Almacenamiento Vectorial.
3.  **Inteligencia de Contexto (RAG)**: Implementar una tubería de procesamiento que permita a WaspAI "leer" y "entender" todo el repositorio local mediante búsqueda semántica.

---

## 🏗️ Nueva Arquitectura: El Stack de Élite

### 1. Framework: Next.js + Tailwind CSS
- **Unified Stack**: Backend y Frontend conviven en un solo repositorio, facilitando la comunicación y el tipado.
- **Server Components**: Renderizado híbrido para una velocidad de carga instantánea.
- **Streaming Nativo**: Mejoras en la implementación del flujo de respuesta de la IA.

### 2. Backend-as-a-Service: Supabase
- **Auth**: Autenticación segura via GitHub (OAuth). Solo devs autorizados pueden usar la herramienta.
- **PostgreSQL**: Almacenamiento de sesiones de chat, proyectos y metadatos de archivos.
- **Vector Database (pgvector)**: Almacenamiento de "embeddings" de código para permitir búsqueda semántica.

---

## 🧠 Proyecto "Cerebro Local" (RAG)

La gran diferencia de esta fase es que la IA dejará de depender de lo que el usuario pegue en el chat.

1.  **Indexing**: Un script leerá los archivos del repositorio (respetando el `.gitignore`).
2.  **Embedding**: Gemini generará vectores matemáticos que representan el significado técnico de cada función, clase o archivo.
3.  **Vector Search**: Cuando el usuario pregunte *"¿Dónde se manejan los errores de la API?"*, el sistema buscará los fragmentos de código más relevantes en Supabase y se los pasará a Gemini como contexto automático.

---

## 🗺️ Roadmap de la Fase 2

### Paso 1: Inicialización de Next.js
- Crear la estructura de Next.js en el directorio raíz.
- Portar los componentes de la UI (Chat, MessageBubble, ModeSelector) al nuevo sistema.
- Migrar la lógica de `chat.js` a **Route Handlers** de Next.js.

### Paso 2: Configuración de Supabase
- Crear el proyecto en Supabase Cloud.
- Implementar el flujo de Login con GitHub.
- Crear las tablas de `chats` y `messages` para persistencia.

### Paso 3: Motor de Contexto (Vector Search)
- Configurar la extensión `pgvector` en Supabase.
- Implementar el script de indexación local.
- Conectar la IA para que use el contexto recuperado en cada respuesta.

---

## 📏 Criterios de Éxito para esta Fase

- [ ] Un solo comando para levantar todo el proyecto (`npm run dev`).
- [ ] Persistencia real: Refrescar la página no borra el chat.
- [ ] Búsqueda semántica: La IA responde preguntas sobre archivos que no están abiertos en ese momento.
- [ ] Seguridad: Solo usuarios logueados con GitHub pueden acceder al dashboard.

---
*Fase 2: De un Chatbot a un Senior Architect Assistant.*
