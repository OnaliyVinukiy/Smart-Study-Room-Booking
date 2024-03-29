
// Export Firebase services
export const auth = firebase.auth();
export const database = firebase.database();
import { initializeApp } from"firebase/app";
import { getFirestore } from"@firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyAu2pQmgW_fMd5HgNTxKFnlnx7T-3Nh174",
    authDomain: "smart-study-room.firebaseapp.com",
    projectId: "smart-study-room",
    storageBucket: "smart-study-room.appspot.com",
    messagingSenderId: "891167754370",
    appId: "1:891167754370:web:f536057f0e886e52914c9b",
    measurementId: "G-JLV5BZWB6G"
};


const app = initializeApp(firebaseConfig);
// exportconst firestore = getFirestore(app)