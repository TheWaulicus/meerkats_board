# Meerkats Board - Project Structure

## 📁 Directory Organization

```
meerkats_board/
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── PROJECT_STRUCTURE.md        # This file
│
├── index.html                  # Main control interface
├── view.html                   # Display view (audience facing)
├── test_audio.html             # Audio testing utility
├── theme-preview.html          # Theme preview tool
│
├── src/                        # JavaScript source files
│   ├── firebase-config.js      # Firebase configuration
│   ├── game-cleanup.js         # Game cleanup utilities
│   ├── game-history.js         # Game history management
│   ├── game-manager.js         # Multi-game ID management
│   ├── qr-generator.js         # QR code generation
│   ├── scoreboard.js           # Main scoreboard logic
│   ├── url-shortener.js        # URL shortening utilities
│   └── view.js                 # Display view logic
│
├── css/                        # Stylesheets
│   └── scoreboard.css          # Main styles (responsive, dark/light theme)
│
├── assets/                     # Media files
│   ├── images/                 # Logo and image assets
│   │   ├── juice_box.png       # Default league logo
│   │   └── juice_box.heic      # High-res version
│   └── sounds/                 # Audio files
│       ├── hockey-buzzer.wav   # Buzzer sound (synthesized by default)
│       └── README.md           # Audio file instructions
│
└── docs/                       # Documentation
    └── ROADMAP.md              # Future development plans
```

## 🗂️ Legacy Directories (Deprecated)

These directories are kept for backward compatibility but are no longer used:
- `/images/` - Replaced by `/assets/images/`
- `/sounds/` - Replaced by `/assets/sounds/`

**Note:** The `.gitignore` file prevents these legacy directories from being tracked.

## 📝 File References

All file paths have been updated to the new structure:

### HTML Files
- `index.html` → References: `css/scoreboard.css`, `src/*.js`, `assets/images/*`
- `view.html` → References: `css/scoreboard.css`, `src/*.js`, `assets/images/*`
- `test_audio.html` → References: `assets/sounds/*`

### JavaScript Files
- All JS files in `/src/` use: `assets/images/*` and `assets/sounds/*`

### Path Format
- CSS: `css/scoreboard.css`
- JavaScript: `src/filename.js`
- Images: `assets/images/filename.ext`
- Sounds: `assets/sounds/filename.ext`

## 🎯 Reference Count

- CSS references: 2
- JavaScript references: 11
- Image references: 5
- Sound references: 5

**Total verified references: 23**

## 🔄 Migration Notes

If you have existing bookmarks or external links:
- Old file paths will need to be updated
- The reorganization maintains all HTML files at root level
- Only asset and source file paths have changed

## 📋 Best Practices

### Adding New Files

**JavaScript:**
```bash
# Add to /src/ directory
touch src/new-feature.js
# Reference in HTML: <script src="src/new-feature.js"></script>
```

**CSS:**
```bash
# Add to /css/ directory
touch css/additional-styles.css
# Reference in HTML: <link rel="stylesheet" href="css/additional-styles.css">
```

**Images:**
```bash
# Add to /assets/images/ directory
cp logo.png assets/images/
# Reference in code: "assets/images/logo.png"
```

**Sounds:**
```bash
# Add to /assets/sounds/ directory
cp buzzer.wav assets/sounds/
# Reference in code: "assets/sounds/buzzer.wav"
```

### Documentation
- Place markdown documentation in `/docs/`
- Keep README.md at root level
- Use clear, descriptive filenames

## 🛠️ Maintenance

### Regular Tasks
1. Keep `.gitignore` updated with new patterns
2. Verify all file references after moving files
3. Update this document when structure changes
4. Clean up unused files regularly

### Verification Commands
```bash
# Check for broken image references
grep -r "images/" --include="*.html" --include="*.js" .

# Check for broken sound references  
grep -r "sounds/" --include="*.html" --include="*.js" .

# Check all asset references
grep -r "assets/" --include="*.html" --include="*.js" .
```

## 📊 Project Stats

- HTML files: 4
- JavaScript files: 8
- CSS files: 1
- Documentation files: 3
- Image assets: 2
- Sound assets: 1

**Last Updated:** 2024
**Structure Version:** 2.0
