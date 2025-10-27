# Meerkats Board - Quick Setup Guide

## 🚀 5-Minute Setup

### Step 1: Firebase Project Setup (2 minutes)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create New Project**:
   - Click "Add project"
   - Enter project name: "meerkats-board" (or your choice)
   - Disable Google Analytics (optional)
   - Click "Create project"

### Step 2: Enable Firestore (1 minute)

1. **In your Firebase project**, click "Firestore Database" in left menu
2. Click "Create database"
3. Select **"Start in production mode"**
4. Choose a location (closest to your users)
5. Click "Enable"

### Step 3: Configure Firestore Rules (30 seconds)

1. In Firestore, go to **"Rules"** tab
2. Replace the rules with:
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
3. Click **"Publish"**

### Step 4: Get Firebase Config (1 minute)

1. Click the **gear icon** (Project Settings)
2. Scroll to "Your apps" section
3. Click the **web icon** (`</>`) to add a web app
4. Register app:
   - Nickname: "Meerkats Board"
   - Don't check "Firebase Hosting"
   - Click "Register app"
5. **Copy the firebaseConfig object**

### Step 5: Update firebase-config.js (30 seconds)

1. Open `firebase-config.js` in your editor
2. Replace the placeholder config with your copied config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

3. Save the file

## ✅ Testing

### Open Control Interface
1. Open `index.html` in Chrome, Firefox, or Safari
2. You should see the scoreboard with default values
3. Click the **gear icon** to configure teams and league
4. Test the timer: Start/Stop/Reset buttons
5. Test scores: Use +/- buttons

### Open Display Interface
1. Open `view.html` in another browser window/tab or on another screen
2. You should see the same scoreboard (read-only)
3. Changes in control interface should sync instantly to display

### Test Audio
1. In control interface, set timer to 1:10
2. Click "Start"
3. You should hear:
   - A beep at 1:00
   - Three buzzers when timer reaches 0:00

## 🎯 Usage Tips

### For Best Experience:
- **Control Interface**: Run on operator's computer/tablet
- **Display Interface**: Run on large TV/monitor facing spectators
- **Multiple Displays**: Open `view.html` on multiple screens - all sync!

### Keyboard Shortcuts (Display Interface):
- Press **F** or **F11**: Toggle fullscreen

### Mobile Friendly:
- Both interfaces are fully responsive
- Works on phones, tablets, and desktops

## 🔒 Security Note

The current Firestore rules allow **anyone** to read/write. This is fine for:
- Local networks
- Trusted environments
- Testing/development

For **production use**, consider:
1. Adding Firebase Authentication
2. Restricting write access to authenticated operators
3. Keeping read access public for display screens

## 🐛 Troubleshooting

**Interfaces not syncing?**
- Check browser console (F12) for errors
- Verify Firebase config is correct
- Ensure Firestore rules are published
- Check internet connection

**Audio not playing?**
- Click "Start" button to initialize audio (browser requirement)
- Check browser isn't muted
- Check system volume

**Images not loading?**
- Use smaller image files (< 1MB recommended)
- Images are stored as base64 in Firestore
- Try PNG or JPG formats

**Timer seems laggy?**
- Normal - Firebase syncs every few seconds
- Display interface uses local interpolation for smooth countdown
- Control interface is authoritative

## 📱 Deployment Options

### Option 1: Local Files (Easiest)
- Just open HTML files directly
- No server needed
- Perfect for local use

### Option 2: Simple HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Node.js (if installed)
npx serve

# Then open: http://localhost:8000
```

### Option 3: Firebase Hosting (Cloud)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 🎉 You're Ready!

Your Meerkats Board scoreboard is now set up and ready to use!

**Next Steps:**
1. Customize team names and logos
2. Set your desired timer duration
3. Test on your display screens
4. Enjoy your game!

---

**Need Help?** Check README.md for detailed documentation.
