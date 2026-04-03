// Progressive enhancement — register service worker only in production
export function registerServiceWorker(): void {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[e-Dent] SW registered, scope:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // every hour
      })
      .catch((error) => {
        console.warn('[e-Dent] SW registration failed:', error);
      });
  });
}
