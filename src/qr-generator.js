// QR Code Generator - Client-side QR code generation
// Uses qrcodejs library for generating QR codes

/**
 * Generate QR code for a URL
 * @param {string} containerId - ID of container element
 * @param {string} url - URL to encode in QR code
 * @param {number} size - QR code size in pixels
 */
function generateQRCode(containerId, url, size = 256) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('QR code container not found:', containerId);
    return;
  }
  
  // Clear existing QR code
  container.innerHTML = '';
  
  try {
    // Using QRCode.js library (will be loaded via CDN)
    if (typeof QRCode === 'undefined') {
      console.error('QRCode library not loaded');
      container.innerHTML = '<p style="color: var(--error-color);">QR Code library not available</p>';
      return;
    }
    
    new QRCode(container, {
      text: url,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H // High error correction
    });
    
    console.log('QR code generated for:', url);
  } catch (error) {
    console.error('Error generating QR code:', error);
    container.innerHTML = '<p style="color: var(--error-color);">Failed to generate QR code</p>';
  }
}

/**
 * Generate QR codes for control and display URLs
 * @param {string} gameId - Game ID
 */
function generateGameQRCodes(gameId) {
  if (!window.GameManager) {
    console.error('GameManager not available');
    return;
  }
  
  const controlUrl = window.GameManager.getGameUrl(gameId, false);
  const displayUrl = window.GameManager.getGameUrl(gameId, true);
  
  generateQRCode('qrCodeControl', controlUrl, 200);
  generateQRCode('qrCodeDisplay', displayUrl, 200);
}

/**
 * Download QR code as PNG image
 * @param {string} containerId - ID of QR code container
 * @param {string} filename - Filename for download
 */
function downloadQRCode(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('QR code container not found');
    return;
  }
  
  const canvas = container.querySelector('canvas');
  if (!canvas) {
    alert('No QR code to download. Generate one first.');
    return;
  }
  
  try {
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('QR code downloaded:', filename);
    });
  } catch (error) {
    console.error('Error downloading QR code:', error);
    alert('Failed to download QR code');
  }
}

/**
 * Print QR codes
 */
function printQRCodes() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print QR codes');
    return;
  }
  
  const gameId = window.GameManager ? window.GameManager.getCurrentGameId() : 'main';
  const gameName = document.getElementById('currentGameId')?.textContent || gameId;
  
  const controlQR = document.getElementById('qrCodeControl')?.innerHTML || '';
  const displayQR = document.getElementById('qrCodeDisplay')?.innerHTML || '';
  
  const controlUrl = window.GameManager ? window.GameManager.getGameUrl(gameId, false) : '';
  const displayUrl = window.GameManager ? window.GameManager.getGameUrl(gameId, true) : '';
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Codes - ${gameName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          text-align: center;
        }
        h1 {
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 40px;
        }
        .qr-section {
          display: inline-block;
          margin: 20px;
          padding: 20px;
          border: 2px solid #000;
          page-break-inside: avoid;
        }
        .qr-section h2 {
          margin-top: 0;
        }
        .qr-code {
          margin: 20px 0;
        }
        .url {
          font-size: 10px;
          word-break: break-all;
          color: #666;
          margin-top: 10px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>🏒 Meerkats Board QR Codes</h1>
      <p class="subtitle">Game: ${gameName}</p>
      
      <div class="qr-section">
        <h2>📋 Control Interface</h2>
        <p>Scan to manage the scoreboard</p>
        <div class="qr-code">${controlQR}</div>
        <div class="url">${controlUrl}</div>
      </div>
      
      <div class="qr-section">
        <h2>📺 Display Interface</h2>
        <p>Scan to view the scoreboard</p>
        <div class="qr-code">${displayQR}</div>
        <div class="url">${displayUrl}</div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          }, 500);
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.QRGenerator = {
    generateQRCode,
    generateGameQRCodes,
    downloadQRCode,
    printQRCodes
  };
}
