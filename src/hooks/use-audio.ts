"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PlaybackSpeed } from "@/lib/audio-utils";

interface UseAudioOptions {
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

/**
 * Hook to manage HTML5 Audio element with playback controls
 * @param audioUrl - URL of the audio file
 * @param options - Optional callbacks for time updates and playback end
 * @returns Audio state and control methods
 */
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
  }, [audioUrl, options]);

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
