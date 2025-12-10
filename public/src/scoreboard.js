// Meerkats Board - Hockey Scoreboard Control Logic
// Includes audio alarms: beeps every minute + 3 buzzers at end

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let timerInterval = null;
let timerSeconds = 18 * 60; // Default 18 minutes (standard hockey period)
let syncIntervalMs = 100;
let timerRunning = false;
let timerStartedAt = null; // Timestamp when timer was started (for sync)
let timerInitialSeconds = null; // Duration at start (for sync)
let period = 1;
let gamePhase = "REG"; // REG, OT, SO
const REGULATION_PERIODS = 3;

let teamState = {
  A: { name: "Home Team", logo: "", score: 0 },
  B: { name: "Away Team", logo: "", score: 0 }
};

function setTeamLogoElement(elementId, logoUrl) {
  const logoEl = document.getElementById(elementId);
  if (!logoEl) return;
  if (logoUrl) {
    logoEl.src = logoUrl;
    logoEl.style.display = "";
  } else {
    logoEl.removeAttribute("src");
    logoEl.style.display = "none";
  }
}

let leagueName = "Juicebox Hockey";
let leagueLogo = "assets/images/juice_box.png";
let advancedSettings = {
  defaultPeriodMinutes: 18,
  autoMinuteHorn: true,
  syncPrecisionMs: 100,
};

/**
 * Update the page title and favicon to match the league branding
 */
function updatePageBranding() {
  // Update page title
  document.title = `${leagueName} - Control`;
  
  // Update favicon
  let favicon = document.querySelector("link[rel*='icon']");
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    document.head.appendChild(favicon);
  }
  favicon.href = leagueLogo;
}

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
  buzzerAudio.src = 'assets/sounds/hockey-buzzer.wav';
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
    buzzerAudio.src = 'assets/sounds/hockey-buzzer.mp3';
    buzzerAudio.addEventListener('error', () => {
      console.log('Custom buzzer audio not found, using synthesized sound');
      buzzerAudio = null;
    }, { once: true });
  }, { once: true });
  
  // Try to load minute beep audio file (optional)
  minuteBeepAudio = new Audio();
  minuteBeepAudio.src = 'assets/sounds/hockey-buzzer.wav';
  minuteBeepAudio.volume = 0.3;
  
  // Fallback to MP3
  minuteBeepAudio.addEventListener('error', () => {
    minuteBeepAudio.src = 'assets/sounds/hockey-buzzer.mp3';
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
 * Update timer based on elapsed time from start timestamp
 * Called every 100ms for smooth countdown
 */
function updateTimer() {
  if (!timerRunning || !timerStartedAt || timerInitialSeconds === null) {
    return;
  }
  
  // Calculate elapsed time in seconds
  const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
  timerSeconds = Math.max(0, timerInitialSeconds - elapsed);
  
  updateTimerDisplay();
  if (advancedSettings.autoMinuteHorn) {
    checkMinuteBeep();
  }
  
  // Stop automatically when reaching 0
  if (timerSeconds === 0) {
    stopTimer();
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
  timerStartedAt = Date.now(); // Record when timer started
  timerInitialSeconds = timerSeconds; // Record starting duration
  hasPlayedEndBuzzers = false; // Reset end buzzer flag
  
  // Update every 100ms for smooth countdown (no Firestore writes in loop)
  timerInterval = setInterval(updateTimer, 100);
  
  // Write to Firestore ONCE when starting
  saveStateToFirestore();
}

/**
 * Stop the countdown timer
 */
function stopTimer() {
  if (!timerRunning) return;
  
  // Calculate final time before stopping
  if (timerStartedAt && timerInitialSeconds !== null) {
    const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
    timerSeconds = Math.max(0, timerInitialSeconds - elapsed);
  }
  
  timerRunning = false;
  timerStartedAt = null;
  timerInitialSeconds = null;
  clearInterval(timerInterval);
  timerInterval = null;
  
  updateTimerDisplay();
  saveStateToFirestore(); // Write ONCE with final value
}

/**
 * Reset the timer to default (18:00)
 */
function resetTimer() {
  stopTimer();
  timerSeconds = advancedSettings.defaultPeriodMinutes * 60;
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

  setupSettingsTabs();
  initializeAdvancedSettingsForm();
});

/**
 * Parse timer input and update timer state
 * @param {string} value - Timer input value
 */
function parseAndSetTimer(value) {
  // If timer is running, stop it first
  if (timerRunning) {
    stopTimer();
  }
  
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

    const defaultPeriodInput = document.getElementById("defaultPeriodLengthInput");
    if (defaultPeriodInput) {
      defaultPeriodInput.value = advancedSettings.defaultPeriodMinutes;
    }
    const autoHornToggle = document.getElementById("autoHornToggle");
    if (autoHornToggle) {
      autoHornToggle.checked = advancedSettings.autoMinuteHorn;
    }
    const syncPrecisionSelect = document.getElementById("syncPrecisionSelect");
    if (syncPrecisionSelect) {
      syncPrecisionSelect.value = String(advancedSettings.syncPrecisionMs);
    }
    
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

    activateSettingsTab('branding');

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
 * Handle settings tabs
 */
function activateSettingsTab(tabId) {
  const tabButtons = document.querySelectorAll('.settings-tab-button');
  const tabPanels = document.querySelectorAll('.settings-tab-panel');

  tabButtons.forEach(button => {
    const isActive = button.dataset.settingsTab === tabId;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  tabPanels.forEach(panel => {
    const isActive = panel.dataset.settingsPanel === tabId;
    panel.classList.toggle('active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });
}

function setupSettingsTabs() {
  const tabButtons = document.querySelectorAll('.settings-tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      activateSettingsTab(button.dataset.settingsTab);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const buttonsArray = Array.from(tabButtons);
        const currentIndex = buttonsArray.indexOf(button);
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = buttonsArray.length - 1;
        if (nextIndex >= buttonsArray.length) nextIndex = 0;
        buttonsArray[nextIndex].focus();
        activateSettingsTab(buttonsArray[nextIndex].dataset.settingsTab);
      }
    });
  });
}

function initializeAdvancedSettingsForm() {
  const defaultPeriodInput = document.getElementById("defaultPeriodLengthInput");
  if (defaultPeriodInput) {
    defaultPeriodInput.value = advancedSettings.defaultPeriodMinutes;
  }
  const autoHornToggle = document.getElementById("autoHornToggle");
  if (autoHornToggle) {
    autoHornToggle.checked = advancedSettings.autoMinuteHorn;
  }
  const syncPrecisionSelect = document.getElementById("syncPrecisionSelect");
  if (syncPrecisionSelect) {
    syncPrecisionSelect.value = String(advancedSettings.syncPrecisionMs);
  }
}

function populateVisibilityGrid() {
  const grid = document.getElementById('visibilityGrid');
  if (!grid) return;

  const elements = [
    { key: 'Period', label: 'Period / Phase', controlId: 'showPeriodControl', viewId: 'showPeriodView', icon: '🕒' },
    { key: 'Timer', label: 'Timer', controlId: 'showTimerControl', viewId: 'showTimerView', icon: '⏱️' },
    { key: 'Scores', label: 'Scores', controlId: 'showScoresControl', viewId: 'showScoresView', icon: '🏒' },
    { key: 'Logos', label: 'Team Logos', controlId: 'showTeamLogosControl', viewId: 'showTeamLogosView', icon: '🛡️' },
    { key: 'Names', label: 'Team Names', controlId: 'showTeamNamesControl', viewId: 'showTeamNamesView', icon: '🏷️' },
    { key: 'League', label: 'League Info', controlId: 'showLeagueControl', viewId: 'showLeagueView', icon: '🏆' },
  ];

  grid.innerHTML = '';

  elements.forEach((element) => {
    const card = document.createElement('div');
    card.className = 'visibility-card';
    card.innerHTML = `
      <div class="visibility-card-header">
        <span class="visibility-card-icon">${element.icon}</span>
        <div>
          <h4>${element.label}</h4>
          <p class="settings-help">Toggle separately for controller and display.</p>
        </div>
      </div>
      <div class="visibility-card-toggles">
        <label>
          <input type="checkbox" id="${element.controlId}" class="settings-checkbox" ${visibilitySettings[`show${element.key}Control`] ? 'checked' : ''}>
          <span>Control</span>
        </label>
        <label>
          <input type="checkbox" id="${element.viewId}" class="settings-checkbox" ${visibilitySettings[`show${element.key}View`] ? 'checked' : ''}>
          <span>Display</span>
        </label>
      </div>
    `;

    grid.appendChild(card);
  });
}

function updateSyncInterval() {
  if (window.__syncIntervalId) {
    clearInterval(window.__syncIntervalId);
  }

  window.__syncIntervalId = setInterval(() => {
    if (timerRunning) {
      saveStateToFirestore();
    }
  }, advancedSettings.syncPrecisionMs);
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

  populateVisibilityGrid();
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
    updatePageBranding();
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
  
  // Update advanced settings
  const defaultPeriodInput = document.getElementById("defaultPeriodLengthInput");
  if (defaultPeriodInput) {
    const minutesValue = Number(defaultPeriodInput.value);
    if (!Number.isNaN(minutesValue) && minutesValue >= 1 && minutesValue <= 60) {
      advancedSettings.defaultPeriodMinutes = minutesValue;
    }
  }
  const autoHornToggle = document.getElementById("autoHornToggle");
  if (autoHornToggle) {
    advancedSettings.autoMinuteHorn = autoHornToggle.checked;
  }
  const syncPrecisionSelect = document.getElementById("syncPrecisionSelect");
  if (syncPrecisionSelect) {
    advancedSettings.syncPrecisionMs = Number(syncPrecisionSelect.value);
  }
  updateSyncInterval();

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
    const file = leagueLogoInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      leagueLogo = e.target.result;
      const navbarLeagueLogo = document.getElementById("navbarLeagueLogo");
      if (navbarLeagueLogo) {
        navbarLeagueLogo.src = leagueLogo;
        navbarLeagueLogo.style.display = 'block';
      }
      updatePageBranding();
      // Save to gallery
      saveLogoToGallery('league', leagueLogo, file.name);
      saveStateToFirestore();
    };
    reader.readAsDataURL(file);
  }
  
  const teamALogoInput = document.getElementById("teamALogoInput");
  if (teamALogoInput.files[0]) {
    const file = teamALogoInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      teamState.A.logo = e.target.result;
      setTeamLogoElement("teamALogo", teamState.A.logo);
      // Save to gallery
      saveLogoToGallery('team', teamState.A.logo, file.name);
      saveStateToFirestore();
    };
    reader.readAsDataURL(file);
  }
  
  const teamBLogoInput = document.getElementById("teamBLogoInput");
  if (teamBLogoInput.files[0]) {
    const file = teamBLogoInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      teamState.B.logo = e.target.result;
      setTeamLogoElement("teamBLogo", teamState.B.logo);
      // Save to gallery
      saveLogoToGallery('team', teamState.B.logo, file.name);
      saveStateToFirestore();
    };
    reader.readAsDataURL(file);
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
    timerSeconds: advancedSettings.defaultPeriodMinutes * 60,
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
    leagueLogo: "assets/images/juice_box.png",
    theme: "dark",
    advancedSettings,
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
    timerStartedAt, // NEW: For synchronized timer
    timerInitialSeconds, // NEW: For synchronized timer
    period,
    gamePhase,
    teamA: teamState.A,
    teamB: teamState.B,
    leagueName,
    leagueLogo,
    theme: document.body.getAttribute('data-theme') || 'dark',
    visibilitySettings: visibilitySettings,
    advancedSettings,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  isLocalUpdate = true;
  window.SCOREBOARD_DOC.set(state).catch((error) => {
    console.error("Error saving to Firestore:", error);
  });
}

/**
 * Save state to localStorage cache for instant loading
 */
function saveStateToCache(state) {
  try {
    const cacheKey = `scoreboard_cache_${window.GameManager ? window.GameManager.getCurrentGameId() : 'main'}`;
    const cacheData = {
      ...state,
      cachedAt: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache state:', error);
  }
}

/**
 * Load state from localStorage cache
 */
function loadStateFromCache() {
  try {
    const cacheKey = `scoreboard_cache_${window.GameManager ? window.GameManager.getCurrentGameId() : 'main'}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // Check if cache is less than 7 days old
    const age = Date.now() - (cacheData.cachedAt || 0);
    if (age > 7 * 24 * 60 * 60 * 1000) {
      return null; // Cache too old
    }
    
    return cacheData;
  } catch (error) {
    console.warn('Failed to load cache:', error);
    return null;
  }
}

/**
 * Load state from Firestore snapshot
 */
function loadStateFromSnapshot(snapshot, isFromCache = false) {
  if (!snapshot.exists && !isFromCache) {
    // Initialize with default state
    window.SCOREBOARD_DOC.set(getDefaultState());
    return;
  }
  
  const state = isFromCache ? snapshot : snapshot.data();
  
  // Save to cache for next time (only if from Firebase, not from cache itself)
  if (!isFromCache) {
    saveStateToCache(state);
  }
  
  if (!isLocalUpdate || isFromCache) {
    // Update local state from remote
    // Don't use fallback for timerSeconds - it could be 0
    if (state.timerSeconds !== undefined) {
      timerSeconds = state.timerSeconds;
    }
    
    // Load synchronized timer fields
    timerStartedAt = state.timerStartedAt || null;
    timerInitialSeconds = state.timerInitialSeconds || null;
    
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
    
    setTeamLogoElement("teamALogo", teamState.A.logo);
    setTeamLogoElement("teamBLogo", teamState.B.logo);
    
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
    updatePageBranding();
    
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

    if (state.advancedSettings) {
      const prevDefaultMinutes = advancedSettings.defaultPeriodMinutes;
      advancedSettings = state.advancedSettings;
      if (!timerRunning) {
        if (state.timerSeconds !== undefined) {
          timerSeconds = state.timerSeconds;
        } else if (advancedSettings.defaultPeriodMinutes !== prevDefaultMinutes) {
          timerSeconds = advancedSettings.defaultPeriodMinutes * 60;
        }
        updateTimerDisplay();
      }
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
  
  // Try to load from cache first for instant display
  const cachedState = loadStateFromCache();
  if (cachedState) {
    console.log("Loading from cache for instant display");
    loadStateFromSnapshot(cachedState, true);
  } else {
    // No cache, show defaults
    updateTimerDisplay();
    updatePhaseDisplay();
    applyVisibilitySettings();
  }
  
  // Initialize Firebase with game ID
  if (window.initializeScoreboardDoc) {
    window.initializeScoreboardDoc(gameId);
    window.SCOREBOARD_DOC = window.getScoreboardDoc();
  }
  
  // Update game ID display in UI
  updateGameIdDisplay(gameId);
  
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
let gameModalLastFocusedElement = null;

async function toggleGameModal(show) {
  const modal = document.getElementById('gameModal');
  const closeButton = document.querySelector('#gameModal .settings-close');
  if (!modal) return;
  
  if (show) {
    gameModalLastFocusedElement = document.activeElement;
    const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
    
    const modalDisplay = document.getElementById('currentGameIdDisplay');
    if (modalDisplay) {
      modalDisplay.textContent = gameId;
    }
    
    const gameNameInput = document.getElementById('gameNameInput');
    if (gameNameInput && window.getGameName) {
      const gameName = await window.getGameName(gameId);
      gameNameInput.value = gameName === gameId ? '' : gameName;
    }
    
    loadRecentGamesList();
    
    modal.removeAttribute('aria-hidden');
    modal.style.display = 'flex';
    if (closeButton) {
      closeButton.setAttribute('tabindex', '0');
      closeButton.focus();
    }
  } else {
    await saveGameName();
    
    if (closeButton) {
      closeButton.blur();
      closeButton.setAttribute('tabindex', '-1');
    }
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    if (gameModalLastFocusedElement && typeof gameModalLastFocusedElement.focus === 'function') {
      gameModalLastFocusedElement.focus();
    }
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

function openDisplayView(event) {
  if (event) {
    event.preventDefault();
  }
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  const url = window.GameManager ? window.GameManager.getGameUrl(gameId, true) : `view.html?game=${gameId}`;
  window.open(url, '_blank', 'noopener');
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

// ============================================================================
// LOGO GALLERY MANAGEMENT
// ============================================================================

let currentLogoType = null; // 'league', 'teamA', or 'teamB'

/**
 * Convert base64 data URL to Blob
 */
function base64ToBlob(base64Data) {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Get logos from Firebase or localStorage
 */
async function getLogosFromGallery(type) {
  const user = firebase.auth().currentUser;
  
  // If user is authenticated, fetch from Firestore
  if (user && window.db) {
    try {
      const galleryType = type === 'league' ? 'league' : 'team';
      const snapshot = await window.db
        .collection('users')
        .doc(user.uid)
        .collection('logoGallery')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      // Filter by type in client-side
      const logos = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === galleryType) {
          logos.push({
            id: doc.id,
            url: data.url,
            name: data.name,
            timestamp: data.timestamp,
            storagePath: data.storagePath
          });
        }
      });
      
      // Keep only last 20 logos of this type
      return logos.slice(0, 20);
    } catch (error) {
      console.error('❌ Error fetching logos from Firebase:', error);
      alert('Error loading logos from Firebase: ' + error.message);
      return []; // Return empty array on error
    }
  } else {
    console.warn('⚠️ User not authenticated, cannot load logos');
    return []; // Return empty array if not authenticated
  }
}

/**
 * Compress and resize image if needed
 */
async function compressImage(base64Data, maxSizeMB = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Max dimensions for logos
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with quality 0.9 and reduce if needed
      let quality = 0.9;
      let compressedData = canvas.toDataURL('image/jpeg', quality);
      
      // If still too large, reduce quality
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      while (compressedData.length > maxSizeBytes && quality > 0.5) {
        quality -= 0.1;
        compressedData = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedData);
    };
    img.onerror = reject;
    img.src = base64Data;
  });
}

/**
 * Save logo to gallery with compression and size limits
 */
async function saveLogoToGallery(type, base64Data, filename) {
  const user = firebase.auth().currentUser;
  
  // Check authentication
  if (!user || !window.storage || !window.db) {
    alert('Please sign in to upload logos. Firebase Storage requires authentication.');
    throw new Error('User not authenticated');
  }
  
  try {
    const galleryType = type === 'league' ? 'league' : 'team';
    
    // Check if this exact logo already exists in gallery (avoid duplicates)
    const existingLogos = await window.db
      .collection('users')
      .doc(user.uid)
      .collection('logoGallery')
      .where('type', '==', galleryType)
      .where('name', '==', filename)
      .limit(1)
      .get();
    
    // If logo with same name exists and was uploaded recently (within 5 seconds), skip
    if (!existingLogos.empty) {
      const existingDoc = existingLogos.docs[0];
      const existingData = existingDoc.data();
      const timeDiff = Date.now() - existingData.timestamp;
      if (timeDiff < 5000) {
        console.log('Logo already exists, skipping duplicate upload');
        return existingData.url;
      }
    }
    
    // Check file size (base64 is ~33% larger than actual file)
    const estimatedSizeMB = (base64Data.length * 0.75) / (1024 * 1024);
    
    // If larger than 5MB, compress it
    let processedData = base64Data;
    if (estimatedSizeMB > 5) {
      alert('Image is large, compressing...');
      processedData = await compressImage(base64Data, 2);
    }
    
    // Convert base64 to blob
    const blob = base64ToBlob(processedData);
    
    // Final size check
    const finalSizeMB = blob.size / (1024 * 1024);
    if (finalSizeMB > 5) {
      alert('Image is too large (max 5MB). Please use a smaller image.');
      throw new Error('Image too large');
    }
    
    // Create storage path
    const timestamp = Date.now();
    const storagePath = `logos/${user.uid}/${galleryType}/${timestamp}-${filename}`;
    
    // Upload to Firebase Storage
    const storageRef = window.storage.ref().child(storagePath);
    const uploadTask = await storageRef.put(blob);
    
    // Get download URL
    const downloadURL = await uploadTask.ref.getDownloadURL();
    
    // Save metadata to Firestore
    await window.db.collection('users').doc(user.uid).collection('logoGallery').add({
      url: downloadURL,
      name: filename || 'Untitled',
      type: galleryType,
      storagePath: storagePath,
      timestamp: timestamp
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error saving logo to Firebase:', error);
    alert('Error uploading logo: ' + error.message);
    throw error;
  }
}

/**
 * Delete logo from gallery
 */
async function deleteLogoFromGallery(type, logoIdOrIndex) {
  const user = firebase.auth().currentUser;
  
  // If user is authenticated and logoIdOrIndex is a string (Firebase document ID)
  if (user && window.db && window.storage && typeof logoIdOrIndex === 'string') {
    try {
      // Get the logo document to get storage path
      const docRef = window.db
        .collection('users')
        .doc(user.uid)
        .collection('logoGallery')
        .doc(logoIdOrIndex);
      
      const doc = await docRef.get();
      
      if (doc.exists) {
        const data = doc.data();
        
        // Delete from Storage
        if (data.storagePath) {
          await window.storage.ref().child(data.storagePath).delete();
        }
        
        // Delete from Firestore
        await docRef.delete();
        
        console.log('✅ Logo deleted from Firebase');
      }
    } catch (error) {
      console.error('❌ Error deleting logo from Firebase:', error);
      alert('Error deleting logo: ' + error.message);
    }
  } else {
    console.error('❌ Cannot delete logo: User not authenticated');
    alert('Please sign in to delete logos.');
  }
  
  // Refresh gallery display
  renderLogoGallery(type);
}

/**
 * Open logo gallery modal
 */
function openLogoGallery(type) {
  currentLogoType = type;
  const modal = document.getElementById('logoGalleryModal');
  const heading = document.getElementById('logoGalleryHeading');
  
  // Update heading based on type
  const titles = {
    'league': 'Choose League Logo',
    'teamA': 'Choose Home Team Logo',
    'teamB': 'Choose Away Team Logo'
  };
  heading.textContent = titles[type] || 'Choose Logo';
  
  // Render logos
  renderLogoGallery(type);
  
  // Show modal
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

/**
 * Close logo gallery modal
 */
function closeLogoGallery() {
  const modal = document.getElementById('logoGalleryModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  currentLogoType = null;
}

/**
 * Render logo gallery grid
 */
async function renderLogoGallery(type) {
  const galleryType = type === 'league' ? 'league' : 'team';
  const grid = document.getElementById('logoGalleryGrid');
  const emptyMessage = document.getElementById('logoGalleryEmpty');
  
  // Show loading state
  grid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Loading logos...</p>';
  grid.style.display = 'block';
  emptyMessage.style.display = 'none';
  
  const logos = await getLogosFromGallery(galleryType);
  
  if (logos.length === 0) {
    grid.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  emptyMessage.style.display = 'none';
  grid.innerHTML = '';
  
  const user = firebase.auth().currentUser;
  
  logos.forEach((logo, index) => {
    const item = document.createElement('div');
    item.className = 'logo-gallery-item';
    item.onclick = () => selectLogoFromGallery(type, logo.url);
    
    const img = document.createElement('img');
    img.src = logo.url;
    img.alt = logo.name;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-logo';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete logo';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Delete this logo from gallery?')) {
        // Use logo ID for Firebase, index for localStorage
        const identifier = (user && logo.id) ? logo.id : index;
        deleteLogoFromGallery(galleryType, identifier);
      }
    };
    
    item.appendChild(img);
    item.appendChild(deleteBtn);
    grid.appendChild(item);
  });
}

/**
 * Select logo from gallery
 */
function selectLogoFromGallery(type, logoUrl) {
  // Apply the logo based on type
  // Note: We don't call saveLogoToGallery() here because the logo is already in Firebase Storage
  if (type === 'league') {
    leagueLogo = logoUrl;
    const navbarLeagueLogo = document.getElementById('navbarLeagueLogo');
    if (navbarLeagueLogo) {
      navbarLeagueLogo.src = leagueLogo;
      navbarLeagueLogo.style.display = 'block';
    }
    updatePageBranding();
  } else if (type === 'teamA') {
    teamState.A.logo = logoUrl;
    const teamALogo = document.getElementById('teamALogo');
    setTeamLogoElement('teamALogo', teamState.A.logo);
  } else if (type === 'teamB') {
    teamState.B.logo = logoUrl;
    setTeamLogoElement('teamBLogo', teamState.B.logo);
  }
  
  // Save to Firestore (saves the scoreboard state, not the logo to gallery)
  saveStateToFirestore();
  
  // Close gallery
  closeLogoGallery();
}

// Add event listeners for logo uploads
function setupLogoUploadListeners() {
  // League logo upload
  const leagueLogoInput = document.getElementById('leagueLogoInput');
  if (leagueLogoInput) {
    leagueLogoInput.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          leagueLogo = e.target.result;
          const navbarLeagueLogo = document.getElementById('navbarLeagueLogo');
          if (navbarLeagueLogo) {
            navbarLeagueLogo.src = leagueLogo;
            navbarLeagueLogo.style.display = 'block';
          }
          updatePageBranding();
          // Save to gallery
          await saveLogoToGallery('league', leagueLogo, file.name);
          saveStateToFirestore();
          alert('✅ League logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Team A logo upload
  const teamALogoInput = document.getElementById('teamALogoInput');
  if (teamALogoInput) {
    teamALogoInput.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          teamState.A.logo = e.target.result;
          setTeamLogoElement('teamALogo', teamState.A.logo);
          // Save to gallery
          await saveLogoToGallery('team', teamState.A.logo, file.name);
          saveStateToFirestore();
          alert('✅ Home team logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Team B logo upload
  const teamBLogoInput = document.getElementById('teamBLogoInput');
  if (teamBLogoInput) {
    teamBLogoInput.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          teamState.B.logo = e.target.result;
          setTeamLogoElement('teamBLogo', teamState.B.logo);
          // Save to gallery
          await saveLogoToGallery('team', teamState.B.logo, file.name);
          saveStateToFirestore();
          alert('✅ Away team logo uploaded successfully!');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupLogoUploadListeners();
  });
} else {
  initializeApp();
  setupLogoUploadListeners();
}

// ============================================================================
// PRESENCE TRACKING INTEGRATION
// ============================================================================

// Initialize presence tracking after game ID is available
function initializePresenceTracking() {
  const gameId = getCurrentGameId();
  
  if (gameId && typeof presenceTracker !== 'undefined') {
    // Initialize as controller
    presenceTracker.initialize(gameId, 'controller');
    
    // Listen for presence changes and update UI
    presenceTracker.onPresenceChange((controllers, viewers, total) => {
      updateViewerCountBadge(controllers, viewers, total);
    });
    
    console.log('[Scoreboard] Presence tracking initialized for game:', gameId);
  } else {
    console.warn('[Scoreboard] Presence tracking not available or no game ID');
  }
}

// Update viewer count badge in UI
function updateViewerCountBadge(controllers, viewers, total) {
  const badge = document.getElementById('viewerCountBadge');
  const text = document.getElementById('viewerCountText');
  
  if (text) {
    text.textContent = total;
    
    // Update title with breakdown
    if (badge) {
      badge.title = `${total} active: ${controllers} controller${controllers !== 1 ? 's' : ''}, ${viewers} viewer${viewers !== 1 ? 's' : ''}`;
      
      // Add pulse animation on change
      badge.classList.add('updated');
      setTimeout(() => badge.classList.remove('updated'), 600);
    }
  }
}

// Initialize presence after a short delay to ensure game ID is set
setTimeout(() => {
  initializePresenceTracking();
}, 1000);
