# Spec Alignment Report — CollabCanvas v5

This report summarizes discrepancies between the current codebase and the specification documents (`docs/prd.md` and `docs/architecture-overview.md`) for the current Phase 1 scope as reflected in the memory bank.

## Scope Considered
- Phase 1 features per PRD and Architecture Overview
- Code under `src/lib/`, `src/hooks/`, `src/components/`, `src/store/`, and `src/app/`
- Memory Bank context (`memory-bank/*.md`)

## Findings (Not Aligned / Gaps) — limited to completed Phase 1 work (through Step 6)

### 1) Previews: Throttle/Frame-Gate/TTL/SEQ Policies
- `publishPreview` is called on every pointer move with incrementing `seq`; no explicit throttle/frame-gating in `useCanvasInteractions`.
- `presence` slice has TTL pruning (default 800ms), but `subscribePreviews` hydrates raw previews without SEQ/TTL filtering.
- Architecture expects: 80–120ms throttle (faster on high velocity), at-most-once-per-frame publishing, and ignoring stale or out-of-order previews (via SEQ and TTL).
- Status: Partially implemented (SEQ field exists), but throttle/frame-gate and consumer-side SEQ/TTL guards are missing.

### 2) Reconciler: Debounced Truth & Delta Reapplication
- `useCanvasSubscriptions` applies a 16ms debounce for Firestore snapshots — aligns with spec.
- `reconciler.selectRenderProps` implements localIntent ▷ preview ▷ truth — aligns.
- `reconciler.transformIntentOnTruth` stub exists but does not reapply deltas when truth advances mid-gesture (required to avoid rubber-band feel).
- Status: Partially implemented; delta reapplication logic missing.

### 3) Presence & Cursor Labels
- Cursor publishing is throttled to ~90ms in `CanvasStage` — aligns with PRD guidance.
- Presence publishing uses a fixed color `#3b82f6`; spec expects stable per-user color assignment (not necessarily user-configurable).
- Status: Color assignment is simplistic; acceptable for Phase 1, but note deviation from “stable color assignment” nuance.

### 4) RTDB Payload Schemas (minor spec deviations)
- Cursors payload includes `userId` inside the value; Architecture schema shows keying by userId with `{ x, y, tool, at }` (no `userId` field).
- Editing payload uses `{ userId, at }`; Architecture shows `{ isEditing: true, at }`.
- Previews payload nests transform fields under `props` (e.g., `{ props: { x, y } }`); Architecture shows top-level `{ x?, y?, w?, h?, rotation? }`.
- Status: Functional but deviates from documented schema; recommend aligning or documenting the divergence.

### 5) Error Handling & Toasts
- PRD expects non-blocking toast on write failures and adopting saved truth.
- Code logs errors on `commitObject` failure without surfacing a toast.
- Status: Missing UI feedback.

### 6) Reconnection & Cleanup
- `onDisconnect()` usage present for presence/cursors/editing/previews — aligns.
- Explicit preview cleanup on gesture end publishes an empty props payload; should ensure previews are removed, not just set empty, to avoid ghost entries.
- Status: Consider `remove` on end, plus consumer TTL expiry (already present globally at 800ms).

### 7) Stale Diagnostics Import (build issue)
- `src/app/(app)/canvases/[canvasId]/page.tsx` imports `CanvasDiagnosticsRunner`, which does not exist and is not used (prop is passed `null`).
- Status: Remove the import to avoid build errors and keep aligned with the decision to avoid diagnostics overlays.

## Minor Inconsistencies / Nits (Phase 1)
- `PresenceLayer` overlays a “Preview” badge at preview location; PRD implies peers see object motion. Consider rendering an outline/ghost of the object instead of a label (optional polish).
- `PresenceLayer` screen-space conversion for cursors appears correct with `stagePos`/`stageScale`.

## Summary of Required Work (within completed Step 1–6 scope)
- Add preview publishing throttle/frame-gating; add consumer-side SEQ/TTL guards (prefer ~80–120ms and ignore stale/out-of-order).
- Implement delta reapplication in `transformIntentOnTruth` to prevent rubber-banding.
- Add user feedback for write failures via toast; ensure preview cleanup removes entries.
- Optional: align RTDB payload shapes to documented schemas or document the deviations; consider simple stable color assignment per user.

## Notes
- Resize, delete/duplicate, keyboard shortcuts, text, multi-select, and rotation are outside the currently completed steps and are not evaluated here.


