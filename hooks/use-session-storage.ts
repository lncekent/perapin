"use client";

import { useCallback, useSyncExternalStore } from "react";

const cache = new Map<string, { raw: string | null; value: unknown }>();

/** Reads JSON session state without synchronously copying it into component state. */
export function useSessionStorageValue<T>(key: string): T | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const eventName = `perapin-session-storage:${key}`;
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(eventName, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(eventName, onStoreChange);
    };
  }, [key]);

  const getSnapshot = useCallback((): T | null => {
    try {
      const raw = window.sessionStorage.getItem(key);
      const previous = cache.get(key);
      if (previous?.raw === raw) return previous.value as T | null;
      const value = raw ? (JSON.parse(raw) as T) : null;
      cache.set(key, { raw, value });
      return value;
    } catch {
      return null;
    }
  }, [key]);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
