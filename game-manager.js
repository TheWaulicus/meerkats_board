// Game Manager - Multi-Game ID System
// Handles game ID generation, storage, and URL management

/**
 * Generate a random game ID
 * @returns {string} Game ID in format "game-XXXXXX"
 */
function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'game-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Sanitize game ID (remove invalid characters)
 * @param {string} id - Game ID to sanitize
 * @returns {string} Sanitized game ID
 */
function sanitizeGameId(id) {
  if (!id) return 'main';
  // Allow only alphanumeric, hyphens, and underscores
  return id.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

/**
 * Get current game ID from URL, localStorage, or default
 * Priority: URL param > localStorage > default "main"
 * @returns {string} Current game ID
 */
function getCurrentGameId() {
  // 1. Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get('game');
  
  if (urlGameId) {
    const sanitized = sanitizeGameId(urlGameId);
    // Save to localStorage for future visits
    localStorage.setItem('lastGameId', sanitized);
    
    // Add to history
    if (window.GameHistory) {
      window.GameHistory.addToHistory(sanitized);
    }
    
    return sanitized;
  }
  
  // 2. Check localStorage (last used game)
  const storedGameId = localStorage.getItem('lastGameId');
  if (storedGameId) {
    return sanitizeGameId(storedGameId);
  }
  
  // 3. Default to "main"
  return 'main';
}

/**
 * Set current game ID and update URL
 * @param {string} gameId - Game ID to set
 */
function setGameId(gameId) {
  const sanitized = sanitizeGameId(gameId);
  
  // Update localStorage
  localStorage.setItem('lastGameId', sanitized);
  
  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('game', sanitized);
  window.history.pushState({}, '', url);
  
  console.log('Game ID set to:', sanitized);
}

/**
 * Get shareable URL for current game
 * @param {string} gameId - Game ID to create URL for
 * @param {boolean} isViewMode - True for view.html, false for index.html
 * @returns {string} Shareable URL
 */
function getGameUrl(gameId, isViewMode = false) {
  const sanitized = sanitizeGameId(gameId);
  const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace('view.html', '');
  const page = isViewMode ? 'view.html' : 'index.html';
  return `${baseUrl}${page}?game=${sanitized}`;
}

/**
 * Copy game URL to clipboard
 * @param {string} gameId - Game ID
 * @param {boolean} isViewMode - View or control URL
 */
function copyGameUrl(gameId, isViewMode = false) {
  const url = getGameUrl(gameId, isViewMode);
  
  navigator.clipboard.writeText(url).then(() => {
    alert(`${isViewMode ? 'Display' : 'Control'} link copied to clipboard!\n\n${url}`);
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback: show URL in prompt
    prompt('Copy this URL:', url);
  });
}

/**
 * Create a new game and switch to it
 */
function createNewGame() {
  const newGameId = generateGameId();
  console.log('Creating new game:', newGameId);
  
  // Add to history
  if (window.GameHistory) {
    window.GameHistory.addToHistory(newGameId, '', true);
  }
  
  // Reload page with new game ID
  const url = new URL(window.location);
  url.searchParams.set('game', newGameId);
  window.location.href = url.toString();
}

/**
 * Join an existing game by ID
 * @param {string} gameId - Game ID to join
 */
function joinGameById(gameId) {
  const sanitized = sanitizeGameId(gameId);
  
  if (!sanitized || sanitized === 'main') {
    alert('Please enter a valid game ID');
    return;
  }
  
  console.log('Joining game:', sanitized);
  
  // Add to history
  if (window.GameHistory) {
    window.GameHistory.addToHistory(sanitized, '', false);
  }
  
  // Reload page with new game ID
  const url = new URL(window.location);
  url.searchParams.set('game', sanitized);
  window.location.href = url.toString();
}

/**
 * Handle browser back/forward button
 * Reload if game ID in URL changes
 */
window.addEventListener('popstate', () => {
  const currentGameId = getCurrentGameId();
  const displayedGameId = document.getElementById('currentGameId')?.textContent;
  
  if (currentGameId !== displayedGameId) {
    console.log('Game ID changed via browser navigation, reloading...');
    window.location.reload();
  }
});

// Export for use in other files
if (typeof window !== 'undefined') {
  window.GameManager = {
    generateGameId,
    sanitizeGameId,
    getCurrentGameId,
    setGameId,
    getGameUrl,
    copyGameUrl,
    createNewGame,
    joinGameById
  };
}
