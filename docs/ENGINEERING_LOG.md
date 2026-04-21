# Engineering Log: Desafíos Técnicos y Soluciones

En el desarrollo de software real, el camino nunca es lineal. Este log documenta los problemas críticos enfrentados durante la Fase 2 de WaspAI y cómo se resolvieron con criterio de ingeniería.

## 1. Desincronización de la API de Google Gemini (v1beta vs v1)
- **Problema**: La API `v1beta` empezó a retornar errores 404 para modelos estables como `gemini-1.5-flash` en ciertas regiones. Al migrar a `v1`, el campo `systemInstruction` generaba un error 400 (Bad Request).
- **Análisis**: El SDK de Google y los proxies (Helicone) tenían desajustes en el esquema del JSON para la versión estable.
- **Solución**: Se implementó una técnica de **"Manual System Prompt Injection"**. Eliminamos el campo problemático del JSON y prependizamos las instrucciones del sistema directamente en el mensaje del usuario. Esto garantizó compatibilidad total con cualquier versión de la API.

## 2. Errores de Hidratación en React (Error #418)
- **Problema**: El navegador intentaba renderizar configuraciones viejas guardadas en `localStorage` que chocaban con el renderizado inicial del servidor.
- **Análisis**: Un "mismatch" entre el estado del servidor y el cliente.
- **Solución**: Se robusteció la lógica de carga de `settings` y se implementó un mecanismo de limpieza de configuraciones obsoletas para evitar colisiones de estado en el despliegue.

## 3. Optimización de UI para Terminales de Ingeniería
- **Problema**: El diseño inicial era demasiado "pesado" visualmente, ocupando espacio vital con logos gigantes y rellenos innecesarios, lo que provocaba scroll excesivo.
- **Análisis**: Un Staff Engineer necesita densidad de información, no adornos visuales.
- **Solución**: Refactorizamos el layout a un formato compacto y horizontal. Redujimos el ancho del sidebar un 15% y compactamos el input area un 20%. El resultado es una interfaz que permite ver más código con menos distracciones.

## 4. Middleware vs Proxy en Next.js 16
- **Problema**: Aparecieron advertencias sobre la depreciación de archivos `middleware` en favor de configuraciones de proxy estáticas.
- **Análisis**: Evaluamos si podíamos migrar, pero determinamos que al usar lógica de sesión dinámica de Supabase (refresh de tokens en cada request), el middleware es el patrón arquitectónico correcto para este caso de uso.
- **Solución**: Se mantuvo el middleware con una documentación clara de por qué es una excepción necesaria a la regla de optimización estática.

---
*Conclusión de Gestión: Cada error fue una oportunidad para robustecer la infraestructura y mejorar la resiliencia del sistema.*
