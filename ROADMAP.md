# 🏒 Meerkats Board - Multi-Game Support Roadmap

This document tracks planned enhancements for the multi-game support system.

## 📊 Implementation Status

- ✅ **Completed**: Feature is fully implemented and tested
- 🚧 **In Progress**: Feature is currently being developed
- 📋 **Planned**: Feature is planned but not started
- 💡 **Proposed**: Feature idea for future consideration

---

## Current Implementation (v1.0) ✅

### Core Multi-Game Features
- ✅ Unique game ID generation (`game-XXXXXX` format)
- ✅ URL-based game routing with `?game=` parameter
- ✅ localStorage persistence for last used game
- ✅ Game ID sanitization and validation
- ✅ Firebase Firestore per-game document isolation
- ✅ Create new game functionality
- ✅ Join existing game by ID
- ✅ Copy control link (for managing scoreboard)
- ✅ Copy display link (for read-only viewing)
- ✅ Current game ID display in navbar
- ✅ Game management modal UI
- ✅ Browser back/forward navigation support

---

## High Priority Features ✅

### 1. Game List & History Management
**Status**: ✅ Completed (Jan 2025)  
**Priority**: High  
**Estimated Effort**: 2-3 days

#### What It Involves:
- **Data Structure**:
  - Store list of games in localStorage or Firebase user document
  - Format: `{ gameId, friendlyName, lastAccessed, createdDate, isFavorite }`
  
- **UI Components**:
  - Dropdown menu in navbar showing recent games (last 10)
  - Full game list modal/page with search and filters
  - "Recent Games" section in game management modal
  - Quick switch button (cycle through recent games)
  
- **Features**:
  - Auto-add games when created or joined
  - Click to switch to any game instantly
  - Sort by: Most Recent, Name (A-Z), Created Date
  - Filter by: Favorites, Created by Me, Joined
  
- **Implementation Files**:
  - New file: `game-history.js` (localStorage management)
  - Update: `game-manager.js` (track history on create/join)
  - Update: `index.html` & `view.html` (add UI elements)
  - Update: `scoreboard.css` (dropdown styles)

#### Acceptance Criteria:
- [x] Recent games list appears in game modal
- [x] Games are automatically saved to history
- [x] Can switch between games (with page reload)
- [x] History persists across browser sessions
- [x] Maximum 50 games stored (auto-prune oldest)

---

### 2. Friendly Game Names
**Status**: ✅ Completed (Jan 2025)  
**Priority**: High  
**Estimated Effort**: 1-2 days

#### What It Involves:
- **Data Structure**:
  - Add `gameName` field to Firebase game document
  - Store in format: `{ gameName: "Meerkats vs Tigers - Jan 15" }`
  - Fall back to game ID if no name set
  
- **UI Components**:
  - "Game Name" input field in game management modal
  - Display game name in navbar (with ID as subtitle)
  - Edit game name inline (click to edit)
  - Character limit: 50 characters
  
- **Features**:
  - Auto-suggest format: "Team A vs Team B - Date"
  - Real-time sync across all connected clients
  - Validation: no empty names, trim whitespace
  - Optional: emoji support in names
  
- **Implementation Files**:
  - Update: `firebase-config.js` (add gameName field)
  - Update: `game-manager.js` (save/load game name)
  - Update: `scoreboard.js` & `view.js` (display name)
  - Update: `index.html` (add name input)

#### Acceptance Criteria:
- [x] Can set game name when creating new game
- [x] Can edit game name from game modal
- [x] Game name syncs across all devices in real-time
- [x] Name appears in navbar and game list
- [x] Falls back to game ID if no name set

---

### 3. Reset/Clear Game
**Status**: ✅ Completed (Jan 2025)  
**Priority**: High  
**Estimated Effort**: 1 day

#### What It Involves:
- **Functionality**:
  - Reset all game data to initial state
  - Keep game ID and name intact
  - Confirmation dialog (prevent accidental resets)
  - Optional: partial reset (scores only, timer only, etc.)
  
- **UI Components**:
  - "Reset Game" button in game management modal
  - Confirmation modal with warning message
  - Checklist: Reset scores, timer, penalties, team names, logos
  - "Are you sure?" double confirmation
  
- **Features**:
  - Full reset: everything back to defaults
  - Partial reset options:
    - Scores and shots only
    - Timer and period only
    - Penalties only
    - Keep team names/logos
  - Broadcast reset event to all connected displays
  
- **Implementation Files**:
  - Update: `scoreboard.js` (reset functions)
  - Update: `firebase-config.js` (reset Firebase doc)
  - Update: `index.html` (reset button and modal)
  - Update: `game-manager.js` (reset coordination)

#### Acceptance Criteria:
- [x] Reset button available to game controllers
- [x] Confirmation dialog prevents accidental resets
- [x] All connected displays update immediately
- [x] Can choose full or partial reset
- [x] Game ID and name persist after reset

---

## Medium Priority Features 📋

### 4. Delete/Archive Games
**Status**: ✅ Completed (Jan 2025)  
**Priority**: Medium  
**Estimated Effort**: 2 days

#### What It Involves:
- **Functionality**:
  - Permanently delete game from Firebase
  - Archive game (hide from active list but keep data)
  - Bulk delete multiple games
  - Auto-archive games inactive for 30+ days
  
- **Data Structure**:
  - Add `archived` and `archivedDate` fields
  - Add `deleted` and `deletedDate` fields (soft delete)
  - Permanent delete after 90 days in trash
  
- **UI Components**:
  - Delete button in game list (trash icon)
  - Archive toggle in game settings
  - "Archived Games" section in game list
  - Bulk actions: Select multiple → Delete/Archive
  - Restore from archive button
  
- **Features**:
  - Soft delete (30-day grace period)
  - Restore deleted games within grace period
  - Permanent delete confirmation (cannot undo)
  - Export game data before delete
  - Admin cleanup tool for old games
  
- **Implementation Files**:
  - New file: `game-cleanup.js` (delete/archive logic)
  - Update: `game-history.js` (handle archived games)
  - Update: `firebase-config.js` (delete operations)
  - Update: `index.html` (delete/archive UI)

#### Acceptance Criteria:
- [x] Can delete games from game list
- [x] Export game data before deletion
- [x] Delete from Firebase and history
- [x] Archive games (mark in Firebase)
- [x] Permanent delete requires double confirmation
- [ ] Trash/30-day retention (future enhancement)
- [ ] Bulk delete operations (future enhancement)

---

### 5. QR Code Generation
**Status**: ✅ Completed (Jan 2025)  
**Priority**: Medium  
**Estimated Effort**: 1 day

#### What It Involves:
- **Library Integration**:
  - Use QRCode.js or similar lightweight library
  - No external API calls (privacy-friendly)
  - Generate QR codes client-side
  
- **UI Components**:
  - QR code display in game management modal
  - Separate QR codes for control and display links
  - Download QR code as PNG/SVG
  - Print-friendly QR code page
  
- **Features**:
  - Generate QR for control URL
  - Generate QR for display URL
  - Optional: QR with game name embedded
  - Customizable QR code size
  - High error correction for reliability
  
- **Use Cases**:
  - Print QR codes for easy mobile access
  - Display QR on tablet for crowd scanning
  - Share via poster/flyer
  - Quick access without typing URLs
  
- **Implementation Files**:
  - Add library: `qrcode.min.js` (or CDN)
  - New file: `qr-generator.js` (QR code logic)
  - Update: `index.html` (QR UI in modal)
  - Update: `scoreboard.css` (QR code styling)

#### Acceptance Criteria:
- [x] QR codes generate instantly
- [x] Separate QR for control and display
- [x] Can download QR as image
- [x] QR codes work reliably when scanned
- [x] Print-friendly layout option

---

### 6. Active Viewer Count
**Status**: 📋 Planned  
**Priority**: Medium  
**Estimated Effort**: 2 days

#### What It Involves:
- **Firebase Presence System**:
  - Use Firebase Realtime Database for presence
  - Track connected clients per game ID
  - Detect disconnections (window close, network loss)
  - Count unique viewers vs. controllers
  
- **Data Structure**:
  ```javascript
  /presence/{gameId}/{sessionId}: {
    type: "controller" | "viewer",
    connectedAt: timestamp,
    lastSeen: timestamp,
    userAgent: string (optional)
  }
  ```
  
- **UI Components**:
  - Viewer count badge in navbar (e.g., "👁️ 3")
  - Detailed breakdown in game modal
  - Show who's controlling vs. viewing
  - Optional: notification when someone joins
  
- **Features**:
  - Real-time count updates
  - Distinguish controllers from viewers
  - Timeout inactive connections (2 min)
  - Optional: anonymous user nicknames
  - Privacy: no personal data stored
  
- **Implementation Files**:
  - New file: `presence.js` (presence tracking)
  - Update: `firebase-config.js` (Realtime DB setup)
  - Update: `index.html` & `view.html` (viewer count UI)
  - Update: `scoreboard.js` & `view.js` (presence hooks)

#### Acceptance Criteria:
- [ ] Viewer count displays in navbar
- [ ] Count updates in real-time
- [ ] Disconnected clients removed within 2 minutes
- [ ] Can distinguish controllers from viewers
- [ ] No PII (personally identifiable information) stored

---

## Low Priority Features 💡

### 7. Authentication & Permissions
**Status**: 💡 Proposed  
**Priority**: Low  
**Estimated Effort**: 5-7 days

#### What It Involves:
- **Authentication Options**:
  - Firebase Authentication (Email, Google, Anonymous)
  - Optional: Simple PIN code system (lightweight)
  - Optional: Magic link (email-based, no password)
  
- **Permission Levels**:
  - **Owner**: Full control, can delete game, manage permissions
  - **Controller**: Can change scores, timer, settings
  - **Viewer**: Read-only access
  - **Guest**: Temporary access (auto-expire)
  
- **Data Structure**:
  ```javascript
  gamePermissions: {
    ownerId: "user123",
    controllers: ["user456", "user789"],
    viewers: ["user999"],
    publicView: true/false,
    requireAuth: true/false
  }
  ```
  
- **UI Components**:
  - Login modal (simple)
  - Permission management page
  - Share with permissions (send invite links)
  - Access control settings
  
- **Features**:
  - Owner can invite controllers
  - Revoke access at any time
  - Public vs. private games
  - Anonymous viewer access
  - Transfer ownership
  
- **Security Considerations**:
  - Firebase Security Rules enforcement
  - Rate limiting on game creation
  - Prevent unauthorized modifications
  - Audit log of changes

#### Acceptance Criteria:
- [ ] Users can sign in (optional)
- [ ] Owner can set game visibility
- [ ] Can invite specific users as controllers
- [ ] Viewers cannot modify game state
- [ ] Security rules properly enforced

---

### 8. Game Templates
**Status**: 💡 Proposed  
**Priority**: Low  
**Estimated Effort**: 2-3 days

#### What It Involves:
- **Template System**:
  - Save game configuration as template
  - Reuse team names, logos, settings
  - Pre-set timer durations, period counts
  - League-specific templates
  
- **Data Structure**:
  ```javascript
  template: {
    id: "template-xyz",
    name: "U12 League Standard",
    teamAName: "Home",
    teamBName: "Away",
    leagueName: "Youth Hockey League",
    timerDuration: 720, // 12 minutes
    periods: 3,
    shotTracking: true,
    penaltyTracking: true
  }
  ```
  
- **UI Components**:
  - "Save as Template" button
  - Template picker when creating new game
  - Template library/gallery
  - Edit/delete templates
  
- **Features**:
  - Create template from current game
  - Apply template to new game
  - Share templates (export/import JSON)
  - Community templates (optional)
  - Default templates (youth hockey, beer league, etc.)
  
- **Use Cases**:
  - League managers set up standard games
  - Recurring matchups (same teams)
  - Tournament bracket games
  - Different age divisions with different rules

#### Acceptance Criteria:
- [ ] Can save current game as template
- [ ] Can create new game from template
- [ ] Templates include all settings
- [ ] Can edit/delete saved templates
- [ ] Can export/import templates as JSON

---

### 9. Game Export/Import
**Status**: 💡 Proposed  
**Priority**: Low  
**Estimated Effort**: 2 days

#### What It Involves:
- **Export Formats**:
  - JSON (full game state)
  - CSV (scores, shots, penalties)
  - PDF (printable game sheet)
  - Optional: Excel spreadsheet
  
- **Export Data**:
  - Final score and stats
  - Period-by-period breakdown
  - Penalty summary
  - Timestamps (start, end, each goal)
  - Team information
  
- **Import Functionality**:
  - Restore game from JSON backup
  - Import game into new game ID
  - Merge games (combine stats)
  
- **UI Components**:
  - Export button in game modal
  - Format selector (JSON/CSV/PDF)
  - Import button (upload JSON)
  - Preview imported data
  
- **Use Cases**:
  - Season statistics tracking
  - Backup important games
  - Share game results
  - Transfer between systems
  - Archival/record keeping

#### Acceptance Criteria:
- [ ] Can export game as JSON
- [ ] Can export stats as CSV
- [ ] Can import JSON to restore game
- [ ] Export includes all game data
- [ ] PDF export is print-friendly

---

### 10. Game Analytics Dashboard
**Status**: 💡 Proposed  
**Priority**: Low  
**Estimated Effort**: 3-4 days

#### What It Involves:
- **Metrics to Track**:
  - Total games created
  - Average game duration
  - Most used team names
  - Peak viewing times
  - Viewer count per game
  - Device types (mobile/desktop)
  
- **Visualizations**:
  - Line chart: Games over time
  - Bar chart: Games per day/week
  - Pie chart: Device distribution
  - Heatmap: Active hours
  - Leaderboard: Most active games
  
- **UI Components**:
  - Dedicated analytics page
  - Filter by date range
  - Export analytics as CSV
  - Real-time updates
  
- **Privacy**:
  - Aggregate data only (no personal info)
  - Optional: Disable analytics
  - Local-only storage option
  - No third-party tracking
  
- **Implementation**:
  - Store events in Firebase
  - Client-side analytics processing
  - Optional: Google Analytics integration
  - Dashboard using Chart.js or similar

#### Acceptance Criteria:
- [ ] Analytics dashboard accessible
- [ ] Shows key metrics accurately
- [ ] Data updates in real-time
- [ ] Can filter by date range
- [ ] Privacy-friendly implementation

---

### 11. Short URL Service
**Status**: 💡 Proposed  
**Priority**: Low  
**Estimated Effort**: 2-3 days

#### What It Involves:
- **URL Shortening**:
  - Convert long game URLs to short links
  - Custom short codes (e.g., `meerkats.app/g/ABC`)
  - Optional: Self-hosted shortener
  - Alternative: Firebase Dynamic Links
  
- **Features**:
  - Generate short URL for any game
  - Optional: Custom vanity URLs
  - Track clicks/analytics
  - QR code integration
  - Expire old short URLs
  
- **Implementation Options**:
  - **Option A**: Firebase Dynamic Links (free, Google-hosted)
  - **Option B**: Self-hosted (bit.ly alternative)
  - **Option C**: Third-party API (TinyURL, Bitly)
  
- **UI Components**:
  - Short URL display in game modal
  - "Create Short Link" button
  - Copy short URL to clipboard
  - Optional: Edit custom short code

#### Acceptance Criteria:
- [ ] Can generate short URL for game
- [ ] Short URLs redirect correctly
- [ ] Copy short URL to clipboard
- [ ] Short URLs work long-term
- [ ] Optional: Custom short codes

---

## Technical Debt & Improvements 🔧

### Code Quality
- [ ] Add JSDoc comments to all functions
- [ ] Create comprehensive unit tests
- [ ] Set up CI/CD pipeline
- [ ] Add TypeScript type definitions
- [ ] Improve error handling and logging

### Performance
- [ ] Optimize Firebase read/write operations
- [ ] Implement caching for frequently accessed games
- [ ] Lazy load game history (pagination)
- [ ] Reduce bundle size (code splitting)
- [ ] Add service worker for offline support

### Accessibility
- [ ] Full keyboard navigation support
- [ ] Screen reader improvements
- [ ] WCAG 2.1 AA compliance
- [ ] High contrast mode support
- [ ] Focus indicators for all interactive elements

### Documentation
- [ ] API documentation
- [ ] Developer setup guide
- [ ] User manual/help system
- [ ] Video tutorials
- [ ] FAQ section

---

## Implementation Notes

### Development Workflow
1. Create feature branch: `feature/game-history`
2. Implement feature with tests
3. Update ROADMAP.md with ✅ status
4. Submit PR with demo video/screenshots
5. Merge after review and testing

### Testing Checklist
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (iOS/Android)
- [ ] Firebase sync works correctly
- [ ] No console errors
- [ ] Performance acceptable (<2s load time)
- [ ] Accessibility tested with screen reader

### Dependencies to Add
- QRCode.js (for QR generation)
- Chart.js (for analytics dashboard)
- Firebase Authentication (for auth features)
- jsPDF (for PDF export)

---

## Version Planning

### v1.1 - Game Management (Target: Q2 2025)
- Game list & history
- Friendly game names
- Reset/clear game

### v1.2 - Sharing & Collaboration (Target: Q3 2025)
- QR code generation
- Active viewer count
- Delete/archive games

### v1.3 - Advanced Features (Target: Q4 2025)
- Authentication & permissions
- Game templates
- Export/import

### v2.0 - Analytics & Enterprise (Target: 2026)
- Analytics dashboard
- Short URL service
- Multi-language support
- White-label options

---

## Contributing

Want to help implement any of these features? Great!

1. Pick a feature from the roadmap
2. Comment on the issue (or create one)
3. Fork the repo and create a feature branch
4. Implement with tests
5. Submit a PR with clear description

---

## Questions or Suggestions?

Have ideas for the multi-game system? Open an issue or submit a PR to update this roadmap!

**Last Updated**: January 2025  
**Maintainer**: Meerkats Board Team
