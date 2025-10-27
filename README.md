# Meerkats Board - Hockey Scoreboard

A modern, simplified web-based hockey scoreboard with dual interfaces: a control panel for operators and a display-only viewing interface. Features real-time Firebase synchronization and audio alarms.

## 🎯 Features

### Core Functionality
- **Configurable Timer**: Set custom time, start/stop/reset controls
- **Audio Alarms**: 
  - Beep every minute during countdown
  - Three buzzer sounds when timer reaches zero
- **Score Tracking**: Simple score management for two teams (no penalties or shots)
- **Period Management**: Track periods, overtime, and shootout
- **Team Customization**: Edit team names and upload logos
- **League Branding**: Custom league name and logo

### Dual Interface System
- **Control Interface** (`index.html`): Full operator controls with settings and buttons
- **Viewing Interface** (`view.html`): Clean, display-only interface for spectators
- **Real-time Sync**: Firebase ensures both interfaces stay in perfect sync

### Design
- Responsive layout (desktop, tablet, mobile)
- Dark/Light theme support
- Professional hockey scoreboard aesthetic
- Accessible UI with ARIA labels

## 📁 Project Structure

```
meerkats_board/
├── README.md                 # This file
├── index.html                # Control interface (operator view)
├── view.html                 # Viewing interface (display only)
├── scoreboard.css            # Shared styles
├── scoreboard.js             # Control logic with audio
├── view.js                   # Viewing logic (read-only sync)
├── firebase-config.js        # Firebase configuration
└── .gitignore                # Git ignore file
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project (instructions below)

### Firebase Setup

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

### Running the Scoreboard

1. **Control Interface** (Operator):
   - Open `index.html` in your browser
   - Use settings (gear icon) to configure teams and league
   - Control timer, manage scores, and track periods

2. **Viewing Interface** (Display):
   - Open `view.html` in your browser (or on a separate display)
   - The scoreboard automatically syncs with the control interface
   - No controls visible - pure display mode

3. **Multiple Displays**:
   - You can open `view.html` on multiple screens
   - All displays sync in real-time with the control interface

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

## 📝 Data Structure

```javascript
{
  timerSeconds: 1200,           // Current timer value in seconds
  timerRunning: false,          // Is timer counting down?
  period: 1,                    // Current period (1-3)
  gamePhase: "REG",             // REG, OT, or SO
  teamA: {
    name: "Team A",
    logo: "",                   // Base64 or URL
    score: 0
  },
  teamB: {
    name: "Team B",
    logo: "",
    score: 0
  },
  leagueName: "League Name",
  leagueLogo: "",
  theme: "dark",                // dark or light
  lastUpdate: timestamp         // Firestore server timestamp
}
```

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
