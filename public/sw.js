self.addEventListener('install', (event) => {
  console.log('WaspAI Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Por ahora no hacemos cacheo, pero este listener es NECESARIO para que sea instalable
  return;
});
