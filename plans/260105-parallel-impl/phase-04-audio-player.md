# Phase 04: Audio Player

## Parallelization
- **Wave:** 2
- **Can parallel with:** Phase 02 (DB/Auth), Phase 03 (UI)
- **Depends on:** Phase 01
- **Blocks:** Phase 06 (Dictation Core)

## File Ownership (Exclusive)
```
src/
├── components/
│   └── audio/
│       ├── audio-player.tsx      # Main component
│       ├── waveform.tsx          # WaveSurfer wrapper
│       ├── playback-controls.tsx # Play, pause, speed
│       ├── progress-bar.tsx      # Seek bar
│       └── index.ts
├── hooks/
│   ├── use-audio.ts              # Core audio state
│   └── use-keyboard-shortcuts.ts # Keyboard handlers
└── lib/
    └── audio-utils.ts            # Format helpers
```

## Conflict Prevention
- All audio code in `components/audio/` and `hooks/use-audio.ts`
- No overlap with UI components (Phase 03)
- WaveSurfer instance managed internally

## Tasks

### 1. Audio Utilities (20min)
```typescript
// src/lib/audio-utils.ts
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export function getSpeedLabel(speed: PlaybackSpeed): string {
  return speed === 1 ? "1x" : `${speed}x`;
}
```

### 2. useAudio Hook (45min)
```typescript
// src/hooks/use-audio.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PlaybackSpeed } from "@/lib/audio-utils";

interface UseAudioOptions {
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

export function useAudio(audioUrl: string | null, options: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      options.onTimeUpdate?.(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      options.onEnded?.();
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [audioUrl]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const seekRelative = useCallback((delta: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
      seek(newTime);
    }
  }, [duration, seek]);

  const changeSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    speed,
    volume,
    play,
    pause,
    toggle,
    seek,
    seekRelative,
    changeSpeed,
    changeVolume,
  };
}
```

### 3. Keyboard Shortcuts Hook (30min)
```typescript
// src/hooks/use-keyboard-shortcuts.ts
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
```

### 4. WaveSurfer Waveform Component (45min)
```typescript
// src/components/audio/waveform.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  audioUrl: string;
  onReady?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
  isPlaying?: boolean;
  playbackRate?: number;
}

export function Waveform({
  audioUrl,
  onReady,
  onTimeUpdate,
  onSeek,
  isPlaying,
  playbackRate = 1,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#E5E7EB",
      progressColor: "#1A56DB",
      cursorColor: "#8B5CF6",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
      normalize: true,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsLoaded(true);
      onReady?.(ws.getDuration());
    });

    ws.on("audioprocess", () => {
      onTimeUpdate?.(ws.getCurrentTime());
    });

    ws.on("seeking", () => {
      onSeek?.(ws.getCurrentTime());
    });

    ws.on("click", () => {
      onSeek?.(ws.getCurrentTime());
    });

    ws.load(audioUrl);

    return () => ws.destroy();
  }, [audioUrl]);

  // Sync play state
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isLoaded) return;

    if (isPlaying && !ws.isPlaying()) {
      ws.play();
    } else if (!isPlaying && ws.isPlaying()) {
      ws.pause();
    }
  }, [isPlaying, isLoaded]);

  // Sync playback rate
  useEffect(() => {
    wavesurferRef.current?.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden bg-gray-50 cursor-pointer"
      role="slider"
      aria-label="Audio waveform"
      tabIndex={0}
    />
  );
}
```

### 5. Playback Controls Component (30min)
```typescript
// src/components/audio/playback-controls.tsx
"use client";

import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui";
import { PLAYBACK_SPEEDS, getSpeedLabel, type PlaybackSpeed } from "@/lib/audio-utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  volume: number;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

export function PlaybackControls({
  isPlaying,
  speed,
  volume,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  onSpeedChange,
  onVolumeChange,
  disabled,
}: PlaybackControlsProps) {
  const cycleSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    onSpeedChange(PLAYBACK_SPEEDS[nextIndex]);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Rewind 5s */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSeekBackward}
        disabled={disabled}
        aria-label="Rewind 5 seconds"
      >
        <SkipBack className="h-5 w-5" />
      </Button>

      {/* Play/Pause */}
      <Button
        variant="primary"
        size="icon"
        onClick={onPlayPause}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="h-14 w-14"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-0.5" />
        )}
      </Button>

      {/* Forward 5s */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSeekForward}
        disabled={disabled}
        aria-label="Forward 5 seconds"
      >
        <SkipForward className="h-5 w-5" />
      </Button>

      {/* Speed */}
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleSpeed}
        disabled={disabled}
        className="min-w-[3rem] font-mono text-sm"
        aria-label={`Playback speed: ${getSpeedLabel(speed)}`}
      >
        {getSpeedLabel(speed)}
      </Button>

      {/* Volume */}
      <div className="flex items-center gap-2 ml-4">
        <Volume2 className="h-4 w-4 text-gray-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-20 h-1 accent-primary"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
```

### 6. Progress Bar Component (25min)
```typescript
// src/components/audio/progress-bar.tsx
"use client";

import { formatTime } from "@/lib/audio-utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  disabled,
}: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="w-full">
      <div
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
        onClick={handleClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Seek"
        tabIndex={0}
      >
        <div
          className="absolute h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute h-4 w-4 bg-primary rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-sm text-gray-500 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
```

### 7. Main AudioPlayer Component (30min)
```typescript
// src/components/audio/audio-player.tsx
"use client";

import { useAudio } from "@/hooks/use-audio";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Waveform } from "./waveform";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from "@/lib/audio-utils";
import { Skeleton } from "@/components/ui";

interface AudioPlayerProps {
  audioUrl: string;
  showWaveform?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

export function AudioPlayer({
  audioUrl,
  showWaveform = true,
  onTimeUpdate,
  onEnded,
}: AudioPlayerProps) {
  const audio = useAudio(audioUrl, { onTimeUpdate, onEnded });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: audio.toggle,
    onSeekForward: () => audio.seekRelative(5),
    onSeekBackward: () => audio.seekRelative(-5),
    onSpeedUp: () => {
      const idx = PLAYBACK_SPEEDS.indexOf(audio.speed);
      if (idx < PLAYBACK_SPEEDS.length - 1) {
        audio.changeSpeed(PLAYBACK_SPEEDS[idx + 1]);
      }
    },
    onSpeedDown: () => {
      const idx = PLAYBACK_SPEEDS.indexOf(audio.speed);
      if (idx > 0) {
        audio.changeSpeed(PLAYBACK_SPEEDS[idx - 1]);
      }
    },
    onVolumeUp: () => audio.changeVolume(Math.min(1, audio.volume + 0.1)),
    onVolumeDown: () => audio.changeVolume(Math.max(0, audio.volume - 0.1)),
  });

  return (
    <div className="w-full p-4 bg-white rounded-xl border border-gray-100 space-y-4">
      {/* Waveform */}
      {showWaveform && (
        <div className="mb-4">
          {audio.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <Waveform
              audioUrl={audioUrl}
              isPlaying={audio.isPlaying}
              playbackRate={audio.speed}
              onSeek={audio.seek}
            />
          )}
        </div>
      )}

      {/* Progress */}
      <ProgressBar
        currentTime={audio.currentTime}
        duration={audio.duration}
        onSeek={audio.seek}
        disabled={audio.isLoading}
      />

      {/* Controls */}
      <PlaybackControls
        isPlaying={audio.isPlaying}
        speed={audio.speed}
        volume={audio.volume}
        onPlayPause={audio.toggle}
        onSeekBackward={() => audio.seekRelative(-5)}
        onSeekForward={() => audio.seekRelative(5)}
        onSpeedChange={audio.changeSpeed}
        onVolumeChange={audio.changeVolume}
        disabled={audio.isLoading}
      />

      {/* Keyboard hint */}
      <p className="text-xs text-gray-400 text-center">
        Space: play/pause | Arrows: seek | Shift+&lt;/&gt;: speed
      </p>
    </div>
  );
}
```

### 8. Export Index (5min)
```typescript
// src/components/audio/index.ts
export { AudioPlayer } from "./audio-player";
export { Waveform } from "./waveform";
export { PlaybackControls } from "./playback-controls";
export { ProgressBar } from "./progress-bar";
```

## Acceptance Criteria
- [x] WaveSurfer renders waveform correctly
- [x] Play/pause toggles audio
- [x] Speed control cycles through 0.5x-1.5x
- [x] Keyboard shortcuts work (Space, arrows)
- [x] Click-to-seek on waveform/progress bar
- [x] Volume slider functional
- [x] Loading skeleton shows while audio loads
- [x] Accessible (ARIA labels, keyboard nav)

## Implementation Status
**COMPLETED** - All audio player components implemented and type-checked successfully.

## Effort: 5h
