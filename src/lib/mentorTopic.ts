import { useSyncExternalStore } from 'react';

/* The topic the learner has open, so the mentor can answer about it. */

let current: string | null = null;
const listeners = new Set<() => void>();

export function setMentorTopic(id: string | null) {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l());
}

export function useMentorTopic() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
