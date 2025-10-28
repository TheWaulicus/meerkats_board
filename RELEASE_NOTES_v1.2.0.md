# 🏒 Meerkats Board v1.2.0 - Game Management & Sharing

## Release Date: January 2025

This major update adds comprehensive game management capabilities, making it easier to create, organize, share, and manage multiple games simultaneously.

---

## 🎉 What's New

### Game Management Features

#### 📋 Game History & Quick Switching
- View recent games (last 10 displayed, up to 50 stored)
- Click any game to switch instantly
- Favorite games for quick access (⭐)
- Remove games from history
- Auto-tracking of created/joined games
- Relative time display ("5m ago", "2h ago")
- Current game highlighted in blue

#### 🏷️ Friendly Game Names
- Set custom names like "Meerkats vs Tigers" instead of cryptic IDs
- Names sync across all devices in real-time via Firebase
- Display in navbar and game list
- Auto-save when closing modal
- 50 character limit with graceful fallback to game ID

#### 🔄 Game Reset
- Granular reset options with 5 checkboxes:
  - Reset Scores & Shots ✓
  - Reset Timer & Period ✓
  - Reset Penalties ✓
  - Reset Team Names & Logos (optional)
  - Reset League Settings (optional)
- Preserves game ID and name always
- Double confirmation to prevent accidents
- Updates all connected displays immediately

#### 📱 QR Code Generation
- Generate QR codes for control and display URLs
- Download QR codes as PNG images
- Print-friendly page with both codes
- High error correction for reliability
- Client-side generation (privacy-friendly, no API calls)
- Perfect for rink displays and easy mobile access

#### 🗑️ Delete & Export Games
- Two deletion options:
  1. Remove from history only (keeps Firebase data)
  2. Delete completely (Firebase + history)
- Export game data as JSON before deletion
- Automatic backup prompt for safety
- Cannot delete 'main' game (protection)
- Archive/restore functionality (API ready)

---

## 🐛 Bug Fixes

### Critical
- **Fixed duplicate games in history**: Games no longer appear twice with different cases (e.g., game-ABC and game-abc)
- **Case-insensitive deduplication**: Auto-cleanup on page load removes duplicates

### Minor
- **Game name sync**: Names now save automatically on modal close
- **ID normalization**: All game IDs normalized to lowercase for consistency

---

## 📊 Technical Details

### New Files (6)
- `game-history.js` (330 lines) - localStorage-based game history management
- `game-manager.js` (178 lines) - Game ID routing and URL management
- `qr-generator.js` (204 lines) - Client-side QR code generation
- `game-cleanup.js` (244 lines) - Game deletion, archiving, and export
- `ROADMAP.md` (650+ lines) - Complete feature roadmap
- `PROGRESS_SUMMARY.md` (300+ lines) - Implementation tracking

### Modified Files (7)
- `firebase-config.js` (+108 lines) - Game name, reset, delete functions
- `index.html` (+135 lines) - Game modal UI, QR codes, export button
- `scoreboard.js` (+280 lines) - History UI, QR integration, delete logic
- `view.js` (+14 lines) - Display game names
- `view.html` (+3 lines) - Script includes
- `scoreboard.css` (+4 lines) - CSS variables
- `game-manager.js` (+15 lines) - History integration

### Statistics
- **Total Code**: ~1,200+ lines added
- **New Functions**: 40+ functions
- **Documentation**: 60KB+ comprehensive docs
- **Zero Breaking Changes**: Fully backward compatible with v1.0

### Dependencies
- **QRCode.js** v1.0.0 (via CDN) - Client-side QR code generation

---

## 🎯 Use Cases

### League Managers
- Create multiple games for different divisions
- Quick switching between simultaneous games
- Print QR codes for rink displays
- Export game data for record keeping

### Tournament Organizers
- Name games clearly (e.g., "Semifinal 1 - Tigers vs Panthers")
- Share control and display links via QR codes
- Delete old tournament games to clean up
- Reset games for next tournament

### Practice Sessions
- Create a "Practice" game and favorite it
- Reset before each practice session
- Keep team names/logos, reset scores only
- Quick access via favorites

### Mobile Users
- Scan QR codes for instant access
- No typing URLs on small screens
- Quick setup for new scoreboards
- Easy sharing with team parents

---

## 📚 Documentation

All features are fully documented:

1. **ROADMAP.md** - Complete feature planning and future roadmap
2. **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
3. **FEATURES_DEMO.md** - Step-by-step demo guide with test scenarios
4. **CHANGELOG.md** - Full version history and migration guide
5. **PROGRESS_SUMMARY.md** - Implementation progress tracking

---

## 🚀 How to Use

### Access Game Management
1. Click the **🎮 game button** in the navbar
2. Game modal opens with all features

### Create & Name Games
1. Click **"🆕 Create New Game"**
2. Enter a friendly name in **"Game Name"** field
3. Close modal to auto-save

### Switch Games
1. Open game modal
2. Scroll through **"Recent Games"** list
3. Click any game to switch instantly

### Share with QR Codes
1. Open game modal
2. Click **"📱 Show QR Codes"**
3. Download or print QR codes
4. Scan with phone for instant access

### Export & Delete
1. Click **"💾 Export Game Data"** to backup
2. Click **🗑️** on any game for delete options
3. Choose "Remove from history" or "Delete completely"

### Reset Game
1. Click **"🔄 Reset Game"** button
2. Select what to reset (5 options)
3. Confirm action
4. All displays update instantly

---

## 🔄 Migration from v1.1

**No migration needed!** This release is fully backward compatible.

### What's Preserved
✅ All existing game IDs work  
✅ All game data in Firebase intact  
✅ Existing bookmarks/links work  
✅ URL parameters unchanged  

### What's New
✨ Recent games now tracked automatically  
✨ Can set friendly names for games  
✨ QR codes available for sharing  
✨ Export/delete options added  

### Optional Steps
1. Name your existing games for easier identification
2. Favorite frequently used games
3. Clean up old test games
4. Print QR codes for your rinks

---

## 🧪 Browser Support

**Tested and Working:**
- ✅ Chrome 120+ (Desktop & Mobile)
- ✅ Firefox 121+ (Desktop & Mobile)
- ✅ Safari 17+ (Desktop & Mobile)
- ✅ Edge 120+ (Desktop)

**Requirements:**
- localStorage support
- ES6+ JavaScript (async/await, arrow functions)
- Firebase SDK 9.x compatible
- Modern CSS (CSS variables, flexbox)

---

## 📈 Performance

- **Initial Load**: ~500ms
- **Firebase Sync**: ~100-500ms latency
- **Game Switching**: ~500ms-2s (page reload)
- **History Operations**: <10ms (localStorage)
- **QR Generation**: <100ms
- **Game Export**: <500ms

---

## 🔒 Security & Privacy

### Data Storage
- Game names stored in Firebase (your project)
- History stored locally in browser (localStorage)
- No personal data collected
- No tracking or analytics

### QR Codes
- Generated client-side (no external API)
- No data sent to third parties
- Privacy-friendly implementation

### Game Deletion
- Optional export before deletion
- Double confirmation required
- Cannot delete 'main' game
- Safe fallback to history removal

---

## 🙏 Credits

**Development**: Meerkats Board Team  
**QR Codes**: QRCode.js library  
**Icons**: Unicode emoji  
**Fonts**: Google Fonts (Inter & Orbitron)  
**Backend**: Firebase (Firestore)  

---

## 📝 Known Limitations

1. **Game History**: localStorage only (not synced across devices)
2. **Game Switching**: Requires page reload (seamless switching in future)
3. **Archive UI**: Archive API ready but UI not yet implemented
4. **Bulk Delete**: Not yet available (future enhancement)
5. **Search**: Not implemented yet (API exists)

---

## 🔮 What's Next (v1.3)

### Planned for Next Release
- Active Viewer Count (show how many people watching)
- Authentication & Permissions (owner/controller/viewer roles)
- Game Templates (save configurations for reuse)
- Enhanced Export/Import (CSV, PDF formats)

See [ROADMAP.md](ROADMAP.md) for complete future plans.

---

## 🐛 Report Issues

Found a bug? Have a feature request?

1. Check existing issues on GitHub
2. Review [FEATURES_DEMO.md](FEATURES_DEMO.md) troubleshooting
3. Open a new issue with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

---

## 💬 Feedback

We'd love to hear from you!

- ⭐ Star the repo if you find it useful
- 🐛 Report bugs via GitHub issues
- 💡 Suggest features in discussions
- 🤝 Contribute via pull requests

---

## 📦 Installation

### For New Users
1. Clone the repository
2. Configure Firebase (see README.md)
3. Open `index.html` in browser
4. Start creating games!

### For Existing Users
1. Pull latest changes: `git pull origin main`
2. No configuration changes needed
3. Refresh browser to see new features
4. Existing games work automatically

---

## 🎓 Learn More

- **README.md** - Project overview and setup
- **ROADMAP.md** - Feature roadmap and planning
- **FEATURES_DEMO.md** - Hands-on demo guide
- **IMPLEMENTATION_SUMMARY.md** - Technical deep dive
- **CHANGELOG.md** - Full version history

---

**Release**: v1.2.0  
**Date**: January 2025  
**Size**: ~1,200 lines of code, 60KB docs  
**Commits**: 5 commits since v1.1.0  
**Contributors**: Meerkats Board Team  

**Download**: [GitHub Repository](https://github.com/TheWaulicus/meerkats_board)

---

🏒 **Happy Scorekeeping!** 🏒
