// Presence Tracking Module
// Uses Firebase Realtime Database with aggregated counts (Option A - zero cost)

class PresenceTracker {
  constructor() {
    this.gameId = null;
    this.userType = null; // 'controller' or 'viewer'
    this.presenceRef = null;
    this.updateInterval = null;
    this.isActive = false;
  }

  /**
   * Initialize presence tracking for a game
   * @param {string} gameId - The game ID to track presence for
   * @param {string} userType - 'controller' or 'viewer'
   */
  initialize(gameId, userType = 'viewer') {
    if (!gameId) {
      console.error('[Presence] No game ID provided');
      return;
    }

    this.gameId = gameId;
    this.userType = userType;
    this.presenceRef = realtimeDb.ref(`presence/${gameId}`);
    this.isActive = true;

    console.log(`[Presence] Initialized as ${userType} for game ${gameId}`);

    // Start tracking presence
    this.startTracking();

    // Set up cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup());
    window.addEventListener('unload', () => this.cleanup());

    // Handle visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Start tracking presence with periodic updates
   */
  startTracking() {
    // Increment count immediately
    this.incrementCount();

    // Update presence every 15 seconds to show we're still active
    this.updateInterval = setInterval(() => {
      if (this.isActive && !document.hidden) {
        this.updatePresence();
      }
    }, 15000); // 15 seconds
  }

  /**
   * Increment the viewer/controller count
   */
  async incrementCount() {
    if (!this.presenceRef) return;

    try {
      const countField = this.userType === 'controller' ? 'controllers' : 'viewers';
      
      await this.presenceRef.transaction((current) => {
        if (current === null) {
          // Initialize if doesn't exist
          return {
            controllers: this.userType === 'controller' ? 1 : 0,
            viewers: this.userType === 'viewer' ? 1 : 0,
            lastUpdate: firebase.database.ServerValue.TIMESTAMP
          };
        }
        
        // Increment the appropriate count
        current[countField] = (current[countField] || 0) + 1;
        current.lastUpdate = firebase.database.ServerValue.TIMESTAMP;
        return current;
      });

      console.log(`[Presence] Incremented ${countField} count`);
    } catch (error) {
      console.error('[Presence] Error incrementing count:', error);
    }
  }

  /**
   * Update presence timestamp
   */
  async updatePresence() {
    if (!this.presenceRef) return;

    try {
      await this.presenceRef.update({
        lastUpdate: firebase.database.ServerValue.TIMESTAMP
      });
      
      console.log('[Presence] Updated timestamp');
    } catch (error) {
      console.error('[Presence] Error updating presence:', error);
    }
  }

  /**
   * Decrement the viewer/controller count
   */
  async decrementCount() {
    if (!this.presenceRef) return;

    try {
      const countField = this.userType === 'controller' ? 'controllers' : 'viewers';
      
      await this.presenceRef.transaction((current) => {
        if (current === null) return current;
        
        // Decrement but don't go below 0
        current[countField] = Math.max((current[countField] || 0) - 1, 0);
        current.lastUpdate = firebase.database.ServerValue.TIMESTAMP;
        return current;
      });

      console.log(`[Presence] Decremented ${countField} count`);
    } catch (error) {
      console.error('[Presence] Error decrementing count:', error);
    }
  }

  /**
   * Listen for presence changes and update UI
   * @param {Function} callback - Called with (controllers, viewers, total)
   */
  onPresenceChange(callback) {
    if (!this.presenceRef) return;

    this.presenceRef.on('value', (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const controllers = data.controllers || 0;
        const viewers = data.viewers || 0;
        const total = controllers + viewers;
        
        console.log(`[Presence] Updated: ${controllers} controllers, ${viewers} viewers (${total} total)`);
        
        if (callback) {
          callback(controllers, viewers, total);
        }
      } else {
        // No data yet
        if (callback) {
          callback(0, 0, 0);
        }
      }
    });
  }

  /**
   * Get current presence counts
   * @returns {Promise<{controllers: number, viewers: number, total: number}>}
   */
  async getCounts() {
    if (!this.presenceRef) {
      return { controllers: 0, viewers: 0, total: 0 };
    }

    try {
      const snapshot = await this.presenceRef.once('value');
      const data = snapshot.val();
      
      if (data) {
        const controllers = data.controllers || 0;
        const viewers = data.viewers || 0;
        return {
          controllers,
          viewers,
          total: controllers + viewers
        };
      }
      
      return { controllers: 0, viewers: 0, total: 0 };
    } catch (error) {
      console.error('[Presence] Error getting counts:', error);
      return { controllers: 0, viewers: 0, total: 0 };
    }
  }

  /**
   * Pause presence tracking (when tab is hidden)
   */
  pause() {
    console.log('[Presence] Paused');
    this.isActive = false;
  }

  /**
   * Resume presence tracking (when tab becomes visible)
   */
  resume() {
    console.log('[Presence] Resumed');
    this.isActive = true;
    this.updatePresence();
  }

  /**
   * Clean up presence tracking
   */
  async cleanup() {
    console.log('[Presence] Cleaning up');
    
    // Clear interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Decrement count
    await this.decrementCount();

    // Remove listeners
    if (this.presenceRef) {
      this.presenceRef.off();
    }

    this.isActive = false;
  }
}

// Create singleton instance
const presenceTracker = new PresenceTracker();

// Export for use in other modules
window.presenceTracker = presenceTracker;
