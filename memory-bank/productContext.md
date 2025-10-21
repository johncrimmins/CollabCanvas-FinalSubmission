# CollabCanvas — Product Context

## Why This Product Exists
Collaborative design tools often suffer from:
- Laggy interactions that break creative flow
- Confusing conflict states when multiple users edit simultaneously
- Lost work after refresh or network interruptions
- Complex mental models that require extensive onboarding

CollabCanvas addresses these issues with a simple, predictable model where users immediately see their own changes while peers see smooth previews followed by authoritative final state.

## Problems We Solve

### 1. Responsiveness Gap
**Problem**: In many collaborative tools, local actions feel sluggish because they wait for server confirmation.
**Solution**: Local-first architecture where the actor sees instant feedback; writes happen asynchronously.

### 2. State Confusion
**Problem**: Users lose track of who's editing what, leading to accidental overwrites and frustration.
**Solution**: Clear visual indicators (cursors, editing badges, smooth previews) show what peers are doing in real-time.

### 3. Data Loss on Refresh
**Problem**: Refreshing the browser mid-edit can lose in-flight changes.
**Solution**: Firestore as authoritative truth combined with `onDisconnect()` cleanup ensures peers never see stale artifacts; actors lose at most their current in-flight gesture (by design, to keep the model simple).

### 4. Conflict Chaos
**Problem**: Simultaneous edits on the same object create unpredictable results.
**Solution**: Per-object versioning with optimistic transactions; last-write-wins is explicit and predictable.

## How It Should Work (User Mental Model)

### Core Principle
"I see what I do instantly; others see me smoothly; we all converge quickly."

### Key User Flows

#### Authentication & Entry
1. User signs in via Email or Google at `/auth`
2. Redirected to dashboard where they can create or join a canvas by ID
3. Canvas loads with all previously saved objects visible

#### Presence Awareness
- Each user appears in a presence list with an assigned color
- Cursors display user names and follow mouse position in near-real-time
- Editing indicators show when someone is actively transforming or editing an object

#### Object Creation & Manipulation
1. Select a tool (Rectangle/Circle/Text) from toolbar
2. Click/drag to create → object appears instantly for actor, shortly after for peers
3. Select object(s) and drag/resize/rotate → smooth local updates + preview for peers
4. On gesture end → authoritative save to Firestore; everyone converges to same state

#### Multi-Select
- Click empty space and drag to create selection marquee
- Shift-click to add/remove objects from selection
- Transform entire selection together with smart preview throttling for large selections

#### Text Editing
- Double-click text object or press Enter while selected
- Inline editor appears; peers see "editing" indicator
- Commit on Enter or blur → final text saved and visible to all
- ESC cancels and restores previous text

#### Undo/Redo
- Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo
- Local-only (doesn't undo other users' changes)
- Persists across refresh via IndexedDB

#### Reconnection
- Temporary disconnect: previews and editing indicators auto-clear
- On refresh: canvas reloads from Firestore truth cleanly
- Connection status visible in UI

## User Experience Goals

### Performance Feel
- **Instant**: Actor's interactions render at full 60 FPS with zero perceived lag
- **Smooth**: Peer previews interpolate at high frequency (80-120ms updates, lower during high velocity)
- **Eventual**: Final truth arrives within acceptable delay after gesture ends

### Predictability
- Refreshing never creates chaos; canvas always loads correctly
- Ghost objects or stale editing indicators never persist
- Conflicts resolve last-write-wins; no mysterious merge behavior

### Simplicity
- Minimal learning curve: familiar canvas tools (select, shapes, text)
- No complex permissions model (authenticated users can access any canvas by ID)
- Clear visual feedback for all collaborative states

### Design Aesthetic & Visual Language
CollabCanvas embodies a premium, creative-team friendly aesthetic that is:
- **Creative-team friendly**: Approachable, inspiring interface that encourages collaboration
- **High aesthetic**: Premium visual quality with attention to every detail
- **Collaborative**: Warm, inviting, team-oriented feel that brings people together
- **Aspirational but accessible**: Sophisticated and polished yet easy to use and welcoming
- **Sleek, modern, and elegant**: Clean lines, generous whitespace, smooth transitions
- **Never cluttered or corporate**: Minimal chrome, focused content, no busy interfaces

#### Visual Design Principles
- **Typography**: Modern sans-serif (e.g., Inter) with clear hierarchy
- **Spacing**: Generous whitespace, consistent spacing scale (4, 8, 16, 24, 32, 48, 64px)
- **Color**: Warm, inviting palette that avoids cold corporate tones
- **Depth**: Subtle shadows and layering for visual interest
- **Motion**: Polished animations (200-300ms transitions) that feel smooth and intentional
- **Components**: Contemporary styling with rounded corners, borderless or minimal borders
- **Interactions**: Playful but professional micro-interactions that delight without distracting

## Edge Case Behaviors

### Simultaneous Edits
Two users edit same object → last transaction wins; UI may briefly flicker to truth but no corruption occurs.

### Large Multi-Select
100+ objects selected and transformed → system adapts with throttled previews or centroid-only preview mode to protect RTDB bandwidth.

### Mid-Gesture Refresh
Actor refreshes while dragging → peers see preview clear; actor's in-flight change is lost (acceptable trade-off for simplicity).

### Slow Network
Actor still sees local responsiveness; peers may see chunkier preview updates; final truth eventually syncs.

### Text Editor Blur
Clicking outside text editor commits current text; failures show inline error and keep editor open.

### Preview Staleness
If a preview isn't refreshed within TTL (400-600ms), it fades and system falls back to truth only.

## Non-Functional UX Requirements

### Accessibility
- Keyboard navigation for selection, delete, duplicate, undo/redo
- Visible focus states on all interactive elements
- Sufficient color contrast for labels and controls

### Error Handling
- Write failures show non-blocking toast notification
- UI automatically adopts authoritative truth on conflict
- Permission errors show clear message with link back to dashboard

### Visual Polish
- Selection handles are obvious but not intrusive
- Cursor labels avoid heavy overlap through smart positioning
- Transform previews fade smoothly on gesture end

## Success Metrics
- Zero user-reported data loss incidents
- 95%+ of gestures complete with smooth preview rendering
- Sub-150ms perceived latency for cursor updates
- Canvas loads in under 2 seconds for 300 objects

