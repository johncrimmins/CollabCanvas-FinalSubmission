# CollabCanvas v5

A real-time collaborative canvas application built with Next.js, Firebase, and TypeScript.

## 🚀 Project Status

**Phase 1, Task 1: Project Setup & Authentication** - ✅ **COMPLETE**

This repository contains the complete implementation of authentication and project infrastructure for CollabCanvas v5 (Gauntlet Final Submission).

---

## ✨ Features Implemented

### Authentication System
- ✅ Email/Password sign up and login
- ✅ Google OAuth authentication
- ✅ Session persistence across browser refreshes
- ✅ Protected routes with auth guards
- ✅ User-friendly error handling
- ✅ Loading states and smooth transitions

### Dashboard
- ✅ Create new canvas (generates unique ID)
- ✅ Join existing canvas by ID
- ✅ Real-time Firebase connection status indicator
- ✅ User profile display
- ✅ Sign out functionality

### Design System
- ✅ Premium, creative-team friendly aesthetic
- ✅ shadcn/ui component library
- ✅ Tailwind CSS with custom styling
- ✅ Responsive layouts (desktop-focused)
- ✅ Smooth animations and transitions

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore + Realtime Database
- **State Management:** Zustand (ready for future features)
- **Validation:** Zod
- **ID Generation:** nanoid

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd CanvasCollab-v5-FinalSubmission
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase Project

Follow the detailed instructions in [`FIREBASE-SETUP.md`](./FIREBASE-SETUP.md) to:
- Create a Firebase project
- Enable Authentication providers (Email/Password + Google)
- Create Firestore and Realtime Database
- Deploy security rules
- Get your Firebase configuration

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

See [`ENV.md`](./ENV.md) for more details.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Testing

Follow the comprehensive testing guide in [`TESTING-GUIDE.md`](./TESTING-GUIDE.md) to verify all features work correctly.

**Test Suites:**
1. New User Sign Up
2. Returning User Login
3. Auth Guards & Protected Routes
4. Dashboard Functionality
5. Visual & UX Quality
6. Firebase Integration

### Canvas Shell Verification (Task 2)

Follow the manual QA checklist in [`docs/canvas-shell-qa.md`](./docs/canvas-shell-qa.md) to verify the Canvas Page Shell is working:

- Authentication required to access `/(app)/canvases/[canvasId]`
- Canvas providers mount without errors and Zustand store is initialized
- Connection indicator reflects RTDB connectivity
- Diagnostics panel shows object and peer counts
- Layout renders `Toolbar`, `CanvasStage`, `PresenceLayer`, and status correctly

---

## 📁 Project Structure

```
CanvasCollab-v5-FinalSubmission/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── auth/              # Authentication page
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # Protected app layout with auth guard
│   │   │   ├── page.tsx           # Dashboard
│   │   │   └── canvases/
│   │   │       └── [canvasId]/    # Canvas page (placeholder)
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuthGuard.ts        # Auth protection hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   ├── firebase.ts            # Firebase initialization
│   │   ├── types.ts               # TypeScript types
│   │   └── utils.ts               # Utility functions
│   └── store/                     # Zustand store (future)
├── docs/                          # Project documentation
├── memory-bank/                   # AI memory bank (architecture, context)
├── tasks/                         # Task breakdowns and PRDs
├── .cursor/                       # Cursor IDE rules
└── [config files]                 # Next.js, TypeScript, Tailwind configs
```

---

## 🎨 Design Philosophy

CollabCanvas follows a **premium, creative-team friendly** aesthetic:

- **Aspirational Premium:** High-quality typography, generous whitespace, subtle shadows
- **Creative-Friendly:** Warm color palette, playful micro-interactions, confidence-inspiring
- **Sleek & Modern:** Clean layouts, minimal borders, contemporary styling
- **Accessible:** Clear hierarchy, smooth transitions, intuitive UX

---

## 🔐 Security

- Firebase Security Rules enforce authentication for all reads/writes
- Client-side validation with Zod schemas
- Secure session management via Firebase SDK
- Protected routes with auth guards
- User-friendly error messages (no technical details exposed)

---

## 📚 Documentation

- **[PRD: Project Setup & Authentication](./tasks/prd-01-project-setup-authentication.md)** - Detailed requirements
- **[Task Breakdown](./tasks/tasks-prd-01-project-setup-authentication.md)** - Implementation tasks
- **[Firebase Setup Guide](./FIREBASE-SETUP.md)** - Step-by-step Firebase configuration
- **[Environment Variables](./ENV.md)** - Environment setup instructions
- **[Testing Guide](./TESTING-GUIDE.md)** - Comprehensive test suites
- **[Architecture Overview](./docs/architecture-overview.md)** - System design
- **[Memory Bank](./memory-bank/)** - Project context and patterns

---

## 🚧 What's Next

This task completes **Phase 1, Task 1**. Upcoming tasks include:

- **Task 2:** Canvas Page Infrastructure
- **Task 3:** Basic Object System (Firestore integration)
- **Task 4:** Canvas Rendering (Konva.js)
- **Task 5:** Presence & Cursors (RTDB)
- **Task 6:** Single Object Interactions
- **Task 7:** Resize & Delete
- **Task 8:** Undo/Redo
- **Task 9:** Toolbar & Polish
- **Task 10:** Reconnection & Edge Cases

See [`memory-bank/progress.md`](./memory-bank/progress.md) for full roadmap.

---

## 🤝 Contributing

This is a Gauntlet submission project. If you'd like to explore or extend it:

1. Follow the setup instructions above
2. Read the architecture docs in `memory-bank/`
3. Check the task breakdowns in `tasks/`
4. Maintain the established design aesthetic and patterns

---

## 📝 License

This project is part of the Gauntlet challenge submission.

---

## 🐛 Known Issues

- Minor ESLint warning in `use-toast.ts` (shadcn/ui hook, non-blocking)
- Firebase security rules are basic (auth-only, no fine-grained permissions yet)

---

## 💡 Tips for Development

1. **Always restart dev server** after modifying `.env.local`
2. **Keep browser console open** during development to catch errors early
3. **Test with multiple browsers** to ensure cross-browser compatibility
4. **Use incognito mode** for testing authentication flows
5. **Check Firebase Console** for user accounts and database activity

---

## 📧 Support

For issues related to:
- **Firebase setup:** See `FIREBASE-SETUP.md`
- **Testing:** See `TESTING-GUIDE.md`
- **Architecture:** See `memory-bank/systemPatterns.md`
- **PRD details:** See `tasks/prd-01-project-setup-authentication.md`

---

**Built with ❤️ for the Gauntlet Challenge**

