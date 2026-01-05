"use client";

import { formatTime } from "@/lib/audio-utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

/**
 * Clickable progress bar with time display
 * Shows current time and duration in MM:SS format
 */
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
          className="absolute h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute h-4 w-4 bg-blue-600 rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
