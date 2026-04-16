/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

test.describe('WaspAI Chat Workflow', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // Seteamos la cookie de bypass para el middleware
    await context.addCookies([{
      name: 'playwright-skip-auth',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }]);

    const supabaseRef = 'qwluobsozettpfrzppyg';
    const authData = {
      access_token: 'fake-token',
      refresh_token: 'fake-refresh',
      user: { id: 'test-user', email: 'tester@waspai.ai' },
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };

    // Mock de la sesión de Supabase para el cliente (localStorage)
    await page.addInitScript(({ ref, data }) => {
      window.localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(data));
    }, { ref: supabaseRef, data: authData });

    // Mock de la llamada a Supabase Auth para que el cliente no se entere
    await page.route(`https://${supabaseRef}.supabase.co/auth/v1/user`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(authData.user),
      });
    });

    // MATAMOS las animaciones y el BLUR que confunde a Playwright
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
/* eslint-disable @typescript-eslint/no-explicit-any */
          animation-duration: 0s !important;
/* eslint-disable @typescript-eslint/no-explicit-any */
          animation-iteration-count: 1 !important;
/* eslint-disable @typescript-eslint/no-explicit-any */
          transition-duration: 0s !important;
/* eslint-disable @typescript-eslint/no-explicit-any */
          scroll-behavior: auto !important;
/* eslint-disable @typescript-eslint/no-explicit-any */
          backdrop-filter: none !important;
/* eslint-disable @typescript-eslint/no-explicit-any */
          -webkit-backdrop-filter: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Interceptamos la llamada a /api/chat para no gastar tokens reales
    await page.route('**/api/chat', async (route) => {
      const body = route.request().postDataJSON();
      let responseText = '';

      if (body.config?.agent === 'architecture') {
        responseText = '```mermaid\ngraph TD\nA["Test Node"] --> B["Result"]\n```\n# Success';
      } else if (body.config?.agent === 'security') {
        responseText = '[SEVERITY: HIGH]\n# 🛡️ Security Audit\nVulnerability detected in test mock.';
      } else {
        responseText = 'I am WaspAI General Assistant. How can I help?';
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: `data: ${JSON.stringify({ text: responseText })}\n\ndata: [DONE]\n\n`,
      });
    });

    await page.goto('/', { waitUntil: 'load' });
    // Esperamos explícitamente a que el textarea esté listo antes de arrancar
    await page.waitForSelector('textarea', { state: 'visible', timeout: 30000 });
  });

  // Función de ayuda para inyección lateral de input (Opción A) con Foco
  const sendLateralInput = async (page: any, selector: string, text: string) => {
    const el = page.locator(selector);
    await el.waitFor({ state: 'visible', timeout: 30000 });
    await el.focus();
    await page.evaluate(({ sel, val }: { sel: string, val: string }) => {
      const element = document.querySelector(sel) as HTMLTextAreaElement;
      if (element) {
        element.focus();
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeSetter?.call(element, val);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { sel: selector, val: text });
  };

  // Función de ayuda para Clicks Lateral (Evita intercepciones)
  const lateralClick = async (page: any, selector: string) => {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    await locator.click({ force: true });
  };

  test('should create a new chat and switch to Architecture Agent', async ({ page }) => {
    const textareaSelector = 'textarea';
    const sendButton = 'button:has(svg.lucide-arrow-up)';

    // 1. Escribir un mensaje inicial
    await sendLateralInput(page, textareaSelector, 'Generame un diagrama de prueba');
    await lateralClick(page, sendButton);

    // 2. Cambiar a modo Arquitectura
    await lateralClick(page, 'button:has-text("Active Agent")');
    const archAgentBtn = 'button:has-text("Mapeo de Arquitectura")';
    await lateralClick(page, archAgentBtn);

    // 3. Enviar comando de arquitectura
    await sendLateralInput(page, textareaSelector, 'Ahora hacelo con arquitectura real');
    await lateralClick(page, sendButton);

    // 4. Verificar que el MermaidRenderer aparezca
    await expect(page.locator('text=Architecture Pattern')).toBeVisible({ timeout: 30000 });
  });

  test('should detect security severity and apply pulse animation', async ({ page }) => {
    const textareaSelector = 'textarea';
    const sendButton = 'button:has(svg.lucide-arrow-up)';

    // 1. Cambiar a Agente de Seguridad
    await lateralClick(page, 'button:has-text("Active Agent")');
    const secAgentBtn = 'button:has-text("Agente de Seguridad")';
    await lateralClick(page, secAgentBtn);

    // 2. Enviar mensaje de prueba
    await sendLateralInput(page, textareaSelector, 'Analizá este código inseguro');
    await lateralClick(page, sendButton);

    // 3. Verificar que el mensaje tenga la clase de animación roja (HIGH)
    await expect(page.locator('.animate-pulse-red')).toBeVisible({ timeout: 30000 });
  });
});
