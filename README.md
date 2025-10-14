# Weight Tracker App

A modern, fully functional weight tracking application built with Next.js 15, TypeScript, Tailwind CSS, Firebase, and ShadCN UI.

## Features

### Authentication
- Firebase Authentication with email/password
- Real-time authentication state management
- Auto-login after signup with 30 days of demo data
- Protected routes for dashboard and profile pages
- Secure user sessions

### Dashboard
- **Stats Cards**: Display current weight, weekly/monthly changes, and highest/lowest weights
- **Weight Chart**: Interactive line chart with Recharts showing weight progress
  - Filter options: 7 days, 15 days, 30 days (default), or custom date range
  - Responsive design for mobile and desktop
  - Light/dark mode support
- **Weight Table**: Sortable table with pagination
  - Columns: Date, Weight, Change, Trend
  - Sort by date or weight
  - 10 entries per page
  - Color-coded trends (green for weight loss, red for weight gain)

### Profile Page
- **BMI Calculator**: Enter height to automatically calculate BMI with category
  - Categories: Underweight, Normal, Overweight, Obese
  - Color-coded display
- **Goal Tracking**: Set target weight and track progress
  - Progress bar showing completion percentage
  - Remaining weight to lose/gain
  - Days tracked since first entry

### Weight Management
- Add weight entries with date picker
- Update existing entries (if date already exists)
- Input validation (positive numbers, max 500kg)
- Toast notifications for success/error feedback

### Additional Features
- Light/dark mode toggle (respects system preference)
- Responsive design (mobile, tablet, desktop)
- Bottom navigation for mobile devices
- Empty state illustrations
- Smooth CSS transitions

## Tech Stack

- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI (Radix UI)
- **Charts**: Recharts 3.2.1
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner
- **Theme**: next-themes
- **Database**: Firestore with offline persistence

## Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager
- Firebase account (free tier is sufficient)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wta
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Create a Firebase project
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your Firebase config to `.env.local`

4. Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_APIKEY=your-api-key
NEXT_PUBLIC_AUTHDOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_PROJECTID=your-project-id
NEXT_PUBLIC_STORAGEBUCKET=your-project.appspot.com
NEXT_PUBLIC_MESSAGINGSENDERID=your-sender-id
NEXT_PUBLIC_APPID=your-app-id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### First Time Use

1. Navigate to the app (will redirect to login page)
2. Click "Sign up" to create a new account
3. Enter your email and password (min 6 characters)
4. After signup, you'll be automatically logged in with 30 days of demo weight data

### Adding Weight Entries

- **Desktop**: Click the "Add Weight" button in the top right
- **Mobile**: Tap the floating "+" button in the bottom navigation
- Select a date and enter your weight
- Click "Save Entry"

### Viewing Progress

- **Dashboard**: View your weight chart with different time filters
- **Stats Cards**: See current weight and changes at a glance
- **Weight History**: Browse all entries in the sortable table

### Setting Goals

1. Go to Profile page
2. Enter your height in the BMI Calculator section
3. Enter your target weight in Goal Tracking section
4. View your progress with visual indicators

### Theme Toggle

- Click the sun/moon icon in the top navigation
- Toggle between light and dark modes
- Preference is automatically saved

## Project Structure

```
wta/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── profile/
│   │   └── page.tsx          # Profile/settings page
│   ├── signup/
│   │   └── page.tsx          # Signup page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Root redirect page
├── components/
│   ├── ui/                   # ShadCN UI components
│   ├── BMISection.tsx        # BMI calculator component
│   ├── BottomNav.tsx         # Mobile bottom navigation
│   ├── DateFilter.tsx        # Date range filter chips
│   ├── GoalSection.tsx       # Goal tracking component
│   ├── Navbar.tsx            # Top navigation bar
│   ├── providers.tsx         # Theme provider wrapper
│   ├── StatsCards.tsx        # Dashboard stats cards
│   ├── ThemeToggle.tsx       # Light/dark mode toggle
│   ├── WeightChart.tsx       # Recharts line chart
│   ├── WeightDialog.tsx      # Add/edit weight modal
│   └── WeightTable.tsx       # Weight history table
├── lib/
│   ├── auth.ts               # Firebase authentication functions
│   ├── authContext.tsx       # Auth state provider (React Context)
│   ├── firebaseService.ts    # Firestore operations & real-time listeners
│   ├── types.ts              # TypeScript type definitions
│   ├── utils.ts              # Utility functions (cn, etc.)
│   └── weightUtils.ts        # Weight calculation utilities
├── FIREBASE_SETUP.md         # Detailed Firebase setup guide
└── package.json
```

## Firestore Database Schema

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

### Data Isolation & Security
- Each user's data is stored in their own subcollection
- Firestore security rules ensure users can only access their own data
- No userId needed in weight documents (path provides isolation)

## Performance Optimizations

- ⚡ **Firestore Offline Persistence**: Instant loads from local cache
- ⚡ **Real-time Listeners**: Live updates without manual refreshing
- ⚡ **Optimistic UI Updates**: Instant feedback before server confirmation
- ⚡ **Indexed Queries**: Fast date-based sorting
- ⚡ **Batched Writes**: Efficient multi-operation transactions
- ⚡ **Subcollection Architecture**: Optimized data structure for fast queries

## Edge Cases Handled

- ✅ Duplicate date entries (updates existing record)
- ✅ Invalid weight input (negative, zero, non-numeric, >500kg)
- ✅ Empty dataset (informative placeholders)
- ✅ Chart with missing data (graceful fallback)
- ✅ Table with missing data ("No entries" message)
- ✅ Logout (clears Firebase session properly)
- ✅ Network failures (cached data with offline support)
- ✅ Authentication errors (proper error messages)
- ✅ Theme switching (chart colors update dynamically)
- ✅ Small screens (≤360px responsive design)

## Build for Production

```bash
npm run build
npm start
```

## Firebase Integration Features

- ✅ **Authentication**: Secure Firebase Auth with email/password
- ✅ **Real-time Database**: Firestore with live updates
- ✅ **Offline Support**: Works without internet, syncs when reconnected
- ✅ **Security Rules**: User data isolation and protection
- ✅ **Optimistic Updates**: Fast UI with background sync
- ✅ **Auto-generated Demo Data**: 30 days of weight entries on signup

## Future Enhancements

- [ ] Add Framer Motion animations
- [ ] Export data to CSV
- [ ] Reset all data functionality
- [ ] Social authentication (Google, GitHub)
- [ ] Email verification
- [ ] Password reset functionality

## License

MIT

## Author

Built with ❤️ using Next.js and TypeScript
