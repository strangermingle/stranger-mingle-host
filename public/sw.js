// Service Worker for Stranger Mingle Host Portal
// Handles background push events, incoming call alerts when mobile screen is off

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '📞 Incoming Call - Stranger Mingle';
    const options = {
      body: data.body || 'A member is calling you. Tap to answer now!',
      icon: data.icon || '/icons/call-icon.png',
      badge: data.badge || '/icons/call-icon.png',
      tag: data.tag || 'incoming-call',
      requireInteraction: true,
      vibrate: data.vibrate || [500, 250, 500, 250, 500, 250, 500],
      data: data.data || {},
      actions: data.actions || [
        { action: 'answer', title: 'Answer Call 📞' },
        { action: 'open', title: 'Open Dashboard' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[ServiceWorker] Error displaying push notification:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/phone-a-friend';

  if (notifData.callId) {
    targetUrl = `/phone-a-friend/call/${notifData.callId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
