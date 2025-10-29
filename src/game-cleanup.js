// Game Cleanup - Delete and Archive Games
// Handles deletion and archiving of games from Firebase and history

/**
 * Delete game from Firebase
 * @param {string} gameId - Game ID to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteGameFromFirebase(gameId) {
  if (!gameId || gameId === 'main') {
    console.error('Cannot delete main game');
    return false;
  }
  
  try {
    if (!window.db) {
      console.error('Firebase not initialized');
      return false;
    }
    
    const docRef = window.db.collection('scoreboards').doc(gameId);
    await docRef.delete();
    console.log('Game deleted from Firebase:', gameId);
    return true;
  } catch (error) {
    console.error('Error deleting game from Firebase:', error);
    return false;
  }
}

/**
 * Archive game (mark as archived in Firebase)
 * @param {string} gameId - Game ID to archive
 * @returns {Promise<boolean>} Success status
 */
async function archiveGame(gameId) {
  if (!gameId || gameId === 'main') {
    console.error('Cannot archive main game');
    return false;
  }
  
  try {
    if (!window.db) {
      console.error('Firebase not initialized');
      return false;
    }
    
    const docRef = window.db.collection('scoreboards').doc(gameId);
    await docRef.set({
      archived: true,
      archivedDate: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('Game archived:', gameId);
    return true;
  } catch (error) {
    console.error('Error archiving game:', error);
    return false;
  }
}

/**
 * Restore game from archive
 * @param {string} gameId - Game ID to restore
 * @returns {Promise<boolean>} Success status
 */
async function restoreGame(gameId) {
  if (!gameId) {
    console.error('Invalid game ID');
    return false;
  }
  
  try {
    if (!window.db) {
      console.error('Firebase not initialized');
      return false;
    }
    
    const docRef = window.db.collection('scoreboards').doc(gameId);
    await docRef.update({
      archived: firebase.firestore.FieldValue.delete(),
      archivedDate: firebase.firestore.FieldValue.delete()
    });
    
    console.log('Game restored from archive:', gameId);
    return true;
  } catch (error) {
    console.error('Error restoring game:', error);
    return false;
  }
}

/**
 * Check if game is archived
 * @param {string} gameId - Game ID to check
 * @returns {Promise<boolean>} True if archived
 */
async function isGameArchived(gameId) {
  try {
    if (!window.db) return false;
    
    const docRef = window.db.collection('scoreboards').doc(gameId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return data.archived === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking archive status:', error);
    return false;
  }
}

/**
 * Export game data as JSON
 * @param {string} gameId - Game ID to export
 * @returns {Promise<object|null>} Game data
 */
async function exportGameData(gameId) {
  try {
    if (!window.db) {
      console.error('Firebase not initialized');
      return null;
    }
    
    const docRef = window.db.collection('scoreboards').doc(gameId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return {
        gameId,
        exportedAt: new Date().toISOString(),
        data
      };
    }
    return null;
  } catch (error) {
    console.error('Error exporting game data:', error);
    return null;
  }
}

/**
 * Download game data as JSON file
 * @param {string} gameId - Game ID to export
 */
async function downloadGameData(gameId) {
  const gameData = await exportGameData(gameId);
  
  if (!gameData) {
    alert('Failed to export game data');
    return;
  }
  
  const jsonStr = JSON.stringify(gameData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `meerkats-game-${gameId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('Game data downloaded:', gameId);
}

/**
 * Delete game completely (from Firebase and history)
 * @param {string} gameId - Game ID to delete
 * @param {boolean} exportFirst - Export data before deleting
 * @returns {Promise<boolean>} Success status
 */
async function deleteGameCompletely(gameId, exportFirst = true) {
  if (!gameId || gameId === 'main') {
    alert('Cannot delete the main game');
    return false;
  }
  
  // Confirm deletion
  const gameName = document.getElementById('currentGameId')?.textContent || gameId;
  const confirmMsg = `Are you sure you want to permanently delete "${gameName}"?\n\nThis will:\n- Remove all game data from Firebase\n- Remove from your game history\n\nThis action cannot be undone!`;
  
  if (!confirm(confirmMsg)) {
    return false;
  }
  
  try {
    // Export data first if requested
    if (exportFirst) {
      const shouldExport = confirm('Export game data before deleting?\n\nRecommended: Click OK to save a backup');
      if (shouldExport) {
        await downloadGameData(gameId);
        // Give user time to save the file
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Delete from Firebase
    const firebaseSuccess = await deleteGameFromFirebase(gameId);
    
    // Remove from history
    if (window.GameHistory) {
      window.GameHistory.removeFromHistory(gameId);
    }
    
    if (firebaseSuccess) {
      alert('Game deleted successfully');
      
      // If deleting current game, switch to main
      const currentGameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
      if (currentGameId === gameId) {
        window.location.href = window.location.pathname + '?game=main';
      }
      
      return true;
    } else {
      alert('Failed to delete game from Firebase, but removed from history');
      return false;
    }
  } catch (error) {
    console.error('Error deleting game:', error);
    alert('Error deleting game: ' + error.message);
    return false;
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.GameCleanup = {
    deleteGameFromFirebase,
    archiveGame,
    restoreGame,
    isGameArchived,
    exportGameData,
    downloadGameData,
    deleteGameCompletely
  };
}
