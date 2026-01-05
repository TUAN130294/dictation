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

/**
 * Playback control buttons and volume slider
 * Includes play/pause, skip forward/backward, speed toggle, and volume control
 */
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
          className="w-20 h-1 accent-blue-600"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
