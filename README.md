# 🏒 Meerkats Board - Hockey Scoreboard

A professional web-based hockey scoreboard with real-time synchronization, multi-game support, and Progressive Web App capabilities. Features responsive design, offline support, and real-time viewer tracking. Perfect for hockey rinks, tournaments, and practice sessions.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![License](https://img.shields.io/badge/license-open--source-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![PWA](https://img.shields.io/badge/PWA-enabled-purple)

## ✨ Features

### 🎮 Core Functionality
- **Configurable Timer** - Editable countdown with start/stop/reset controls
- **Score Tracking** - Real-time score management for both teams
- **Period/Phase Management** - Support for Periods 1-3, Overtime, and Shootout
- **Audio Alerts** - Synthesized buzzer sounds (minute beeps + end buzzer)

### 🎪 Multi-Game System
- **Multiple Simultaneous Games** - Run unlimited games with unique IDs
- **Game History** - Track and switch between recent games
- **QR Code Generation** - Share control and display links via QR codes
- **URL Shortening** - Create short links for easy sharing
- **Game Export** - Download game data as JSON

### 🖥️ Dual Interface System
- **Control Interface** (`index.html`) - Full operator controls and settings
- **Display Interface** (`view.html`) - Clean, read-only view for audience
- **Real-time Sync** - Firebase Firestore keeps all interfaces synchronized
- **Independent Visibility** - Control what shows on operator vs audience screens

### 🎨 Customization & Branding
- **League Settings** - Custom name and logo
- **Team Branding** - Names and logos for both teams
- **Dark/Light Themes** - Toggle between themes with instant sync
- **Flexible Visibility** - Show/hide any element (timer, scores, period, logos, names, league)

### 📱 Modern Design & Performance
- **Fully Responsive** - Fluid typography and spacing that adapts to any screen size
- **Container Queries** - Components adapt based on their container, not just viewport
- **Dynamic Viewport Heights** - Better mobile browser support (dvh units)
- **Orbitron Display Font** - Bold, modern monospace font for timer and scores
- **Fluid Typography System** - Text scales smoothly from mobile to 4K displays
- **Maximized Space Usage** - 95% screen utilization with edge-to-edge layout
- **Arena Mode** - Optimized for large displays (1920px+) and projectors

### 📱 Progressive Web App (PWA)
- **Install to Home Screen** - Add app to mobile/desktop home screen
- **Offline Support** - Works without internet connection using service worker
- **Smart Caching** - Cache-first for static assets, network-first for dynamic content
- **Auto-Updates** - Notifies users when new version is available
- **Beautiful Offline Page** - Branded fallback with auto-retry connection
- **Cross-Platform** - Works on Android, iOS, and desktop as native-like app

### 👁️ Real-Time Viewer Tracking
- **Active Viewer Count** - See how many people are watching in real-time
- **Controller vs Viewer** - Distinguishes between operators and spectators
- **Zero Additional Cost** - Uses aggregated counts, stays within Firebase free tier
- **Privacy-Friendly** - No individual session tracking or PII storage
- **Auto-Updates** - Count refreshes every 15 seconds automatically

## 🚀 Quick Start

### Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TheWaulicus/meerkats_board.git
   cd meerkats_board
   ```

2. **Open in browser**:
   - Open `index.html` for the control interface
   - Click "Display" button in navbar to open `view.html` in a new window

3. **Configure Firebase** (required for multi-screen sync):
   - See Firebase Setup section below
   - Without Firebase, the scoreboard works locally but won't sync between screens

## ⚙️ Firebase Setup

Firebase enables real-time sync between control and display screens, and is required for multi-game support.

> ⚠️ **Security Warning**: The default Firestore rules in this guide allow **public read/write access**. This is fine for testing but **NOT secure for production**. See [docs/SECURITY.md](docs/SECURITY.md) for security improvements before deploying publicly.

### Create Firebase Project

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Firestore Database**:
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Start in **production mode** (we'll configure rules next)
   - Choose a location close to your users

3. **Enable Realtime Database** (for viewer count):
   - In your Firebase project, go to "Realtime Database"
   - Click "Create database"
   - Start in **locked mode** (we'll configure rules next)
   - Choose same location as Firestore

4. **Configure Firestore Rules**:
   - In Firestore, go to the "Rules" tab
   - Update rules to allow read/write access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /scoreboards/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"

5. **Configure Realtime Database Rules**:
   - In Realtime Database, go to the "Rules" tab
   - Update rules to allow read/write access for presence tracking:
   ```
   {
     "rules": {
       "presence": {
         "$gameId": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```
   - Click "Publish"

6. **Get Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Register your app with a nickname (e.g., "Meerkats Board")
   - Copy the Firebase configuration object
   - **Important**: Make sure to include the `databaseURL` field for Realtime Database

7. **Update firebase-config.js**:
   - Open `src/firebase-config.js`
   - Replace the placeholder config with your Firebase config

## 🎮 How to Use

### Control Interface (`index.html`)

**Navbar**:
- **Viewer Count Badge** (👁️) - Shows real-time count of active viewers and controllers
- **Game Button** (🎮) - Manage games, create new games, join existing games
- **Display Button** - Open display interface in new window
- **Settings** (⚙️) - Configure scoreboard settings

**Game Management** (🎮 icon):
- **Create New Game** - Generate unique game ID for new game
- **Join Existing Game** - Enter game ID to join another game
- **Recent Games** - Quick access to previously used games
- **Share Links** - Copy control and display URLs
- **QR Codes** - Generate QR codes for easy mobile access
- **Short URLs** - Create shortened links via TinyURL
- **Export Game** - Download game data as JSON
- **Reset Game** - Selectively reset scores, timer, penalties, teams, or settings

**Timer Controls**:
- Click timer to edit manually (e.g., type "15:00")
- **Start/Stop/Reset** buttons
- Period controls: +/- buttons and "Advance Phase"
- Advance Phase: Period 1 → Period 2 → Period 3 → Overtime → Shootout

**Score Management**:
- Use +/- buttons under each team
- Scores sync instantly across all interfaces

**Settings** (⚙️ gear icon):
- **Theme** - Toggle light/dark mode
- **League** - Name and logo (appears in navbar)
- **Teams** - Names and logos for Home and Away
- **Visibility Controls** - Independently control what shows on:
  - Control interface (operator view)
  - Display interface (audience view)
  - Toggle: Timer, Scores, Period, Team Logos, Team Names, League Info

### Display Interface (`view.html`)

- **Read-only** - No controls, clean display for audience
- **Auto-sync** - Real-time updates from control interface via Firebase
- **Viewer Count Badge** - Shows same real-time count as control interface
- **Game Selection** - Join different games using game ID
- **Theme Sync** - Automatically matches control interface theme
- Perfect for projectors, TVs, and spectator screens

### Progressive Web App (PWA) Features

**Installation**:
- **Mobile (Android/iOS)**: Visit the site, tap browser menu → "Add to Home Screen"
- **Desktop (Chrome/Edge)**: Click install icon in address bar or browser menu → "Install"
- **Benefits**: Faster loading, works offline, app-like experience

**Offline Mode**:
- Automatically caches pages and assets for offline use
- Shows beautiful offline page if connection lost
- Auto-retries connection every 5 seconds
- Reconnects automatically when back online

**Updates**:
- Checks for updates every minute in background
- Shows "Update Available" banner when new version ready
- Click "Update Now" to refresh with latest features

## 🔊 Audio System

The scoreboard uses **Web Audio API** for synthesized sounds (no external files required):

- **Minute Beeps** - Short beep every 60 seconds during countdown
- **End Buzzer** - Three loud buzzer sounds when timer reaches 0:00
- All sounds work in modern browsers without additional files

## 🔧 Technical Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (no frameworks)
- **Database**: Firebase Firestore (real-time sync)
- **Audio**: Web Audio API (synthesized sounds)
- **Structure**:
  - `/src` - JavaScript modules
  - `/css` - Stylesheets
  - `/assets` - Images and sounds
  - `/docs` - Documentation

### Firebase Architecture
- **Firestore**: Game state (scores, timer, team info, settings)
  - Document structure: `/scoreboards/{gameId}`
  - Real-time listeners (`onSnapshot`)
  - Automatic conflict resolution
- **Realtime Database**: Presence tracking (viewer counts)
  - Data structure: `/presence/{gameId}`
  - Transaction-based count updates
  - Automatic cleanup on disconnect
- **Storage**: Team logos and league branding (optional)
- Multi-game support with unique game IDs
- Offline support (syncs when reconnected)

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13+)
- All modern browsers supported

## 🔒 Security

⚠️ **Important**: The default Firebase setup uses open read/write rules for simplicity. This is **not secure for production**.

**See [docs/SECURITY.md](docs/SECURITY.md)** for:
- Current security issues and risks
- Authentication implementation guide
- Secure Firestore rules (3 options)
- Role-based access control
- Rate limiting and data validation
- Complete security audit checklist

**Quick Fix**: At minimum, require authentication for writes:
```javascript
allow read: if true;
allow write: if request.auth != null;  // Require authentication
```

## 🐛 Troubleshooting

**Interfaces not syncing?**
- Check browser console for Firebase errors
- Verify Firestore rules allow read/write access
- Ensure Firebase config is correct in `src/firebase-config.js`
- Confirm both interfaces are using the same game ID

**Audio not playing?**
- Browser audio permissions may be blocked
- Ensure browser tab is not muted
- Some browsers require user interaction before playing audio

**Images not displaying?**
- Logos use base64 encoding and are stored in Firebase
- Large images may take time to sync
- Recommended: Resize images to 200x200px before upload

**Game not loading?**
- Check that game ID is correctly formatted
- Verify Firebase is properly configured
- Clear browser cache and reload

## 📄 License

Open source - Free to use for hockey rinks, sports facilities, and personal use.

## 🙏 Acknowledgments

Built for hockey enthusiasts who need a reliable, feature-rich scoreboard solution.

---

## 📋 Changelog

### Version 2.1.0 (November 2025)
- ✨ **Progressive Web App (PWA)**: Install to home screen, offline support, auto-updates
- ✨ **Active Viewer Count**: Real-time tracking of controllers and viewers
- ✨ **Responsive Design Overhaul**: Fluid typography, container queries, dynamic viewport heights
- ✨ **Orbitron Display Font**: Modern monospace font for timer and scores
- ✨ **Offline Fallback Page**: Beautiful branded page with auto-retry
- 🔧 Service worker v1.1.0 with improved caching
- 🔧 Firebase Realtime Database integration for presence tracking
- 🎨 CSS custom properties for responsive spacing and typography
- 📱 Better mobile browser support with dvh units
- ⚡ Zero additional Firebase cost (stays within free tier)

### Version 2.0.0 (October 2025)
- Initial multi-game system release
- Game history and management
- QR code generation
- Export/import functionality
- Authentication support

---

**Version**: 2.1.0  
**Last Updated**: November 2025  
**Firebase Cost**: $0/month (Free Tier)
