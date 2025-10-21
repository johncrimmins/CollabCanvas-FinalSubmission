# Canvas Shell QA Checklist (Task 2)

Use this checklist to verify the Canvas Page Shell infrastructure.

## Prerequisites
- Firebase project configured and `.env.local` set (see `FIREBASE-SETUP.md` and `ENV.md`).
- Can sign in via `/auth`.

## Steps

1) Auth Guard
- Navigate to `/canvases/test-canvas` while signed out → redirected to `/auth`.
- Sign in → redirected to dashboard, then open `/canvases/test-canvas`.

2) Providers Mount
- Page loads without errors.
- Open console → no runtime errors.
- `CanvasDiagnosticsRunner` logs group with object and peer counts.

3) Store Initialization
- Diagnostics panel shows `Objects: 0`, `Peers: 0` initially.
- No React warnings about context/store.

4) Connection Indicator
- Indicator reflects RTDB connection (connected shortly after load).
- Disconnect network and reconnect → indicator updates accordingly.

5) Layout Composition
- `Toolbar` visible in header.
- `CanvasStage` placeholder message visible.
- `PresenceLayer` overlay mounted (non-interactive layer).
- Diagnostics panel appears centered at the bottom.

6) Stability
- Refresh page → shell re-renders cleanly.
- Navigate away and back → no duplicated listeners or memory leaks apparent.

## Pass Criteria
- All steps above behave as expected without errors.
- Visual layout matches the premium aesthetic.

## Notes
- Functional object rendering, presence, and interactions are covered in subsequent tasks.
