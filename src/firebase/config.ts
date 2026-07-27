import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Fill these in from your Firebase project settings:
// Firebase Console -> Project settings (gear icon) -> General ->
// "Your apps" -> Web app -> SDK setup and configuration -> Config.
// These values are safe to ship in the app — they identify your project,
// they are not secret credentials. Access is controlled by Firestore
// Security Rules instead (see firestore.rules in the repo root).
const firebaseConfig = {
  apiKey: 'AIzaSyAGVL0nJwU9I1PSvztKHj22uGYqnTvuf9U',
  authDomain: 'travel-cost-72e25.firebaseapp.com',
  projectId: 'travel-cost-72e25',
  storageBucket: 'travel-cost-72e25.firebasestorage.app',
  messagingSenderId: '830185487486',
  appId: '1:830185487486:web:03e9b90a9b138a957aec2f',
};

export const firebaseApp = initializeApp(firebaseConfig);
// React Native's networking stack doesn't support the streaming transport
// Firestore uses by default (that's a browser-only mechanism) — without
// forcing long-polling, writes/listens silently queue locally and never
// actually reach the server, even though the app looks like it's working.
export const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});
