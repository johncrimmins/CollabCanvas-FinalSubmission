# CollabCanvas — Active Context

## Current Phase: Phase 1 Implementation - Task 1 Complete → Task 2 Next

### Status
This is the **Gauntlet Final Submission (v5)** of CollabCanvas. Project setup and authentication are complete:
- ✅ Product Requirements Document (PRD) complete
- ✅ Architecture Overview complete  
- ✅ Performance Requirements defined
- ✅ Memory Bank initialized
- ✅ **Task 1: Project Setup & Authentication COMPLETE**

**Next Step**: Task 2 - Canvas Page Infrastructure (Canvas Page Shell)

## Current Work Focus

### Immediate Priority
**Phase 1: Core Collaborative Canvas — Begin Task 2 (Canvas Page Shell)**

This phase will establish the foundational collaborative features:
1. Authentication system (Email/Password + Google)
2. Canvas page infrastructure with providers
3. Presence & cursor system via RTDB
4. Basic shape creation (rectangle, circle)
5. Single-select and transform operations (move, resize)
6. Delete and duplicate functionality
7. RTDB preview system during transforms
8. Firestore commit on gesture end
9. Reconnection behavior with `onDisconnect()` cleanup
10. Local undo/redo system

### Implementation Order (Phase 1)
Following the principle of building foundation first:

**Step 1: Project Setup & Authentication** (Foundation)
- Initialize Next.js project with TypeScript
- Configure Tailwind + shadcn/ui
- Set up Firebase (Auth, Firestore, RTDB)
- Create auth routes and guards
- Test: User can sign up, log in, and be redirected appropriately

**Step 2: Canvas Page Shell** (Infrastructure)
- Create app layout with providers
- Create canvas route with `[canvasId]` dynamic segment
- Set up Zustand store structure (objects, ui, presence, undo slices)
- Initialize Firebase clients (fsClient, rtdbClient)
- Test: Canvas page loads, store is accessible, Firebase connects

**Step 3: Basic Object System** (Core Data Flow)
- Implement Firestore object schema and validators
- Create `commitObject` transaction helper
- Implement `subscribeObjects` with debounced updates
- Build `reconciler.ts` with render priority logic
- Test: Can create object in Firestore, see it render on canvas

**Step 4: Canvas Rendering** (Visual Layer)
- Implement `CanvasStage.tsx` with Konva
- Create object rendering components (Rect, Circle)
- Wire up selectors for per-object rendering
- Implement pan/zoom controls
- Test: Objects render smoothly, pan/zoom works, no unnecessary re-renders

**Step 5: Presence & Cursors** (Collaborative Foundation)
- Implement RTDB presence system with `onDisconnect()`
- Create cursor position broadcasting (throttled)
- Build `PresenceLayer.tsx` for cursor rendering
- Add name labels and color assignment
- Test: Multiple users see each other's cursors in real-time

**Step 6: Single Object Interactions** (Core UX)
- Implement shape creation tools (rect, circle)
- Build `useCanvasInteractions` hook
- Add selection system (click to select)
- Implement move transform with localIntent
- Integrate RTDB preview publishing
- Test: Can create, select, and move shapes with instant local feedback

**Step 7: Resize & Delete** (Extending UX)
- Add resize handles to selection
- Implement resize transform with previews
- Wire up delete functionality
- Add duplicate functionality
- Test: Can resize objects, delete them, duplicate them

**Step 8: Undo/Redo** (Quality of Life)
- Implement undo store slice with immer patches
- Add keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
- Optional: Add persist middleware for cross-refresh undo
- Test: Can undo/redo operations, history persists across refresh

**Step 9: Toolbar & Polish** (UI Completion)
- Build toolbar with tool selection
- Add keyboard shortcuts (Delete, Duplicate)
- Implement connection status indicator
- Add error toasts for write failures
- Test: Full user flow works end-to-end

**Step 10: Reconnection & Edge Cases** (Reliability)
- Test refresh scenarios
- Verify `onDisconnect()` cleanup works
- Test simultaneous edit scenarios
- Verify version conflict handling
- Test slow network behavior
- Test: All acceptance criteria from PRD Phase 1 pass

## Recent Changes
- ✅ **Completed Task 1: Project Setup & Authentication** (67/67 sub-tasks)
- ✅ Initialized Next.js 15 with TypeScript, Tailwind, shadcn/ui
- ✅ Implemented full authentication system (Email/Password + Google OAuth)
- ✅ Created auth guards and protected routes
- ✅ Built dashboard with Create/Join canvas functionality
- ✅ Created placeholder canvas route
- ✅ Added error handling for missing Firebase configuration
- ✅ All builds successful, no linter errors
- ✅ Premium UI aesthetic implemented throughout
- ✅ Comprehensive documentation created (README, setup guides, testing guide)

## Next Steps

### Immediate (Next Session)
1. Begin Task 2: Canvas Page Infrastructure
   - Set up Zustand store structure (objects, ui, presence, undo slices)
   - Create Firebase client wrappers (fsClient, rtdbClient)
   - Implement canvas route providers
   - Test: Canvas page loads, store accessible, Firebase connects

### Near-Term (Phase 1 Continuation)
1. Task 3: Basic Object System (Firestore integration)
2. Task 4: Canvas Rendering (Konva.js)
3. Task 5: Presence & Cursors (RTDB)
4. Tasks 6-10: Interactions, undo/redo, polish, testing

## Active Decisions & Considerations

### Tech Stack Locked
All technology choices are finalized per `techContext.md`:
- Next.js App Router (not Pages Router)
- Zustand with immer (not Redux or Context)
- Konva.js (not Canvas API directly)
- Firebase hybrid (Firestore + RTDB)

### Architecture Locked
Core architectural patterns are locked per `systemPatterns.md`:
- Local-first rendering priority: `localIntent ▷ preview ▷ truth`
- Per-object Firestore transactions with version checking
- Final-only text editing (no keystroke sync)
- Ephemeral RTDB with `onDisconnect()` cleanup
- Throttled preview publishing with TTL and SEQ guards

### Open Questions (To Be Resolved During Implementation)
1. **Throttle tuning**: Exact ms values for preview throttling will be tuned based on testing
2. **Large selection threshold**: What count triggers centroid-only preview mode? (TBD during Phase 2)
3. **Color assignment**: Algorithm for stable user color assignment
4. **Cursor label positioning**: Anti-overlap algorithm specifics
5. **Debounce timing**: Exact Firestore snapshot debounce (16ms vs 33ms)

### Out of Scope for Now
- Phase 2 features (text, multi-select, rotation) - implemented after Phase 1 ships
- Advanced features (layers panel, rich text, permissions) - future consideration
- Mobile optimization - basic support only
- Offline mode - not planned

## Context for Next Session

### What to Remember
This is a **final submission project** for Gauntlet. Quality, reliability, and meeting all acceptance criteria are critical. The architecture is already designed; implementation should follow the documented patterns exactly.

### What Not to Do
- Don't deviate from documented architecture without discussion
- Don't skip Phase 1 acceptance testing
- Don't add features outside Phase 1 scope
- Don't use MVP terminology (this is production-ready)

### Success Criteria for Phase 1
From PRD acceptance criteria:
- Auth flow works; unauthorized users redirected to `/auth`
- Two browsers can concurrently view and edit with presence/cursors visible within ~100ms
- Previews look smooth; final positions/size persist correctly
- No stale editing/preview markers after closing tab or losing connection
- Canvas reload restores prior saved state

## Questions to Ask User Before Implementation
1. Should we proceed with Phase 1 implementation now?
2. Any specific concerns about the documented architecture?
3. Is the Firebase project already set up, or should we include those setup steps?
4. What's the target timeline for Phase 1 completion?

- Layout components (loading/error/shell) now live under `src/components/layout/` and must be reused instead of embedding raw Tailwind/JSX fallbacks in routes or layouts.

