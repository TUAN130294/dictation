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

/**
 * Waveform visualization component using WaveSurfer.js
 * Renders audio waveform with clickable seek functionality
 */
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
  }, [audioUrl, onReady, onTimeUpdate, onSeek]);

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
