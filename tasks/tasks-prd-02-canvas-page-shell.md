## Relevant Files

- `src/app/(app)/layout.tsx` - Hosts global providers and authenticated shell.
- `src/app/(app)/canvases/[canvasId]/page.tsx` - Canvas route entry point where the shell mounts.
- `src/store/index.ts` - Aggregates Zustand slices and exports store hooks.
- `src/store/objects.ts` - Tracks Firestore object truth state.
- `src/store/ui.ts` - Manages selection, local intent, and canvas UI state.
- `src/store/presence.ts` - Mirrors RTDB presence, cursor, and editing signals.
- `src/store/undo.ts` - Stores local undo/redo history.
- `src/lib/fsClient.ts` - Firestore transaction helpers.
- `src/lib/rtdbClient.ts` - RTDB publishers/subscribers for ephemeral signals.
- `src/lib/reconciler.ts` - Render priority logic scaffolding.
- `src/components/CanvasLayout.tsx` - Composes the canvas shell layout.
- `src/components/Toolbar.tsx` - Placeholder toolbar component.
- `src/components/CanvasStage.tsx` - Placeholder Konva stage component.
- `src/components/PresenceLayer.tsx` - Placeholder presence overlay component.
- `src/components/ConnectionIndicator.tsx` - Displays connection status.
- `docs/README.md` - Updated instructions for running the canvas shell infrastructure.

### Notes

- Unit tests should typically live alongside their implementation files (e.g., `CanvasStage.tsx` and `CanvasStage.test.tsx`).
- Use `npm run test` or `npx jest path/to/test` to execute targeted test suites once added.

## Tasks

- [x] 1.0 Establish canvas route shell infrastructure
  - [x] 1.1 Update `(app)/layout.tsx` to ensure global providers (auth guard, theme, toaster) wrap all authenticated pages.
  - [x] 1.2 Create a `CanvasProviders` wrapper component that instantiates the canvas store and exposes context.
  - [x] 1.3 Compose `CanvasProviders` inside `(app)/canvases/[canvasId]/page.tsx`, reading `canvasId` from params and passing it downstream.
  - [x] 1.4 Implement loading and error fallback UI within the canvas page to cover store/Firebase initialization states.

- [x] 2.0 Scaffold Zustand store and providers
  - [x] 2.1 Build `store/index.ts` with a store factory, provider component, and typed hook exports.
  - [x] 2.2 Implement `store/objects.ts` slice with state shape, actions (`upsertMany`, `removeMany`, `reset`), and selectors.
  - [x] 2.3 Implement `store/ui.ts` slice covering `tool`, `selectedIds`, `localIntent`, `draftTextById`, plus helper actions.
  - [x] 2.4 Implement `store/presence.ts` slice mirroring `peers`, `cursors`, and `editing` with TTL cleanup utilities.
  - [x] 2.5 Implement `store/undo.ts` slice using immer patches for `push`, `undo`, `redo`, and `clear` behaviours.
  - [x] 2.6 Export shared types (`CanvasObject`, `LocalIntent`, `CursorState`, etc.) for reuse across slices and components.

- [x] 3.0 Implement Firebase client scaffolding and reconciler hooks
  - [x] 3.1 Create `lib/fsClient.ts` with typed stubs for `commitObject`, `subscribeObjects`, and shared Firestore helpers.
  - [x] 3.2 Create `lib/rtdbClient.ts` exposing publishers/subscribers for presence, cursors, editing, and previews with `onDisconnect` cleanup.
  - [x] 3.3 Create `lib/reconciler.ts` scaffolding the `localIntent ▷ preview ▷ truth` selection logic and snapshot debouncing.
  - [x] 3.4 Wire preliminary error handling utilities so subsequent tasks can distinguish transient vs fatal Firebase issues.
  - [x] 3.5 Confirm all clients reuse the initialized Firebase app from `lib/firebase.ts` without creating duplicate instances.

- [x] 4.0 Create canvas UI placeholder components
  - [x] 4.1 Implement `CanvasLayout.tsx` arranging toolbar, stage, presence, and status regions using the premium aesthetic.
  - [x] 4.2 Add placeholder `Toolbar.tsx` exposing props for tool selection without real functionality yet.
  - [x] 4.3 Add placeholder `CanvasStage.tsx` rendering a Konva stage skeleton or illustrative surface.
  - [x] 4.4 Add placeholder `PresenceLayer.tsx` that displays sample avatars/labels tied to store data.
  - [x] 4.5 Add `ConnectionIndicator.tsx` showing connection state with accessible status messaging.
  - [x] 4.6 Integrate the placeholders into the canvas page to verify layout spacing and responsive behaviour.

- [x] 5.0 Document diagnostics, QA checklist, and developer ergonomics
  - [x] 5.1 Implement a development-only debug hook or console group to confirm provider/store initialization.
  - [x] 5.2 Expose a `useCanvasConnectionStatus` helper reading Firestore/RTDB status for QA usage.
  - [x] 5.3 Update documentation (e.g., `README` or dedicated doc) with instructions to run and verify the canvas shell.
  - [x] 5.4 Produce a manual QA checklist covering authenticated access, loading, error handling, and connection visibility.
  - [x] 5.5 Add smoke tests or unit tests validating store default state and basic action behaviour (where feasible).

