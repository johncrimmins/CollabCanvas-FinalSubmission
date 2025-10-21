import { rtdb } from "@/lib/firebase";

export type PeerSignals = {
  cursor?: { x: number; y: number; tool: string; at: number };
  transforms?: Record<string, { dx?: number; dy?: number; dw?: number; dh?: number; drot?: number; seq?: number }>;
  editing?: Record<string, true>;
  at?: number;
  seq?: number;
};

export async function publishSignals(canvasId: string, userId: string, signals: PeerSignals) {
  const ref = rtdb.ref(`canvases/${canvasId}/signals/${userId}`);
  await ref.set(signals);
}

export function subscribeSignals(canvasId: string, onChange: (userId: string, sig: PeerSignals) => void) {
  const ref = rtdb.ref(`canvases/${canvasId}/signals`);
  const listener = ref.on("value", snap => {
    const data = snap.val() || {};
    for (const [uid, sig] of Object.entries<PeerSignals>(data)) onChange(uid, sig);
  });
  return () => ref.off("value", listener);
}
