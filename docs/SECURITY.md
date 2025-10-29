# 🔒 Security Guide for Meerkats Board

## Current Security Issues

### ⚠️ Critical: Open Firestore Rules

**Current rules (INSECURE):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{document=**} {
      allow read, write: if true;  // ❌ ANYONE can read/write
    }
  }
}
```

**Problems:**
- Anyone can read all game data
- Anyone can modify any game
- Anyone can delete games
- No rate limiting
- Vulnerable to abuse and spam

---

## 🛡️ Recommended Security Improvements

### Option 1: Game ID as Password (Simple)

Best for: Casual use, small groups

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      // Allow read if you know the game ID
      allow read: if true;
      
      // Allow write only to specific game documents
      // Users must know the exact game ID to write
      allow write: if request.resource.data.keys().hasAll(['lastUpdated']) 
                   && request.resource.data.lastUpdated is timestamp;
      
      // Prevent deletion
      allow delete: if false;
    }
  }
}
```

**Pros:**
- No authentication needed
- Game IDs act as passwords
- Simple to implement

**Cons:**
- Anyone with game ID can modify
- No user identity tracking
- Can't restrict specific operations

---

### Option 2: Authentication with Operator Roles (Recommended)

Best for: Professional use, rinks, tournaments

**Implementation Steps:**

#### 1. Enable Firebase Authentication

```bash
# In Firebase Console:
# Authentication > Sign-in method > Enable "Email/Password"
```

#### 2. Add Authentication to firebase-config.js

```javascript
// Add after firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Sign in anonymously for view mode
function signInAnonymously() {
  return auth.signInAnonymously();
}

// Sign in with email for control mode
function signInOperator(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

// Sign out
function signOut() {
  return auth.signOut();
}

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User authenticated:', user.uid);
    window.currentUser = user;
  } else {
    console.log('User not authenticated');
    window.currentUser = null;
  }
});
```

#### 3. Secure Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      // Anyone can read (for display mode)
      allow read: if true;
      
      // Only authenticated users can write
      allow write: if request.auth != null;
      
      // Only the game creator can delete
      allow delete: if request.auth != null 
                    && resource.data.createdBy == request.auth.uid;
    }
    
    // Game metadata (for tracking ownership)
    match /game_metadata/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow delete: if request.auth != null 
                    && resource.data.createdBy == request.auth.uid;
    }
  }
}
```

#### 4. Add Login UI to index.html

```html
<!-- Login Modal (add before gameModal) -->
<div id="loginModal" class="settings-modal" style="display: none">
  <div class="settings-content">
    <h2>Operator Login</h2>
    <form id="loginForm">
      <div class="settings-section">
        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" class="settings-input" required />
      </div>
      <div class="settings-section">
        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" class="settings-input" required />
      </div>
      <button type="submit" class="settings-save">Login</button>
    </form>
  </div>
</div>

<script>
// Check if user is authenticated
firebase.auth().onAuthStateChanged((user) => {
  if (!user && window.location.pathname.includes('index.html')) {
    // Show login for control interface
    document.getElementById('loginModal').style.display = 'flex';
  }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    document.getElementById('loginModal').style.display = 'none';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});
</script>
```

#### 5. Auto-login for View Mode (view.html)

```javascript
// Add to view.js
firebase.auth().signInAnonymously()
  .then(() => console.log('Signed in anonymously for view mode'))
  .catch(error => console.error('Anonymous auth failed:', error));
```

---

### Option 3: Advanced - Role-Based Access Control

Best for: Large organizations, multiple operators

**Firestore Rules with Roles:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user role
    function getUserRole(gameId) {
      return get(/databases/$(database)/documents/game_metadata/$(gameId))
             .data.roles[request.auth.uid];
    }
    
    match /scoreboards/{gameId} {
      // Anyone can read
      allow read: if true;
      
      // Operators and admins can write
      allow write: if request.auth != null 
                   && getUserRole(gameId) in ['operator', 'admin'];
      
      // Only admins can delete
      allow delete: if request.auth != null 
                    && getUserRole(gameId) == 'admin';
    }
    
    match /game_metadata/{gameId} {
      // Structure: { createdBy, roles: { uid: 'admin'|'operator' } }
      allow read: if request.auth != null;
      
      // Only admins can modify roles
      allow write: if request.auth != null 
                   && (getUserRole(gameId) == 'admin'
                       || !exists(/databases/$(database)/documents/game_metadata/$(gameId)));
    }
  }
}
```

---

## 🔐 Additional Security Measures

### 1. API Key Restrictions

In Firebase Console > Project Settings > API Keys:

**Restrict Firebase API Key:**
- Application restrictions: HTTP referrers (websites)
- Website restrictions: `yourdomain.com/*`
- API restrictions: Select specific APIs only

### 2. Rate Limiting

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      allow read: if true;
      
      // Rate limit: Max 100 writes per hour per user
      allow write: if request.auth != null 
                   && request.time > resource.data.lastUpdated + duration.value(36, 's');
    }
  }
}
```

### 3. Data Validation

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      allow read: if true;
      
      allow write: if request.auth != null 
                   && request.resource.data.teamAScore is int
                   && request.resource.data.teamAScore >= 0
                   && request.resource.data.teamAScore < 100
                   && request.resource.data.timerSeconds is int
                   && request.resource.data.timerSeconds >= 0;
    }
  }
}
```

### 4. Prevent Sensitive Data Exposure

**Don't store in Firestore:**
- User passwords (use Firebase Auth)
- Payment information
- Personal identifiable information (PII)

**Use Firebase Security Rules to hide fields:**
```javascript
allow read: if resource.data.keys().hasAny(['teamAScore', 'teamBScore', 'timerDisplay']);
```

### 5. Enable App Check (Advanced)

Prevents unauthorized access from modified apps:

1. Enable App Check in Firebase Console
2. Add to firebase-config.js:

```javascript
const appCheck = firebase.appCheck();
appCheck.activate('YOUR_RECAPTCHA_SITE_KEY', true);
```

---

## 📊 Security Audit Checklist

- [ ] Replace open Firestore rules with restricted rules
- [ ] Enable Firebase Authentication
- [ ] Add login UI to control interface
- [ ] Restrict API keys to your domain
- [ ] Add rate limiting to prevent abuse
- [ ] Validate data types and ranges
- [ ] Enable App Check (optional)
- [ ] Monitor Firebase usage for anomalies
- [ ] Set up billing alerts
- [ ] Regular security audits

---

## 🚨 Immediate Action Required

**If your Firebase is currently public:**

1. **Go to Firebase Console NOW**
2. **Navigate to:** Firestore Database > Rules
3. **Replace with minimum security:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;  // Require auth
      allow delete: if false;  // Prevent deletion
    }
  }
}
```

4. **Enable Firebase Authentication** (Email/Password)
5. **Test that writes require authentication**

---

## 📚 Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Security Best Practices](https://firebase.google.com/docs/firestore/security/overview)
- [App Check Documentation](https://firebase.google.com/docs/app-check)

---

**Last Updated:** October 29, 2025  
**Security Level:** ⚠️ Currently INSECURE - Action Required
