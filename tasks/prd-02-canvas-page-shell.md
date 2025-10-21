# PRD: Canvas Page Shell & State Infrastructure

**Feature:** Phase 1, Task 2 – Canvas Page Shell & State Infrastructure  
**Status:** Not Started  
**Priority:** P0 (Foundation – Blocking)  
**Estimated Complexity:** Medium-High  
**Related Docs:** [Product PRD](../docs/prd.md), [Architecture Overview](../docs/architecture-overview.md), [Performance Requirements](../docs/performance-requirements.md), [Tech Context](../memory-bank/techContext.md)

---

## 1. Introduction/Overview

This task establishes the collaborative canvas route and shared application state that every subsequent feature relies on. It replaces the temporary "coming soon" canvas page with a production-ready shell that wires providers, initializes the global Zustand store slices, and exposes typed Firebase client utilities. The goal is to ensure that when an authenticated user opens `/canvases/[canvasId]`, the page mounts instantly with the correct providers, has access to Firebase, and exposes predictable hooks/state for upcoming canvas functionality.

---

## 2. Goals

1. Provide a stable, reusable layout and provider stack for all authenticated app routes, including the canvas page.  
2. Initialize the full Zustand store structure (`objects`, `ui`, `presence`, `undo`) with typed actions that match the architecture spec.  
3. Expose Firestore and RTDB client helpers (`fsClient.ts`, `rtdbClient.ts`, `reconciler.ts` scaffolding) so future tasks can implement data flows without reshuffling infrastructure.  
4. Replace the placeholder canvas route with a shell that mounts toolbar, stage, and presence placeholders, ready for real data and interactions.  
5. Ensure loading/error states, authentication guard behaviour, and connection status indicators are in place so QA can verify connectivity before object rendering exists.

---

## 3. User Stories

**US-1 (Collaborator Entry)**  
> As an authenticated collaborator, when I open a canvas link, I want the page to load instantly with the correct layout, headers, and placeholders so I know the space is ready even before objects appear.

**US-2 (Feature Developer)**  
> As a developer implementing canvas interactions, I want a strongly typed global store and Firebase client utilities so I can build features without creating infrastructure from scratch.

**US-3 (QA/Support)**  
> As a tester, I want visible connection status, loading, and empty states on the canvas page so I can confirm Firebase connectivity and authentication guard behaviour before deeper functionality ships.

---

## 4. Functional Requirements

### 4.1 Route & Layout Infrastructure

- **FR-1.1** Update `(app)/layout.tsx` to host global providers (theme, auth guard, toast, etc.) and ensure all authenticated routes share consistent chrome.  
- **FR-1.2** Implement a canvas-specific provider wrapper (e.g., `CanvasProviders` component) composed inside `(app)/canvases/[canvasId]/page.tsx` so we honor the documented route structure while still injecting Zustand store context, subscription placeholders, and error boundaries.  
- **FR-1.3** Replace the placeholder `(app)/canvases/[canvasId]/page.tsx` with a client component that reads the `canvasId` param, mounts shell components, and gracefully handles loading/error states.

### 4.2 Zustand Store Structure

- **FR-2.1** Create `store/index.ts` exposing `CanvasStoreProvider`, `useCanvasStore`, and typed selectors; ensure the store is scoped per canvas instance to avoid cross-canvas leakage.  
- **FR-2.2** Implement `store/objects.ts` with state shape `Record<objectId, CanvasObject>`, plus actions for `upsertMany`, `removeMany`, `reset`, and derived selectors used by forthcoming rendering logic.  
- **FR-2.3** Implement `store/ui.ts` managing `tool`, `selectedIds`, `localIntent`, `draftTextById`, and helpers such as `beginLocalIntent`, `updateLocalIntent`, `endLocalIntent`, `setSelectedIds`, `clearSelection`.  
- **FR-2.4** Implement `store/presence.ts` to mirror RTDB data (`peers`, `cursors`, `editing`) with actions to hydrate, prune by TTL, and reset, matching the architecture spec.  
- **FR-2.5** Implement `store/undo.ts` using immer patches (`push`, `undo`, `redo`, `clear`) and expose selectors/hooks to integrate with keyboard shortcuts later.  
- **FR-2.6** Ensure all slices export TypeScript interfaces/types that match the architecture doc (e.g., `CanvasObject`, `LocalIntent`, `CursorState`) and are re-exported from `store/types.ts` or `store/index.ts` for reuse.

### 4.3 Firebase Client Layer

- **FR-3.1** Create `lib/fsClient.ts` stubbing typed helpers (`commitObject`, `subscribeObjects`, etc.) with TODOs or minimal implementations aligned to architecture contracts.  
- **FR-3.2** Create `lib/rtdbClient.ts` exposing throttled publishers/subscribers for cursors, presence, editing, and previews (interfaces only if implementation is out of scope this step).  
- **FR-3.3** Create `lib/reconciler.ts` scaffolding that will house the `localIntent ▷ preview ▷ truth` logic and export placeholder functions (`selectRenderProps`, `applyFirestoreSnapshot`, `transformIntentOnTruth`).  
- **FR-3.4** Ensure all Firebase helpers register `onDisconnect().remove()` for ephemeral paths and return unsubscribe/dispose functions as specified in the architecture overview.  
- **FR-3.5** Surface typed error classes or result objects so later tasks can differentiate recoverable Firebase errors from fatal ones.

### 4.4 Canvas Shell UI & Placeholders

- **FR-4.1** Introduce `components/CanvasLayout.tsx` (or equivalent) that arranges toolbar, stage, and presence layers using the premium aesthetic defined in product docs.  
- **FR-4.2** Create placeholder components (`Toolbar`, `CanvasStage`, `PresenceLayer`, `ConnectionIndicator`) that render skeleton states or "coming soon" copy while exposing the props/slots their future implementations will require.  
- **FR-4.3** Display canvas metadata (ID, last connected timestamp placeholder) and a CTA or hint describing future functionality to reassure users the page is functioning.  
- **FR-4.4** Provide a visible loading spinner/state while the store initializes or while Firebase SDK lazily loads, and an inline error card if initialization fails.

### 4.5 Diagnostics & Developer Ergonomics

- **FR-5.1** Add a development-only debug panel or console group logging that confirms store initialization, Firebase configuration presence, and provider mounting (disabled in production builds).  
- **FR-5.2** Expose helper hooks (e.g., `useCanvasConnectionStatus`) that surface RTDB/Firestore connectivity so QA can verify status without deep inspection.  
- **FR-5.3** Document how to access the canvas store from React DevTools or the console for manual verification.

### 4.6 Verification & Testing

- **FR-6.1** Manual QA checklist: authenticated user opens existing/new canvas → shell loads within 1s, connection indicator reports status, no TypeScript errors, no console warnings.  
- **FR-6.2** Write smoke tests (unit or integration) ensuring store slices initialize to expected defaults and actions mutate state predictably (can use Vitest/Jest).  
- **FR-6.3** Update `README` or docs with instructions for running the canvas page locally now that it relies on store providers.

---

## 5. Non-Goals (Out of Scope)

- Rendering Firestore objects, presence cursors, or previews (handled in Tasks 3–5).  
- Implementing gesture logic (move/resize), tool selection behaviour, or undo integration (future tasks).  
- Final UI polish for toolbar controls, Konva layers, or text editing; placeholders are acceptable as long as layout and providers exist.  
- Performance tuning (throttling, debouncing) beyond scaffolding interfaces.  
- Deployment or CI/CD changes.

---

## 6. Design Considerations

- Maintain the premium, creative-team aesthetic defined in the product context: generous whitespace, warm palette, elegant typography, subtle motion.  
- Canvas shell should hint at final layout: toolbar top/side, stage center, presence overlay, connection indicator; ensure responsive behaviour for common desktop widths.  
- Loading and empty states should feel deliberate (skeletons, subtle transitions) rather than "broken" placeholders.  
- Preserve accessibility basics: focus order, keyboard navigation to primary actions, ARIA labels for status indicators.

---

## 7. Technical Considerations

- The provider stack must respect the dependency flow `Components → Hooks → Store → Lib → Firebase` from the architecture overview.  
- Zustand store should use the `immer` middleware and expose a factory so each canvas route instance can create an isolated store; avoid singleton state that spans canvases.  
- Firebase helpers must reuse the initialized SDK from `lib/firebase.ts`; never initialize secondary apps.  
- `reconciler.ts` should centralize render-priority logic even if implementations are placeholders, so future tasks do not scatter this concern.  
- Ensure TypeScript types are exported for reuse (`CanvasObject`, `Tool`, `CursorState`, `LocalIntent`, etc.) and align with docs to avoid churn later.  
- Consider suspense boundaries or `next/dynamic` if Firebase or store initialization is async, but keep the loading experience smooth.

---

## 8. Success Metrics

- Canvas route loads in ≤1 second on local dev with Firebase configured, without console errors.  
- `useCanvasStore.getState()` exposes populated slices with correct defaults immediately after mount.  
- Connection indicator reflects real Firebase connectivity (disconnecting network toggles status).  
- Developers can call exported store actions in tests to mutate state without runtime exceptions.  
- QA can verify, via UI alone, that they are authenticated, connected, and ready for future interactions.

---

## 9. Open Questions

1. Should store instances persist across route transitions (e.g., navigate away and back) or reset each time? Architecture suggests per-canvas isolation, but confirm desired UX.  
2. Do we want to ship the developer debug panel in production behind a feature flag, or strip it entirely?  
3. Should the canvas shell include a basic breadcrumbs/top-nav showing "Dashboard → Canvas" or keep focus solely on the canvas layout?  
4. Are we introducing automated tests in this task, or is manual verification sufficient until interactions land?

---

**Definition of Ready:** Clarify the open questions above, confirm Firebase config availability, and align on store scoping expectations. Once resolved, implementation can begin immediately.

