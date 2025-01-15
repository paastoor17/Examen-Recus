import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAISbU2RrjlH9s8-tNKYSGJdaLB4P1-UsQ",
    authDomain: "examen-recus-53a51.firebaseapp.com",
    projectId: "examen-recus-53a51",
    storageBucket: "examen-recus-53a51.firebasestorage.app",
    messagingSenderId: "282426922837",
    appId: "1:282426922837:web:55cea477eedd2749fa81dc",
    measurementId: "G-SYG48MW8JD"
  };

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
const db = getFirestore(app);

export { db };
