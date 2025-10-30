# Firebase App Check Setup Guide

Firebase App Check protects your app from billing abuse, phishing, and unauthorized access by verifying that requests come from your legitimate app.

## Benefits
- ✅ Prevents billing abuse from unauthorized clients
- ✅ Protects against API key theft and phishing
- ✅ Blocks bot traffic and scrapers
- ✅ Free to use with Firebase
- ✅ Works with Firestore, Storage, and other Firebase services

## Setup Steps

### Step 1: Get reCAPTCHA v3 Site Key

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in:
   - **Label**: "Meerkats Board"
   - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
   - **Domains**: Add:
     - `thewaulicus.github.io`
     - `localhost` (for testing)
4. Accept terms and click **Submit**
5. Copy your **Site Key** (starts with `6L...`)

### Step 2: Enable App Check in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/meerkats-74de5/appcheck)
2. Click **"Get started"**
3. Select your web app
4. Choose **"reCAPTCHA v3"** as the provider
5. Paste your reCAPTCHA v3 Site Key
6. Click **Register**

### Step 3: Configure Enforcement (Important!)

Start in **Monitor Mode** (non-blocking) to test:

1. In App Check settings, go to **"APIs"** tab
2. For each service (Firestore, Storage), select:
   - **Monitor**: Logs violations but doesn't block (recommended to start)
   - Wait 24-48 hours to review metrics
   - Then switch to **Enforce** once confident

### Step 4: Activate in Your Code

Open `src/firebase-config.js` and replace this section:

```javascript
// Uncomment and add your site key when ready:
// const appCheck = firebase.appCheck();
// appCheck.activate('YOUR_RECAPTCHA_V3_SITE_KEY', true);
// console.log('✅ Firebase App Check activated');
```

With your actual site key:

```javascript
const appCheck = firebase.appCheck();
appCheck.activate('6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-YOUR-ACTUAL-KEY', true);
console.log('✅ Firebase App Check activated');
```

### Step 5: Update Security Rules (Optional but Recommended)

After testing in Monitor mode, you can enforce App Check in your Security Rules:

#### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scoreboard/{gameId} {
      allow read: if true;
      allow write: if request.auth != null && request.app != null;
    }
    
    match /scoreboards/{gameId} {
      allow read: if true;
      allow write: if request.auth != null && request.app != null;
    }
    
    match /users/{userId}/logoGallery/{logoId} {
      allow read, write: if request.auth != null 
                          && request.auth.uid == userId 
                          && request.app != null;
    }
  }
}
```

#### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{userId}/{type}/{filename} {
      allow read: if request.auth != null && request.app != null;
      allow write, delete: if request.auth != null 
                            && request.auth.uid == userId 
                            && request.app != null;
    }
  }
}
```

The `request.app != null` check ensures the request has a valid App Check token.

## Testing

1. Deploy your changes
2. Open your app at `https://thewaulicus.github.io/meerkats_board/`
3. Open browser console
4. You should see: `✅ Firebase App Check activated`
5. Use the app normally - everything should work
6. Check Firebase Console → App Check → Metrics to see verified requests

## Monitoring

In Firebase Console → App Check:
- **Verified Requests**: Shows requests passing App Check
- **Unverified Requests**: Shows requests without valid tokens (potential abuse)
- Review metrics regularly to identify issues

## Troubleshooting

### "App Check token is invalid"
- Make sure your domain is registered in reCAPTCHA admin
- Check that your site key is correct in firebase-config.js
- Verify App Check is enabled in Firebase Console

### "Request is missing required App Check token"
- You're in Enforce mode but App Check isn't activated in your code
- Switch back to Monitor mode temporarily

### Development/Testing
For local development, you can use debug tokens:
1. In Firebase Console → App Check → Apps → (your app) → Debug tokens
2. Add a debug token for testing
3. Use in code: `appCheck.activate('debug-token', true);`

## Cost

App Check is **free** to use! reCAPTCHA v3 has these limits:
- **Free tier**: 1 million assessments/month
- This is usually more than enough for most apps

## Security Best Practices

1. ✅ Start in Monitor mode, then enforce
2. ✅ Keep your reCAPTCHA secret key secure (never commit to git)
3. ✅ Monitor metrics regularly
4. ✅ Use App Check with Authentication for best security
5. ✅ Update Security Rules to require App Check tokens

## Additional Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [App Check Security Rules](https://firebase.google.com/docs/app-check/custom-resource)
