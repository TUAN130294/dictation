"use client";

import { useAudio } from "@/hooks/use-audio";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Waveform } from "./waveform";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";
import { PLAYBACK_SPEEDS } from "@/lib/audio-utils";
import { Skeleton } from "@/components/ui";

interface AudioPlayerProps {
  audioUrl: string;
  showWaveform?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

/**
 * Complete audio player component with waveform, controls, and keyboard shortcuts
 * Features:
 * - WaveSurfer waveform visualization
 * - Play/pause, skip forward/backward
 * - Speed control (0.5x - 1.5x)
 * - Volume slider
 * - Keyboard shortcuts (Space, arrows, Shift+</>)
 * - Loading skeleton
 */
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
