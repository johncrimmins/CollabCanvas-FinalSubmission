import { useEffect, useRef } from "react";
import { publishSignals, subscribeSignals, type PeerSignals } from "@/lib/rtdbSignals";
import { useCanvasStore } from "@/store";

export function useNetworkSync(canvasId: string, userId: string) {
  const getState = useCanvasStore.getState;
  const applyPeerSignals = useCanvasStore.getState().applyPeerSignals;
  const clearPeer = useCanvasStore.getState().clearPeer;
  const dirtyRef = useRef(false);

  const markDirty = () => { dirtyRef.current = true };

  useEffect(() => {
    let frame: number;
    const loop = () => {
      if (dirtyRef.current) {
        const signals = getState().signalsDraft as PeerSignals;
        publishSignals(canvasId, userId, signals);
        dirtyRef.current = false;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [canvasId, userId]);

  useEffect(() => {
    const unsub = subscribeSignals(canvasId, (uid, sig) => {
      if (uid !== userId) applyPeerSignals(uid, sig);
    });
    const interval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 1000;
      const peers = getState().peers;
      for (const [uid, peer] of Object.entries(peers)) {
        if ((peer.at ?? 0) < cutoff) clearPeer(uid);
      }
    }, 1000);
    return () => { unsub(); clearInterval(interval); };
  }, [canvasId, userId]);
}
