"use client";
import { useSyncExternalStore } from "react";

/** True after hydration — avoids SSR mismatches for localStorage-backed state. */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
