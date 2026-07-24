"use client";

import React from "react";

interface VirtualPinPadProps {
  value: string;
  onChange: (val: string) => void;
  maxDigits?: number;
  onCancel: () => void;
  onSubmit?: (pin: string) => void;
}

export default function VirtualPinPad({
  value,
  onChange,
  maxDigits = 4,
  onCancel,
  onSubmit,
}: VirtualPinPadProps) {
  const handleKeyPress = (num: string) => {
    if (value.length < maxDigits) {
      const newValue = value + num;
      onChange(newValue);
      if (newValue.length === maxDigits && onSubmit) {
        onSubmit(newValue);
      }
    }
  };

  const handleBackspace = () => {
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[280px]" id="custom-tactical-keypad">
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            className="flex aspect-square min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white font-mono text-xl font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-95 active:bg-slate-100"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onCancel}
          className="flex aspect-square min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-500 transition-all hover:bg-slate-50 active:scale-95"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          className="flex aspect-square min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white font-mono text-xl font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-95 active:bg-slate-100"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="flex aspect-square min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 active:scale-95"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
