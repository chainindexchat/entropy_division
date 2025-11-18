"use client";
import { getStorageManager } from "lib/browser-stroage";
import { createEmitter } from "lib/utils";
import { useCallback, useEffect, useState } from "react";

const storage = getStorageManager<string>("theme-style");

const emitter = createEmitter();

export function useThemeStyle() {
  const [themeStyle, _setThemeStyle] = useState(storage.get("default"));

  const setThemeStyle = useCallback((value: string) => {
    storage.set(value);
    _setThemeStyle(value);
    emitter.emit(value);
  }, []);

  useEffect(() => {
    const unsubscribe = emitter.on(_setThemeStyle);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    themeStyle,
    setThemeStyle,
  };
}
