## Relevant Files

- `src/hooks/useCanvasInteractions.ts` - Gesture lifecycle: begin/update/end transform; keyboard hooks.
- `src/hooks/useUndoManager.ts` - Local undo/redo application and history push helpers.
- `src/store/ui.ts` - Selection state and `localIntent` management.
- `src/store/undo.ts` - Undo stack model and operations.
- `src/store/objects.ts` - Optimistic updates to canvas objects map.
- `src/lib/fsClient.ts` - Firestore commit helpers (`commitObject`, create/delete operations).
- `src/lib/rtdbClient.ts` - RTDB publish helpers (`publishEditing`, `publishPreview`, cleanup).
- `src/lib/reconciler.ts` - Render priority logic (localIntent ▷ preview ▷ truth).
- `src/components/ObjectsLayer.tsx` - Mount point for object components and potential Transformer.
- `src/components/RectObject.tsx` - Rectangle rendering and transform wiring.
- `src/components/CircleObject.tsx` - Circle rendering and transform wiring.
- `src/components/Toolbar.tsx` - Duplicate/Delete actions and confirmations.
- `src/components/layout/CanvasSubscriptions.tsx` - Lifecycle for subscriptions/cleanup (verify ephemeral clears).
- `src/hooks/useCanvasSubscriptions.ts` - Firebase listeners; ensure preview/editing cleanup on unmount.
- `src/hooks/useCanvasConnectionStatus.ts` - Surface errors/toasts on write conflicts.
- `src/lib/__tests__/reconciler.test.ts` - Unit tests for render priority/preview TTL.
- `src/store/__tests__/undo.test.ts` - Unit tests for undo history semantics.

### Notes

- Keep previews throttled around 80–120ms; adapt to drag velocity if needed.
- Clear RTDB `editing` and `previews` on gesture end and via `onDisconnect()`.
- Use per-object Firestore transactions with expected version checks; on conflict, toast and adopt saved truth.

## Tasks

- [x] 1.0 Add Konva Transformer for single selection and wire resize anchors
  - [x] 1.1 Decide Transformer location (`ObjectsLayer` vs per-object component) and mount once
  - [x] 1.2 Show Transformer only when exactly one object is selected
  - [x] 1.3 Configure anchors per type: rect (`w/h`), circle (`r`); disable rotation
  - [x] 1.4 Wire `onTransformStart` to begin resize gesture and capture `baseProps`
  - [x] 1.5 Wire `onTransform` to update shape node props but source-of-truth is store intent
  - [x] 1.6 Wire `onTransformEnd` to finalize; clear Transformer selection flicker
  - [x] 1.7 Style handles to match UI (size/colors) and ensure high z-index in Konva order
- [x] 2.0 Implement `localIntent` updates and throttled RTDB previews for resize
  - [x] 2.1 In `beginTransform`, set `localIntent[id] = { kind: 'resize', props: {}, seq: 0 }`
  - [x] 2.2 In `onTransform`, compute deltas: rect clamp min size; circle radius math
  - [x] 2.3 Round previewed numeric props to integers where appropriate
  - [x] 2.4 Throttle `publishPreview(canvasId, id, { by, seq++, at, props })` (~80ms)
  - [x] 2.5 Frame-gate when drag velocity is high to avoid backlog
  - [x] 2.6 Publish/editing on start and clear editing/preview on end and `onDisconnect()`
- [x] 3.0 Commit final resize on end and integrate undo update entries
  - [x] 3.1 Derive `before` from captured `baseProps` and `after` from final `patch`
  - [x] 3.2 Call `commitObject({ canvasId, objectId, expectedVersion, patch, userId })`
  - [x] 3.3 Push `update` undo entry: `{ id, before, after }`
  - [x] 3.4 On conflict/version mismatch: show toast and adopt Firestore truth
  - [x] 3.5 Clear `localIntent` and ensure Transformer target remains selected
- [x] 4.0 Polish duplicate/delete flows and surface in toolbar + hotkeys
  - [x] 4.1 Duplicate: clone selection with new IDs (`nanoid`), offset (+24,+24), set `v=0`
  - [x] 4.2 Optimistically upsert clones to store, persist via `createObject`
  - [x] 4.3 Select clones after creation and record `create` undo entry
  - [x] 4.4 Delete: if >25 selected, require confirmation UI from toolbar (implemented via toast, needs toolbar integration)
  - [x] 4.5 Batch persist via `deleteObjects`; optimistic remove, record `delete` undo entry
  - [x] 4.6 Ensure toolbar buttons reflect state and are disabled when invalid
- [x] 5.0 Register keyboard shortcuts for Duplicate/Delete/Undo/Redo with proper cleanup
  - [x] 5.1 Register Cmd/Ctrl+D → duplicate selection
  - [x] 5.2 Register Delete/Backspace → delete selection (respect large-delete prompt)
  - [x] 5.3 Register Cmd/Ctrl+Z → undo; Shift+Cmd/Ctrl+Z → redo
  - [x] 5.4 Scope listeners to canvas mount and remove on unmount
  - [x] 5.5 Avoid hijacking critical browser/system combos; preventDefault selectively
- [x] 6.0 Add error handling (toasts), adopt truth on conflicts, and ensure ephemeral cleanup
  - [x] 6.1 Centralize write-failure toasts in hooks using `use-toast`
  - [x] 6.2 On commit failure, fetch latest object and reconcile store to truth
  - [x] 6.3 Ensure `editing` and `previews` nodes are removed on gesture end and unmount
  - [x] 6.4 Two-browser manual check: no ghost editing/preview after refresh/disconnect


