// Meerkats Board - Hockey Scoreboard Control Logic
// Includes audio alarms: beeps every minute + 3 buzzers at end

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let timerInterval = null;
let timerSeconds = 18 * 60; // Default 18 minutes (standard hockey period)
let timerRunning = false;
let period = 1;
let gamePhase = "REG"; // REG, OT, SO
const REGULATION_PERIODS = 3;

let teamState = {
  A: { name: "Home Team", logo: "", score: 0 },
  B: { name: "Away Team", logo: "", score: 0 }
};

let leagueName = "Juice Box Hockey";
let leagueLogo = "images/juice_box.png";

// Visibility settings
let visibilitySettings = {
  showPeriodControl: true,
  showPeriodView: true,
  showTimerControl: true,
  showTimerView: true,
  showScoresControl: true,
  showScoresView: true,
  showTeamLogosControl: true,
  showTeamLogosView: true,
  showTeamNamesControl: true,
  showTeamNamesView: true,
  showLeagueControl: true,
  showLeagueView: true
};

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
 * Play a beep sound (file or synthesized)
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in milliseconds
 * @param {number} volume - Volume (0-1)
 */
function playBeep(frequency = 800, duration = 200, volume = 0.3) {
  // Try to play custom minute beep if available
  if (frequency === 1000 && minuteBeepAudio && minuteBeepAudio.src) {
    const audioClone = minuteBeepAudio.cloneNode();
    audioClone.volume = volume;
    audioClone.play().catch(() => {
      playSynthesizedBeep(frequency, duration, volume);
    });
    return;
  }
  
  // Otherwise use synthesized beep
  playSynthesizedBeep(frequency, duration, volume);
}

/**
 * Synthesized beep using Web Audio API
 */
function playSynthesizedBeep(frequency, duration, volume) {
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

// Audio file cache
let buzzerAudio = null;
let minuteBeepAudio = null;

/**
 * Load audio files if available, otherwise use synthesized sounds
 */
function loadAudioFiles() {
  // Try to load hockey buzzer audio file (try .wav first, then .mp3)
  buzzerAudio = new Audio();
  
  // Try WAV format first
  buzzerAudio.src = 'sounds/hockey-buzzer.wav';
  buzzerAudio.volume = 0.7;
  buzzerAudio.preload = 'auto';
  
  console.log('Loading buzzer audio from:', buzzerAudio.src);
  
  // Success handler
  buzzerAudio.addEventListener('canplaythrough', () => {
    console.log('✅ Hockey buzzer WAV loaded successfully!');
  }, { once: true });
  
  // Fallback to MP3 if WAV doesn't exist
  buzzerAudio.addEventListener('error', (e) => {
    console.log('WAV buzzer error, trying MP3...', e);
    buzzerAudio.src = 'sounds/hockey-buzzer.mp3';
    buzzerAudio.addEventListener('error', () => {
      console.log('Custom buzzer audio not found, using synthesized sound');
      buzzerAudio = null;
    }, { once: true });
  }, { once: true });
  
  // Try to load minute beep audio file (optional)
  minuteBeepAudio = new Audio();
  minuteBeepAudio.src = 'sounds/minute-beep.wav';
  minuteBeepAudio.volume = 0.3;
  
  // Fallback to MP3
  minuteBeepAudio.addEventListener('error', () => {
    minuteBeepAudio.src = 'sounds/minute-beep.mp3';
    minuteBeepAudio.addEventListener('error', () => {
      console.log('Custom minute beep not found, using synthesized sound');
      minuteBeepAudio = null;
    }, { once: true });
  }, { once: true });
}

/**
 * Play a traditional hockey buzzer sound (file or synthesized)
 */
function playBuzzer() {
  console.log('playBuzzer called. buzzerAudio:', buzzerAudio, 'src:', buzzerAudio?.src);
  
  // Try to play audio file first
  if (buzzerAudio && buzzerAudio.src && buzzerAudio.src.includes('hockey-buzzer')) {
    const audioClone = buzzerAudio.cloneNode();
    audioClone.volume = 0.7;
    
    console.log('Attempting to play WAV file:', audioClone.src);
    
    audioClone.play().then(() => {
      console.log('✅ WAV file playing successfully!');
    }).catch(err => {
      console.warn('❌ Audio file playback failed, using synthesized sound:', err);
      playSynthesizedBuzzer();
    });
  } else {
    console.log('Fallback: No audio file loaded, using synthesized buzzer');
    // Fallback to synthesized buzzer
    playSynthesizedBuzzer();
  }
}

/**
 * Synthesized hockey buzzer using Web Audio API
 */
function playSynthesizedBuzzer() {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Hockey horn frequency - low and powerful (similar to arena horns)
    oscillator.frequency.setValueAtTime(110, ctx.currentTime); // Low A note
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.2); // Slight drop
    oscillator.type = 'sawtooth'; // Harsh, buzzer-like sound
    
    // Volume envelope - loud and sustained
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.05); // Quick attack
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime + 1.0); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2); // Decay
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.2);
  } catch (error) {
    console.warn('Buzzer playback failed:', error);
  }
}

/**
 * Play the end-of-period sequence (3 hockey buzzers)
 */
function playEndSequence() {
  if (hasPlayedEndBuzzers) return;
  hasPlayedEndBuzzers = true;
  
  // Three hockey horn blasts with 1.5 second gaps
  playBuzzer();
  setTimeout(() => playBuzzer(), 1500);
  setTimeout(() => playBuzzer(), 3000);
}

/**
 * Check if we should play a minute beep or end buzzer
 */
function checkMinuteBeep() {
  if (!timerRunning) return;
  
  // Play buzzer at every 60-second mark (except at 0)
  if (timerSeconds > 0 && timerSeconds % 60 === 0 && timerSeconds !== lastBeepSecond) {
    lastBeepSecond = timerSeconds;
    playBuzzer(); // Play the same hockey buzzer every minute
  }
  
  // Play end sequence when timer reaches 0
  if (timerSeconds === 0 && !hasPlayedEndBuzzers) {
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
  
  // Don't start if timer is at 0
  if (timerSeconds === 0) {
    console.log("Timer is at 0:00. Reset timer before starting.");
    return;
  }
  
  // Initialize audio context on first user interaction
  initAudioContext();
  
  timerRunning = true;
  hasPlayedEndBuzzers = false; // Reset end buzzer flag
  
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
      checkMinuteBeep(); // Check for audio alarms AFTER decrementing
      saveStateToFirestore();
    } else {
      // Timer reached 0:00 - STOP COMPLETELY
      clearInterval(timerInterval); // Clear the interval immediately
      timerInterval = null;
      timerRunning = false; // Set running flag to false
      checkMinuteBeep(); // Play end sequence
      updateTimerDisplay(); // Update display to show 0:00
      saveStateToFirestore(); // Save stopped state to Firebase
      return; // Exit the interval callback
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
 * Reset the timer to default (18:00)
 */
function resetTimer() {
  stopTimer();
  timerSeconds = 18 * 60;
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
    // Allow free editing while typing
    timerDisplay.addEventListener("focus", function (e) {
      // Select all on focus for easy editing
      e.target.select();
    });
    
    // Process on blur (when user clicks away)
    timerDisplay.addEventListener("blur", function (e) {
      parseAndSetTimer(e.target.value);
    });
    
    // Process on Enter key
    timerDisplay.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.target.blur(); // Trigger blur event
      }
    });
  }
});

/**
 * Parse timer input and update timer state
 * @param {string} value - Timer input value
 */
function parseAndSetTimer(value) {
  const val = value.replace(/[^0-9:]/g, "");
  const parts = val.split(":");
  
  let min = 0;
  let sec = 0;
  
  if (parts.length === 1) {
    // If only one number, treat as minutes
    min = parseInt(parts[0], 10) || 0;
  } else if (parts.length === 2) {
    // MM:SS format
    min = parseInt(parts[0], 10) || 0;
    sec = parseInt(parts[1], 10) || 0;
  }
  
  // Clamp values
  min = Math.min(99, Math.max(0, min));
  sec = Math.min(59, Math.max(0, sec));
  
  timerSeconds = min * 60 + sec;
  hasPlayedEndBuzzers = false;
  lastBeepSecond = -1;
  updateTimerDisplay();
  saveStateToFirestore();
}

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
    
    // Populate visibility checkboxes
    document.getElementById("showPeriodControl").checked = visibilitySettings.showPeriodControl;
    document.getElementById("showPeriodView").checked = visibilitySettings.showPeriodView;
    document.getElementById("showTimerControl").checked = visibilitySettings.showTimerControl;
    document.getElementById("showTimerView").checked = visibilitySettings.showTimerView;
    document.getElementById("showScoresControl").checked = visibilitySettings.showScoresControl;
    document.getElementById("showScoresView").checked = visibilitySettings.showScoresView;
    document.getElementById("showTeamLogosControl").checked = visibilitySettings.showTeamLogosControl;
    document.getElementById("showTeamLogosView").checked = visibilitySettings.showTeamLogosView;
    document.getElementById("showTeamNamesControl").checked = visibilitySettings.showTeamNamesControl;
    document.getElementById("showTeamNamesView").checked = visibilitySettings.showTeamNamesView;
    document.getElementById("showLeagueControl").checked = visibilitySettings.showLeagueControl;
    document.getElementById("showLeagueView").checked = visibilitySettings.showLeagueView;
    
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
 * Apply visibility settings to the scoreboard
 */
function applyVisibilitySettings() {
  const scoreboard = document.querySelector('.scoreboard');
  if (!scoreboard) return;
  
  // Remove all visibility classes first
  scoreboard.classList.remove(
    'hide-period-control', 'hide-period-view',
    'hide-timer-control', 'hide-timer-view',
    'hide-scores-control', 'hide-scores-view',
    'hide-team-logos-control', 'hide-team-logos-view',
    'hide-team-names-control', 'hide-team-names-view',
    'hide-league-control', 'hide-league-view'
  );
  
  // Apply visibility classes based on settings
  if (!visibilitySettings.showPeriodControl) scoreboard.classList.add('hide-period-control');
  if (!visibilitySettings.showPeriodView) scoreboard.classList.add('hide-period-view');
  if (!visibilitySettings.showTimerControl) scoreboard.classList.add('hide-timer-control');
  if (!visibilitySettings.showTimerView) scoreboard.classList.add('hide-timer-view');
  if (!visibilitySettings.showScoresControl) scoreboard.classList.add('hide-scores-control');
  if (!visibilitySettings.showScoresView) scoreboard.classList.add('hide-scores-view');
  if (!visibilitySettings.showTeamLogosControl) scoreboard.classList.add('hide-team-logos-control');
  if (!visibilitySettings.showTeamLogosView) scoreboard.classList.add('hide-team-logos-view');
  if (!visibilitySettings.showTeamNamesControl) scoreboard.classList.add('hide-team-names-control');
  if (!visibilitySettings.showTeamNamesView) scoreboard.classList.add('hide-team-names-view');
  if (!visibilitySettings.showLeagueControl) scoreboard.classList.add('hide-league-control');
  if (!visibilitySettings.showLeagueView) scoreboard.classList.add('hide-league-view');
}

/**
 * Apply settings from modal
 */
function applySettings() {
  // Update league name
  const leagueNameValue = document.getElementById("leagueNameInput").value;
  if (leagueNameValue) {
    leagueName = leagueNameValue;
    const navbarLeagueName = document.getElementById("navbarLeagueName");
    if (navbarLeagueName) {
      navbarLeagueName.textContent = leagueName;
    }
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
  
  // Update visibility settings
  visibilitySettings.showPeriodControl = document.getElementById("showPeriodControl").checked;
  visibilitySettings.showPeriodView = document.getElementById("showPeriodView").checked;
  visibilitySettings.showTimerControl = document.getElementById("showTimerControl").checked;
  visibilitySettings.showTimerView = document.getElementById("showTimerView").checked;
  visibilitySettings.showScoresControl = document.getElementById("showScoresControl").checked;
  visibilitySettings.showScoresView = document.getElementById("showScoresView").checked;
  visibilitySettings.showTeamLogosControl = document.getElementById("showTeamLogosControl").checked;
  visibilitySettings.showTeamLogosView = document.getElementById("showTeamLogosView").checked;
  visibilitySettings.showTeamNamesControl = document.getElementById("showTeamNamesControl").checked;
  visibilitySettings.showTeamNamesView = document.getElementById("showTeamNamesView").checked;
  visibilitySettings.showLeagueControl = document.getElementById("showLeagueControl").checked;
  visibilitySettings.showLeagueView = document.getElementById("showLeagueView").checked;
  
  // Apply visibility settings
  applyVisibilitySettings();
  
  // Handle logo uploads
  const leagueLogoInput = document.getElementById("leagueLogoInput");
  if (leagueLogoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      leagueLogo = e.target.result;
      const navbarLeagueLogo = document.getElementById("navbarLeagueLogo");
      if (navbarLeagueLogo) {
        navbarLeagueLogo.src = leagueLogo;
        navbarLeagueLogo.style.display = 'block';
      }
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
  const sunIcons = document.querySelectorAll('.sun-icon');
  const moonIcons = document.querySelectorAll('.moon-icon');
  
  if (theme === 'light') {
    sunIcons.forEach(icon => icon.classList.add('active'));
    moonIcons.forEach(icon => icon.classList.remove('active'));
  } else {
    sunIcons.forEach(icon => icon.classList.remove('active'));
    moonIcons.forEach(icon => icon.classList.add('active'));
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
    timerSeconds: 18 * 60,
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
    leagueName: "Juice Box Hockey",
    leagueLogo: "images/juice_box.png",
    theme: "dark",
    visibilitySettings: {
      showPeriodControl: true,
      showPeriodView: true,
      showTimerControl: true,
      showTimerView: true,
      showScoresControl: true,
      showScoresView: true,
      showTeamLogosControl: true,
      showTeamLogosView: true,
      showTeamNamesControl: true,
      showTeamNamesView: true,
      showLeagueControl: true,
      showLeagueView: true
    },
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
    visibilitySettings: visibilitySettings,
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
    // Don't use fallback for timerSeconds - it could be 0
    if (state.timerSeconds !== undefined) {
      timerSeconds = state.timerSeconds;
    }
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
    
    // Update navbar with league info
    const navbarLeagueName = document.getElementById("navbarLeagueName");
    if (navbarLeagueName) {
      navbarLeagueName.textContent = leagueName;
    }
    const navbarLeagueLogo = document.getElementById("navbarLeagueLogo");
    if (navbarLeagueLogo && leagueLogo) {
      navbarLeagueLogo.src = leagueLogo;
      navbarLeagueLogo.style.display = 'block';
    }
    
    // Update theme
    const newTheme = state.theme || "dark";
    if (document.body.getAttribute('data-theme') !== newTheme) {
      document.body.setAttribute('data-theme', newTheme);
      updateThemeIcons(newTheme);
    }
    
    // Update visibility settings
    if (state.visibilitySettings) {
      visibilitySettings = state.visibilitySettings;
      applyVisibilitySettings();
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
  
  // Load custom audio files if available
  loadAudioFiles();
  
  // Get current game ID
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  console.log("Current game ID:", gameId);
  
  // Initialize Firebase with game ID
  if (window.initializeScoreboardDoc) {
    window.initializeScoreboardDoc(gameId);
    window.SCOREBOARD_DOC = window.getScoreboardDoc();
  }
  
  // Update game ID display in UI
  updateGameIdDisplay(gameId);
  
  // Initialize display
  updateTimerDisplay();
  updatePhaseDisplay();
  applyVisibilitySettings();
  
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

/**
 * Update game ID display in navbar and load game name
 * @param {string} gameId - Current game ID
 */
async function updateGameIdDisplay(gameId) {
  const display = document.getElementById('currentGameId');
  
  // Get game name from Firebase
  let displayName = gameId === 'main' ? 'MAIN' : gameId.toUpperCase();
  if (window.getGameName && gameId !== 'main') {
    const gameName = await window.getGameName(gameId);
    if (gameName && gameName !== gameId) {
      displayName = gameName;
    }
  }
  
  if (display) {
    display.textContent = displayName;
  }
  
  // Update modal displays
  const modalDisplay = document.getElementById('currentGameIdDisplay');
  if (modalDisplay) {
    modalDisplay.textContent = gameId;
  }
  
  const gameNameInput = document.getElementById('gameNameInput');
  if (gameNameInput && window.getGameName) {
    const gameName = await window.getGameName(gameId);
    gameNameInput.value = gameName === gameId ? '' : gameName;
  }
  
  // Load recent games list
  if (window.GameHistory) {
    loadRecentGamesList();
  }
}

/**
 * Toggle game manager modal
 * @param {boolean} show - Whether to show or hide
 */
async function toggleGameModal(show) {
  const modal = document.getElementById('gameModal');
  if (!modal) return;
  
  if (show) {
    const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
    
    // Update displays
    const modalDisplay = document.getElementById('currentGameIdDisplay');
    if (modalDisplay) {
      modalDisplay.textContent = gameId;
    }
    
    // Load game name
    const gameNameInput = document.getElementById('gameNameInput');
    if (gameNameInput && window.getGameName) {
      const gameName = await window.getGameName(gameId);
      gameNameInput.value = gameName === gameId ? '' : gameName;
    }
    
    // Load recent games
    loadRecentGamesList();
    
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  } else {
    // Save game name when closing modal
    await saveGameName();
    
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Create a new game with random ID
 */
function createNewGame() {
  if (window.GameManager) {
    window.GameManager.createNewGame();
  }
}

/**
 * Join an existing game by ID
 */
function joinExistingGame() {
  const input = document.getElementById('joinGameInput');
  if (input && input.value) {
    if (window.GameManager) {
      window.GameManager.joinGameById(input.value);
    }
  } else {
    alert('Please enter a game ID');
  }
}

/**
 * Copy control interface link to clipboard
 */
function copyControlLink() {
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  if (window.GameManager) {
    window.GameManager.copyGameUrl(gameId, false);
  }
}

/**
 * Copy display interface link to clipboard
 */
function copyDisplayLink() {
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  if (window.GameManager) {
    window.GameManager.copyGameUrl(gameId, true);
  }
}

/**
 * Save game name to Firebase and history
 */
async function saveGameName() {
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  const gameNameInput = document.getElementById('gameNameInput');
  
  if (!gameNameInput || !gameId) return;
  
  const gameName = gameNameInput.value.trim();
  
  // Save to Firebase
  if (gameName && window.updateGameName) {
    try {
      await window.updateGameName(gameId, gameName);
      console.log('Game name saved:', gameName);
      
      // Update navbar display
      const display = document.getElementById('currentGameId');
      if (display) {
        display.textContent = gameName || gameId.toUpperCase();
      }
      
      // Update history
      if (window.GameHistory) {
        window.GameHistory.updateGameName(gameId, gameName);
      }
    } catch (error) {
      console.error('Error saving game name:', error);
    }
  }
}

/**
 * Load and display recent games list
 */
function loadRecentGamesList() {
  if (!window.GameHistory) return;
  
  const listContainer = document.getElementById('recentGamesList');
  if (!listContainer) return;
  
  const recentGames = window.GameHistory.getRecentGames(10);
  const currentGameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  
  if (recentGames.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 16px;">No recent games</p>';
    return;
  }
  
  listContainer.innerHTML = '';
  
  recentGames.forEach(game => {
    const gameItem = document.createElement('div');
    gameItem.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; cursor: pointer; background: var(--bg-secondary); margin-bottom: 4px;';
    
    // Highlight current game
    if (game.gameId === currentGameId) {
      gameItem.style.background = 'var(--accent-primary)';
      gameItem.style.color = 'white';
    }
    
    // Favorite star
    const favBtn = document.createElement('button');
    favBtn.textContent = game.isFavorite ? '⭐' : '☆';
    favBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 16px; padding: 0; width: 24px;';
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavoriteGame(game.gameId);
    };
    
    // Game info
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'flex: 1; overflow: hidden;';
    
    const nameSpan = document.createElement('div');
    nameSpan.textContent = game.friendlyName;
    nameSpan.style.cssText = 'font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    
    const metaSpan = document.createElement('div');
    metaSpan.textContent = `${game.gameId} • ${window.GameHistory.formatDate(game.lastAccessed)}`;
    metaSpan.style.cssText = 'font-size: 0.75em; opacity: 0.7;';
    
    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(metaSpan);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.cssText = 'background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px; opacity: 0.6;';
    deleteBtn.title = 'Remove from history';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      removeGameFromHistory(game.gameId);
    };
    
    gameItem.appendChild(favBtn);
    gameItem.appendChild(infoDiv);
    gameItem.appendChild(deleteBtn);
    
    // Click to switch games
    gameItem.onclick = () => {
      if (game.gameId !== currentGameId) {
        switchToGame(game.gameId);
      }
    };
    
    listContainer.appendChild(gameItem);
  });
}

/**
 * Toggle favorite status for a game
 */
function toggleFavoriteGame(gameId) {
  if (window.GameHistory) {
    window.GameHistory.toggleFavorite(gameId);
    loadRecentGamesList();
  }
}

/**
 * Remove game from history (with option to delete from Firebase)
 */
function removeGameFromHistory(gameId) {
  const currentGameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  
  // Can't delete main game
  if (gameId === 'main') {
    alert('Cannot delete the main game');
    return;
  }
  
  // Show delete options
  const options = [
    'Remove from history only (keeps data in Firebase)',
    'Delete completely from Firebase and history',
    'Cancel'
  ];
  
  const choice = prompt(
    `Delete "${gameId}"?\n\n` +
    '1. Remove from history only\n' +
    '2. Delete completely (cannot undo)\n' +
    '3. Cancel\n\n' +
    'Enter 1, 2, or 3:'
  );
  
  if (choice === '1') {
    // Remove from history only
    if (window.GameHistory) {
      window.GameHistory.removeFromHistory(gameId);
      loadRecentGamesList();
    }
  } else if (choice === '2') {
    // Delete completely
    if (window.GameCleanup) {
      window.GameCleanup.deleteGameCompletely(gameId).then(success => {
        if (success) {
          loadRecentGamesList();
        }
      });
    } else {
      alert('Game cleanup module not loaded');
    }
  }
  // choice === '3' or anything else: cancel
}

/**
 * Switch to a different game
 */
function switchToGame(gameId) {
  if (window.GameManager) {
    const url = new URL(window.location);
    url.searchParams.set('game', gameId);
    window.location.href = url.toString();
  }
}

/**
 * Show reset game modal
 */
function showResetModal() {
  toggleGameModal(false);
  toggleResetModal(true);
}

/**
 * Toggle reset modal
 */
function toggleResetModal(show) {
  const modal = document.getElementById('resetModal');
  if (!modal) return;
  
  if (show) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  } else {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Confirm and execute game reset
 */
async function confirmResetGame() {
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  
  // Get reset options
  const resetScores = document.getElementById('resetScores')?.checked ?? true;
  const resetTimer = document.getElementById('resetTimer')?.checked ?? true;
  const resetPenalties = document.getElementById('resetPenalties')?.checked ?? true;
  const resetTeams = document.getElementById('resetTeams')?.checked ?? false;
  const resetSettings = document.getElementById('resetSettings')?.checked ?? false;
  
  const options = {
    resetScores,
    resetTimer,
    resetPenalties,
    resetTeams,
    resetSettings
  };
  
  if (!confirm('Are you sure you want to reset this game? This cannot be undone.')) {
    return;
  }
  
  try {
    if (window.resetGame) {
      const success = await window.resetGame(gameId, options);
      if (success) {
        alert('Game reset successfully!');
        toggleResetModal(false);
        // Reload page to reflect changes
        window.location.reload();
      } else {
        alert('Failed to reset game. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error resetting game:', error);
    alert('Error resetting game. Please try again.');
  }
}

/**
 * Toggle QR code section visibility
 */
function toggleQRSection() {
  const section = document.getElementById('qrSection');
  const button = event.target;
  
  if (!section) return;
  
  if (section.style.display === 'none') {
    // Show and generate QR codes
    section.style.display = 'block';
    button.textContent = '📱 Hide QR Codes';
    
    // Generate QR codes
    const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
    if (window.QRGenerator) {
      setTimeout(() => {
        window.QRGenerator.generateGameQRCodes(gameId);
      }, 100);
    }
  } else {
    // Hide
    section.style.display = 'none';
    button.textContent = '📱 Show QR Codes';
  }
}

/**
 * Download QR code as PNG
 */
function downloadQRCode(containerId, filename) {
  if (window.QRGenerator) {
    window.QRGenerator.downloadQRCode(containerId, filename);
  }
}

/**
 * Print QR codes
 */
function printQRCodes() {
  if (window.QRGenerator) {
    window.QRGenerator.printQRCodes();
  }
}

/**
 * Export current game data as JSON
 */
function exportCurrentGame() {
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  if (window.GameCleanup) {
    window.GameCleanup.downloadGameData(gameId);
  } else {
    alert('Game cleanup module not loaded');
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
