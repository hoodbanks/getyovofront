import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const BASE_URL = 'https://api.getyovo.app/api/v1';

/**
 * useFCM — Requests notification permission, retrieves the FCM token,
 * registers it with the backend, and listens for foreground messages.
 *
 * @param {string|null} accessToken  - Rider bearer token (skip registration if null)
 * @param {function}    onForegroundMessage - Optional callback for in-app notifications
 */
const useFCM = (accessToken, onForegroundMessage) => {
    const registeredToken = useRef(null);

    useEffect(() => {
        if (!accessToken) return;

        let unsubscribe;

        const initFCM = async () => {
            try {
                // 1. Request notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.info('[FCM] Notification permission denied.');
                    return;
                }

                // 2. Register the service worker
                const swRegistration = await navigator.serviceWorker.register(
                    '/firebase-messaging-sw.js'
                );

                // 3. Get FCM token
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                    serviceWorkerRegistration: swRegistration,
                });

                if (!token) {
                    console.warn('[FCM] No token received.');
                    return;
                }

                // Skip if we already registered this token in this session
                if (registeredToken.current === token) return;
                registeredToken.current = token;

                // 4. Register token with backend
                const response = await fetch(`${BASE_URL}/device-token/rider`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                        role: 'RIDER', // Backend requirement for rider actions
                    },
                    body: JSON.stringify({ fcmToken: token }),
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                console.info('[FCM] Token registered successfully.');
            } catch (err) {
                // Non-fatal — notifications simply won't work
                console.warn('[FCM] Initialization failed:', err.message);
            }

            // 5. Listen for foreground messages (app is open)
            unsubscribe = onMessage(messaging, (payload) => {
                console.log('[FCM] Foreground message:', payload);
                if (typeof onForegroundMessage === 'function') {
                    onForegroundMessage(payload);
                }
            });
        };

        initFCM();

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [accessToken]);
};

export default useFCM;
