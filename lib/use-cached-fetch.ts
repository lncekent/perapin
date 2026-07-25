"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A tiny module-level cache for client data fetching.
 *
 * Because this Map lives at module scope, it survives Next.js client-side
 * navigations (the JS bundle stays loaded). That lets us do stale-while-
 * revalidate: when you revisit a page, its data is already cached so it renders
 * instantly (no skeleton), and we quietly refetch in the background to keep it
 * fresh — just like a typical single-page app.
 *
 * The cache is intentionally in-memory only: it clears on a hard refresh and on
 * logout (see clearCachedValues), so no stale/other-user data lingers.
 */
const cache = new Map<string, unknown>();

export function setCachedValue<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function getCachedValue<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function clearCachedValues(): void {
  cache.clear();
}

export interface CachedFetch<T> {
  /** Cached (possibly stale) data, or undefined until the first successful load. */
  data: T | undefined;
  /** True only on a cold cache (first-ever load). Never true on revisit. */
  loading: boolean;
  /** Error message from the latest load when there is no cached data to show. */
  error: string;
  /** Re-run the fetcher and update the cache without showing the skeleton. */
  refetch: () => Promise<T | undefined>;
}

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>): CachedFetch<T> {
  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined);
  const [loading, setLoading] = useState<boolean>(() => !cache.has(key));
  const [error, setError] = useState("");

  // Keep the latest fetcher without making it a dependency (it's redefined each
  // render), so the effect only re-runs when the cache key changes.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async (): Promise<T | undefined> => {
    try {
      const result = await fetcherRef.current();
      cache.set(key, result);
      setData(result);
      setError("");
      return result;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to load.";
      // Only surface the error when we have nothing cached to show.
      if (!cache.has(key)) setError(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    // Revalidate in the background. State updates happen after the await inside
    // load(), so they are never synchronous within the effect.
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
