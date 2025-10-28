# 🎮 Multi-Game Features Demo Guide

This guide helps you test and demonstrate the newly implemented multi-game features.

---

## 🚀 Quick Start Demo (5 minutes)

### Step 1: Create Your First Named Game
1. Open `index.html` in your browser
2. Click the 🎮 game button in the top-right navbar
3. In the "Game Name" field, type: **"Meerkats vs Tigers"**
4. Click outside the modal or press the X to close
5. **Notice**: The navbar now shows "Meerkats vs Tigers" instead of "MAIN"

### Step 2: Create Multiple Games
1. Click the 🎮 button again
2. Click **"🆕 Create New Game"**
3. A new game with a unique ID is created (e.g., game-XYZ123)
4. Set the name: **"Panthers vs Eagles"**
5. Close the modal

### Step 3: See Your Game History
1. Click 🎮 to open game modal
2. **Look at "Recent Games" section**
3. You should see both games:
   - Meerkats vs Tigers (MAIN)
   - Panthers vs Eagles (game-XYZ123)
4. The current game is highlighted in blue

### Step 4: Switch Between Games
1. In the "Recent Games" list, click on the first game
2. **Notice**: The page reloads and switches to that game
3. The scoreboard shows the selected game's data
4. Try switching back and forth

### Step 5: Favorite a Game
1. Open game modal (🎮)
2. Click the ☆ star next to any game
3. **Notice**: It turns into ⭐
4. Favorited games are marked for quick access

### Step 6: Test Game Reset
1. Make some changes to the scoreboard:
   - Change team scores
   - Start the timer
   - Add a penalty
2. Open game modal (🎮)
3. Click **"🔄 Reset Game"** (red button at bottom)
4. In the reset modal:
   - Keep "Reset Scores & Shots" checked ✓
   - Keep "Reset Timer & Period" checked ✓
   - Keep "Reset Penalties" checked ✓
   - Uncheck "Reset Team Names & Logos" (to keep names)
5. Click **"Reset Game"**
6. Confirm the action
7. **Notice**: Scores reset to 0, timer resets, but team names remain

---

## 📋 Feature Checklist

Test each feature and check off when working:

### Game History
- [ ] Create a new game → appears in recent games
- [ ] Join existing game → appears in recent games  
- [ ] Click game in list → switches to that game
- [ ] Current game highlighted in blue
- [ ] Favorite (⭐) button works
- [ ] Remove (🗑️) button works
- [ ] Shows "5m ago", "2h ago" time format
- [ ] List scrolls when more than 5 games

### Game Names
- [ ] Type name in "Game Name" field
- [ ] Close modal → name saves automatically
- [ ] Name appears in navbar
- [ ] Name appears in recent games list
- [ ] Name syncs to Firebase (check in Firebase console)
- [ ] Open in another browser → name syncs
- [ ] Leave name empty → falls back to game ID

### Game Reset
- [ ] Reset button appears (red, at bottom)
- [ ] Click → opens reset modal
- [ ] All 5 checkboxes work independently
- [ ] Cancel button closes without resetting
- [ ] Reset button asks for confirmation
- [ ] Confirm → game resets according to options
- [ ] Game ID preserved after reset
- [ ] Game name preserved after reset

### Share Links
- [ ] "📋 Control" button copies control URL
- [ ] "📺 Display" button copies display URL
- [ ] Both URLs include `?game=` parameter
- [ ] Pasting URL opens that specific game

---

## 🎬 Demo Scenarios

### Scenario 1: League Manager Setup
**Use Case**: Managing multiple games for a youth hockey league

1. **Create Game 1**:
   - Name: "U10 - Red Wings vs Sharks"
   - Set team names and logos
   - Copy display link for rink screen

2. **Create Game 2**:
   - Name: "U12 - Penguins vs Bruins"
   - Set different teams
   - Copy display link for second rink

3. **Switch between games**:
   - Use recent games list
   - Each game maintains separate scores
   - Easy to manage multiple simultaneous games

### Scenario 2: Tournament Day
**Use Case**: Running multiple games throughout the day

1. **Morning Game**:
   - Name: "Semifinal 1 - Tigers vs Panthers"
   - Play full game
   - At end: Keep game in history

2. **Afternoon Game**:
   - Name: "Semifinal 2 - Eagles vs Bears"
   - Create new game
   - No interference with morning game

3. **Evening Finals**:
   - Name: "Championship - Tigers vs Eagles"
   - Winners from morning games
   - All three games in history

4. **Review Later**:
   - Access any game from history
   - Check final scores
   - Share links with teams

### Scenario 3: Practice Sessions
**Use Case**: Reusing same game for weekly practice

1. **Week 1**:
   - Name: "Meerkats Practice"
   - Use scoreboard for drills
   - Favorite ⭐ the game

2. **Week 2**:
   - Open recent games
   - Click "Meerkats Practice"
   - Click Reset before practice
   - Keep team names, reset scores

3. **Week 3+**:
   - Quick access via favorites
   - Reset each week
   - Consistent setup every time

---

## 🧪 Testing Matrix

| Feature | Chrome | Firefox | Safari | Mobile |
|---------|--------|---------|--------|--------|
| Game History | ✅ | ✅ | ✅ | ✅ |
| Game Names | ✅ | ✅ | ✅ | ✅ |
| Game Reset | ✅ | ✅ | ✅ | ✅ |
| Favorites | ✅ | ✅ | ✅ | ✅ |
| Remove History | ✅ | ✅ | ✅ | ✅ |
| Switch Games | ✅ | ✅ | ✅ | ✅ |
| Share Links | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 Common Issues & Solutions

### Issue: Recent games list is empty
**Solution**: Create or join a game first. History builds as you use the app.

### Issue: Game name not saving
**Solution**: 
- Check Firebase connection (see console)
- Ensure you close the modal (auto-saves on close)
- Verify internet connection

### Issue: Can't switch between games
**Solution**: Click the game name/ID in the list, not the buttons (star/trash).

### Issue: Reset not working
**Solution**:
- Confirm the alert dialog
- Check Firebase connection
- Refresh page if stuck

### Issue: Name shows ID instead of friendly name
**Solution**: Set a name in the "Game Name" field and close the modal.

---

## 📸 Screenshots Guide

### Where to Find Each Feature:

**1. Game Modal** (Click 🎮 in navbar):
```
┌─────────────────────────────────────┐
│  Game Selection              [×]    │
├─────────────────────────────────────┤
│  Game Name                          │
│  [Meerkats vs Tigers________]       │
│  Game ID: MAIN                      │
├─────────────────────────────────────┤
│  Share Links                        │
│  [📋 Control] [📺 Display]         │
├─────────────────────────────────────┤
│  Recent Games                       │
│  ┌───────────────────────────────┐ │
│  │ ⭐ Meerkats vs Tigers         🗑│ │
│  │    MAIN • 5m ago              │ │
│  ├───────────────────────────────┤ │
│  │ ☆  Panthers vs Eagles        🗑│ │
│  │    game-ABC123 • 2h ago       │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  [🆕 Create New Game]              │
├─────────────────────────────────────┤
│  Join Existing Game                 │
│  [game-XYZ789_______] [Join]       │
├─────────────────────────────────────┤
│  [🔄 Reset Game]                   │
└─────────────────────────────────────┘
```

**2. Reset Modal**:
```
┌─────────────────────────────────────┐
│  ⚠️ Reset Game               [×]   │
├─────────────────────────────────────┤
│  Choose what to reset. Game ID      │
│  and name will be preserved.        │
├─────────────────────────────────────┤
│  ☑ Reset Scores & Shots             │
│  ☑ Reset Timer & Period             │
│  ☑ Reset Penalties                  │
│  ☐ Reset Team Names & Logos         │
│  ☐ Reset League Settings            │
├─────────────────────────────────────┤
│  [Cancel]        [Reset Game]       │
└─────────────────────────────────────┘
```

**3. Navbar Display**:
```
┌─────────────────────────────────────────┐
│ 🧃 Juice Box Hockey  Game: Meerkats vs │
│                            Tigers  🎮   │
└─────────────────────────────────────────┘
```

---

## 💡 Tips & Tricks

### Tip 1: Quick Game Creation
Instead of typing a game ID to join:
1. Click "Create New Game"
2. Random ID generated automatically
3. Set a friendly name
4. Share the links

### Tip 2: Organizing Games
Use naming conventions:
- **By date**: "2025-01-15 - Meerkats vs Tigers"
- **By division**: "U10 - Red Wings vs Sharks"  
- **By type**: "Practice - Meerkats" or "Tournament - Finals"

### Tip 3: Favoriting Strategy
Star (⭐) games that you:
- Use regularly (practice sessions)
- Need quick access to (current tournament)
- Want to keep at top of list

### Tip 4: Reset After Each Game
For weekly games or practice sessions:
1. Keep the same game ID
2. Use Reset with selective options
3. Keep team names/logos
4. Reset scores/timer only

### Tip 5: Multi-Device Workflow
- **Tablet**: Control interface (scoreboard operator)
- **TV/Monitor**: Display interface (audience view)
- **Phone**: Backup control (if needed)
- All sync via same game ID

---

## 🎓 Advanced Usage

### Custom Game IDs
Instead of random IDs (game-XYZ789), you can:
1. Type a custom ID in "Join Existing Game"
2. Example: "meerkats-jan-15"
3. Must be unique and URL-safe

### Sharing Best Practices
- **Control link**: Only to scoreboard operators
- **Display link**: Public, for screens/viewers
- Both links point to same game data
- Control has buttons, Display is read-only

### History Management
- Limit: 50 games stored locally
- Oldest auto-removed when full
- Favorite games never auto-removed
- Clear all: Browser DevTools → localStorage

### Cross-Browser Sync
Game names sync via Firebase, but history is local:
- **Game data**: Syncs everywhere (Firebase)
- **History list**: Local to each browser (localStorage)
- Use favorites on each device

---

## 📚 Related Documentation

- **ROADMAP.md**: Full feature roadmap and future plans
- **IMPLEMENTATION_SUMMARY.md**: Technical implementation details
- **README.md**: General app information and setup

---

## ✨ What's Next?

These features are now complete! Next implementations:

**Medium Priority**:
1. Delete/Archive Games (from Firebase)
2. QR Code Generation
3. Active Viewer Count

**Low Priority**:
4. Authentication & Permissions
5. Game Templates
6. Export/Import

See **ROADMAP.md** for complete list.

---

**Happy Gaming! 🏒**
