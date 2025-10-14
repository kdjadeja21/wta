# Quick Start Guide - Weight Tracker App

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Step 2: Create Your Account
1. You'll be automatically redirected to the login page
2. Click **"Sign up"** at the bottom
3. Enter any email (e.g., `test@test.com`)
4. Enter a password (minimum 6 characters)
5. Confirm your password
6. Click **"Sign Up"**

**✨ Bonus:** You'll get 30 days of demo weight data automatically!

### Step 3: Explore the Features

#### Dashboard (Main Page)
- View your **weight chart** with 30 days of data
- See **stats cards** showing:
  - Current weight
  - Weekly change
  - Monthly change
  - Highest/Lowest weights
- Try different **time filters**: 7 days, 15 days, 30 days, or custom range
- Scroll down to see the **weight history table**
- Click **"Add Weight"** to add a new entry (desktop) or tap the **+** button (mobile)

#### Profile Page
- Click the **user icon** (mobile) or navigate via bottom nav
- Enter your **height** to calculate BMI
- Set a **goal weight** to track progress
- See your **days tracked** counter

#### Adding Weight Entries
1. Click **"Add Weight"** (desktop) or **+** FAB (mobile)
2. Pick a date (defaults to today)
3. Enter your weight (e.g., 75.5)
4. Click **"Save Entry"**
5. See instant updates in chart and table!

#### Theme Switching
- Click the **sun/moon icon** in the top navigation
- Toggle between light and dark modes
- Your preference is saved automatically

## 📱 Mobile View
On mobile devices (< 768px width):
- Bottom navigation appears with Home, Add, Profile tabs
- Charts and tables are optimized for small screens
- All touch targets are ≥44px for easy tapping

## 🔒 Logging Out & Back In
1. Click the **logout icon** (desktop only) in the top navigation
2. You'll be redirected to the login page
3. Login with your email and password
4. All your data is preserved!

## 💡 Tips

### Testing Different Scenarios
- **Add weight for today**: Use the default date
- **Update existing entry**: Pick a date that already has data
- **Try sorting**: Click column headers in the weight table
- **Test pagination**: If you have more than 10 entries
- **Custom date range**: Click "Custom" in date filter and pick your range

### Demo Data Details
After signup, you get:
- 30 days of weight entries
- Starting weight: ~78 kg
- Realistic daily variations (±0.3 kg)
- Dates: Last 30 days from today

## 🐛 Troubleshooting

### If the app doesn't start:
```bash
# Make sure all dependencies are installed
npm install

# Try clearing the cache
rm -rf .next
npm run dev
```

### If data seems corrupted:
Open browser DevTools (F12) and run:
```javascript
localStorage.clear()
```
Then refresh and sign up again.

### If theme doesn't work:
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Check if system preferences are blocking theme changes

## 📊 Understanding the Data

### Weight Changes
- **Green numbers**: Weight decreased (good for weight loss)
- **Red numbers**: Weight increased
- **Gray dash**: No previous data to compare

### BMI Categories
- **Blue**: Underweight (BMI < 18.5)
- **Green**: Normal (18.5 ≤ BMI < 25)
- **Orange**: Overweight (25 ≤ BMI < 30)
- **Red**: Obese (BMI ≥ 30)

### Goal Progress
- **Progress bar**: Shows % toward your goal
- **Remaining**: How much weight left to lose/gain
- **Days Tracked**: Total days since first entry

## 🎯 What to Test

### Core Functionality
- ✅ Sign up with different emails
- ✅ Login with existing account
- ✅ Add weight for today
- ✅ Add weight for a past date
- ✅ Update existing weight entry
- ✅ Try all date filters (7/15/30/custom)
- ✅ Sort table by date and weight
- ✅ Navigate through table pages
- ✅ Enter height and see BMI
- ✅ Set goal weight and see progress
- ✅ Toggle theme multiple times
- ✅ Logout and login again

### Edge Cases
- ✅ Try entering negative weight (should show error)
- ✅ Try entering weight > 500kg (should show error)
- ✅ Try entering invalid height (should show error)
- ✅ Add weight for the same date twice (should update)
- ✅ Test on different screen sizes
- ✅ Test with no internet (app works offline!)

## 🎉 You're All Set!

The app is fully functional and ready to use. Enjoy tracking your weight progress!

For detailed documentation, see **README.md**
For implementation details, see **IMPLEMENTATION.md**

