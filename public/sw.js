self.addEventListener('install', () => {
  console.log('WaspAI Service Worker installed');
});

self.addEventListener('fetch', () => {
  // Por ahora no hacemos cacheo, pero este listener es NECESARIO para que sea instalable
  return;
});
