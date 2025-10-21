Description: Feature PRD for Phase 1 Steps 7–8 (Resize & Duplicate; Undo/Redo)
Globs: src/hooks/**/*.{ts,tsx}, src/components/**/*.{ts,tsx}, src/store/**/*.{ts,tsx}, src/lib/**/*.{ts,tsx}

---

## Feature: Step 7 — Resize & Duplicate, Step 8 — Undo/Redo (Local)

This rule defines the minimal, production-ready scope to complete Phase 1 Steps 7 and 8 quickly, aligned with the architecture overview and product PRD. It is tailored to the current implementation state found in:
- hooks: `useCanvasInteractions.ts`, `useUndoManager.ts`
- store: `undo.ts`, `ui.ts`, `types.ts`
- lib: `fsClient.ts`, `rtdbClient.ts`, `reconciler.ts`
- components: `RectObject.tsx`, `CircleObject.tsx`, `ObjectsLayer.tsx`, `Toolbar.tsx`

References:
- @docs/architecture-overview.md
- @docs/prd.md
- @memory-bank/activeContext.md

---

### 1) Scope (What we will ship now)

- Step 7 (Resize & Duplicate)
  - Visible resize handles for selected object(s) using Konva Transformer.
  - Resize gesture integrates with existing localIntent ▷ preview ▷ truth loop.
  - RTDB previews published during resize (throttled). Firestore commit on gesture end.
  - Duplicate action (toolbar + Cmd/Ctrl+D) creates offset clones and selects them.
  - Delete action (Delete/Backspace) with prompt when >25 objects selected.

- Step 8 (Undo/Redo — local only)
  - Local undo/redo of create, delete, and update (move/resize) operations.
  - Keyboard shortcuts: Cmd/Ctrl+Z (undo), Shift+Cmd/Ctrl+Z (redo).
  - History cap (100). Optional persistence may be added later.

Out of scope for this step: Text editing, rotation, marquee multi-select and group transforms beyond what already exists. Those are covered in Phase 2.

---

### 2) Data Contracts (align with current code)

- Firestore (durable): `commitObject({ canvasId, objectId, expectedVersion, patch, userId })` performs per-object transaction; `v == expectedVersion` → merge `patch` into `props`, bump `v`, set `updatedBy/At`.

- RTDB (ephemeral):
  - `editing/{objectId}/{userId}`: `{ userId, at }` during active gesture; cleared on end and via `onDisconnect().remove()`.
  - `previews/{objectId}`: Preview entry includes `{ by, seq, at, props }` where `props` is `Partial<CanvasObject["props"]>`. This matches `PreviewStateEntry` in `src/store/types.ts`. TTL/SEQ guards are applied on the consumer side.

Note: The architecture overview shows flattened preview fields; implementation uses a `props` bag for clarity and parity with `localIntent`. Both represent the same ephemeral delta concept.

---

### 3) Interaction Model (single or multi selection)

- PointerDown on selected object(s):
  - Set `ui.localIntent[id] = { kind: 'move' | 'resize', props: {}, seq: 0 }`.
  - `publishEditing(canvasId, id, userId, true)` for each acted-on object.

- PointerMove during transform:
  - Update localIntent deltas for each selected object.
  - Throttled `publishPreview(canvasId, id, { by, seq:++, at, props })` with only changed, rounded props.

- PointerUp:
  - Commit final deltas to Firestore via `commitObject` per object.
  - Clear localIntent and RTDB editing/preview entries.
  - Push an `update` operation to undo history with entries `{ id, before, after }` (computed from gesture baseProps vs final patch).

Keyboard:
- Delete/Backspace → delete selected (prompt if >25), push `delete` operation to undo history.
- Cmd/Ctrl+D → duplicate selected with offset, push `create` operation to undo history.
- Cmd/Ctrl+Z → undo last local operation.
- Shift+Cmd/Ctrl+Z → redo last undone operation.

---

### 4) Resize Specification

- Konva Transformer is shown when exactly one object is selected; anchors adjust size (`w/h` for rect, `r` for circle). Rotation is out-of-scope in Step 7.
- Resize math:
  - Rect: anchors update `w` and/or `h` with min size clamp; reposition if resizing from top/left to preserve the opposite anchor.
  - Circle: anchors produce a radius change; `r = max(minR, computedR)`.
- During drag:
  - Update `localIntent[id].props` with the live size delta.
  - `publishPreview` with updated props (throttled ~80 ms; adjust when velocity is high).
- On end:
  - Compute `before` from `baseProps` and `after` from final `patch`, then `commitObject` and `undoManager.pushUpdate([{ id, before, after }])`.

---

### 5) Duplicate & Delete

- Duplicate:
  - Clone current selection with new IDs (`nanoid`), offset by (+24, +24), set `v=0` and `updatedBy/At`.
  - Persist via `createObject`; optimistically upsert and re-select clones.
  - Record `create` in undo history.

- Delete:
  - For ≤25 objects: batch delete; for >25: require explicit confirmation in toolbar.
  - Persist via `deleteObjects` and optimistically remove from store.
  - Record `delete` in undo history with the deleted objects payload.

---

### 6) Undo/Redo Semantics (local-only)

- History Model (`store/undo.ts`): bounded stack (MAX_HISTORY=100) with pointer; operations are one of:
  - `create`: `objects: CanvasObject[]`
  - `delete`: `objects: CanvasObject[]`
  - `update`: `entries: { id, before, after }[]`

- Application (`useUndoManager.ts`):
  - `undo()`
    - create → applyDelete
    - delete → applyCreate
    - update → applyUpdate(entries, useAfter=false) // uses `before`
  - `redo()`
    - create → applyCreate
    - delete → applyDelete
    - update → applyUpdate(entries, useAfter=true) // uses `after`

- All applications are optimistic to the store and then persisted through `fsClient` helpers; conflicts surface as toasts and the UI adopts saved truth.

---

### 7) Acceptance Criteria

- Step 7 (Resize & Duplicate)
  - Selecting a rect/circle shows appropriate resize handles.
  - Dragging handles updates size locally and publishes RTDB previews; peers see smooth updates.
  - Releasing the drag persists final size with correct version bump.
  - Duplicate (toolbar + Cmd/Ctrl+D) creates offset clones and selects them.
  - Delete works via Delete/Backspace; prompt is shown when >25 objects.
  - No ghost `editing`/`preview` after gesture end or disconnect.

- Step 8 (Undo/Redo)
  - Undo/redo works for create, delete, and move/resize update operations.
  - Keyboard shortcuts function correctly and never hijack system-critical combos.
  - History is capped at 100; redo stack is cleared on new push.
  - Conflicts (e.g., version mismatch) show a toast and converge to saved truth.

---

### 8) Implementation Tasks (concrete, minimal)

1) Resize handles
   - Introduce Konva Transformer for selected single object inside object components or `ObjectsLayer`.
   - Wire anchor drag events to `useCanvasInteractions` resize mode: `beginTransform(object, pointer, 'resize')`, `updateTransform(id, { w/h or r })`, `endTransform(...)`.

2) Local intent and preview
   - Ensure `updateLocalIntent` carries only changed props; round values to integers for preview publishing when appropriate.
   - Keep throttling at ~80ms by default; frame-gate when drag velocity is high.

3) Commit + undo history for transforms
   - In `endTransform`, compute `before/after` for each object from `state.baseProps` and `nextPropsById`.
   - Call `undoManager.pushUpdate(entries)` before/after committing (recording the intended change).

4) Duplicate and delete polish
   - Keep current implementations; ensure toolbar buttons surface these alongside hotkeys.
   - Confirm destructive prompt for >25 deletions exists in UI (toast + toolbar confirm).

5) Keyboard shortcuts
   - Verify Cmd/Ctrl+D, Delete/Backspace, Cmd/Ctrl+Z, Shift+Cmd/Ctrl+Z are registered once at canvas mount (and cleaned up on unmount).

6) Error handling & UX
   - On write failure, show non-blocking toast and adopt Firestore truth.
   - Clear RTDB `editing` and `previews` on gesture end and via `onDisconnect()`.

---

### 9) Testing Plan (targeted)

- Unit: `store/undo.ts` push/undo/redo behavior; `useUndoManager.applyUpdate` patch selection for `before/after`.
- Integration: gesture flow publishes editing/preview; end commits; undo/redo round-trip through Firebase clients without UI desync.
- Manual:
  - Two-browser session: verify smooth previews and convergence.
  - Mid-gesture refresh: no ghost editing/preview remains.
  - Large delete confirmation triggers appropriately.

---

### 10) Done Checklist

- Resize works for rect/circle with previews and commit-on-end.
- Duplicate and delete work via toolbar and keyboard; >25 delete prompt enforced.
- Undo/redo functions for create/delete/update and passes manual tests.
- No stale RTDB ephemeral entries after disconnect.
- Shortcuts do not conflict with critical system shortcuts.

---
description: Guide for generating a detailed Product Requirements Document (PRD) based on user prompts
globs: **/tasks/**/*.md, **/prd-*.md
---

# Rule: Generating a Product Requirements Document (PRD)

// Description: Guide for generating a detailed Product Requirements Document (PRD) based on user prompts
// Recommended Globs: **/tasks/**/*.md, **/prd-*.md

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out).
3.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4.  **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions (Examples)

The AI should adapt its questions based on the prompt, but here are some common areas to explore:

*   **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
*   **Target User:** "Who is the primary user of this feature?"
*   **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
*   **User Stories:** "Could you provide a few user stories? (e.g., As a [type of user], I want to [perform an action] so that [benefit].)"
*   **Acceptance Criteria:** "How will we know when this feature is successfully implemented? What are the key success criteria?"
*   **Scope/Boundaries:** "Are there any specific things this feature *should not* do (non-goals)?"
*   **Data Requirements:** "What kind of data does this feature need to display or manipulate?"
*   **Design/UI:** "Are there any existing design mockups or UI guidelines to follow?" or "Can you describe the desired look and feel?"
*   **Edge Cases:** "Are there any potential edge cases or error conditions we should consider?"

## PRD Structure

The generated PRD should include the following sections:

1.  **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2.  **Goals:** List the specific, measurable objectives for this feature.
3.  **User Stories:** Detail the user narratives describing feature usage and benefits.
4.  **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5.  **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.
6.  **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7.  **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8.  **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").
9.  **Open Questions:** List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/tasks/`
*   **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD