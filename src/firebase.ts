import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDk_hfcU9hwgszNJUsepULn1xg0EhEMZgQ",
    authDomain: "mex-hinge-reboot.firebaseapp.com",
    databaseURL: "https://mex-hinge-reboot-default-rtdb.firebaseio.com", 
    projectId: "mex-hinge-reboot",
    storageBucket: "mex-hinge-reboot.firebasestorage.app",
    messagingSenderId: "37494493409",
    appId: "1:37494493409:web:6f0ac4ed61dd82115967a0",
    measurementId: "G-Y1GT3G6EM4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);