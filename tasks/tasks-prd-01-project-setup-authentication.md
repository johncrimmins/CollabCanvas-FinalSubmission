# Tasks: Project Setup & Authentication

**Source PRD:** [prd-01-project-setup-authentication.md](./prd-01-project-setup-authentication.md)  
**Status:** Not Started  
**Created:** 2025-10-20

---

## Relevant Files

- `src/lib/firebase.ts` - Firebase SDK initialization (auth, firestore, rtdb)
- `src/lib/types.ts` - TypeScript interfaces for User and auth types
- `src/hooks/useAuthGuard.ts` - Auth protection hook for protected routes
- `src/app/(public)/auth/page.tsx` - Authentication UI (sign up/login)
- `src/app/(app)/layout.tsx` - Protected app layout with auth guard
- `src/app/(app)/page.tsx` - Dashboard for creating/joining canvases
- `src/app/(app)/canvases/[canvasId]/page.tsx` - Placeholder canvas route
- `tailwind.config.ts` - Tailwind configuration with custom theme
- `.env.local.example` - Template for required environment variables

### Notes

- This is a foundational task - all subsequent Phase 1 tasks depend on this
- Firebase project must be created manually in Firebase Console
- User must add Firebase config to `.env.local` after project creation
- Focus on premium, creative-team friendly aesthetic throughout UI

---

## Tasks

- [ ] 1.0 Initialize Project Structure
  - [ ] 1.1 Run `npx create-next-app@latest` with TypeScript, ESLint, Tailwind CSS, src/ directory, App Router, and import alias `@/*`
  - [ ] 1.2 Configure Tailwind CSS with custom theme colors in `tailwind.config.ts` if needed for brand identity
  - [ ] 1.3 Initialize shadcn/ui with `npx shadcn-ui@latest init`
  - [ ] 1.4 Install Firebase SDK and core dependencies: `npm install firebase zustand immer zod nanoid`
  - [ ] 1.5 Install development dependencies: `npm install -D @types/node`
  - [ ] 1.6 Install shadcn/ui components: `npx shadcn-ui@latest add button input card label toast`
  - [ ] 1.7 Create directory structure: `src/app/(public)/auth/`, `src/app/(app)/canvases/[canvasId]/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/store/`
  - [ ] 1.8 Create `.env.local.example` with Firebase environment variable placeholders (NEXT_PUBLIC_FIREBASE_* variables from PRD Section 7)
  - [ ] 1.9 Verify project builds without errors: `npm run build`
  - [ ] 1.10 Start development server and verify it runs: `npm run dev`

- [ ] 2.0 Set Up Firebase Project & Configuration
  - [ ] 2.1 Create new Firebase project in Firebase Console with desired project name
  - [ ] 2.2 Enable Email/Password authentication provider in Firebase Console
  - [ ] 2.3 Enable Google OAuth authentication provider in Firebase Console (configure OAuth consent screen if prompted)
  - [ ] 2.4 Create Firestore Database in production mode, choose nearest region
  - [ ] 2.5 Create Realtime Database in locked mode, choose nearest region
  - [ ] 2.6 Copy Firebase config values from Project Settings > General > Your apps
  - [ ] 2.7 Create `src/lib/firebase.ts` with modular Firebase SDK initialization (import from `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/database`)
  - [ ] 2.8 Export `auth`, `db` (Firestore), and `rtdb` (Realtime Database) instances from `firebase.ts`
  - [ ] 2.9 Deploy Firestore security rules from PRD Section 7 via Firebase Console
  - [ ] 2.10 Deploy RTDB security rules from PRD Section 7 via Firebase Console
  - [ ] 2.11 User creates `.env.local` and adds Firebase config values (manual step - document this)
  - [ ] 2.12 Test Firebase connection by importing and logging `auth` in a test component

- [ ] 3.0 Build Authentication UI (/auth route)
  - [ ] 3.1 Create `src/lib/types.ts` with User interface and auth-related types
  - [ ] 3.2 Create `src/app/(public)/auth/page.tsx` as a client component
  - [ ] 3.3 Build auth form container using shadcn/ui `Card` component with elegant styling
  - [ ] 3.4 Implement mode toggle between "Sign Up" and "Log In" with smooth transition
  - [ ] 3.5 Create Sign Up form with email input (validated with Zod), password input with show/hide toggle (min 8 chars), and display name input
  - [ ] 3.6 Create Log In form with email input and password input with show/hide toggle
  - [ ] 3.7 Implement email/password sign up logic using `createUserWithEmailAndPassword` from Firebase Auth
  - [ ] 3.8 After sign up, update user profile with display name using `updateProfile(user, { displayName })`
  - [ ] 3.9 Implement email/password login logic using `signInWithEmailAndPassword`
  - [ ] 3.10 Add Google OAuth button that uses `signInWithPopup` with `GoogleAuthProvider`
  - [ ] 3.11 Handle authentication errors with user-friendly messages (invalid credentials, email in use, weak password, network errors)
  - [ ] 3.12 Implement loading states on submit buttons to prevent double-submission
  - [ ] 3.13 Redirect to `/` (dashboard) upon successful authentication using Next.js router
  - [ ] 3.14 Style with premium aesthetic: generous whitespace, smooth transitions, modern form inputs, subtle shadows

- [ ] 4.0 Build Auth Guard & Protected Routes
  - [ ] 4.1 Create `src/hooks/useAuthGuard.ts` hook that listens to `onAuthStateChanged` from Firebase Auth
  - [ ] 4.2 In `useAuthGuard`, return loading state (boolean), user object (or null), and handle initial auth check
  - [ ] 4.3 Create `src/app/(app)/layout.tsx` as a client component that uses the auth guard hook
  - [ ] 4.4 In `(app)/layout.tsx`, redirect to `/auth` if user is not authenticated using Next.js router
  - [ ] 4.5 Show minimal loading indicator during initial auth check to prevent flash of wrong content
  - [ ] 4.6 Only render children when authenticated and loading is false
  - [ ] 4.7 Verify session persistence works by default (Firebase SDK handles this)
  - [ ] 4.8 Test that unauthenticated users are immediately redirected when accessing protected routes

- [ ] 5.0 Build Dashboard UI (/ route)
  - [ ] 5.1 Create `src/app/(app)/page.tsx` as a client component (protected by auth guard via layout)
  - [ ] 5.2 Access current user from `useAuthGuard` hook
  - [ ] 5.3 Build user info header displaying user's display name and email
  - [ ] 5.4 Add sign-out button to header with elegant, subtle styling
  - [ ] 5.5 Implement "Create New Canvas" button that generates canvas ID using `nanoid()` and navigates to `/canvases/[canvasId]`
  - [ ] 5.6 Create "Join Canvas" input field with validation (non-empty, reasonable length)
  - [ ] 5.7 Implement join canvas logic that navigates to `/canvases/[canvasId]` on Enter key or button click
  - [ ] 5.8 Add Firebase RTDB connection status indicator (small dot + "Connected"/"Disconnected" text)
  - [ ] 5.9 Listen to RTDB connection state using `.info/connected` reference
  - [ ] 5.10 Implement sign-out functionality: call `signOut(auth)`, clear local state, redirect to `/auth`
  - [ ] 5.11 Handle sign-out errors gracefully with toast notifications
  - [ ] 5.12 Style dashboard with premium aesthetic: large prominent "Create" button, generous whitespace, clean layout, smooth hover states

- [ ] 6.0 Create Placeholder Canvas Route
  - [ ] 6.1 Create `src/app/(app)/canvases/[canvasId]/page.tsx` (protected by auth guard via layout)
  - [ ] 6.2 Extract `canvasId` from route params and display it
  - [ ] 6.3 Show "Canvas [ID] - Coming Soon" message with note that this is a placeholder
  - [ ] 6.4 Style placeholder page: centered content, clear messaging, matches design aesthetic
  - [ ] 6.5 Verify navigation from dashboard "Create" and "Join" actions works correctly

- [ ] 7.0 Manual Testing & Polish
  - [ ] 7.1 Run Test Suite 1 from PRD Section 9: New User Sign Up (T1.1-T1.4)
  - [ ] 7.2 Run Test Suite 2 from PRD Section 9: Returning User Login (T2.1-T2.3)
  - [ ] 7.3 Run Test Suite 3 from PRD Section 9: Auth Guards & Protected Routes (T3.1-T3.3)
  - [ ] 7.4 Run Test Suite 4 from PRD Section 9: Dashboard Functionality (T4.1-T4.4)
  - [ ] 7.5 Run Test Suite 5 from PRD Section 9: Visual & UX Quality (T5.1-T5.4)
  - [ ] 7.6 Run Test Suite 6 from PRD Section 9: Firebase Integration (T6.1-T6.3)
  - [ ] 7.7 Fix any issues discovered during testing
  - [ ] 7.8 Verify no console errors or warnings in browser
  - [ ] 7.9 Verify no TypeScript compilation errors
  - [ ] 7.10 Verify UI consistently matches design aesthetic from PRD Section 6
  - [ ] 7.11 Confirm all acceptance criteria from PRD Section 12 are satisfied
  - [ ] 7.12 Document any known issues or edge cases in comments or documentation

---

## Definition of Done

This task list is **COMPLETE** when:

- ✅ All 7 parent tasks and their sub-tasks are checked off
- ✅ All manual test suites from PRD Section 9 pass
- ✅ All acceptance criteria from PRD Section 12 are met:
  - User can sign up with email/password with proper validation
  - User can sign up with Google OAuth
  - User can log in with existing credentials
  - Session persists across browser refresh
  - Unauthenticated users redirected to `/auth`
  - Dashboard shows user info and has Create/Join functionality
  - Create Canvas generates valid ID and navigates
  - Join Canvas validates and navigates correctly
  - Sign out works and redirects to `/auth`
  - UI matches design aesthetic: premium, creative-friendly, sleek, modern, elegant
  - No console errors or TypeScript errors
  - Firebase security rules deployed and enforced
  - Code follows project architecture patterns from memory bank


