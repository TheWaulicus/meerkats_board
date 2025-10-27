// Meerkats Board - Hockey Scoreboard View Logic (Read-only)
// This is the display-only interface that syncs with the control interface

// ============================================================================
// STATE MANAGEMENT (Read-only)
// ============================================================================

let timerSeconds = 20 * 60;
let timerRunning = false;
let period = 1;
let gamePhase = "REG"; // REG, OT, SO
const REGULATION_PERIODS = 3;

let teamState = {
  A: { name: "Home Team", logo: "", score: 0 },
  B: { name: "Away Team", logo: "", score: 0 }
};

let leagueName = "League";
let leagueLogo = "";

// Timer display update interval for smooth countdown
let displayInterval = null;
let lastSyncTime = Date.now();
let localTimerSeconds = 20 * 60;

// ============================================================================
// DISPLAY UPDATE FUNCTIONS
// ============================================================================

/**
 * Update the timer display
 */
function updateTimerDisplay() {
  const min = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const sec = String(timerSeconds % 60).padStart(2, "0");
  const timerValue = `${min}:${sec}`;
  
  const timerDisplay = document.getElementById("timerDisplay");
  if (timerDisplay) {
    timerDisplay.textContent = timerValue;
  }
  
  const timerLiveRegion = document.getElementById("timerLiveRegion");
  if (timerLiveRegion) {
    timerLiveRegion.textContent = `Timer: ${min} minutes and ${sec} seconds`;
  }
}

/**
 * Update period/phase display
 */
function updatePhaseDisplay() {
  let label = "";
  if (gamePhase === "REG") {
    label = `Period ${period}`;
  } else if (gamePhase === "OT") {
    label = "Overtime";
  } else if (gamePhase === "SO") {
    label = "Shootout";
  }
  
  const periodLabel = document.getElementById("periodLabel");
  if (periodLabel) {
    periodLabel.textContent = label;
  }
}

/**
 * Update all team and league information
 */
function updateDisplayInfo() {
  // Update team names
  const teamANameEl = document.getElementById("teamAName");
  const teamBNameEl = document.getElementById("teamBName");
  if (teamANameEl) teamANameEl.textContent = teamState.A.name;
  if (teamBNameEl) teamBNameEl.textContent = teamState.B.name;
  
  // Update scores
  const teamAScoreEl = document.getElementById("teamAScore");
  const teamBScoreEl = document.getElementById("teamBScore");
  if (teamAScoreEl) teamAScoreEl.textContent = teamState.A.score;
  if (teamBScoreEl) teamBScoreEl.textContent = teamState.B.score;
  
  // Update team logos
  const teamALogoEl = document.getElementById("teamALogo");
  const teamBLogoEl = document.getElementById("teamBLogo");
  if (teamALogoEl && teamState.A.logo) {
    teamALogoEl.src = teamState.A.logo;
  }
  if (teamBLogoEl && teamState.B.logo) {
    teamBLogoEl.src = teamState.B.logo;
  }
  
  // Update league info
  const leagueNameEl = document.getElementById("leagueName");
  const leagueLogoEl = document.getElementById("leagueLogo");
  if (leagueNameEl) leagueNameEl.textContent = leagueName;
  if (leagueLogoEl && leagueLogo) {
    leagueLogoEl.src = leagueLogo;
  }
}

/**
 * Update theme
 */
function updateTheme(theme) {
  document.body.setAttribute('data-theme', theme || 'dark');
}

// ============================================================================
// TIMER DISPLAY SYNC
// ============================================================================

/**
 * Start local timer display (for smooth countdown between syncs)
 */
function startDisplayTimer() {
  if (displayInterval) return;
  
  displayInterval = setInterval(() => {
    if (timerRunning && timerSeconds > 0) {
      const elapsed = Math.floor((Date.now() - lastSyncTime) / 1000);
      localTimerSeconds = Math.max(0, timerSeconds - elapsed);
      
      const min = String(Math.floor(localTimerSeconds / 60)).padStart(2, "0");
      const sec = String(localTimerSeconds % 60).padStart(2, "0");
      const timerValue = `${min}:${sec}`;
      
      const timerDisplay = document.getElementById("timerDisplay");
      if (timerDisplay) {
        timerDisplay.textContent = timerValue;
      }
    }
  }, 100); // Update display 10 times per second for smoothness
}

/**
 * Stop local timer display
 */
function stopDisplayTimer() {
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = null;
  }
}

// ============================================================================
// FIREBASE SYNC (Read-only)
// ============================================================================

/**
 * Load state from Firestore snapshot
 */
function loadStateFromSnapshot(snapshot) {
  if (!snapshot.exists) {
    console.log("No scoreboard data found. Waiting for control interface...");
    return;
  }
  
  const state = snapshot.data();
  
  // Update timer state
  const newTimerSeconds = state.timerSeconds || 20 * 60;
  const newTimerRunning = state.timerRunning || false;
  
  // Only update if there's a significant change (avoid jitter)
  if (Math.abs(newTimerSeconds - timerSeconds) > 2 || timerRunning !== newTimerRunning) {
    timerSeconds = newTimerSeconds;
    localTimerSeconds = timerSeconds;
    lastSyncTime = Date.now();
    
    if (newTimerRunning !== timerRunning) {
      timerRunning = newTimerRunning;
      if (timerRunning) {
        startDisplayTimer();
      } else {
        stopDisplayTimer();
      }
    }
    
    updateTimerDisplay();
  }
  
  // Update period and phase
  period = state.period || 1;
  gamePhase = state.gamePhase || "REG";
  updatePhaseDisplay();
  
  // Update team states
  teamState.A = state.teamA || { name: "Home Team", logo: "", score: 0 };
  teamState.B = state.teamB || { name: "Away Team", logo: "", score: 0 };
  
  // Update league info
  leagueName = state.leagueName || "League";
  leagueLogo = state.leagueLogo || "";
  
  // Update display
  updateDisplayInfo();
  
  // Update theme
  const theme = state.theme || "dark";
  updateTheme(theme);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the view application
 */
function initializeView() {
  console.log("Meerkats Board - Display View (Read-only)");
  
  // Set initial display
  updateTimerDisplay();
  updatePhaseDisplay();
  updateDisplayInfo();
  
  // Set up Firebase listener
  if (window.SCOREBOARD_DOC) {
    window.SCOREBOARD_DOC.onSnapshot((snapshot) => {
      loadStateFromSnapshot(snapshot);
    }, (error) => {
      console.error("Firestore listener error:", error);
    });
  } else {
    console.warn("Firebase not initialized. Check firebase-config.js");
  }
  
  // Prevent accidental navigation
  window.addEventListener('beforeunload', (e) => {
    // Optionally warn before closing
    // Uncomment to enable:
    // e.preventDefault();
    // e.returnValue = '';
  });
  
  // Add fullscreen support
  document.addEventListener('keydown', (e) => {
    // Press F11 or F to toggle fullscreen
    if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeView);
} else {
  initializeView();
}
