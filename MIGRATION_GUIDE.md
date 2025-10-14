# Migration Guide: localStorage to Firebase

This guide is for users who have been using the app with localStorage and want to migrate their data to Firebase.

## Important Note

The current version of the app **starts fresh with Firebase**. Your old localStorage data will remain in your browser but won't automatically transfer to Firebase.

## What Changed?

- **Before**: Data stored in browser localStorage
- **After**: Data stored in Firebase Firestore (cloud database)

## Benefits of Firebase

- ✅ Access your data from any device
- ✅ Data never gets lost (cloud backup)
- ✅ Real-time sync across devices
- ✅ Offline support with automatic sync
- ✅ Better performance and security

## Option 1: Start Fresh (Recommended)

This is the simplest approach:

1. Sign up with a new account in the Firebase-enabled app
2. The app will generate 30 days of demo data automatically
3. Start adding your real weight entries going forward
4. Your old localStorage data remains accessible if you need it

## Option 2: Manual Data Entry

If you have important data in localStorage:

1. Open your old app in the browser
2. Go to the Dashboard and note down your important entries
3. Sign up in the new Firebase app
4. Manually add your historical weight entries using the "Add Weight" dialog
5. Update your height and goal weight in the Profile page

## Option 3: Browser Console Export (Advanced)

If you're comfortable with browser console:

### Step 1: Export your localStorage data

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this code:

```javascript
// Get all users data
const users = JSON.parse(localStorage.getItem('weightTracker_users') || '[]');
const currentUserId = localStorage.getItem('weightTracker_currentUser');
const currentUser = users.find(u => u.id === currentUserId);

if (currentUser) {
  // Format the data
  const exportData = {
    email: currentUser.email,
    height: currentUser.height,
    goalWeight: currentUser.goalWeight,
    weights: currentUser.weights.map(w => ({
      date: w.date,
      weight: w.weight
    }))
  };
  
  // Convert to JSON and copy to clipboard
  const jsonString = JSON.stringify(exportData, null, 2);
  console.log('Your data:');
  console.log(jsonString);
  
  // Try to copy to clipboard
  navigator.clipboard.writeText(jsonString).then(() => {
    console.log('✅ Data copied to clipboard!');
  }).catch(err => {
    console.log('⚠️ Could not copy automatically. Please copy the JSON above manually.');
  });
} else {
  console.log('❌ No user data found in localStorage');
}
```

4. Your data will be displayed and copied to clipboard
5. Save it to a text file for safekeeping

### Step 2: Import to Firebase (Manual)

Currently, there's no automatic import feature. You'll need to:

1. Sign up for a new Firebase account
2. Manually add your most important weight entries
3. Set your height and goal weight in the Profile page

## Future Feature: Import from JSON

We may add an import feature in the future that will allow you to:
- Upload your exported JSON file
- Automatically create all weight entries in Firebase
- Preserve all your historical data

## Clearing Old localStorage Data

If you want to clear your old data after migrating:

1. Open Developer Tools (F12)
2. Go to Console tab
3. Run:
```javascript
localStorage.removeItem('weightTracker_users');
localStorage.removeItem('weightTracker_currentUser');
console.log('✅ Old data cleared');
```

Or go to Application tab → Local Storage → delete the items manually.

## Need Help?

If you encounter any issues during migration:

1. Check that your Firebase setup is correct (see FIREBASE_SETUP.md)
2. Ensure you've created a `.env.local` file with your Firebase credentials
3. Try signing up with a new account to verify Firebase is working
4. Check browser console for any error messages

## Data Privacy

- Your localStorage data never leaves your browser
- Only you can see your data (stored locally)
- Firebase data is protected by security rules
- Each user can only access their own data
- Firebase credentials are kept in `.env.local` (not committed to git)

## Rollback (Going Back to localStorage Version)

If you need to go back to the localStorage version:

1. Check out the previous git commit before Firebase integration
2. Your localStorage data will still be there
3. Run `npm install` and `npm run dev`

The localStorage version is tagged as `v1.0-localstorage` in the git history (if tagged by the developer).

