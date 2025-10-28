# Changelog

All notable changes to the Meerkats Board Hockey Scoreboard project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2025-01-XX

### 🎉 Added - Multi-Game Support Features

This major update adds comprehensive multi-game management capabilities, allowing users to create, manage, and switch between multiple games seamlessly.

#### Game History & Management
- **Recent Games List**: View and manage up to 50 recent games in localStorage
- **Quick Game Switching**: Click any game in the list to switch instantly
- **Favorite Games**: Star important games for quick access
- **Remove from History**: Clean up old games from your list
- **Auto-tracking**: Games automatically added when created or joined
- **Smart Display**: Shows game name, ID, and relative time ("5m ago", "2h ago")
- **Current Game Highlight**: Active game highlighted in blue

#### Friendly Game Names
- **Custom Names**: Set user-friendly names for games (e.g., "Meerkats vs Tigers")
- **Real-time Sync**: Names sync across all devices via Firebase
- **Navbar Display**: Game name appears in navbar instead of cryptic ID
- **Automatic Save**: Names save when closing game modal
- **Fallback Support**: Falls back to game ID if no name set
- **Character Limit**: 50 character maximum for names

#### Game Reset Functionality
- **Granular Reset**: Choose exactly what to reset with checkboxes
- **Reset Options**:
  - Scores & Shots (default: on)
  - Timer & Period (default: on)
  - Penalties (default: on)
  - Team Names & Logos (default: off)
  - League Settings (default: off)
- **Safe Reset**: Game ID and name always preserved
- **Double Confirmation**: Prevents accidental resets
- **Real-time Update**: All connected displays update immediately

#### New Files
- `game-history.js`: localStorage-based game history management
- `ROADMAP.md`: Detailed feature roadmap and planning
- `IMPLEMENTATION_SUMMARY.md`: Technical implementation details
- `FEATURES_DEMO.md`: Demo guide and testing scenarios
- `CHANGELOG.md`: This file

#### Modified Files
- `firebase-config.js`: Added game name and reset functions
- `game-manager.js`: Integrated with history tracking
- `index.html`: New UI for game modal and reset modal
- `view.html`: Added game history script
- `scoreboard.js`: History UI, name saving, reset logic
- `view.js`: Display game names from Firebase
- `scoreboard.css`: Added CSS variables for error colors

### 🔧 Changed
- Game modal redesigned with better organization
- Navbar now shows friendly game names when available
- Game ID display moved to subtitle in modal
- Share buttons now full-width for better mobile UX

### 🐛 Fixed
- Game switching now properly reloads page state
- Modal auto-saves game name on close
- History properly persists across browser sessions

### 📚 Documentation
- Complete ROADMAP with all planned features
- Detailed implementation summary with architecture
- Demo guide with test scenarios
- Updated README with new features

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Core Features
- Real-time scoreboard with Firebase sync
- Team score tracking (home/away)
- Shot counter for both teams
- Period/phase management (regulation, OT, shootout)
- Countdown timer with play/pause
- Penalty tracking with timers
- Team and league customization (names, logos)
- Dark/light theme toggle
- Responsive design (mobile/desktop/tablet)
- Read-only display view (view.html)
- Control interface (index.html)
- Audio buzzer support

#### Game Management (Basic)
- Game ID system for multi-game support
- URL-based game routing (`?game=`)
- Create new game with random ID
- Join existing game by ID
- Share control and display links
- localStorage persistence for last game

#### Settings
- League name and logo upload
- Team names and logo upload
- Shot tracking visibility toggle
- Timeout tracking visibility toggle
- Period display visibility toggle
- Timer visibility toggle

#### UI/UX
- Fixed navbar with branding
- Collapsible penalty boxes
- Visual timer with glow effects
- Hover states and transitions
- Accessibility features (ARIA labels)
- Keyboard navigation support

#### Technical
- Firebase Firestore integration
- No external dependencies (vanilla JS)
- Modular code structure
- Browser localStorage support
- Image upload and storage
- Real-time data synchronization

---

## [Unreleased]

### 🔮 Planned Features

#### Medium Priority (v1.2)
- Delete/Archive games from Firebase
- QR code generation for easy sharing
- Active viewer count display
- Game search functionality
- Sort options in UI

#### Low Priority (v1.3+)
- Authentication and permissions system
- Game templates for quick setup
- Export/import game data (JSON/CSV/PDF)
- Analytics dashboard
- Short URL service integration
- Multi-language support
- White-label customization

See [ROADMAP.md](ROADMAP.md) for complete details.

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2025-01-XX | Multi-game management features |
| 1.0.0 | 2024-XX-XX | Initial release |

---

## Migration Guide

### Upgrading from 1.0.0 to 1.1.0

**No breaking changes!** All existing games continue to work.

#### New Features Available:
1. Open game modal (🎮 button) to see new features
2. Set a friendly name for your games
3. View recent games in the modal
4. Use reset feature to clear scores while keeping setup

#### What's Preserved:
- All existing game IDs
- All game data in Firebase
- URL parameters still work
- Existing bookmarks/links work

#### What's New:
- Recent games now tracked in localStorage
- Game names can be set (optional)
- Reset functionality available
- Enhanced game modal UI

#### Optional Steps:
1. Name your existing games for easier identification
2. Favorite frequently used games
3. Clean up old test games from history

---

## Support & Feedback

### Reporting Issues
If you encounter any bugs or issues:
1. Check the [FEATURES_DEMO.md](FEATURES_DEMO.md) troubleshooting section
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
3. Check browser console for error messages
4. Verify Firebase connection and configuration

### Feature Requests
Have ideas for new features?
1. Check [ROADMAP.md](ROADMAP.md) to see if it's planned
2. Review [ROADMAP.md](ROADMAP.md) contributing section
3. Submit detailed feature proposals

### Contributing
Contributions are welcome! See [ROADMAP.md](ROADMAP.md) for:
- Development workflow
- Testing checklist
- Code quality standards
- Feature implementation guidelines

---

## Credits

**Original Author**: Meerkats Board Team  
**License**: Open Source (see project README)  
**Firebase**: Real-time database backend  
**Font Awesome**: Icons (via Unicode emoji)  
**Google Fonts**: Inter & Orbitron fonts

---

## Technical Notes

### Browser Compatibility
- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Recommended**: Latest stable versions
- **Mobile**: iOS 14+, Android 10+

### Performance
- **Initial Load**: ~500ms
- **Firebase Sync**: ~100-500ms latency
- **Game Switching**: ~500ms-2s (page reload)
- **History Operations**: <10ms (localStorage)

### Storage
- **localStorage**: ~5KB per 50 games
- **Firebase**: ~5-10KB per game document
- **Images**: Stored as base64 in Firebase

### Dependencies
- Firebase SDK 9.x (CDN)
- Google Fonts (CDN)
- No npm packages required
- Pure vanilla JavaScript

---

## Security

### Firebase Rules
Ensure proper Firebase security rules are configured:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      allow read: true;
      allow write: true; // Consider restricting in production
    }
  }
}
```

### Data Privacy
- No personal data collected
- No tracking or analytics (unless explicitly added)
- Game data stored in Firebase (your project)
- History stored locally (localStorage)
- No third-party data sharing

---

**Last Updated**: January 2025  
**Maintained by**: Meerkats Board Team
