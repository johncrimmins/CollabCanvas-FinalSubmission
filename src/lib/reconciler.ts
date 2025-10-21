import type { CanvasObject } from "@/lib/types";
import type {
  CanvasStoreState,
  LocalIntentState,
  PreviewState,
} from "@/store/types";

export interface RenderProps {
  object: CanvasObject;
  derivedProps: CanvasObject["props"];
  source: "localIntent" | "preview" | "truth";
}

const DEFAULT_DEBOUNCE_MS = 16;

export function selectRenderProps(
  object: CanvasObject,
  localIntent: LocalIntentState,
  previews: PreviewState
): RenderProps {
  const localEntry = localIntent[object.id];
  if (localEntry) {
    return {
      object,
      derivedProps: {
        ...object.props,
        ...localEntry.props,
      },
      source: "localIntent",
    };
  }

  const preview = previews[object.id];
  if (preview) {
    return {
      object,
      derivedProps: {
        ...object.props,
        ...preview.props,
      },
      source: "preview",
    };
  }

  return {
    object,
    derivedProps: object.props,
    source: "truth",
  };
}

export function applyFirestoreSnapshot(
  state: CanvasStoreState,
  objects: CanvasObject[]
) {
  // Replace objects map to reflect deletions
  state.setAll(objects);
}

export function transformIntentOnTruth(
  objectId: string,
  latestTruth: CanvasObject,
  localIntent: LocalIntentState
) {
  const entry = localIntent[objectId];
  if (!entry) return;
  localIntent[objectId] = {
    ...entry,
    props: {
      ...entry.props,
      // Additional reconciliation can be added here in later tasks
    },
  };
}

export function debounceDuration(): number {
  return DEFAULT_DEBOUNCE_MS;
}

