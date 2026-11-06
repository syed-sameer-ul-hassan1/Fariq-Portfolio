import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyBklsmSaEGCZKSgk5shJmzaR-58IErUqTs",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "fariq-site-portfolio.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "fariq-site-portfolio",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "fariq-site-portfolio.firebasestorage.app",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "40331884085",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:40331884085:web:a430a4f00f13d1ef2c237c",
};

function getFirebaseApp() {
  const currentApps = getApps();
  if (currentApps.length > 0) {
    const existingApp = currentApps.find((a) => a.name === "[DEFAULT]") || currentApps[0];
    if (existingApp.options.apiKey === firebaseConfig.apiKey) {
      return existingApp;
    }
    deleteApp(existingApp);
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
export const db = getFirestore(app);
