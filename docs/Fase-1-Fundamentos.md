# Fase 1: Fundamentos y MVP (Vite + Express)

Esta fase fue el nacimiento de **WaspAI**. Pasamos de una idea a un producto funcional que ya demostraba criterio de ingeniería.

## 🚀 Lo que añadimos
- **Arquitectura desacoplada:** Cliente en React (Vite) y Servidor en Node.js (Express). Separar responsabilidades desde el día 1 fue clave para la escalabilidad.
- **Modos de IA especializados:** Implementamos los modos `review`, `explain` y `debug`. No es un prompt genérico; cada uno tiene una estructura de output (Summary, Issues, Complexity) que el cliente parsea para mostrar una UI limpia.
- **Auth con GitHub:** Integramos OAuth para que solo desarrolladores reales usen la herramienta, dándole un toque profesional.
- **Estilos y UI "Fachera":** Usamos **Tailwind CSS** y componentes de **React Bits** (como el `Dock` interactivo) para que la app no solo funcione bien, sino que se vea increíble.
- **Local Brain con RAG (Valiente intento):** Empezamos a experimentar con la búsqueda semántica (Retrieval Augmented Generation) para que la IA pudiera "leer" archivos locales.

## 🛠️ ¿Cómo lo hicimos?
- **Parser de Markdown:** Creamos una utilidad para detectar secciones en la respuesta de la IA (`## Summary`, etc.) y convertirlas en componentes visuales con badges de severidad.
- **System Prompts:** Diseñamos prompts en capas (Identidad -> Estructura -> Reglas) para asegurar respuestas deterministas.

## 🚧 Donde nos estancamos (The "Stuck" Moments)
- **El drama del CORS:** Al tener cliente y servidor separados, estuvimos un buen rato peleando con las políticas de CORS hasta que configuramos correctamente los headers en Express.
- **Parseo de Mermaid:** Al principio, la IA mandaba diagramas de Mermaid que rompían el render. Tuvimos que ajustar el prompt para que SIEMPRE use bloques de código limpios y un componente `MermaidRenderer` con manejo de errores.
- **Tokens de Auth:** Manejar la persistencia de la sesión de GitHub en un entorno desacoplado nos dio un par de dolores de cabeza hasta que estandarizamos el uso de JWT y cookies.

---
*Alexa: "El MVP no tiene que ser perfecto, tiene que ser demostrable y sólido. Y acá lo logramos, loco."*
