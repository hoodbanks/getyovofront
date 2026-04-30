import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyCeCdwlyD64rHSVJjFBgZ1v2y144LHRJZM",
    authDomain: "getyovo-b65d7.firebaseapp.com",
    projectId: "getyovo-b65d7",
    storageBucket: "getyovo-b65d7.firebasestorage.app",
    messagingSenderId: "114488270158",
    appId: "1:114488270158:web:9395101459b41af86b121f",
    measurementId: "G-P61VLRDZNG"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
