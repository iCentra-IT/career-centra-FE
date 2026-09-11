"use client";

import React, { useRef } from "react";

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length, value, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Each box has maxLength=1, so a paste event otherwise gets truncated to whatever the browser
  // keeps of the pasted string — only the first character ever lands. Read the clipboard directly
  // and spread it across the remaining boxes instead.
  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();

    const next = digits.slice();
    let cursor = index;
    for (const char of pasted) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor++;
    }
    onChange(next.join(""));
    inputsRef.current[Math.min(cursor, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          inputMode="numeric"
          maxLength={1}
          placeholder="*"
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-12 rounded-lg border border-gray-200 text-center text-lg text-gray-900 placeholder:text-gray-300 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        />
      ))}
    </div>
  );
}
