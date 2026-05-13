/**
 * Auto-Save Middleware
 *
 * OWNERSHIP: Store middleware (cross-cutting concern)
 * PERSISTENCE: Non-persistent (behavior only)
 *
 * Automatically triggers project auto-save when timeline or project state changes.
 * Eliminates 15+ manual scheduleAutoSave() calls throughout the codebase.
 *
 * Usage:
 * ```typescript
 * export const useTimelineStore = create(
 *   autoSaveMiddleware((set, get) => ({
 *     // ... store implementation
 *   }))
 * );
 * ```
 */

import type { StateCreator, StoreMutatorIdentifier } from "zustand";

type AutoSave = <T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(f: StateCreator<T, Mps, Mcs>) => StateCreator<T, Mps, Mcs>;

type AutoSaveImpl = <T>(f: StateCreator<T, [], []>) => StateCreator<T, [], []>;

const autoSaveImpl: AutoSaveImpl = (f) => (set, get, store) => {
  // Wrap the set function to trigger auto-save after state changes
  const wrappedSet: typeof set = (partial, replace) => {
    // Call the original set with proper arguments
    set(partial, replace as any);

    // Trigger auto-save asynchronously to avoid blocking state updates
    // Use dynamic import to avoid circular dependency
    import("../projectStore")
      .then(({ useProjectStore }) => {
        useProjectStore.getState().scheduleAutoSave();
      })
      .catch((err) => {
        console.error("[AutoSaveMiddleware] Failed to trigger auto-save:", err);
      });
  };

  return f(wrappedSet, get, store);
};

export const autoSaveMiddleware = autoSaveImpl as AutoSave;
