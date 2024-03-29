import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database'; // If you're using Realtime Database
import 'firebase/compat/auth';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const firebaseConfig = {
  apiKey: "AIzaSyAu2pQmgW_fMd5HgNTxKFnlnx7T-3Nh174",
  authDomain: "smart-study-room.firebaseapp.com",
  projectId: "smart-study-room",
  storageBucket: "smart-study-room.appspot.com",
  messagingSenderId: "891167754370",
  appId: "1:891167754370:web:f536057f0e886e52914c9b",
  measurementId: "G-JLV5BZWB6G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
