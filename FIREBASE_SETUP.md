# Firebase Setup Guide

This guide will help you set up Firebase for the Weight Tracking App.

## Prerequisites

- A Firebase account (free tier is sufficient)
- Node.js installed locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a project"
3. Enter your project name (e.g., "weight-tracker-app")
4. Disable Google Analytics (optional for this app)
5. Click "Create Project"

## Step 2: Set Up Firebase Authentication

1. In your Firebase project, go to **Authentication** from the left sidebar
2. Click "Get Started"
3. Enable **Email/Password** sign-in method:
   - Click on "Email/Password"
   - Toggle the first switch to **Enable**
   - Click "Save"

## Step 3: Set Up Firestore Database

1. In your Firebase project, go to **Firestore Database** from the left sidebar
2. Click "Create database"
3. Select **Start in production mode** (we'll set up rules next)
4. Choose a Cloud Firestore location (choose the one closest to your users)
5. Click "Enable"

### Set Up Firestore Security Rules

After creating the database, go to the **Rules** tab and replace the rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User profile and weights - only the user can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish** to save the rules.

### Set Up Firestore Indexes (Optional but Recommended)

Go to the **Indexes** tab and add a composite index for better performance:

1. Collection: `weights` (under users/{userId}/weights)
2. Fields:
   - `date` - Descending
3. Query scope: Collection

This will be auto-created when you first query, but you can pre-create it for faster initial queries.

## Step 4: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click the **Web app** icon (`</>`)
4. Register your app with a nickname (e.g., "Weight Tracker Web")
5. **DO NOT** check "Set up Firebase Hosting" (unless you want to use it)
6. Click "Register app"
7. Copy the `firebaseConfig` object values

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
# In your terminal
touch .env.local
```

2. Add your Firebase credentials to `.env.local`:

```env
NEXT_PUBLIC_APIKEY=your-api-key-here
NEXT_PUBLIC_AUTHDOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_PROJECTID=your-project-id
NEXT_PUBLIC_STORAGEBUCKET=your-project-id.appspot.com
NEXT_PUBLIC_MESSAGINGSENDERID=your-messaging-sender-id
NEXT_PUBLIC_APPID=your-app-id
```

**Important:** Replace the placeholder values with your actual Firebase configuration values.

## Step 6: Test Your Setup

1. Install dependencies (if not already done):
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)
4. Try signing up with a new account
5. The app should:
   - Create a new user in Firebase Authentication
   - Create a user profile in Firestore
   - Generate 30 days of demo weight data

## Firestore Data Structure

Your data will be organized as follows:

```
users/{userId}/
  ├── profile/
  │   └── data (document)
  │       ├── email: string
  │       ├── height: number (optional)
  │       ├── goalWeight: number (optional)
  │       ├── createdAt: timestamp
  │       └── updatedAt: timestamp
  │
  └── weights/{weightId} (subcollection)
      ├── date: string (YYYY-MM-DD)
      ├── weight: number (kg)
      └── createdAt: timestamp
```

## Troubleshooting

### "Permission Denied" Errors
- Make sure your Firestore security rules are set up correctly
- Ensure the user is authenticated before making requests

### "Firebase not initialized" Errors
- Check that all environment variables are set in `.env.local`
- Restart your development server after adding environment variables
- Make sure variable names start with `NEXT_PUBLIC_`

### Offline Persistence Warnings
- If you see warnings about multiple tabs, it's normal
- Firestore persistence only works in one tab at a time
- This is expected behavior and won't affect functionality

### Authentication Errors
- Verify that Email/Password authentication is enabled in Firebase Console
- Check that your API key is correct in `.env.local`

## Performance Tips

The app is already optimized for fast Firebase operations:

1. **Offline Persistence**: Enabled for instant loads from cache
2. **Real-time Listeners**: Used for live updates without manual refreshing
3. **Optimistic Updates**: UI updates immediately before server confirmation
4. **Indexed Queries**: Date-based sorting is indexed for fast queries
5. **Subcollections**: User data is isolated for better security and performance

## Security Notes

- Never commit `.env.local` to version control
- Your Firebase API key is safe to expose (it's designed for client-side use)
- Security is enforced by Firestore Security Rules, not by hiding the API key
- Each user can only access their own data (enforced by security rules)

## Next Steps

- Deploy your app to production (Vercel, Netlify, etc.)
- Set up the same environment variables in your hosting platform
- Consider adding a custom domain
- Monitor usage in Firebase Console to stay within free tier limits

## Free Tier Limits

Firebase's free "Spark" plan includes:
- **Authentication**: 50,000 users
- **Firestore**: 1 GB storage, 50,000 reads/day, 20,000 writes/day
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

This is more than enough for personal use and small user bases.

