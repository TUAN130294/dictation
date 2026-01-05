"use client";

import { useEffect, useCallback } from "react";

interface KeyboardActions {
  onPlayPause?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onSpeedUp?: () => void;
  onSpeedDown?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
}

/**
 * Hook to manage keyboard shortcuts for audio player
 * Prevents shortcuts when typing in input/textarea elements
 * @param actions - Callback functions for keyboard actions
 * @param enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(
  actions: KeyboardActions,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          actions.onPlayPause?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          actions.onSeekForward?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          actions.onSeekBackward?.();
          break;
        case "ArrowUp":
          e.preventDefault();
          actions.onVolumeUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          actions.onVolumeDown?.();
          break;
        case ">":
        case ".":
          if (e.shiftKey) {
            e.preventDefault();
            actions.onSpeedUp?.();
          }
          break;
        case "<":
        case ",":
          if (e.shiftKey) {
            e.preventDefault();
            actions.onSpeedDown?.();
          }
          break;
      }
    },
    [actions]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}
