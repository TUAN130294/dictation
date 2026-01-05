/**
 * Audio utility functions for the audio player
 */

/**
 * Format seconds into MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "2:05")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Available playback speed options
 */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;

/**
 * Type for playback speed values
 */
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/**
 * Get display label for playback speed
 * @param speed - Playback speed value
 * @returns Label string (e.g., "1x", "1.5x")
 */
export function getSpeedLabel(speed: PlaybackSpeed): string {
  return speed === 1 ? "1x" : `${speed}x`;
}
