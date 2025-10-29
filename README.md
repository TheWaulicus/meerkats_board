# 🏒 Meerkats Board - Hockey Scoreboard

A professional web-based hockey scoreboard with real-time synchronization, multi-game support, and dual interface system. Perfect for hockey rinks, tournaments, and practice sessions.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-open--source-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

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

### 📱 Display & Performance
- **Fully Responsive** - Optimized for mobile, tablet, and desktop
- **Maximized Space Usage** - 95% screen utilization, up from 70%
- **Large Timer Display** - 60-100% larger timer for better visibility
- **Mobile Optimized** - Massive timer on mobile (60% larger than previous)
- **Edge-to-Edge Layout** - No wasted space on any screen size

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

3. **Configure Firestore Rules**:
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

4. **Get Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Register your app with a nickname (e.g., "Meerkats Board")
   - Copy the Firebase configuration object

5. **Update firebase-config.js**:
   - Open `src/firebase-config.js`
   - Replace the placeholder config with your Firebase config

## 🎮 How to Use

### Control Interface (`index.html`)

**Navbar**:
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
- **Game Selection** - Join different games using game ID
- **Theme Sync** - Automatically matches control interface theme
- Perfect for projectors, TVs, and spectator screens

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
- Uses Firestore real-time listeners (`onSnapshot`)
- Document structure: `/scoreboards/{gameId}`
- Multi-game support with unique game IDs
- Automatic conflict resolution
- Offline support (syncs when reconnected)

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13+)
- All modern browsers supported

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

**Version**: 2.0.0  
**Last Updated**: 2024
