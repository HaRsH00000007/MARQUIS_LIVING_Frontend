/**
 * The session-scoped "reduce motion" preference, behind a `useSyncExternalStore`
 * contract.
 *
 * The WordPress build kept this in `sessionStorage` under `ml-v2-motion-v4` and
 * read it straight into a local variable. React needs it read through a store
 * instead: the server has no `sessionStorage`, so the server snapshot is always
 * "motion on", and hydration settles to the stored value on the client without
 * a cascading render.
 */

const KEY = "ml-v2-motion-v4";
const listeners = new Set<() => void>();

let snapshot = false;
let primed = false;

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === "off";
  } catch {
    return false; // private mode, or storage blocked — motion stays on
  }
};

/** getSnapshot must be pure, so the storage read is cached on first use. */
const prime = () => {
  if (!primed) {
    primed = true;
    snapshot = read();
  }
};

export function subscribeMotion(onChange: () => void) {
  prime();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getMotionSnapshot() {
  prime();
  return snapshot;
}

export function getMotionServerSnapshot() {
  return false;
}

export function setReducedMotion(next: boolean) {
  primed = true;
  snapshot = next;
  try {
    sessionStorage.setItem(KEY, next ? "off" : "on");
  } catch {
    /* nothing to persist to; the in-memory value still applies */
  }
  listeners.forEach((l) => l());
}
