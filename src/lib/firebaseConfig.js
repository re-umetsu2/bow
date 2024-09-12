import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD286xsH686PV110183viRxLWUEy87yYBY",
    authDomain: "bow-space-3b810.firebaseapp.com",
    projectId: "bow-space-3b810",
    storageBucket: "bow-space-3b810.appspot.com",
    messagingSenderId: "1036416873492",
    appId: "1:1036416873492:web:cec16e81f69c146b8ea301"  
};  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };