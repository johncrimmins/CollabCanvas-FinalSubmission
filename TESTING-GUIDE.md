# Testing Guide - Project Setup & Authentication

This guide covers all manual tests from PRD Section 9 (Test Suites 1-6).

## Prerequisites

Before testing, ensure you have completed:
1. ✅ Firebase project created (see `FIREBASE-SETUP.md`)
2. ✅ `.env.local` file configured with Firebase credentials
3. ✅ Dev server running: `npm run dev`

---

## Test Suite 1: New User Sign Up

### T1.1 - Email/Password Sign Up (Happy Path)
**Steps:**
1. Navigate to `http://localhost:3000/auth`
2. Ensure "Sign Up" mode is active (toggle if needed)
3. Enter:
   - Display Name: `Test User`
   - Email: `testuser@example.com`
   - Password: `password123` (at least 8 characters)
4. Click "Sign Up" button

**Expected Results:**
- ✅ User is authenticated
- ✅ Redirected to `/` (dashboard)
- ✅ User info displayed in header: "Welcome, Test User"
- ✅ Toast notification: "Account created!"

### T1.2 - Email/Password Sign Up (Validation Errors)
**Steps:**
1. Navigate to `/auth` (Sign Up mode)
2. Try submitting with:
   - Empty fields → Click "Sign Up" without filling anything
   - Invalid email → Enter `notanemail` in email field
   - Weak password → Enter `pass` (less than 8 chars)

**Expected Results:**
- ✅ Clear error toast messages displayed
- ✅ "Missing fields" for empty submission
- ✅ "Invalid email format" for invalid email
- ✅ "Password must be at least 8 characters" for weak password

### T1.3 - Email/Password Sign Up (Duplicate Email)
**Steps:**
1. Try to sign up with email that already exists (e.g., `testuser@example.com`)

**Expected Results:**
- ✅ Error toast: "Email already in use. Please log in instead."
- ✅ User remains on `/auth` page
- ✅ Can toggle to "Log In" mode

### T1.4 - Google OAuth Sign Up
**Steps:**
1. Navigate to `/auth`
2. Click "Sign in with Google" button
3. Complete Google OAuth popup flow (select account)

**Expected Results:**
- ✅ User authenticated after OAuth
- ✅ Redirected to `/` (dashboard)
- ✅ Display name from Google account is used
- ✅ Toast notification: "Welcome!"

---

## Test Suite 2: Returning User Login

### T2.1 - Email/Password Login (Happy Path)
**Steps:**
1. Navigate to `/auth` (ensure "Log In" mode)
2. Enter existing credentials:
   - Email: `testuser@example.com`
   - Password: `password123`
3. Click "Log In" button

**Expected Results:**
- ✅ User authenticated
- ✅ Redirected to `/` (dashboard)
- ✅ Toast notification: "Welcome back!"

### T2.2 - Email/Password Login (Invalid Credentials)
**Steps:**
1. Navigate to `/auth` (Log In mode)
2. Enter incorrect password for existing email

**Expected Results:**
- ✅ Error toast: "Invalid email or password"
- ✅ User remains on `/auth` page
- ✅ Can retry login

### T2.3 - Session Persistence
**Steps:**
1. Log in successfully to dashboard
2. Refresh browser (F5 or Cmd+R)

**Expected Results:**
- ✅ User remains authenticated
- ✅ Dashboard loads immediately
- ✅ No flash of login page or redirect
- ✅ No visible loading state (Firebase handles session)

---

## Test Suite 3: Auth Guards & Protected Routes

### T3.1 - Unauthenticated Dashboard Access
**Steps:**
1. Ensure signed out (or use incognito window)
2. Navigate directly to `http://localhost:3000/`

**Expected Results:**
- ✅ Immediately redirected to `/auth`
- ✅ Loading screen briefly shown
- ✅ Auth page loads

### T3.2 - Unauthenticated Canvas Access
**Steps:**
1. Ensure signed out
2. Navigate directly to `http://localhost:3000/canvases/test123`

**Expected Results:**
- ✅ Immediately redirected to `/auth`
- ✅ Cannot access canvas without authentication

### T3.3 - Post-Login Redirect
**Steps:**
1. While signed out, try to access `/canvases/test123`
2. Get redirected to `/auth`
3. Log in successfully

**Expected Results:**
- ✅ Redirected to `/` (dashboard) after login
- ✅ Can manually navigate to canvas from dashboard

---

## Test Suite 4: Dashboard Functionality

### T4.1 - Create New Canvas
**Steps:**
1. Log in to dashboard at `/`
2. Click "Create New Canvas" button

**Expected Results:**
- ✅ Generated canvas ID visible in URL bar
- ✅ Navigated to `/canvases/[generatedId]`
- ✅ Canvas ID is 12 characters long (nanoid)
- ✅ Placeholder canvas page shows correct ID

### T4.2 - Join Existing Canvas
**Steps:**
1. From dashboard at `/`
2. Enter a canvas ID in "Join Canvas" input (e.g., `test123`)
3. Press Enter or click "Join Canvas" button

**Expected Results:**
- ✅ Navigated to `/canvases/test123`
- ✅ Canvas page loads with placeholder content
- ✅ Canvas ID displayed correctly

### T4.3 - Join Canvas (Invalid ID Format)
**Steps:**
1. Try entering empty string or very short ID (1-2 chars)

**Expected Results:**
- ✅ Validation error toast: "Please enter a canvas ID" or "Canvas ID is too short"
- ✅ Does not navigate until valid ID entered

### T4.4 - Sign Out
**Steps:**
1. From dashboard, click "Sign Out" button in header

**Expected Results:**
- ✅ User signed out from Firebase
- ✅ Redirected to `/auth`
- ✅ Toast notification: "Signed out"
- ✅ Trying to access `/` now redirects back to `/auth`

---

## Test Suite 5: Visual & UX Quality

### T5.1 - Design Aesthetic Check
**Steps:**
1. Review `/auth` page appearance
2. Review dashboard page appearance
3. Check hover states on buttons
4. Check focus states on input fields

**Expected Results:**
- ✅ Sleek, modern design with generous whitespace
- ✅ Premium feel with subtle shadows and depth
- ✅ Smooth transitions on all interactive elements
- ✅ Clear visual hierarchy
- ✅ Professional, creative-team friendly aesthetic
- ✅ Gradient backgrounds on auth and dashboard pages
- ✅ Elegant cards with proper spacing

### T5.2 - Loading States
**Steps:**
1. During sign up/login, observe button state
2. During sign out, observe button state

**Expected Results:**
- ✅ Button shows loading spinner (Loader2 icon)
- ✅ Button text changes to "Creating account..." / "Logging in..." / etc.
- ✅ Button is disabled during operation (cannot double-click)
- ✅ Form inputs disabled during submission

### T5.3 - Error Message UX
**Steps:**
1. Trigger various errors:
   - Wrong password
   - Duplicate email
   - Empty fields
   - Network errors (disable network in DevTools)

**Expected Results:**
- ✅ Error messages are clear and friendly
- ✅ Errors display as toast notifications
- ✅ Non-technical language used
- ✅ Actionable guidance provided (e.g., "Please log in instead")

### T5.4 - Responsive Behavior (Desktop)
**Steps:**
1. Resize browser window to various widths:
   - 1024px (small laptop)
   - 1440px (standard desktop)
   - 1920px (large desktop)

**Expected Results:**
- ✅ Layout adjusts gracefully
- ✅ Content remains centered and readable
- ✅ Cards don't stretch too wide (max-width constraints)
- ✅ No horizontal scrolling
- ✅ Spacing scales appropriately

---

## Test Suite 6: Firebase Integration

### T6.1 - Firestore Connection
**Steps:**
1. Open browser DevTools → Network tab
2. Log in and navigate to dashboard
3. Filter by "firestore" in network tab

**Expected Results:**
- ✅ See successful Firestore API calls
- ✅ No 403 Forbidden errors
- ✅ Connection established successfully

### T6.2 - RTDB Connection
**Steps:**
1. While on dashboard, open DevTools → Network tab
2. Look for WebSocket connections (wss://)
3. Observe connection status indicator on dashboard

**Expected Results:**
- ✅ RTDB WebSocket connection established
- ✅ Connection indicator shows green dot + "Connected"
- ✅ No connection errors in console

### T6.3 - Security Rules Enforcement
**Steps:**
1. Sign out completely
2. Open DevTools Console
3. Try to manually access Firebase (if possible via console):
   ```javascript
   // This should fail if security rules are working
   ```

**Expected Results:**
- ✅ Cannot read/write data when unauthenticated
- ✅ Security rules are enforced
- ✅ Access denied errors if attempted

---

## Additional Checks

### Browser Console
**Steps:**
1. Throughout all testing, keep browser console open (F12 or Cmd+Option+I)

**Expected Results:**
- ✅ No error messages (red text)
- ✅ No warning messages (yellow text) except for minor shadcn warnings
- ✅ Only info messages about Firebase connections

### Password Show/Hide
**Steps:**
1. On auth page, click the eye icon in password field

**Expected Results:**
- ✅ Password toggles between visible and hidden
- ✅ Icon changes between EyeIcon and EyeOffIcon
- ✅ Smooth transition

### Mode Toggle
**Steps:**
1. On auth page, click "Sign up" / "Log in" toggle link

**Expected Results:**
- ✅ Form smoothly transitions between modes
- ✅ Display name field appears/disappears
- ✅ Form fields reset when toggling
- ✅ Button text updates appropriately

---

## Troubleshooting Common Issues

### "Missing required Firebase environment variables"
- Check `.env.local` exists in project root
- Verify all variables are spelled correctly with `NEXT_PUBLIC_` prefix
- Restart dev server after creating/modifying `.env.local`

### "Cannot read properties of null"
- Ensure Firebase is initialized before using
- Check that `.env.local` values are correct
- Verify Firebase project is active in console

### Google OAuth popup blocked
- Allow popups in browser for localhost
- Try clicking the button again
- Check browser popup blocker settings

### Connection status shows "Disconnected"
- Check Firebase Realtime Database is created
- Verify RTDB rules are deployed
- Check network connectivity
- Look for errors in browser console

---

## Success Criteria Checklist

Mark each item as you verify:

- [ ] All Test Suite 1 tests pass (New User Sign Up)
- [ ] All Test Suite 2 tests pass (Returning User Login)
- [ ] All Test Suite 3 tests pass (Auth Guards)
- [ ] All Test Suite 4 tests pass (Dashboard Functionality)
- [ ] All Test Suite 5 tests pass (Visual & UX Quality)
- [ ] All Test Suite 6 tests pass (Firebase Integration)
- [ ] No console errors during any test
- [ ] UI consistently matches premium aesthetic
- [ ] All loading states work correctly
- [ ] All error messages are user-friendly

---

## Next Steps

Once all tests pass:
- ✅ Task 1.0-6.0 complete
- ✅ PRD-01 implementation complete
- ➡️ Ready to proceed with subsequent Phase 1 tasks (Canvas implementation)

**Note:** This is the foundation for all future features. Ensure everything works perfectly before moving forward!

