# 👤 Creating Your First Operator User

## Prerequisites

- Firebase project set up (see README.md)
- Firebase Authentication enabled
- Firestore rules updated (see SECURITY.md)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Firebase Authentication

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: meerkats-74de5 (or your project)
3. **Navigate to**: Authentication (in left sidebar)
4. **Click**: "Get Started" (if not already enabled)

### Step 2: Enable Email/Password Sign-in

1. **Go to**: Authentication > Sign-in method tab
2. **Find**: Email/Password in the providers list
3. **Click**: Email/Password row
4. **Enable**: Toggle the "Enable" switch
5. **Save**: Click "Save"

### Step 3: Create Your First Operator User

1. **Go to**: Authentication > Users tab
2. **Click**: "Add user" button
3. **Enter details**:
   - Email: `operator@yourcompany.com` (or your email)
   - Password: Choose a strong password (min 6 characters)
4. **Click**: "Add user"

**✅ Your first operator account is created!**

---

## 🔐 Secure Firestore Rules

Before using authentication, update your Firestore rules:

1. **Go to**: Firestore Database > Rules tab
2. **Replace rules with**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboards/{gameId} {
      // Anyone can read (for display mode)
      allow read: if true;
      
      // Only authenticated users can write (operators)
      allow write: if request.auth != null;
      
      // Prevent deletion by default
      allow delete: if false;
    }
  }
}
```

3. **Click**: "Publish"

---

## 🎯 Testing Your Setup

### Test 1: Login Works

1. Open `index.html` in browser
2. You should see login modal
3. Enter email and password
4. Should successfully log in and see scoreboard

### Test 2: View Mode Works

1. Open `view.html` in browser
2. Should auto-login anonymously (check console)
3. Should see scoreboard in read-only mode

### Test 3: Security Works

1. Open browser console on `index.html`
2. Sign out: `await signOut()`
3. Try to write: `await getScoreboardDoc().set({test: 1})`
4. Should fail with "Missing or insufficient permissions" ✅

---

## 👥 Creating Additional Users

### Method 1: Firebase Console (Recommended)

1. Go to: Authentication > Users
2. Click: "Add user"
3. Enter: Email and password
4. Click: "Add user"

### Method 2: User Self-Registration (Advanced)

Add a registration form to your app:

```javascript
async function registerUser(email, password) {
  try {
    const userCredential = await firebase.auth()
      .createUserWithEmailAndPassword(email, password);
    console.log('User created:', userCredential.user.email);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}
```

---

## 🔑 Password Management

### Reset User Password (Console)

1. Go to: Authentication > Users
2. Find user
3. Click: ⋮ (three dots)
4. Select: "Reset password"
5. Firebase sends password reset email

### User Changes Own Password (Code)

```javascript
async function changePassword(newPassword) {
  const user = firebase.auth().currentUser;
  await user.updatePassword(newPassword);
  alert('Password updated successfully');
}
```

---

## 🛡️ User Management Best Practices

### For Small Teams (1-5 operators)
- Create one account per person
- Use strong passwords
- Share access only when needed

### For Medium Teams (5-20 operators)
- Create accounts for each operator
- Use company email addresses
- Document who has access
- Remove accounts when people leave

### For Large Organizations (20+ operators)
- Consider role-based access (see SECURITY.md Option 3)
- Use Firebase Admin SDK for bulk user management
- Implement user approval workflow
- Regular security audits

---

## 🌐 Production Hosting URL

Share these links with operators once Firebase Hosting deployment is live:
- Control interface: `https://meerkats-74de5.web.app/index.html`
- Display view: `https://meerkats-74de5.web.app/view.html`

If you map a custom domain, update your onboarding docs and ensure Firebase Auth redirect domains + App Check site keys include that host. Confirm operators bookmark the production URL instead of local files.

### CI/CD Deployment Token
- Admins generating CI tokens should run `firebase login:ci` locally and store the resulting token as the GitHub secret `FIREBASE_TOKEN`
- GitHub Actions workflow (`.github/workflows/firebase-hosting.yml`) handles dry-run previews for feature branches and full deploys on `main`
- Operators without CI access can still deploy manually via `firebase deploy` if they have Firebase CLI access

### Game picker behavior
- The Game Manager modal now lists every game from the Firestore `scoreboards` collection (not just local history)
- Firestore is set to App Check + auth enforcement: ensure production hosts have valid reCAPTCHA site keys and preview hosts use the built-in App Check skip
- Favorites still sync locally; the star icon only affects your local history view for now

---

## 🐛 Troubleshooting

### "Email already in use"
- User already exists
- Use different email or reset existing user's password

### "Weak password"
- Password must be at least 6 characters
- Use stronger password

### "Invalid email"
- Check email format (must include @)
- No spaces allowed

### "Operation not allowed"
- Email/Password not enabled in Firebase Console
- Go to Authentication > Sign-in method and enable it

### Login modal doesn't appear
- Check browser console for errors
- Verify Firebase config in `src/firebase-config.js`
- Ensure Firebase Auth SDK loaded

### "Missing or insufficient permissions"
- **Good!** This means security is working
- User must be authenticated to write data
- Anonymous users (view mode) can only read

---

## 📧 Example User Accounts

For testing, create multiple operator accounts:

| Email | Purpose |
|-------|---------|
| `operator@yourcompany.com` | Primary operator |
| `backup@yourcompany.com` | Backup operator |
| `admin@yourcompany.com` | Admin access |

**⚠️ Never use default/weak passwords in production!**

---

## ✅ Setup Complete Checklist

- [ ] Firebase Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] At least one operator user created
- [ ] Firestore rules updated to require auth
- [ ] Tested login on index.html
- [ ] Tested view mode on view.html
- [ ] Verified security (writes blocked when not authenticated)

---

**🎉 You're all set!** Operators can now securely log in to control the scoreboard.

**Next Steps:**
- See [SECURITY.md](SECURITY.md) for advanced security options
- See [README.md](../README.md) for usage instructions
