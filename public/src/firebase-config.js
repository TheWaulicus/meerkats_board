// Firebase Configuration
// Replace this with your own Firebase project configuration
// Get your config from: https://console.firebase.google.com/
// Project Settings > General > Your apps > Web app > Config

const firebaseConfig = {
  apiKey: "AIzaSyAlH1akwhAgGwAN8ll2Q5Ytyg0izzVogsM",
  authDomain: "meerkats-74de5.firebaseapp.com",
  databaseURL: "https://meerkats-74de5-default-rtdb.asia-southeast1.firebasedatabase.app",
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

// Initialize Firebase Realtime Database (for presence tracking)
const realtimeDb = firebase.database();

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firebase Storage
let storage = null;

// Function to initialize storage
function initializeStorage() {
  try {
    if (typeof firebase !== 'undefined' && firebase.storage) {
      storage = firebase.storage();
      if (typeof window !== 'undefined') {
        window.storage = storage;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error initializing Firebase Storage:', error);
    return false;
  }
}

// Try to initialize immediately, retry once if needed
if (!initializeStorage()) {
  setTimeout(() => {
    if (!initializeStorage()) {
      console.error('Failed to initialize Firebase Storage');
    }
  }, 100);
}

// Initialize Firebase App Check (skip on preview hosts)
const shouldEnableAppCheck = typeof window !== 'undefined' && !window.location.hostname.includes('preview-');
if (shouldEnableAppCheck && typeof firebase !== 'undefined' && firebase.appCheck) {
  try {
    const appCheck = firebase.appCheck();
    appCheck.activate(
      new firebase.appCheck.ReCaptchaV3Provider('6LcpLiAsAAAAACZdd-fwzYWPunKRLQXDTF9B4ufE'),
      true
    );
    console.log('✅ Firebase App Check activated with reCAPTCHA v3');
  } catch (error) {
    console.error('❌ Error initializing App Check:', error);
  }
} else {
  console.warn('⚠️ Firebase App Check disabled for this host (preview or SDK unavailable)');
}

// Scoreboard document reference (set dynamically based on game ID)
let SCOREBOARD_DOC = null;

/**
 * Initialize scoreboard document for a specific game ID
 * @param {string} gameId - Game ID to connect to
 * @returns {object} Firestore document reference
 */
function initializeScoreboardDoc(gameId) {
  const sanitizedId = gameId || 'main';
  SCOREBOARD_DOC = db.collection("scoreboards").doc(sanitizedId);
  console.log('Initialized Firestore document for game:', sanitizedId);
  return SCOREBOARD_DOC;
}

/**
 * Get the current scoreboard document reference
 * @returns {object} Firestore document reference
 */
function getScoreboardDoc() {
  return SCOREBOARD_DOC;
}

/**
 * Update game name in Firebase
 * @param {string} gameId - Game ID
 * @param {string} gameName - Friendly name for the game
 */
function updateGameName(gameId, gameName) {
  const docRef = db.collection("scoreboards").doc(gameId);
  return docRef.set({ gameName }, { merge: true });
}

/**
 * Get game name from Firebase
 * @param {string} gameId - Game ID
 * @returns {Promise<string>} Game name
 */
async function getGameName(gameId) {
  try {
    const docRef = db.collection("scoreboards").doc(gameId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return data.gameName || gameId;
    }
    return gameId;
  } catch (error) {
    console.error('Error getting game name:', error);
    return gameId;
  }
}

/**
 * Reset game to initial state (keeps game ID and name)
 * @param {string} gameId - Game ID to reset
 * @param {object} options - Reset options
 */
async function resetGame(gameId, options = {}) {
  const {
    resetScores = true,
    resetTimer = true,
    resetPenalties = true,
    resetTeams = false,
    resetSettings = false
  } = options;
  
  try {
    const docRef = db.collection("scoreboards").doc(gameId);
    const doc = await docRef.get();
    
    // Preserve certain fields
    const preserve = {};
    if (doc.exists) {
      const data = doc.data();
      preserve.gameName = data.gameName;
      
      if (!resetTeams) {
        preserve.teamAName = data.teamAName;
        preserve.teamBName = data.teamBName;
        preserve.teamALogo = data.teamALogo;
        preserve.teamBLogo = data.teamBLogo;
      }
      
      if (!resetSettings) {
        preserve.leagueName = data.leagueName;
        preserve.leagueLogo = data.leagueLogo;
      }
    }
    
    // Build reset data
    const resetData = {
      ...preserve,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (resetScores) {
      resetData.teamAScore = 0;
      resetData.teamBScore = 0;
      resetData.teamAShots = 0;
      resetData.teamBShots = 0;
      resetData.teamATimeouts = 0;
      resetData.teamBTimeouts = 0;
    }
    
    if (resetTimer) {
      resetData.timerDisplay = "20:00";
      resetData.timerSeconds = 1200;
      resetData.isRunning = false;
      resetData.period = 1;
      resetData.gamePhase = "regulation";
    }
    
    if (resetPenalties) {
      resetData.teamAPenalties = [];
      resetData.teamBPenalties = [];
    }
    
    await docRef.set(resetData, { merge: true });
    console.log('Game reset:', gameId);
    return true;
  } catch (error) {
    console.error('Error resetting game:', error);
    return false;
  }
}

/**
 * Authentication functions
 */

// Sign in with email and password (for control interface)
function signInWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Sign in anonymously (for view interface)
function signInAnonymously() {
  return auth.signInAnonymously();
}

// Sign out
function signOut() {
  return auth.signOut();
}

// Get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Auth state change listener
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User authenticated:', user.uid, user.email || '(anonymous)');
    if (typeof window !== 'undefined') {
      window.currentUser = user;
    }
  } else {
    console.log('User not authenticated');
    if (typeof window !== 'undefined') {
      window.currentUser = null;
    }
  }
});

// Export for use in other files
if (typeof window !== 'undefined') {
  window.db = db;
  window.auth = auth;
  window.storage = storage;
  window.SCOREBOARD_DOC = SCOREBOARD_DOC; // Will be set dynamically
  window.initializeScoreboardDoc = initializeScoreboardDoc;
  window.getScoreboardDoc = getScoreboardDoc;
  window.updateGameName = updateGameName;
  window.getGameName = getGameName;
  window.resetGame = resetGame;
  window.signInWithEmail = signInWithEmail;
  window.signInAnonymously = signInAnonymously;
  window.signOut = signOut;
  window.getCurrentUser = getCurrentUser;
}
