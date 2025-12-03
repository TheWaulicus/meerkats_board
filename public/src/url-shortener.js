// URL Shortener using TinyURL API
// Free, unlimited, no API key required

/**
 * Shorten a URL using TinyURL API
 * @param {string} longUrl - The URL to shorten
 * @returns {Promise<string>} Shortened URL
 */
async function shortenUrl(longUrl) {
  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    );
    
    if (!response.ok) {
      throw new Error('TinyURL API request failed');
    }
    
    const shortUrl = await response.text();
    return shortUrl.trim();
  } catch (error) {
    console.error('Error shortening URL:', error);
    throw error;
  }
}

/**
 * Create short URLs for control and display interfaces
 * @param {string} gameId - Game ID
 * @returns {Promise<{control: string, display: string}>} Short URLs
 */
async function createGameShortUrls(gameId) {
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
  
  // Control URL (index.html)
  const controlUrl = `${baseUrl}/index.html?game=${gameId}`;
  
  // Display URL (view.html)
  const displayUrl = `${baseUrl}/view.html?game=${gameId}`;
  
  try {
    const [controlShort, displayShort] = await Promise.all([
      shortenUrl(controlUrl),
      shortenUrl(displayUrl)
    ]);
    
    return {
      control: controlShort,
      display: displayShort,
      controlLong: controlUrl,
      displayLong: displayUrl
    };
  } catch (error) {
    console.error('Error creating short URLs:', error);
    return null;
  }
}

/**
 * Copy short URL to clipboard
 * @param {string} url - URL to copy
 * @param {string} type - Type of URL (control/display)
 */
async function copyShortUrl(url, type = 'link') {
  try {
    await navigator.clipboard.writeText(url);
    
    // Show feedback
    const button = event?.target;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.style.background = 'var(--success-color)';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    }
    
    console.log(`Short ${type} URL copied:`, url);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    alert('Failed to copy URL. Please copy manually.');
  }
}

/**
 * Generate and display short URLs in modal
 * @param {string} gameId - Game ID
 */
async function generateAndShowShortUrls(gameId) {
  const container = document.getElementById('shortUrlsContainer');
  if (!container) {
    console.error('Short URLs container not found');
    return;
  }
  
  // Show loading state
  container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">🔗 Generating short links...</p>';
  
  const urls = await createGameShortUrls(gameId);
  
  if (!urls) {
    container.innerHTML = '<p style="text-align: center; color: var(--error-color); padding: 20px;">❌ Failed to generate short URLs. Please try again.</p>';
    return;
  }
  
  // Display short URLs
  container.innerHTML = `
    <div style="display: grid; gap: 16px;">
      <!-- Control Short URL -->
      <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 1.2em;">📋</span>
          <strong style="font-size: 0.95em;">Control Link (Short)</strong>
        </div>
        <input 
          type="text" 
          value="${urls.control}" 
          readonly 
          onclick="this.select()" 
          style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9em; margin-bottom: 8px; font-family: monospace;"
        />
        <button 
          onclick="copyShortUrl('${urls.control}', 'control')" 
          class="timer-btn" 
          style="width: 100%; padding: 10px;"
        >
          📋 Copy Short Link
        </button>
      </div>
      
      <!-- Display Short URL -->
      <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 1.2em;">📺</span>
          <strong style="font-size: 0.95em;">Display Link (Short)</strong>
        </div>
        <input 
          type="text" 
          value="${urls.display}" 
          readonly 
          onclick="this.select()" 
          style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.9em; margin-bottom: 8px; font-family: monospace;"
        />
        <button 
          onclick="copyShortUrl('${urls.display}', 'display')" 
          class="timer-btn" 
          style="width: 100%; padding: 10px;"
        >
          📋 Copy Short Link
        </button>
      </div>
      
      <!-- Info -->
      <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-secondary);">
        <p style="font-size: 0.85em; color: var(--text-secondary); margin: 0;">
          💡 <strong>Tip:</strong> These short links are permanent and never expire. Share them via text, email, or QR codes!
        </p>
      </div>
    </div>
  `;
}

/**
 * Toggle short URLs section visibility
 */
function toggleShortUrlsSection() {
  const section = document.getElementById('shortUrlsSection');
  const button = event.target;
  
  if (!section) return;
  
  if (section.style.display === 'none') {
    // Show and generate
    section.style.display = 'block';
    button.textContent = '🔗 Hide Short Links';
    
    const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
    generateAndShowShortUrls(gameId);
  } else {
    // Hide
    section.style.display = 'none';
    button.textContent = '🔗 Get Short Links';
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.URLShortener = {
    shortenUrl,
    createGameShortUrls,
    copyShortUrl,
    generateAndShowShortUrls,
    toggleShortUrlsSection
  };
}
