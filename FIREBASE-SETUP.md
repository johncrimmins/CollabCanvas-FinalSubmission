# Firebase Setup Guide

This guide covers the manual steps required to set up your Firebase project (Task 2.0).

## Step 1: Create Firebase Project (Task 2.1)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `collabcanvas-v5` (or your preferred name)
4. (Optional) Enable Google Analytics if desired
5. Click "Create project"

## Step 2: Enable Authentication Providers (Tasks 2.2 & 2.3)

### Enable Email/Password Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started" (if first time)
3. Go to **Sign-in method** tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

### Enable Google OAuth Authentication

1. Still in **Authentication > Sign-in method**
2. Click on "Google"
3. Enable the toggle
4. Enter a support email (your email)
5. Click "Save"
6. If prompted to configure OAuth consent screen, follow the instructions

## Step 3: Create Firestore Database (Task 2.4)

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **"Start in production mode"**
4. Select your preferred location (choose nearest region for best performance)
5. Click "Enable"

## Step 4: Create Realtime Database (Task 2.5)

1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Select your preferred location (same as Firestore if possible)
4. Choose **"Start in locked mode"**
5. Click "Enable"

## Step 5: Get Firebase Configuration (Task 2.6)

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. If no web app exists, click the web icon `</>` to create one
5. Register app with a nickname (e.g., "CollabCanvas Web")
6. Copy the `firebaseConfig` object values

## Step 6: Configure Environment Variables (Task 2.11)

1. In your project root, create a file named `.env.local`
2. Copy the template from `ENV.md`
3. Fill in the values from your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

4. Save the file
5. Restart your dev server: `npm run dev`

## Step 7: Deploy Firestore Security Rules (Task 2.9)

1. In Firebase Console, go to **Build > Firestore Database**
2. Click on the **Rules** tab
3. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

## Step 8: Deploy Realtime Database Security Rules (Task 2.10)

1. In Firebase Console, go to **Build > Realtime Database**
2. Click on the **Rules** tab
3. Replace the default rules with:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

4. Click **"Publish"**

## Step 9: Verify Firebase Connection (Task 2.12)

1. Ensure your `.env.local` file is configured
2. Start the dev server: `npm run dev`
3. Open browser console (F12 or Cmd+Option+I)
4. Check for any Firebase connection errors
5. You should see no errors related to Firebase initialization

## Troubleshooting

### "Missing required Firebase environment variables"

- Check that your `.env.local` file exists in the project root
- Verify all environment variables are spelled correctly
- Restart your dev server after creating/modifying `.env.local`

### "Firebase: Error (auth/invalid-api-key)"

- Double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`
- Ensure there are no extra spaces or quotes

### "Permission denied" errors in Firestore/RTDB

- Verify your security rules are deployed correctly
- Ensure you're authenticated before trying to read/write data

## Next Steps

Once Firebase is configured:
- ✅ Task 2.0 is complete
- ➡️ Proceed to Task 3.0: Build Authentication UI

---

**Need help?** Check the [Firebase Documentation](https://firebase.google.com/docs)

