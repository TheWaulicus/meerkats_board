// Meerkats Board - Hockey Scoreboard Control Logic
// Includes audio alarms: beeps every minute + 3 buzzers at end

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let timerInterval = null;
let timerSeconds = 20 * 60; // Default 20 minutes
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

// Flag to prevent feedback loops during Firebase sync
let isLocalUpdate = false;

// Audio state
let lastBeepSecond = -1; // Track last beep to avoid duplicates
let audioContext = null;
let hasPlayedEndBuzzers = false;

// ============================================================================
// AUDIO SYSTEM - Web Audio API
// ============================================================================

/**
 * Initialize Web Audio Context (must be called after user interaction)
 */
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a beep sound using Web Audio API
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in milliseconds
 * @param {number} volume - Volume (0-1)
 */
function playBeep(frequency = 800, duration = 200, volume = 0.3) {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}

/**
 * Play a buzzer sound (lower frequency, longer duration)
 */
function playBuzzer() {
  playBeep(200, 500, 0.5);
}

/**
 * Play the end-of-period sequence (3 buzzers)
 */
function playEndSequence() {
  if (hasPlayedEndBuzzers) return;
  hasPlayedEndBuzzers = true;
  
  playBuzzer();
  setTimeout(() => playBuzzer(), 600);
  setTimeout(() => playBuzzer(), 1200);
}

/**
 * Check if we should play a minute beep
 */
function checkMinuteBeep() {
  if (!timerRunning) return;
  
  // Play beep at every 60-second mark (except at 0)
  if (timerSeconds > 0 && timerSeconds % 60 === 0 && timerSeconds !== lastBeepSecond) {
    lastBeepSecond = timerSeconds;
    playBeep(1000, 150, 0.25);
  }
  
  // Play end sequence when timer reaches 0
  if (timerSeconds === 0) {
    playEndSequence();
  }
}

// ============================================================================
// TIMER FUNCTIONS
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
    timerDisplay.value = timerValue;
  }
  
  const timerLiveRegion = document.getElementById("timerLiveRegion");
  if (timerLiveRegion) {
    timerLiveRegion.textContent = `Timer: ${min} minutes and ${sec} seconds`;
  }
}

/**
 * Start the countdown timer
 */
function startTimer() {
  if (timerRunning) return;
  
  // Initialize audio context on first user interaction
  initAudioContext();
  
  timerRunning = true;
  hasPlayedEndBuzzers = false; // Reset end buzzer flag
  
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      checkMinuteBeep(); // Check for audio alarms
      updateTimerDisplay();
      saveStateToFirestore();
    } else {
      checkMinuteBeep(); // Play end sequence
      stopTimer();
      saveStateToFirestore();
    }
  }, 1000);
  
  saveStateToFirestore();
}

/**
 * Stop the countdown timer
 */
function stopTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  saveStateToFirestore();
}

/**
 * Reset the timer to default (20:00)
 */
function resetTimer() {
  stopTimer();
  timerSeconds = 20 * 60;
  hasPlayedEndBuzzers = false;
  lastBeepSecond = -1;
  updateTimerDisplay();
  saveStateToFirestore();
}

/**
 * Handle manual timer input
 */
document.addEventListener('DOMContentLoaded', function() {
  const timerDisplay = document.getElementById("timerDisplay");
  if (timerDisplay) {
    timerDisplay.addEventListener("input", function (e) {
      const val = e.target.value.replace(/[^0-9:]/g, "");
      const parts = val.split(":");
      let min = parseInt(parts[0], 10) || 0;
      let sec = parseInt(parts[1], 10) || 0;
      
      // Clamp values
      min = Math.min(99, Math.max(0, min));
      sec = Math.min(59, Math.max(0, sec));
      
      timerSeconds = min * 60 + sec;
      hasPlayedEndBuzzers = false;
      lastBeepSecond = -1;
      updateTimerDisplay();
      saveStateToFirestore();
    });
  }
});

// ============================================================================
// PERIOD MANAGEMENT
// ============================================================================

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
 * Change period number
 * @param {number} delta - Amount to change (+1 or -1)
 */
function changePeriod(delta) {
  if (gamePhase !== "REG") return; // Only allow in regulation
  
  period = Math.max(1, Math.min(REGULATION_PERIODS, period + delta));
  updatePhaseDisplay();
  saveStateToFirestore();
}

/**
 * Advance to next game phase
 */
function advancePhase() {
  if (gamePhase === "REG" && period < REGULATION_PERIODS) {
    changePeriod(1);
  } else if (gamePhase === "REG" && period === REGULATION_PERIODS) {
    gamePhase = "OT";
    updatePhaseDisplay();
    saveStateToFirestore();
  } else if (gamePhase === "OT") {
    gamePhase = "SO";
    updatePhaseDisplay();
    saveStateToFirestore();
  }
}

/**
 * Reset phase to regulation period 1
 */
function resetPhase() {
  gamePhase = "REG";
  period = 1;
  updatePhaseDisplay();
  saveStateToFirestore();
}

// ============================================================================
// SCORE MANAGEMENT
// ============================================================================

/**
 * Update team score
 * @param {string} team - 'A' or 'B'
 * @param {number} delta - Amount to change (+1 or -1)
 */
function updateScore(team, delta) {
  if (!["A", "B"].includes(team)) return;
  
  teamState[team].score = Math.max(0, teamState[team].score + delta);
  
  const scoreElement = document.getElementById(`team${team}Score`);
  if (scoreElement) {
    scoreElement.textContent = teamState[team].score;
  }
  
  saveStateToFirestore();
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

let lastFocusedElement = null;
let settingsFocusTrapListener = null;

/**
 * Toggle settings modal
 * @param {boolean} show - Whether to show or hide
 */
function toggleSettings(show) {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;

  if (show) {
    // Populate current values
    document.getElementById("leagueNameInput").value = leagueName;
    document.getElementById("teamANameInput").value = teamState.A.name;
    document.getElementById("teamBNameInput").value = teamState.B.name;
    
    lastFocusedElement = document.activeElement;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    settingsFocusTrapListener = (event) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    modal.addEventListener("keydown", settingsFocusTrapListener);
  } else {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    if (settingsFocusTrapListener) {
      modal.removeEventListener("keydown", settingsFocusTrapListener);
      settingsFocusTrapListener = null;
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }
}

/**
 * Apply settings from modal
 */
function applySettings() {
  // Update league name
  const leagueNameValue = document.getElementById("leagueNameInput").value;
  if (leagueNameValue) {
    leagueName = leagueNameValue;
    document.getElementById("leagueName").textContent = leagueName;
  }
  
  // Update team names
  const teamANameValue = document.getElementById("teamANameInput").value;
  if (teamANameValue) {
    teamState.A.name = teamANameValue;
    document.getElementById("teamAName").textContent = teamState.A.name;
  }
  
  const teamBNameValue = document.getElementById("teamBNameInput").value;
  if (teamBNameValue) {
    teamState.B.name = teamBNameValue;
    document.getElementById("teamBName").textContent = teamState.B.name;
  }
  
  // Handle logo uploads
  const leagueLogoInput = document.getElementById("leagueLogoInput");
  if (leagueLogoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      leagueLogo = e.target.result;
      document.getElementById("leagueLogo").src = leagueLogo;
      saveStateToFirestore();
    };
    reader.readAsDataURL(leagueLogoInput.files[0]);
  }
  
  const teamALogoInput = document.getElementById("teamALogoInput");
  if (teamALogoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      teamState.A.logo = e.target.result;
      document.getElementById("teamALogo").src = teamState.A.logo;
      saveStateToFirestore();
    };
    reader.readAsDataURL(teamALogoInput.files[0]);
  }
  
  const teamBLogoInput = document.getElementById("teamBLogoInput");
  if (teamBLogoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      teamState.B.logo = e.target.result;
      document.getElementById("teamBLogo").src = teamState.B.logo;
      saveStateToFirestore();
    };
    reader.readAsDataURL(teamBLogoInput.files[0]);
  }
  
  toggleSettings(false);
  saveStateToFirestore();
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const themeToggleButton = document.getElementById('themeToggleButton');
  if (themeToggleButton) {
    themeToggleButton.setAttribute('aria-pressed', String(newTheme === 'dark'));
  }
  
  updateThemeIcons(newTheme);
  saveStateToFirestore();
}

/**
 * Update theme icon visibility
 */
function updateThemeIcons(theme) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  if (theme === 'light') {
    sunIcon.classList.add('active');
    moonIcon.classList.remove('active');
  } else {
    sunIcon.classList.remove('active');
    moonIcon.classList.add('active');
  }
}

/**
 * Initialize theme on page load
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const currentTheme = savedTheme || document.body.getAttribute('data-theme') || 'dark';
  
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);
  
  const themeToggleButton = document.getElementById('themeToggleButton');
  if (themeToggleButton) {
    themeToggleButton.setAttribute('aria-pressed', String(currentTheme === 'dark'));
  }
}

// ============================================================================
// FIREBASE SYNC
// ============================================================================

/**
 * Get default state object
 */
function getDefaultState() {
  return {
    timerSeconds: 20 * 60,
    timerRunning: false,
    period: 1,
    gamePhase: "REG",
    teamA: {
      name: "Home Team",
      logo: "",
      score: 0
    },
    teamB: {
      name: "Away Team",
      logo: "",
      score: 0
    },
    leagueName: "League",
    leagueLogo: "",
    theme: "dark",
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };
}

/**
 * Save current state to Firestore
 */
function saveStateToFirestore() {
  if (!window.SCOREBOARD_DOC) return;
  
  const state = {
    timerSeconds,
    timerRunning,
    period,
    gamePhase,
    teamA: teamState.A,
    teamB: teamState.B,
    leagueName,
    leagueLogo,
    theme: document.body.getAttribute('data-theme') || 'dark',
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  isLocalUpdate = true;
  window.SCOREBOARD_DOC.set(state).catch((error) => {
    console.error("Error saving to Firestore:", error);
  });
}

/**
 * Load state from Firestore snapshot
 */
function loadStateFromSnapshot(snapshot) {
  if (!snapshot.exists) {
    // Initialize with default state
    window.SCOREBOARD_DOC.set(getDefaultState());
    return;
  }
  
  const state = snapshot.data();
  
  if (!isLocalUpdate) {
    // Update local state from remote
    timerSeconds = state.timerSeconds || 20 * 60;
    period = state.period || 1;
    gamePhase = state.gamePhase || "REG";
    
    teamState.A = state.teamA || { name: "Home Team", logo: "", score: 0 };
    teamState.B = state.teamB || { name: "Away Team", logo: "", score: 0 };
    
    leagueName = state.leagueName || "League";
    leagueLogo = state.leagueLogo || "";
    
    // Handle timer running state carefully
    if (state.timerRunning !== undefined && state.timerRunning !== timerRunning) {
      if (state.timerRunning && !timerRunning) {
        startTimer();
      } else if (!state.timerRunning && timerRunning) {
        stopTimer();
      }
    }
    
    // Update UI
    updateTimerDisplay();
    updatePhaseDisplay();
    
    document.getElementById("teamAName").textContent = teamState.A.name;
    document.getElementById("teamBName").textContent = teamState.B.name;
    document.getElementById("teamAScore").textContent = teamState.A.score;
    document.getElementById("teamBScore").textContent = teamState.B.score;
    
    if (teamState.A.logo) {
      document.getElementById("teamALogo").src = teamState.A.logo;
    }
    if (teamState.B.logo) {
      document.getElementById("teamBLogo").src = teamState.B.logo;
    }
    
    document.getElementById("leagueName").textContent = leagueName;
    if (leagueLogo) {
      document.getElementById("leagueLogo").src = leagueLogo;
    }
    
    // Update theme
    const newTheme = state.theme || "dark";
    if (document.body.getAttribute('data-theme') !== newTheme) {
      document.body.setAttribute('data-theme', newTheme);
      updateThemeIcons(newTheme);
    }
  }
  
  isLocalUpdate = false;
}

/**
 * Reset all state to defaults
 */
function resetAll() {
  if (confirm("Are you sure you want to reset all scoreboard data?")) {
    stopTimer();
    window.SCOREBOARD_DOC.set(getDefaultState()).then(() => {
      window.location.reload();
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 */
function initializeApp() {
  console.log("Meerkats Board - Control Interface");
  
  // Initialize theme
  initializeTheme();
  
  // Initialize display
  updateTimerDisplay();
  updatePhaseDisplay();
  
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
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
