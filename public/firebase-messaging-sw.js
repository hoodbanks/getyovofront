// Firebase Messaging Service Worker
// Must be in the /public root so the browser can register it at the correct scope

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCeCdwlyD64rHSVJjFBgZ1v2y144LHRJZM",
    authDomain: "getyovo-b65d7.firebaseapp.com",
    projectId: "getyovo-b65d7",
    storageBucket: "getyovo-b65d7.firebasestorage.app",
    messagingSenderId: "114488270158",
    appId: "1:114488270158:web:9395101459b41af86b121f",
    measurementId: "G-P61VLRDZNG"
});

const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'GetYovo';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/vite.svg',
        badge: '/vite.svg',
        data: payload.data || {},
        vibrate: [200, 100, 200],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — bring the app to focus
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
