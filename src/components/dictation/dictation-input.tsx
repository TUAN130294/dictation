"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui";

interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DictationInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type what you hear...",
}: DictationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-4 font-mono text-lg leading-relaxed border-2 border-gray-200 rounded-lg resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:cursor-not-allowed"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
          <Button onClick={onSubmit} disabled={disabled || !value.trim()}>
            Check Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
