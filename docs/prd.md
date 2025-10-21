

# CollabCanvas — Product Requirements Document (PRD)

**Product Requirements Document (PRD)** for CollabCanvas that **assumes @architecture-overview.md is the single source of truth for system design, data contracts, libraries, and module/APIs**. This PRD intentionally omits anything duplicated there and focuses on: product scope, UX, user flows, edge cases, acceptance criteria, phasing, and execution order.

**Reference:** System design, data contracts, routes, and interfaces are defined in the **Architecture doc (Option B: Firestore truth + RTDB signals + local-first store)**. This PRD specifies *what* the product must do and *how it behaves* from a product/UX perspective so engineers/designers can implement without guessing.

---

## 1) Objectives & Success Criteria

**Objectives**

* Enable small teams (4–5 collaborators) to create/edit shapes and text on a shared canvas with highly responsive, intuitive multiplayer behavior and reliable persistence.
* Keep the mental model simple: users see what they do instantly; others see a smooth preview and then the saved result shortly after.

**Measurable Success**

* Users complete a “draw → move → edit text → refresh → continue” session without confusion or state loss.
* Perceived responsiveness: interactions feel immediate to the actor; other users see motion feedback smoothly (no “teleporting”).
* Sessions with 300 simple objects remain smooth on typical laptops.

---

## 2) Scope (in vs. out)

**In**

* Authentication (Email/Password + Google), protected canvas routes.
* Presence (who’s online), named cursors, editing indicators.
* Canvas interactions: pan/zoom; create/move/resize/rotate rect/circle; create/edit text (final-only).
* Multi-select (drag selection box + shift-click).
* Delete, duplicate, and undo/redo (local).
* Predictable reconnection behavior (no ghost editing).

**Out**

* Keystroke-level text sync.
* CRDTs or custom conflict resolution beyond per-object version checks.
* AI features, layers panel, permissions management beyond owner + invited (unless clarified below).

---

## 3) Information Architecture (UI) & Navigation

**Routes (App Router)**

* `/auth` (public): Sign up / Log in.
* `/` (app): Canvas hub (Create/Open).
* `/canvases/[canvasId]` (app): The canvas screen (toolbar + stage + presence/cursors + inline text editing).

**Top-level UI Regions**

* **Toolbar**: selection tool, rectangle, circle, text; delete/duplicate; undo/redo.
* **Stage**: infinite-feel workspace (smooth pan/zoom), objects, inline text editor overlay.
* **Presence layer**: cursors + name labels; per-object “editing” indicators as needed.

---

## 4) User Flows (happy paths + variants)

### 4.1 Authentication & Entry

1. User visits `/auth`, chooses Email or Google, signs in.
2. Redirect to `/` hub. User:

   * Creates a new canvas → gets sent to `/canvases/[canvasId]`, or
   * Enters an existing canvas ID/URL → goes to that page.
     **Variant:** If unauthenticated and visiting a canvas URL, redirect to `/auth` then back to the canvas on success.

### 4.2 Presence & Cursors

1. On entering a canvas, user appears in presence list; name color is assigned or recalled.
2. Cursor position broadcasts at short intervals; other users see the cursor with the user’s name label.
3. When the user leaves or disconnects, presence disappears shortly (server cleanup handles unexpected drops).

### 4.3 Create Objects

1. Select a tool (Rectangle/Circle/Text).
2. Click (or click-drag) to create object(s).
3. The object appears locally instantly; others see it shortly after (truth).

### 4.4 Select & Multi-select

1. Click an object to select; shift-click to add/remove from selection.
2. Drag on empty space to draw a selection marquee (select all intersecting objects).
3. Selection state is *local-only* (not broadcast).

### 4.5 Transform (Move/Resize/Rotate)

1. With object(s) selected, drag handles or the object to transform.
2. **Actor**: sees immediate updates (local); **Peers**: see smooth *previews* during the drag and the final *truth* shortly after gesture ends.
3. Rotation control (handle or keyboard shortcut) applies similarly with previews.

### 4.6 Text Editing (final-only)

1. Double-click a text object (or hit Enter while selected) to open an inline editor overlay.
2. Edit text locally. Others see only an “editing” indicator on that object.
3. On **Enter** or when the editor **loses focus (blur)**, commit the final text. The overlay closes; everyone sees the saved string.

### 4.7 Delete / Duplicate

* **Delete**: Remove selected objects; this is immediate locally and then saved; others see the deletion.
* **Duplicate**: Clone selected objects with a small offset; new objects appear and save.

### 4.8 Undo / Redo (local intent)

* Undo only affects the local user’s history. Redo re-applies the change and re-saves as needed.

### 4.9 Reconnection & Refresh

* Refresh or temporary disconnect:

  * On reload, the canvas restores from saved truth quickly; short in-flight edits may be lost (by design).
  * Editing flags and previews for the disconnected user are cleared by the server.

---

## 5) Edge Cases & Required Behaviors

**E1: Simultaneous edits on the same object**

* Two users change the same object in quick succession. The saved result is whichever transaction lands last (version check).
* UI must avoid “rubber-band” feeling: apply saved truth with a small debounce; for the actor, re-apply local deltas if still dragging.

**E2: Multi-select across many objects**

* Preview traffic can spike. System should adapt (throttle based on velocity, frame-gate publishes, optionally switch to centroid-only preview if selection is very large). Final truth persists *all* objects on gesture end.

**E3: Mid-gesture refresh**

* If the actor refreshes while dragging, peers should not be left with stale “editing” or “preview” signals. Server-side disconnect cleanup ensures these clear.

**E4: Text editing loss-of-focus**

* If user clicks outside or tabs away, editor blurs → commit current text as final. If commit fails (rare), keep the editor open with an inline error.

**E5: Preview staleness**

* If a preview update is not refreshed within its TTL (~0.4–0.6 s), stop showing it and fall back to truth. Prevents stuck “ghost” positions.

**E6: Out-of-order preview packets**

* Preview updates carry a per-gesture SEQ; ignore any update whose SEQ ≤ last seen to prevent jitter.

**E7: Permission failures / missing canvas**

* If the canvas doesn’t exist or the user lacks access, show a clear error and a link back to `/`.

**E8: Mobile or small screens (optional for now)**

* Basic pan/zoom/selection should still function; complex multi-select may be limited. (Confirm scope below.)

**E9: Slow network**

* Actor still sees local responsiveness; peers may see chunkier previews; truth eventually lands. No UI lock-ups.

**E10: Duplicate hotkeys and conflicts**

* If a system-level hotkey conflicts (e.g., Ctrl+W), avoid intercepting it. Provide alternative shortcut or toolbar action.

---

## 6) Interaction & Behavior Specs

**Canvas**

* Pan with middle-mouse drag or space+drag; scroll to zoom centered at cursor.
* Zoom clamped to reasonable bounds (e.g., 10%–800%).
* Pan/zoom must not increase object subscription load or re-render entire stage unnecessarily.

**Selection**

* Visible handles on selection; group handle affordances appear for multi-select.
* Selection highlight must be obvious but not intrusive.

**Previews**

* Show smooth motion for peers during transforms (position/size/rotation).
* Fade out quickly on gesture end or on TTL expiry.

**Text**

* Double-click or Enter to edit; when editing, dim/hide Konva text and show overlay editor with correct font metrics alignment.
* Commit on Enter/blur; Esc cancels and restores last saved text.

**Presence & Cursors**

* Cursor label shows display name; color persists for the session/canvas.
* Overlapping cursors: top-most or last moved cursor renders above, labels avoid heavy overlap.

**Errors**

* Write failures (e.g., version mismatch after multiple retries) show a non-blocking toast and the UI adopts saved truth.

---

## 7) Non-functional Requirements

**Performance**

* Maintain smooth interactions (60 FPS feel) for 300 simple objects with 4–5 users.
* Cursor updates feel real-time; previews look smooth; truth arrives acceptably soon afterward.

**Resilience**

* No stale editing/preview artifacts after disconnects.
* Refreshing never breaks future edits; the canvas always loads.

**Accessibility**

* Keyboard navigability for selection, deleting, and basic transforms where possible.
* Visible focus states and sufficient color contrast for labels and controls.

---

---

## 9) Phasing (Iterative Build Plan)

> Each phase is **shippable** and builds directly on the prior. Dependencies are ordered to minimize rework.

### **Phase 1 — Core Collaborative Canvas**

**Scope**

* Auth routes and guard.
* Canvas page shell with providers.
* Presence & cursors (RTDB).
* Create rectangle & circle; single-select; move/resize; delete; duplicate.
* RTDB previews during transform; Firestore commit on gesture end.
* Reconnection behavior; onDisconnect cleanup; preview TTL/SEQ.
* Undo/redo (local).

**Done Criteria**

* 2+ users can join the same canvas, see each other’s presence/cursors, create and manipulate shapes with previews and reliable final saves.
* Refresh does not leave ghost editing/previews; canvas reloads cleanly.

**Dependencies**

* All: relies on auth + store + subscriptions + reconciler baseline.

### **Phase 2 — Text & Multi-Select Polish**

**Scope**

* Text object with inline editor overlay (commit on Enter/blur; editing indicator).
* Multi-select marquee and shift-click; group transforms with preview fan-out protections (adaptive throttle, frame-gate, centroid fallback for very large selections).
* Rotation handles for shapes (with previews).
* Keyboard shortcuts (delete/duplicate/undo/redo) and toolbar polish.

**Done Criteria**

* Text editing is reliable and intuitive; peers see editing state and then final text.
* Multi-select transforms remain smooth and do not blow RTDB budgets.
* Rotation behaves like move/resize with previews and final save.
* Shortcuts and toolbar actions mirror each other with no surprises.

---

## 10) Specific Feature Implementation Details

1. **Canvas access model:** Every authenticated user is allowed to open any canvas by ID (unlisted link)
2. **Text editor richness:** Plain text only (single style) is assumed. No rich text formatting.
4. **Rotation:** Included for all objects in phase 2. 
5. **Selection marquee behavior:** Intersect when dragging box
6. **Cursor labels:** Preferred naming rule: displayName from auth and stable color assignment (per user assigned randomly; no ability to change color).
7. **Undo/redo persistence:** Persist to Firebase native IndexedDB so reload preserves local history
8. **Large multi-select preview strategy:** Use “centroid-only preview” for very large selections (to cap RTDB fan-out)
9. **Deletion safeguards:** Prompt on deleting >25 selected objects 
10. **Error messaging tone:** Minimal user-friendly language

---

## 11) Acceptance Criteria (Phase-level)

**Phase 1**

* Auth flow works; unauthorized users redirected to `/auth`.
* Two browsers can concurrently view and edit: presence/cursors are visible within ~100ms feel; previews look smooth; final positions/size persist.
* No stale editing/preview markers after closing a tab or losing connection.
* Canvas reload restores prior saved state.

**Phase 2**

* Text: double-click to edit; commit on Enter/blur; peers see final text; editing indicator shows while typing.
* Multi-select: marquee + shift-click; transforms preview smoothly; large selections do not spike RTDB excessively (adaptive throttling observed in logs).
* Rotation: preview + commit matches move/resize behavior.
* Shortcuts and toolbar actions mirror each other with no surprises.

---
