import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBcUZ5SNmIHLf6oIxPfDfyR8jLYOtLNnSs",
    authDomain: "bow-space-app.firebaseapp.com",
    projectId: "bow-space-app",
    storageBucket: "bow-space-app.appspot.com",
    messagingSenderId: "288363952709",
    appId: "1:288363952709:web:af126d038258637de2012c"  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };