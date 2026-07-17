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
    <div className="max-w-[280px] w-full mx-auto" id="custom-tactical-keypad">
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-2xl text-xl font-semibold font-mono text-slate-800 active:scale-95 transition-all min-h-[44px]"
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={onCancel}
          className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-2xl active:scale-95 transition-all min-h-[44px]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-2xl text-xl font-semibold font-mono text-slate-800 active:scale-95 transition-all min-h-[44px]"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="aspect-square flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl active:scale-95 transition-all min-h-[44px]"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
