# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
# Get these from Firebase Console > Project Settings > General > Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## How to Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one in Task 2.0)
3. Click on the gear icon (Project Settings)
4. Scroll down to "Your apps" section
5. Click on the web app `</>` icon
6. Copy the config values and paste them into your `.env.local` file

## Important Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- All variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Restart the dev server after creating or modifying `.env.local`

