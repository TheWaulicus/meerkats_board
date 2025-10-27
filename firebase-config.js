// Firebase Configuration
// Replace this with your own Firebase project configuration
// Get your config from: https://console.firebase.google.com/
// Project Settings > General > Your apps > Web app > Config

const firebaseConfig = {
  apiKey: "AIzaSyAlH1akwhAgGwAN8ll2Q5Ytyg0izzVogsM",
  authDomain: "meerkats-74de5.firebaseapp.com",
  projectId: "meerkats-74de5",
  storageBucket: "meerkats-74de5.firebasestorage.app",
  messagingSenderId: "1035049140619",
  appId: "1:1035049140619:web:171f5902856196c67aaf8e",
  measurementId: "G-W7EEBNDNG9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Reference to the main scoreboard document
const SCOREBOARD_DOC = db.collection("scoreboards").doc("main");

// Export for use in other files
if (typeof window !== 'undefined') {
  window.db = db;
  window.SCOREBOARD_DOC = SCOREBOARD_DOC;
}
