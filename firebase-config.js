// Firebase Configuration
// Replace this with your own Firebase project configuration
// Get your config from: https://console.firebase.google.com/
// Project Settings > General > Your apps > Web app > Config

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
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
