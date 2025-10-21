import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp,
  setDoc,
  type SnapshotOptions,
  type FirestoreError,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  canvasObjectPatchSchema,
  canvasObjectSchema,
  parseCanvasObjectDoc,
  type CanvasObject,
} from "@/lib/validators";
type Unsubscribe = () => void;

export class CommitVersionMismatchError extends Error {
  constructor(public readonly currentVersion: number) {
    super("Canvas object version mismatch");
    this.name = "CommitVersionMismatchError";
  }
}

export class CommitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommitValidationError";
  }
}

export interface CommitObjectOptions {
  canvasId: string;
  objectId: string;
  expectedVersion: number;
  patch: unknown;
  userId: string;
}

export async function commitObject({
  canvasId,
  objectId,
  expectedVersion,
  patch,
  userId,
}: CommitObjectOptions) {
  const parsedPatch = canvasObjectPatchSchema.safeParse(patch);
  if (!parsedPatch.success) {
    throw new CommitValidationError(parsedPatch.error.message);
  }

  const objectRef = doc(db, "canvases", canvasId, "objects", objectId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(objectRef);
    if (!snapshot.exists()) {
      throw new CommitValidationError("Object does not exist");
    }
    const data = parseCanvasObjectDoc(snapshot.id, snapshot.data());
    if (data.v !== expectedVersion) {
      throw new CommitVersionMismatchError(data.v);
    }

    transaction.update(objectRef, {
      props: { ...data.props, ...parsedPatch.data },
      v: data.v + 1,
      updatedBy: userId,
      updatedAt: serverTimestamp(),
    });
  });
}

export interface CreateObjectOptions {
  canvasId: string;
  object: CanvasObject;
}

export async function createObject({ canvasId, object }: CreateObjectOptions) {
  // Validate before write
  const parsed = canvasObjectSchema.safeParse(object);
  if (!parsed.success) {
    throw new CommitValidationError(parsed.error.message);
  }
  const objectRef = doc(db, "canvases", canvasId, "objects", object.id);
  await setDoc(objectRef, { ...parsed.data, updatedAt: serverTimestamp() });
}

export interface DeleteObjectsOptions {
  canvasId: string;
  objectIds: string[];
}

export async function deleteObjects({ canvasId, objectIds }: DeleteObjectsOptions) {
  if (!objectIds.length) return;
  const batch = writeBatch(db);
  for (const id of objectIds) {
    const ref = doc(db, "canvases", canvasId, "objects", id);
    batch.delete(ref);
  }
  await batch.commit();
}

export interface SubscribeObjectsOptions {
  canvasId: string;
  onChange: (objects: CanvasObject[]) => void;
  onError?: (error: FirestoreError) => void;
}

export function subscribeObjects({
  canvasId,
  onChange,
  onError,
}: SubscribeObjectsOptions): Unsubscribe {
  const collectionRef = collection(db, "canvases", canvasId, "objects");
  return onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot) => {
      try {
        const objects = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data({ serverTimestamps: "estimate" } as SnapshotOptions);
          // Use Timestamp-aware parser to normalize updatedAt → number (ms)
          return parseCanvasObjectDoc(docSnapshot.id, data);
        });
        onChange(objects);
      } catch (error) {
        console.error("Failed to parse canvas objects snapshot", error);
      }
    },
    onError
  );
}

