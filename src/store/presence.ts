// src/store/presence.ts - Zustand slice for real-time presence, cursors, editing, and previews.
import { type StateCreator } from "zustand";
import type {
  CanvasStoreState,
  PresenceSlice,
  PeerPresence,
  CursorState,
  EditingState,
  PreviewState,
} from "@/store/types";

const TTL_DEFAULT_MS = 800;

function prunePresenceEntries<T extends { at: number }>(
  map: Record<string, T>,
  cutoff: number
) {
  for (const [key, value] of Object.entries(map)) {
    if (value.at < cutoff) {
      delete map[key];
    }
  }
}

export const createPresenceSlice: StateCreator<
  CanvasStoreState,
  [["zustand/immer", never]],
  [],
  PresenceSlice
> = (set) => ({
  peers: {},
  cursors: {},
  editing: {},
  previews: {},
  hydratePeers: (peers: Record<string, PeerPresence>) => {
    set((state) => {
      state.peers = peers;
    });
  },
  hydrateCursors: (cursors: Record<string, CursorState>) => {
    set((state) => {
      state.cursors = cursors;
    });
  },
  hydrateEditing: (editing: EditingState) => {
    set((state) => {
      state.editing = editing;
    });
  },
  hydratePreviews: (previews: PreviewState) => {
    set((state) => {
      state.previews = previews;
    });
  },
  pruneByTTL: (ttlMs: number = TTL_DEFAULT_MS, now = Date.now()) => {
    const cutoff = now - ttlMs;
    set((state) => {
      prunePresenceEntries(state.peers, cutoff);
      prunePresenceEntries(state.cursors, cutoff);
      for (const [objectId, editors] of Object.entries(state.editing)) {
        prunePresenceEntries(editors, cutoff);
        if (!Object.keys(editors).length) {
          delete state.editing[objectId];
        }
      }
      prunePresenceEntries(state.previews, cutoff);
    });
  },
  resetPresence: () =>
    set({
      peers: {},
      cursors: {},
      editing: {},
      previews: {},
    }),
});

