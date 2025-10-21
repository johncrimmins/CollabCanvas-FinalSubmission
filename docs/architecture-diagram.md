## CollabCanvas v5 — Architecture & Data Flows (Mermaid)

The diagrams below reflect the current implementation based on the code in `src/lib`, `src/store`, `src/hooks`, `src/components`, and `src/app`.

```mermaid
flowchart TD
  classDef note fill:#f8fafc,stroke:#cbd5e1,color:#334155;

  subgraph Context[App Context]
    CanvasIdProvider[CanvasIdProvider]
    CanvasStoreProvider[CanvasStoreProvider - Zustand]
  end

  subgraph Store[Zustand Store Slices]
    ObjectsSlice[objects.ts]
    UISlice[ui.ts]
    PresenceSlice[presence.ts]
    UndoSlice[undo.ts]
  end

  subgraph Hooks[Hooks]
    useSubs[useCanvasSubscriptions]
    useInteractions[useCanvasInteractions]
    useConn[useCanvasConnectionStatus]
  end

  subgraph UI[UI Components]
    Toolbar[Toolbar]
    CanvasStage[CanvasStage]
    ObjectsLayer[ObjectsLayer]
    PresenceLayer[PresenceLayer]
  end

  subgraph Lib[Lib and Utilities]
    firebase[firebase.ts]
    fsClient[fsClient.ts]
    rtdbClient[rtdbClient.ts]
    reconciler[reconciler.ts]
    validators[validators.ts]
  end

  subgraph Firebase[Firebase Services]
    Auth[Auth]
    FS[Firestore]
    RTDB[Realtime DB]
  end

  subgraph DataModels[Schemas - paths and fields]
    FSObjects[FS Objects schema]
    PresencePath[Presence path schema]
    CursorsPath[Cursors path schema]
    EditingPath[Editing path schema]
    PreviewsPath[Previews path schema]
  end

  subgraph RenderPriority[Render Priority - reconciler]
    Local[Local Intent]
    Preview[Preview]
    Truth[Truth]
  end

  %% Context wiring
  CanvasIdProvider --> CanvasStage
  CanvasStoreProvider --> UI
  CanvasStoreProvider --> Hooks

  %% UI uses hooks and store
  Toolbar --> UISlice
  CanvasStage --> UISlice
  CanvasStage --> useInteractions
  CanvasStage --> useConn
  ObjectsLayer --> UISlice
  ObjectsLayer --> ObjectsSlice
  ObjectsLayer --> PresenceSlice
  ObjectsLayer --> reconciler
  PresenceLayer --> PresenceSlice
  PresenceLayer --> UISlice

  %% Hooks interact with store and lib
  useSubs --> ObjectsSlice
  useSubs --> PresenceSlice
  useSubs --> fsClient
  useSubs --> rtdbClient

  useInteractions --> UISlice
  useInteractions --> ObjectsSlice
  useInteractions --> fsClient
  useInteractions --> rtdbClient

  useConn --> rtdbClient

  %% Lib depends on firebase services
  firebase --> Auth
  firebase --> FS
  firebase --> RTDB
  fsClient --> FS
  rtdbClient --> RTDB
  validators --> fsClient

  %% Data flow annotations (combined from user flows)
  FS -- truth snapshots --> useSubs
  RTDB -- presence, cursors, editing, previews --> useSubs
  useSubs -- debounced upserts --> ObjectsSlice
  useSubs -- hydrate --> PresenceSlice
  useInteractions -- localIntent, selection --> UISlice
  useInteractions -- commitObject, createObject, deleteObjects --> fsClient
  useInteractions -- publish preview and editing --> rtdbClient

  %% Render priority through reconciler
  Local -->|highest| reconciler
  Preview -->|fallback| reconciler
  Truth -->|last| reconciler
  reconciler --> ObjectsLayer

  %% Model linkage for reference
  FS --- FSObjects
  RTDB --- PresencePath
  RTDB --- CursorsPath
  RTDB --- EditingPath
  RTDB --- PreviewsPath
```

Notes
- Firestore documents parsed via `validators.ts` with Timestamp normalization.
- RTDB paths use `onDisconnect().remove()` for presence/cursors/editing/previews.
- `useCanvasSubscriptions` debounces object snapshots (~16ms) and prunes presence by TTL.
- `useCanvasInteractions` performs optimistic UI updates and transactional commits.


