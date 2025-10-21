# PRD: Project Setup & Authentication

**Feature:** Phase 1, Task 1 - Project Setup & Authentication  
**Status:** Not Started  
**Priority:** P0 (Foundation - Blocking)  
**Estimated Complexity:** Medium  
**Related Docs:** [Architecture Overview](../docs/architecture-overview.md), [Tech Context](../memory-bank/techContext.md)

---

## 1. Introduction/Overview

This PRD covers the foundational setup for CollabCanvas v5, including:
- Next.js project initialization with TypeScript
- Firebase project configuration (Authentication, Firestore, Realtime Database)
- Authentication UI at `/auth` route
- Dashboard UI at `/` route
- Auth guards for protected routes
- Basic UI infrastructure with Tailwind CSS and shadcn/ui

**Problem Solved:** Establishes the technical foundation and user authentication required for all subsequent collaborative canvas features.

**Goal:** Create a fully functional authentication system that allows users to sign up, log in, and access a dashboard where they can create or join canvas sessions.

---

## 2. Goals

1. **Technical Foundation:** Set up a production-ready Next.js 14+ project with TypeScript, Tailwind CSS, and required dependencies
2. **Firebase Integration:** Configure Firebase Authentication, Cloud Firestore, and Realtime Database with proper security rules
3. **Authentication Flow:** Implement Email/Password and Google OAuth sign-in with proper session management
4. **Protected Routes:** Create auth guards that redirect unauthenticated users to `/auth`
5. **Dashboard Experience:** Build a simple, elegant dashboard for creating/joining canvases
6. **Visual Excellence:** Establish design system using shadcn/ui with premium, creative-team aesthetic

---

## 3. User Stories

**US-1: New User Sign Up**
> As a **new user**, I want to **sign up with my email and password or Google account** so that **I can access the collaborative canvas platform**.

**US-2: Returning User Login**
> As a **returning user**, I want to **log in with my existing credentials** so that **I can quickly access my canvases**.

**US-3: Protected Access**
> As an **unauthenticated visitor**, I want to **be redirected to the login page when I try to access protected routes** so that **I understand I need to authenticate first**.

**US-4: Dashboard Navigation**
> As an **authenticated user**, I want to **see a clean dashboard where I can create a new canvas or enter an existing canvas ID** so that **I can start collaborating**.

**US-5: Persistent Session**
> As an **authenticated user**, I want my **session to persist across browser refreshes** so that **I don't have to log in repeatedly**.

---

## 4. Functional Requirements

### 4.1 Project Setup

**FR-1.1** Initialize Next.js 14+ project with App Router and TypeScript in strict mode  
**FR-1.2** Configure Tailwind CSS with custom theme for brand colors  
**FR-1.3** Install and configure shadcn/ui component library  
**FR-1.4** Install core dependencies: `firebase`, `zustand`, `immer`, `zod`, `nanoid`  
**FR-1.5** Create basic project structure following the architecture patterns:
```
src/
  app/
    (public)/
      auth/
    (app)/
      layout.tsx
      page.tsx (dashboard)
  components/
  hooks/
  lib/
  store/
```

### 4.2 Firebase Configuration

**FR-2.1** Create new Firebase project with Authentication, Firestore, and Realtime Database enabled  
**FR-2.2** Enable Email/Password authentication provider in Firebase Console  
**FR-2.3** Enable Google OAuth authentication provider in Firebase Console  
**FR-2.4** Create Firebase configuration file at `src/lib/firebase.ts` with SDK initialization  
**FR-2.5** Create Firestore security rules that require authentication for all reads/writes  
**FR-2.6** Create RTDB security rules that require authentication for all reads/writes  
**FR-2.7** Deploy initial security rules to Firebase

### 4.3 Authentication UI (`/auth`)

**FR-3.1** Create public auth route at `/auth` accessible without authentication  
**FR-3.2** Build authentication page with two modes: Sign Up and Log In (toggle between them)  
**FR-3.3** Implement Email/Password sign up form with fields:
- Email (validated)
- Password (minimum 8 characters, show/hide toggle)
- Display name (required)
**FR-3.4** Implement Email/Password login form with fields:
- Email
- Password (show/hide toggle)
**FR-3.5** Implement Google OAuth sign-in button with Firebase popup authentication  
**FR-3.6** Display clear error messages for common auth failures:
- Invalid credentials
- Email already in use
- Weak password
- Network errors
**FR-3.7** Show loading states during authentication operations  
**FR-3.8** Redirect to `/` (dashboard) upon successful authentication

### 4.4 Dashboard UI (`/`)

**FR-4.1** Create protected dashboard route at `/` (requires authentication)  
**FR-4.2** Display user's display name and email in header with sign-out button  
**FR-4.3** Implement "Create New Canvas" action that:
- Generates a new canvas ID using `nanoid`
- Navigates to `/canvases/[canvasId]`
**FR-4.4** Implement "Join Canvas" input field that:
- Accepts a canvas ID
- Validates format
- Navigates to `/canvases/[canvasId]` on submit
**FR-4.5** Show connection status indicator (Firebase connection state)  
**FR-4.6** Implement sign-out functionality that:
- Signs out from Firebase Auth
- Clears any local state
- Redirects to `/auth`

### 4.5 Auth Guards & Navigation

**FR-5.1** Create `useAuthGuard` hook that:
- Listens to Firebase Auth state changes
- Redirects unauthenticated users to `/auth`
- Returns current user object when authenticated
**FR-5.2** Implement auth state persistence (Firebase SDK default)  
**FR-5.3** Handle loading states during initial auth check to prevent flash of wrong content  
**FR-5.4** Create placeholder canvas route at `/canvases/[canvasId]` that:
- Uses auth guard
- Shows "Canvas [ID] - Coming Soon" message
- This will be replaced in subsequent tasks

### 4.6 Design System & Styling

**FR-6.1** Configure Tailwind with custom colors aligned to brand identity  
**FR-6.2** Install shadcn/ui components needed for this phase:
- Button
- Input
- Card
- Label
- Toast/Sonner for notifications
**FR-6.3** Establish design aesthetic throughout auth and dashboard:
- **Creative-team friendly:** Approachable, inspiring interface
- **High aesthetic:** Premium visual quality, attention to detail
- **Collaborative:** Warm, inviting, team-oriented feel
- **Aspirational but accessible:** Sophisticated yet easy to use
- **Sleek, modern, elegant:** Clean lines, generous whitespace, smooth transitions
- **Never cluttered or corporate:** Minimal chrome, focused content
**FR-6.4** Implement smooth transitions and micro-interactions (hover states, focus states)  
**FR-6.5** Ensure responsive layout works on desktop screens (mobile optimization out of scope)

---

## 5. Non-Goals (Out of Scope)

**NG-1** Environment variable setup (user will add `.env.local` manually)  
**NG-2** Password reset/forgot password flow (can be added later)  
**NG-3** Email verification requirement (optional for MVP)  
**NG-4** User profile editing (display name, avatar)  
**NG-5** Canvas listing/history on dashboard (just create/join for now)  
**NG-6** Team/workspace management  
**NG-7** Mobile-optimized layouts  
**NG-8** Unit tests (manual testing only for this phase)  
**NG-9** Analytics/telemetry integration  
**NG-10** Advanced error tracking (Sentry, etc.)

---

## 6. Design Considerations

### Design Aesthetic

The visual design should embody these qualities throughout:

**Aspirational Premium Feel**
- High-quality typography (consider Inter or similar modern sans-serif)
- Generous whitespace and breathing room
- Subtle shadows and depth cues
- Smooth, polished animations (200-300ms transitions)

**Creative Team Friendly**
- Warm, inviting color palette (avoid cold corporate blues)
- Playful but professional micro-interactions
- Visual hierarchy that guides without overwhelming
- Confidence-inspiring without intimidation

**Sleek & Modern**
- Clean, uncluttered layouts
- Borderless or minimal borders where possible
- Focus on content over chrome
- Contemporary component styling (rounded corners, modern form inputs)

### Component Usage (shadcn/ui)

**Auth Page (`/auth`)**
- Use `Card` component for auth form container with subtle shadow
- `Input` components with elegant focus states
- `Button` with primary (solid) and secondary (outline) variants
- Toggle between Sign Up/Log In with smooth transition

**Dashboard Page (`/`)**
- Large, prominent "Create New Canvas" button (primary CTA)
- Elegant input field for canvas ID with clear label
- User info in header with subtle sign-out button
- Connection status as a small indicator (dot + text)

### Spacing & Layout
- Use consistent spacing scale (4, 8, 16, 24, 32, 48, 64px)
- Center main content with max-width container
- Vertical rhythm with clear sections

---

## 7. Technical Considerations

### Firebase SDK v10+
- Use modular imports (`firebase/auth`, `firebase/firestore`, `firebase/database`)
- Initialize Firebase in `src/lib/firebase.ts` with proper error handling
- Export configured instances: `auth`, `db` (Firestore), `rtdb` (Realtime Database)

### Next.js App Router
- Use route groups `(public)` and `(app)` to organize auth vs protected routes
- Server components for layouts where possible
- Client components for interactive auth forms and dashboard

### Type Safety
- Define TypeScript interfaces for user objects
- Create Zod schemas for form validation
- Export types from `lib/types.ts` or similar

### State Management
- No Zustand needed yet (Firebase Auth state is sufficient)
- Later tasks will initialize Zustand store structure

### Error Handling
- Use shadcn/ui Toast component for error notifications
- Log errors to console in development
- User-friendly error messages (never expose technical details)

### Security
- Security rules template provided (deploy manually):

**Firestore Rules:**
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

**RTDB Rules:**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Environment Variables Required
User will add these to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

---

## 8. Success Metrics

### Functional Success
- ✅ User can sign up with email/password
- ✅ User can sign up with Google OAuth
- ✅ User can log in with existing credentials
- ✅ Session persists across browser refresh
- ✅ Unauthenticated access to `/` redirects to `/auth`
- ✅ User can create new canvas (generates ID, navigates to canvas route)
- ✅ User can join existing canvas by ID
- ✅ User can sign out successfully

### Quality Success
- ✅ Auth forms have clear validation and error messages
- ✅ Loading states prevent user confusion
- ✅ UI matches design aesthetic (premium, creative-friendly, sleek)
- ✅ Smooth transitions and interactions throughout
- ✅ No console errors or warnings

### Performance Success
- ✅ Auth operations complete within 2-3 seconds on typical networks
- ✅ Dashboard loads in under 1 second after authentication
- ✅ No visible layout shift or flash of unauthenticated content

---

## 9. Testing Plan (Manual Tests)

### Test Suite 1: New User Sign Up

**T1.1 - Email/Password Sign Up (Happy Path)**
1. Navigate to `/auth`
2. Switch to "Sign Up" mode
3. Enter valid email, password (8+ chars), and display name
4. Click "Sign Up" button
5. **Expected:** User is authenticated and redirected to `/` dashboard
6. **Expected:** User info (display name, email) visible in dashboard header

**T1.2 - Email/Password Sign Up (Validation Errors)**
1. Navigate to `/auth` (Sign Up mode)
2. Try submitting with:
   - Empty fields → Show validation errors
   - Invalid email format → Show "Invalid email" error
   - Weak password (<8 chars) → Show "Password too weak" error
3. **Expected:** Clear, helpful error messages displayed inline

**T1.3 - Email/Password Sign Up (Duplicate Email)**
1. Sign up with an email that already exists
2. **Expected:** Error message "Email already in use" or similar
3. **Expected:** User can switch to "Log In" mode to access account

**T1.4 - Google OAuth Sign Up**
1. Navigate to `/auth`
2. Click "Sign in with Google" button
3. Complete Google OAuth popup flow
4. **Expected:** User is authenticated and redirected to `/` dashboard
5. **Expected:** Display name from Google account is used

### Test Suite 2: Returning User Login

**T2.1 - Email/Password Login (Happy Path)**
1. Navigate to `/auth` (Log In mode)
2. Enter valid existing credentials
3. Click "Log In" button
4. **Expected:** User authenticated and redirected to `/` dashboard

**T2.2 - Email/Password Login (Invalid Credentials)**
1. Navigate to `/auth` (Log In mode)
2. Enter incorrect password for existing email
3. **Expected:** Error message "Invalid credentials" or similar
4. **Expected:** User remains on `/auth` page, can retry

**T2.3 - Session Persistence**
1. Log in successfully to dashboard
2. Refresh browser (F5 or Cmd+R)
3. **Expected:** User remains authenticated, dashboard loads immediately
4. **Expected:** No flash of login page or redirect

### Test Suite 3: Auth Guards & Protected Routes

**T3.1 - Unauthenticated Dashboard Access**
1. Ensure signed out (or use incognito window)
2. Navigate directly to `/`
3. **Expected:** Immediately redirected to `/auth`

**T3.2 - Unauthenticated Canvas Access**
1. Ensure signed out
2. Navigate directly to `/canvases/test123`
3. **Expected:** Immediately redirected to `/auth`

**T3.3 - Post-Login Redirect**
1. While signed out, try to access `/canvases/test123`
2. Get redirected to `/auth`
3. Log in successfully
4. **Expected:** Redirected back to `/canvases/test123` (or at least to dashboard)

### Test Suite 4: Dashboard Functionality

**T4.1 - Create New Canvas**
1. Log in to dashboard at `/`
2. Click "Create New Canvas" button
3. **Expected:** Generated canvas ID (visible in URL or UI)
4. **Expected:** Navigated to `/canvases/[generatedId]`
5. **Expected:** Canvas page shows placeholder content with canvas ID

**T4.2 - Join Existing Canvas**
1. From dashboard at `/`
2. Enter a canvas ID in the "Join Canvas" input field (e.g., "test123")
3. Press Enter or click Join button
4. **Expected:** Navigated to `/canvases/test123`
5. **Expected:** Canvas page loads (placeholder for now)

**T4.3 - Join Canvas (Invalid ID Format)**
1. Enter invalid characters or empty string
2. **Expected:** Validation error or button disabled until valid ID entered

**T4.4 - Sign Out**
1. From dashboard, click "Sign Out" button
2. **Expected:** User signed out from Firebase
3. **Expected:** Redirected to `/auth`
4. **Expected:** Trying to access `/` now redirects back to `/auth`

### Test Suite 5: Visual & UX Quality

**T5.1 - Design Aesthetic Check**
1. Review `/auth` page appearance
2. **Expected:** Matches design principles: sleek, modern, generous whitespace, premium feel
3. Check hover states, focus states on inputs/buttons
4. **Expected:** Smooth transitions, clear interactive feedback

**T5.2 - Loading States**
1. During sign up/login, observe button state
2. **Expected:** Button shows loading spinner or "Loading..." text
3. **Expected:** Button is disabled during operation (prevents double-click)

**T5.3 - Error Message UX**
1. Trigger various errors (wrong password, duplicate email, etc.)
2. **Expected:** Error messages are clear, friendly, non-technical
3. **Expected:** Errors display inline near relevant field or as toast notification
4. **Expected:** Errors clear when user corrects input

**T5.4 - Responsive Behavior (Desktop)**
1. Resize browser window to various desktop widths (1024px, 1440px, 1920px)
2. **Expected:** Layout adjusts gracefully, remains centered and readable
3. **Note:** Mobile not required, but basic responsiveness should work

### Test Suite 6: Firebase Integration

**T6.1 - Firestore Connection**
1. Open browser DevTools → Network tab
2. Log in and navigate to dashboard
3. **Expected:** See successful Firestore API calls (no 403 Forbidden errors)

**T6.2 - RTDB Connection**
1. While on dashboard, check Network tab
2. **Expected:** RTDB WebSocket connection established (look for wss:// connection)
3. **Expected:** Connection status indicator shows "Connected" or similar

**T6.3 - Security Rules Enforcement**
1. Sign out completely
2. Open DevTools Console
3. Try to manually read Firestore data via SDK (if possible in console)
4. **Expected:** Access denied (security rules working)

---

## 10. Open Questions

**Q1:** Should the dashboard show a list of recently accessed canvases?  
**Resolution:** Out of scope for Phase 1 Task 1. User will manually enter canvas ID or create new.

**Q2:** Should we implement password reset flow?  
**Resolution:** Out of scope for Phase 1 Task 1. Can be added later as refinement.

**Q3:** What happens if user tries to join a canvas that doesn't exist yet?  
**Resolution:** Canvas page will load (it's unlisted link model). If no objects exist in Firestore, canvas is simply empty. This is acceptable behavior.

**Q4:** Should Google sign-in be popup or redirect mode?  
**Resolution:** Use popup mode for smoother UX (no full-page redirect).

**Q5:** How should display name be determined for Google OAuth users?  
**Resolution:** Use `user.displayName` from Google account. If null, fall back to email prefix.

---

## 11. Implementation Notes

### Recommended Implementation Order

1. **Initialize Project Structure**
   - Run `npx create-next-app@latest` with TypeScript and App Router
   - Configure Tailwind CSS
   - Install shadcn/ui CLI and initialize
   - Install Firebase SDK and other dependencies
   - Create directory structure

2. **Set Up Firebase**
   - Create Firebase project in console
   - Enable Auth providers
   - Create Firestore and RTDB databases
   - Copy config values (user will add to `.env.local`)
   - Create `src/lib/firebase.ts` with initialization

3. **Build Auth UI**
   - Create `(public)/auth/page.tsx`
   - Build auth form components
   - Implement email/password sign up logic
   - Implement email/password login logic
   - Add Google OAuth button and logic
   - Style with shadcn/ui and premium aesthetic
   - Add error handling and loading states

4. **Build Auth Guard**
   - Create `useAuthGuard` hook in `src/hooks/`
   - Listen to `onAuthStateChanged`
   - Implement redirect logic
   - Handle loading state

5. **Build Dashboard**
   - Create `(app)/layout.tsx` with auth guard
   - Create `(app)/page.tsx` (dashboard)
   - Implement Create Canvas button with nanoid generation
   - Implement Join Canvas input and navigation
   - Add user info header with sign out
   - Style with premium aesthetic

6. **Create Placeholder Canvas Route**
   - Create `(app)/canvases/[canvasId]/page.tsx`
   - Protected by auth guard (via layout)
   - Show simple message with canvas ID
   - This confirms routing works before building actual canvas

7. **Manual Testing**
   - Run through all test suites above
   - Verify design aesthetic matches requirements
   - Test auth flow end-to-end
   - Confirm Firebase connection and security rules

### Key Files to Create

- `src/lib/firebase.ts` - Firebase initialization
- `src/lib/types.ts` - TypeScript interfaces for User, etc.
- `src/hooks/useAuthGuard.ts` - Auth protection hook
- `src/app/(public)/auth/page.tsx` - Auth UI
- `src/app/(app)/layout.tsx` - Protected layout with auth guard
- `src/app/(app)/page.tsx` - Dashboard
- `src/app/(app)/canvases/[canvasId]/page.tsx` - Placeholder canvas

### Dependencies to Install

```bash
npm install firebase zustand immer zod nanoid
npm install -D @types/node
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card label toast
```

---

## 12. Acceptance Criteria (Definition of Done)

This task is **COMPLETE** when:

- ✅ User can sign up with email/password with proper validation
- ✅ User can sign up with Google OAuth
- ✅ User can log in with existing credentials
- ✅ Session persists across browser refresh
- ✅ Unauthenticated users are redirected to `/auth` when accessing protected routes
- ✅ Dashboard shows user info and has Create/Join canvas functionality
- ✅ Create Canvas generates valid canvas ID and navigates to canvas route
- ✅ Join Canvas accepts ID and navigates correctly
- ✅ Sign out works and redirects to `/auth`
- ✅ UI matches design aesthetic: premium, creative-friendly, sleek, modern, elegant
- ✅ All manual tests (Test Suites 1-6) pass successfully
- ✅ No console errors or TypeScript errors
- ✅ Firebase security rules deployed and enforced
- ✅ Code follows project architecture patterns from memory bank

---

## 13. Dependencies & Blockers

**Depends On:** None (this is the foundational task)

**Blocks:** All subsequent Phase 1 tasks (Tasks 2-10)

**External Dependencies:**
- User must add Firebase config to `.env.local` after Firebase project is created
- Firebase project must have Auth, Firestore, and RTDB enabled

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-20  
**Owner:** CollabCanvas Team

