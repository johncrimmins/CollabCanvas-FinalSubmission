# Spec Alignment Report — CollabCanvas v5

This report summarizes discrepancies between the current codebase and the specification documents (`docs/prd.md` and `docs/architecture-overview.md`) for the current Phase 1 scope as reflected in the memory bank.

## Scope Considered
- Phase 1 features per PRD and Architecture Overview
- Code under `src/lib/`, `src/hooks/`, `src/components/`, `src/store/`, and `src/app/`
- Memory Bank context (`memory-bank/*.md`)

## Findings (Not Aligned / Gaps)

### 1) Text Object Support (Phase 2 in PRD)
- Codebase has no `Text` object component or editor overlay (`components/TextEditor.tsx` mentioned in specs is not present).
- Store includes `draftTextById` but there are no hooks/components to edit/commit text.
- Status: Acceptable for Phase 1; call out as future work for Phase 2.

### 2) Multi-Select, Resize, Rotate (Phase 1/2 split)
- Multi-select marquee and shift-click not implemented; `selectedIds` exists but no marquee/shift-add logic.
- Resize handles and logic not present; only move is implemented in `useCanvasInteractions`.
- Rotation not implemented (expected in Phase 2 per PRD).
- Status: Resize is Phase 1; rotate/multi-select are Phase 2. Resize missing for current phase.

### 3) Delete/Duplicate & Keyboard Shortcuts
- No delete/duplicate actions found in hooks/components.
- No keyboard shortcuts module (`useKeyboardShortcuts.ts`) present; PRD expects delete/duplicate/undo/redo bindings (Phase 2 polish, but delete/duplicate are Phase 1 features).
- Status: Missing for current Phase 1 scope.

### 4) Undo/Redo (Local)
- `store/undo.ts` exists but behavior not reviewed here; however no hook wiring or UI bindings are visible.
- No persistence hook (optional) is present.
- Status: Likely incomplete for Phase 1 acceptance.

### 5) Previews: Throttle/Frame-Gate/TTL/SEQ Policies
- `publishPreview` is called on every pointer move with incrementing `seq`; no explicit throttle/frame-gating in `useCanvasInteractions`.
- `presence` slice has TTL pruning (default 800ms), but `subscribePreviews` hydrates raw previews without SEQ/TTL filtering.
- Architecture expects: 80–120ms throttle (faster on high velocity), at-most-once-per-frame publishing, and ignoring stale or out-of-order previews (via SEQ and TTL).
- Status: Partially implemented (SEQ field exists), but throttle/frame-gate and consumer-side SEQ/TTL guards are missing.

### 6) Reconciler: Debounced Truth & Delta Reapplication
- `useCanvasSubscriptions` applies a 16ms debounce for Firestore snapshots — aligns with spec.
- `reconciler.selectRenderProps` implements localIntent ▷ preview ▷ truth — aligns.
- `reconciler.transformIntentOnTruth` stub exists but does not reapply deltas when truth advances mid-gesture (required to avoid rubber-band feel).
- Status: Partially implemented; delta reapplication logic missing.

### 7) Presence & Cursor Labels
- Cursor publishing is throttled to ~90ms in `CanvasStage` — aligns with PRD guidance.
- Presence publishing uses a fixed color `#3b82f6`; spec expects stable per-user color assignment (not necessarily user-configurable).
- Status: Color assignment is simplistic; acceptable for Phase 1, but note deviation from “stable color assignment” nuance.

### 8) Data Validation and Types
- Zod validators present and used in Firestore paths; good alignment.
- RTDB payloads are not validated client-side before publish/consume; specs suggest validation layer for all Firebase data.
- Status: Consider adding lightweight validation on RTDB signals (optional now, recommended).

### 9) Selection Handles & Visual Affordances
- PRD expects visible selection handles; current rendering for rect/circle has no selection visuals/handles.
- Status: Missing for Phase 1 (especially for resize feature).

### 10) Error Handling & Toasts
- PRD expects non-blocking toast on write failures and adopting saved truth.
- Code logs errors on `commitObject` failure without surfacing a toast.
- Status: Missing UI feedback.

### 11) Reconnection & Cleanup
- `onDisconnect()` usage present for presence/cursors/editing/previews — aligns.
- Explicit preview cleanup on gesture end publishes an empty props payload; should ensure previews are removed, not just set empty, to avoid ghost entries.
- Status: Consider `remove` on end, plus consumer TTL expiry (already present globally at 800ms).

### 12) API Surface Parity
- `lib` exports (`fsClient`, `rtdbClient`, `reconciler`) exist with expected functions, though some behaviors are simplified (see items above).
- Missing `hooks/useKeyboardShortcuts.ts` and `components/TextEditor.tsx` referenced in Architecture Overview (Phase 2 items).
- Status: Acceptable for Phase 1 except keyboard shortcuts for delete/duplicate which are expected.

## Minor Inconsistencies / Nits
- `docs/architecture-overview.md` mentions avoiding dev overlays; code contains no diagnostics artifacts — now consistent.
- `PresenceLayer` overlays “Preview” tag at preview location; PRD expects smooth peer previews of object transforms (this is a placeholder, not rendering object outline/shape). Consider rendering transformed outline/ghost of the object instead of a label.
- `PresenceLayer` converts stage space to screen space for cursor labels; ensure consistency with pan/zoom (appears correct using `stagePos` and `stageScale`).

## Summary of Required Work for Phase 1 Completion
- Implement resize (handles + logic) and selection visuals.
- Add delete and duplicate actions; optionally basic keyboard shortcuts for these.
- Add preview publishing throttle/frame-gating; add consumer-side SEQ/TTL guards.
- Implement delta reapplication in `transformIntentOnTruth` to avoid rubber-banding.
- Add user feedback for write failures (toast) and ensure preview cleanup removes ephemeral entries.
- Optional but recommended: RTDB payload validation and stable color assignment approach.

## Notes
- Text, multi-select marquee, and rotation are Phase 2 and intentionally not implemented yet.
- Undo/redo wiring should be verified once object operations beyond move are implemented.


