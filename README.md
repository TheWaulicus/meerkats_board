# 🏒 Meerkats Board - Hockey Scoreboard

A professional web-based hockey scoreboard with dual interfaces and real-time synchronization. Perfect for hockey rinks, tournaments, and practice sessions.

**Live Demo**: [thewaulicus.github.io/meerkats_board](https://thewaulicus.github.io/meerkats_board/)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-open--source-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)

## ✨ Features

### 🎮 Scoreboard Controls
- **18-Minute Timer** - Configurable countdown with start/stop/reset
- **Score Tracking** - Track both teams' scores with +/- buttons
- **Period Management** - Periods 1-3, Overtime, and Shootout support
- **Real Hockey Buzzer** - Authentic arena sound every minute + 3 buzzers at end

### 🖥️ Dual Interface System
- **Control Interface** - Full operator controls with settings (index.html)
- **Display Interface** - Clean, read-only view for spectators (view.html)
- **Real-time Sync** - Firebase keeps both screens perfectly synchronized
- **One-Click Setup** - Click "Display" in navbar to open second screen

### 🎨 Customization
- **League Branding** - Custom league name and logo in navbar
- **Team Setup** - Configure team names and upload logos
- **Theme Toggle** - Switch between light and dark modes
- **Visibility Controls** - Show/hide any element independently on each interface

### 📱 Professional Design
- Fully responsive (mobile, tablet, desktop)
- Fixed navbar with branding
- Dynamic element scaling (timer always prominent)
- WCAG 2.1 AA accessible

## 🚀 Quick Start

### Option 1: Use the Live Version (Easiest)

1. **Open Control**: [thewaulicus.github.io/meerkats_board/index.html](https://thewaulicus.github.io/meerkats_board/index.html)
2. **Click "Display"** in navbar to open second screen
3. **Configure Settings** (gear icon) - Add your league name and logos
4. **Start Using!** - Set timer, track scores, play games

**Note**: The live version uses shared Firebase, so multiple users will see each other's games. For private use, set up your own Firebase (see below).

### Option 2: Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TheWaulicus/meerkats_board.git
   cd meerkats_board
   ```

2. **Open in browser**:
   ```bash
   open index.html    # Control interface
   open view.html     # Display interface (separate window)
   ```

3. **Configure Firebase** (for sync between screens):
   - See Firebase Setup section below

## ⚙️ Firebase Setup (Optional)

Firebase enables real-time sync between control and display screens. Skip this if using locally on one screen.

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
   - Open `firebase-config.js`
   - Replace the placeholder config with your Firebase config

## 🎮 How to Use

### Control Interface (index.html)

**Fixed Navbar**:
- [League Logo] League Name - Your branding
- **Display** button - Click to open display interface in new window
- **Settings** (⚙️) - Configure everything

**Timer Controls**:
- Click timer to edit manually (e.g., type "15:00")
- **Start/Stop/Reset** buttons
- Period controls: +/- and "Advance Phase"

**Scores**:
- Use +/- buttons under each team
- Scores sync instantly to display

**Settings** (⚙️ gear icon):
1. **Theme** - Toggle light/dark mode
2. **League Name** - Shows in navbar
3. **League Logo** - Upload image for navbar
4. **Team Names** - Home and Away
5. **Team Logos** - Upload team images
6. **Display Options** - Show/hide elements on control vs display

### Display Interface (view.html)

- **Read-only** - No controls, just clean display
- **Auto-sync** - Updates from control interface in real-time
- **Fullscreen** - Press 'F' key to maximize
- Perfect for spectators and arena displays

## 🎮 Usage

### Control Interface

**Settings (Gear Icon)**:
- Configure league name and logo
- Set team names and logos
- All changes sync to viewing interfaces instantly

**Timer Controls**:
- Click timer to edit time manually
- Start/Stop/Reset buttons control countdown
- Audio beeps play every minute
- Three buzzers sound at zero

**Score Management**:
- Use +/- buttons to adjust scores
- Scores sync instantly across all interfaces

**Period Management**:
- Use +/- to adjust period number
- "Advance Phase" button transitions: Period 3 → Overtime → Shootout

**Reset All**:
- Red "Reset All" button clears everything
- Returns scoreboard to default state

### Viewing Interface

- **Display Only**: No controls or settings visible
- **Auto-Sync**: Updates automatically from Firebase
- **Clean Design**: Optimized for visibility
- **Theme Support**: Syncs theme from control interface

## 🔊 Audio Alarms

The scoreboard includes two audio alarm behaviors:

1. **Minute Beeps**: A short beep plays every 60 seconds during countdown
2. **End Buzzer**: Three loud buzzer sounds play when timer reaches 0:00

**Note**: Audio files use synthesized tones (Web Audio API). No external audio files required.

## 🎨 Customization

### Themes
- Toggle between light and dark themes using the sun/moon icon
- Theme preference syncs across all interfaces

### Colors
- Edit CSS variables in `scoreboard.css` to customize colors
- Primary accent: `--accent-primary`
- Secondary accent: `--accent-secondary`

### Timer Duration
- Default: 20:00 minutes
- Click the timer display to edit directly
- Changes persist across sessions

## 🔧 Technical Details

### Firebase Sync
- Uses Firestore real-time listeners (`onSnapshot`)
- Single document: `/scoreboards/main`
- Automatic conflict resolution
- Offline support (updates when reconnected)

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Audio API: Supported in all modern browsers

### Security Considerations
- Current Firestore rules allow public read/write
- For production, implement authentication
- Restrict write access to authenticated operators only

## 💾 Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (no frameworks)
- **Database**: Firebase Firestore (real-time sync)
- **Audio**: Web Audio API + WAV file
- **Hosting**: GitHub Pages (free)
- **Browser Support**: Chrome, Firefox, Safari, Edge (all modern browsers)
- **Cost**: $0/month (Firebase free tier)

## 🐛 Troubleshooting

**Interfaces not syncing?**
- Check browser console for Firebase errors
- Verify Firestore rules allow read/write
- Ensure Firebase config is correct in `firebase-config.js`

**Audio not playing?**
- Check browser audio permissions
- Ensure browser tab is not muted
- Some browsers require user interaction before playing audio

**Images not displaying?**
- Logo uploads use base64 encoding
- Large images may take time to sync
- Consider resizing images before upload

## 📄 License

This project is open source and available for use in hockey rinks, sports facilities, and personal use.

## 🙏 Credits

Built for hockey enthusiasts who need a simple, reliable scoreboard solution with dual-screen support.

---

**Version**: 1.0.0  
**Last Updated**: 2024
