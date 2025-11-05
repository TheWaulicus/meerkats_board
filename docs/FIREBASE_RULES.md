# Firebase Security Rules

This document contains the required Firebase Security Rules for the Meerkats Board application.

## Firestore Security Rules

Add these rules to your Firestore Security Rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Scoreboard documents
    match /scoreboard/{gameId} {
      allow read: if true;  // Allow anyone to read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    
    match /scoreboards/{gameId} {
      allow read: if true;  // Allow anyone to read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    
    // Logo Gallery - users can only access their own logos
    match /users/{userId}/logoGallery/{logoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Firebase Storage Security Rules

Add these rules to your Firebase Storage Security Rules in the Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Logo storage - users can only manage their own logos
    match /logos/{userId}/{type}/{filename} {
      allow read: if request.auth != null;
      allow write, delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. For **Firestore Rules**:
   - Navigate to **Firestore Database** → **Rules** tab
   - Copy and paste the Firestore rules above
   - Click **Publish**
4. For **Storage Rules**:
   - Navigate to **Storage** → **Rules** tab
   - Copy and paste the Storage rules above
   - Click **Publish**

## What These Rules Do

### Firestore Rules:
- **Scoreboard collections**: Anyone can read, only authenticated users can write
- **Logo Gallery**: Users can only read/write their own logos (privacy protected)

### Storage Rules:
- **Logo files**: Users can only upload, view, and delete their own logos
- Prevents unauthorized access to other users' logos

## Free Tier Limits

Firebase Free (Spark) Plan includes:
- **Storage**: 5 GB stored
- **Downloads**: 1 GB/day
- **Uploads**: 20,000/day

This is sufficient for a hockey scoreboard application with logo storage.
