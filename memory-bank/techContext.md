# CollabCanvas — Technical Context

## Technology Stack

### Frontend Framework
- **Next.js 14+** (App Router)
  - Server components for initial auth checks
  - Client components for interactive canvas
  - API routes not needed (Firebase handles backend)

- **TypeScript**
  - Strict mode enabled
  - Full type safety across codebase
  - Zod for runtime validation

### UI & Styling
- **Tailwind CSS**
  - Utility-first styling
  - Custom theme configuration for brand colors
  - Consistent spacing scale: 4, 8, 16, 24, 32, 48, 64px
  - Premium aesthetic: generous whitespace, subtle shadows, smooth transitions

- **shadcn/ui**
  - Accessible component primitives
  - Customizable with Tailwind
  - Used for all UI components: toolbar, modals, toasts, forms, buttons
  - Styled to match creative-team friendly, high aesthetic, collaborative design language
  - Contemporary component styling: rounded corners, clean focus states, smooth interactions

- **Konva.js + react-konva**
  - Canvas rendering engine
  - High-performance object manipulation
  - Built-in transform controls

### State Management
- **Zustand**
  - Lightweight, unopinionated state management
  - Used with `immer` middleware for immutable updates
  - Optional `persist` middleware for undo/redo across refreshes
  - Selector-based subscriptions for fine-grained re-renders

### Firebase (Web SDK v10+)
- **Firebase Authentication**
  - Email/Password provider
  - Google OAuth provider
  - Session persistence

- **Cloud Firestore**
  - Durable object storage
  - Per-object transactions with version checking
  - Real-time snapshots

- **Realtime Database (RTDB)**
  - Ephemeral signals (cursors, presence, previews)
  - Low-latency updates
  - `onDisconnect()` for automatic cleanup

### Utilities
- **nanoid**
  - Client-side ID generation
  - Collision-resistant, URL-safe

- **lodash.throttle** (or custom throttle)
  - Throttle preview publishing
  - Debounce Firestore snapshots

- **zod**
  - Runtime schema validation
  - Type inference for TypeScript
  - Validates all Firebase data

### Deployment
- **Vercel**
  - Zero-config deployment for Next.js
  - Edge network for low latency
  - Environment variable management

### Development Tools
- **ESLint** + **Prettier**
  - Code quality and formatting
  - Consistent code style

- **TypeScript**
  - Static type checking
  - IntelliSense support

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Firebase project with Authentication, Firestore, and RTDB enabled
- Vercel account (for deployment)

### Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

### Local Setup Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Create `.env.local` with Firebase credentials
4. Run dev server: `npm run dev`
5. Open `http://localhost:3000`

### Firebase Configuration
1. **Authentication**: Enable Email/Password and Google providers
2. **Firestore**: Create database in production mode, deploy security rules
3. **RTDB**: Create database, deploy security rules
4. **Security Rules**: See `firestore.rules` and `database.rules.json`

## Technical Constraints

### Performance Budgets
- **Initial Load**: Canvas with 300 objects loads in <2s
- **Frame Rate**: Maintain 60 FPS during interactions
- **Latency**: Cursor updates feel real-time (<150ms)
- **Preview Rate**: 80-120ms throttle default, adaptive to velocity
- **Firestore Debounce**: 16-33ms to prevent flicker

### Scalability Constraints
- **Users per Canvas**: Designed for 4-5 concurrent users
- **Objects per Canvas**: Tested up to 300 simple objects
- **RTDB Bandwidth**: Adaptive throttling to stay within limits
- **Firestore Writes**: Per-object transactions to minimize conflicts

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features assumed
- No IE11 support

### Network Assumptions
- Designed for typical broadband (10+ Mbps)
- Graceful degradation on slow networks
- Works on moderate latency (<200ms RTT)
- Handles temporary disconnections

## Dependencies & Versions

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0",
  "firebase": "^10.0.0",
  "zustand": "^4.4.0",
  "immer": "^10.0.0",
  "konva": "^9.0.0",
  "react-konva": "^18.0.0",
  "zod": "^3.22.0",
  "nanoid": "^5.0.0",
  "tailwindcss": "^3.3.0"
}
```

### Dev Dependencies
```json
{
  "eslint": "^8.0.0",
  "prettier": "^3.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0"
}
```

## Architecture Decisions & Rationale

### Why Next.js App Router?
- Server components for efficient auth checks
- Built-in routing and code splitting
- Vercel deployment optimization
- Modern React features (Suspense, etc.)

### Why Zustand over Redux/Context?
- Minimal boilerplate
- Excellent TypeScript support
- Selector-based subscriptions prevent unnecessary re-renders
- Simple API for our use case

### Why Konva.js?
- Mature canvas library with transform controls
- React bindings (react-konva)
- High performance for 300+ objects
- Extensible for future features

### Why Firebase?
- Managed backend (no server code needed)
- Real-time capabilities out of the box
- Firestore for transactions, RTDB for ephemeral signals
- Authentication built-in
- Generous free tier

### Why Firestore + RTDB Hybrid?
- Firestore: Strong consistency, transactions, queries
- RTDB: Ultra-low latency for cursors and previews
- Best of both worlds for our use case

### Why Client-Chosen IDs (nanoid)?
- Enables optimistic UI without server round-trip
- Collision-resistant enough for our scale
- Simpler client code (no ID remapping)

## Deployment Architecture

### Vercel Deployment
- **Edge Functions**: Not needed (Firebase handles backend)
- **Static Generation**: Auth pages pre-rendered
- **Client-Side Rendering**: Canvas page fully client-rendered
- **Environment Variables**: Managed via Vercel dashboard

### Firebase Hosting (alternative)
- Can deploy via Firebase Hosting instead of Vercel
- Requires Next.js static export
- Loses some Next.js features (server components, middleware)

## Monitoring & Debugging

### Built-in Debugging Hooks
- Console counters (dev-only) for:
  - Firestore snapshot latency
  - RTDB publish rate
  - Dropped previews (TTL/SEQ)
- Toggle to disable previews (test truth-only rendering)
- Timing markers for gestures and pan/zoom

### Firebase Console
- Authentication: Monitor sign-ups, sessions
- Firestore: Inspect object documents, query latency
- RTDB: Monitor active connections, bandwidth usage

### Vercel Analytics (optional)
- Page load metrics
- Core Web Vitals
- Error tracking

## Security Considerations

### Client-Side Security
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed
- API keys are safe to expose (Firebase uses domain restrictions)
- Never store secrets in client code

### Firebase Security Rules
- Enforce authentication on all Firestore and RTDB paths
- Validate data structure and types server-side
- Rate limit writes to prevent abuse

### Best Practices
- Use Firebase App Check for production (prevents unauthorized clients)
- Rotate API keys if compromised
- Monitor Firebase usage for anomalies

## Future Technical Considerations

### Potential Optimizations
- IndexedDB caching for faster cold starts
- Web Workers for heavy computations
- Canvas object virtualization for >1000 objects
- WebRTC for ultra-low latency cursor sharing

### Potential Migrations
- Move to Firebase v11 when stable
- Explore Replicache for local-first sync if offline support needed
- Consider WebAssembly for compute-heavy features

### Scaling Beyond Current Limits
- Shard canvases if >1000 objects needed
- Implement user presence limits if >10 concurrent users
- Use Firestore composite indexes for advanced queries

## Known Technical Limitations

### Firebase Free Tier Limits
- Firestore: 50k reads/day, 20k writes/day
- RTDB: 1GB storage, 10GB/month transfer
- Adequate for development and small production usage

### RTDB Data Model Constraints
- No queries or indexes (flat key-value structure)
- Manual cleanup required (using `onDisconnect()`)
- Not suitable for durable data

### Firestore Transaction Limitations
- Max 500 documents per transaction (not an issue for our per-object pattern)
- Retries on contention (handled gracefully in our code)

### Konva Performance Ceiling
- Starts to degrade beyond 1000+ objects
- Transform handles can flicker with very complex shapes
- No built-in virtualization

## Backup & Recovery

### Data Durability
- Firestore provides automatic backups and point-in-time recovery
- Export Firestore data regularly for compliance

### Disaster Recovery
- Firebase infrastructure is multi-region by default
- Client can reconnect seamlessly after Firebase outages
- No additional DR setup needed for this scale

