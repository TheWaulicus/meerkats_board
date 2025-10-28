// Game History Manager - Local Storage Management for Game List
// Tracks user's game history for quick access and switching

const HISTORY_KEY = 'meerkats_game_history';
const MAX_HISTORY = 50; // Maximum games to store

/**
 * Game History Entry Structure
 * @typedef {Object} GameHistoryEntry
 * @property {string} gameId - Unique game ID
 * @property {string} friendlyName - User-friendly game name
 * @property {number} lastAccessed - Timestamp of last access
 * @property {number} createdDate - Timestamp when game was created
 * @property {boolean} isFavorite - Whether game is favorited
 * @property {string} createdBy - 'me' or 'other'
 */

/**
 * Get all games from history
 * @returns {GameHistoryEntry[]} Array of game history entries
 */
function getGameHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error reading game history:', error);
    return [];
  }
}

/**
 * Save game history to localStorage
 * @param {GameHistoryEntry[]} history - Array of game history entries
 */
function saveGameHistory(history) {
  try {
    // Limit to MAX_HISTORY entries
    const limited = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error saving game history:', error);
  }
}

/**
 * Add or update a game in history
 * @param {string} gameId - Game ID to add
 * @param {string} friendlyName - Optional friendly name
 * @param {boolean} isNewGame - Whether this is a newly created game
 */
function addToHistory(gameId, friendlyName = '', isNewGame = false) {
  let history = getGameHistory();
  const now = Date.now();
  
  // Normalize game ID to lowercase for consistency
  const normalizedGameId = gameId.toLowerCase();
  
  // Check if game already exists (case-insensitive)
  const existingIndex = history.findIndex(g => g.gameId.toLowerCase() === normalizedGameId);
  
  if (existingIndex >= 0) {
    // Update existing entry
    history[existingIndex].gameId = normalizedGameId; // Ensure lowercase
    history[existingIndex].lastAccessed = now;
    if (friendlyName) {
      history[existingIndex].friendlyName = friendlyName;
    }
    
    // Move to front of list
    const [updated] = history.splice(existingIndex, 1);
    history.unshift(updated);
  } else {
    // Add new entry
    const newEntry = {
      gameId: normalizedGameId,
      friendlyName: friendlyName || normalizedGameId,
      lastAccessed: now,
      createdDate: now,
      isFavorite: false,
      createdBy: isNewGame ? 'me' : 'other'
    };
    history.unshift(newEntry);
  }
  
  // Remove duplicates (case-insensitive)
  history = deduplicateHistory(history);
  
  saveGameHistory(history);
  console.log('Game added to history:', normalizedGameId);
}

/**
 * Update friendly name for a game
 * @param {string} gameId - Game ID
 * @param {string} friendlyName - New friendly name
 */
function updateGameName(gameId, friendlyName) {
  const history = getGameHistory();
  const game = history.find(g => g.gameId === gameId);
  
  if (game) {
    game.friendlyName = friendlyName;
    saveGameHistory(history);
    console.log('Game name updated:', gameId, friendlyName);
  }
}

/**
 * Toggle favorite status for a game
 * @param {string} gameId - Game ID
 */
function toggleFavorite(gameId) {
  const history = getGameHistory();
  const game = history.find(g => g.gameId === gameId);
  
  if (game) {
    game.isFavorite = !game.isFavorite;
    saveGameHistory(history);
    console.log('Game favorite toggled:', gameId, game.isFavorite);
    return game.isFavorite;
  }
  return false;
}

/**
 * Remove a game from history
 * @param {string} gameId - Game ID to remove
 */
function removeFromHistory(gameId) {
  const history = getGameHistory();
  const filtered = history.filter(g => g.gameId !== gameId);
  saveGameHistory(filtered);
  console.log('Game removed from history:', gameId);
}

/**
 * Get recent games (last N games accessed)
 * @param {number} limit - Number of games to return
 * @returns {GameHistoryEntry[]} Recent games
 */
function getRecentGames(limit = 10) {
  const history = getGameHistory();
  return history.slice(0, limit);
}

/**
 * Get favorite games
 * @returns {GameHistoryEntry[]} Favorite games
 */
function getFavoriteGames() {
  const history = getGameHistory();
  return history.filter(g => g.isFavorite);
}

/**
 * Search games by name or ID
 * @param {string} query - Search query
 * @returns {GameHistoryEntry[]} Matching games
 */
function searchGames(query) {
  if (!query) return getGameHistory();
  
  const history = getGameHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(g => 
    g.gameId.toLowerCase().includes(lowerQuery) ||
    g.friendlyName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort games by various criteria
 * @param {string} sortBy - 'recent', 'name', 'created', 'favorites'
 * @returns {GameHistoryEntry[]} Sorted games
 */
function sortGames(sortBy = 'recent') {
  const history = getGameHistory();
  
  switch (sortBy) {
    case 'name':
      return history.sort((a, b) => 
        a.friendlyName.localeCompare(b.friendlyName)
      );
    
    case 'created':
      return history.sort((a, b) => b.createdDate - a.createdDate);
    
    case 'favorites':
      return history.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return b.lastAccessed - a.lastAccessed;
        }
        return a.isFavorite ? -1 : 1;
      });
    
    case 'recent':
    default:
      return history.sort((a, b) => b.lastAccessed - a.lastAccessed);
  }
}

/**
 * Remove duplicate game entries (case-insensitive)
 * Keeps the most recently accessed version
 * @param {GameHistoryEntry[]} history - Game history array
 * @returns {GameHistoryEntry[]} Deduplicated history
 */
function deduplicateHistory(history) {
  const seen = new Map();
  const deduplicated = [];
  
  for (const entry of history) {
    const normalizedId = entry.gameId.toLowerCase();
    
    if (!seen.has(normalizedId)) {
      // Keep this entry (first occurrence, which is most recent due to sorting)
      seen.set(normalizedId, true);
      deduplicated.push({
        ...entry,
        gameId: normalizedId // Ensure lowercase
      });
    }
  }
  
  return deduplicated;
}

/**
 * Clear all game history
 */
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  console.log('Game history cleared');
}

/**
 * Clean up duplicate games in history
 * Merges case-insensitive duplicates
 */
function cleanupDuplicates() {
  let history = getGameHistory();
  history = deduplicateHistory(history);
  saveGameHistory(history);
  console.log('History cleaned, duplicates removed');
  return history.length;
}

/**
 * Format date for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.GameHistory = {
    getGameHistory,
    addToHistory,
    updateGameName,
    toggleFavorite,
    removeFromHistory,
    getRecentGames,
    getFavoriteGames,
    searchGames,
    sortGames,
    clearHistory,
    cleanupDuplicates,
    formatDate
  };
  
  // Auto-cleanup duplicates on load
  setTimeout(() => {
    if (window.GameHistory) {
      window.GameHistory.cleanupDuplicates();
    }
  }, 1000);
}
