import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CanvasObject } from "@/lib/types";
import type { Unsubscribe } from "@/lib/rtdbClient";

export async function commitObject(
  canvasId: string,
  objectId: string,
  expectedVersion: number,
  patch: Partial<CanvasObject["props"]>,
  userId: string
) {
  const objectRef = doc(db, "canvases", canvasId, "objects", objectId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(objectRef);
    if (!snapshot.exists()) {
      throw new Error("Object does not exist");
    }
    const data = snapshot.data() as CanvasObject;
    if (data.v !== expectedVersion) {
      throw Object.assign(new Error("Version mismatch"), {
        code: "version-mismatch",
        currentVersion: data.v,
      });
    }
    transaction.update(objectRef, {
      props: { ...data.props, ...patch },
      v: data.v + 1,
      updatedBy: userId,
      updatedAt: Date.now(),
    });
  });
}

export function subscribeObjects(
  canvasId: string,
  onChange: (objects: CanvasObject[]) => void
): Unsubscribe {
  const collectionRef = collection(db, "canvases", canvasId, "objects");
  return onSnapshot(collectionRef, (snapshot) => {
    const objects: CanvasObject[] = [];
    snapshot.forEach((doc) => {
      objects.push({ id: doc.id, ...(doc.data() as DocumentData) } as CanvasObject);
    });
    onChange(objects);
  });
}

