export interface AppStore<TState> {
  getState(): TState;
  setState(updater: TState | Partial<TState> | ((current: TState) => TState)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<TState>(initialState: TState): AppStore<TState> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState() {
      return state;
    },
    setState(updater) {
      state =
        typeof updater === "function"
          ? (updater as (current: TState) => TState)(state)
          : isPlainObject(state) && isPlainObject(updater)
            ? { ...state, ...updater }
            : (updater as TState);
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
