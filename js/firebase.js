import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAidZ51UJWUj5HWEpY2Z6KmA5u3HjksxyY",
    authDomain: "robotics-scout.firebaseapp.com",
    projectId: "robotics-scout",
    storageBucket: "robotics-scout.firebasestorage.app",
    messagingSenderId: "844771332912",
    appId: "1:844771332912:web:f382d246db83fd5ae02ef5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
