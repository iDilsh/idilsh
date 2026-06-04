'use client';

import { useEditorStore } from '@/lib/editor-store';
import { ArrowDownUp, RotateCcw } from 'lucide-react';

export default function ColorPicker() {
  const foregroundColor = useEditorStore((s) => s.foregroundColor);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const setForegroundColor = useEditorStore((s) => s.setForegroundColor);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const swapColors = useEditorStore((s) => s.swapColors);

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="relative w-10 h-10">
        {/* Background color */}
        <div className="absolute bottom-0 right-0 w-7 h-7 rounded border border-zinc-500 overflow-hidden">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            title="Background Color"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor }}
          />
        </div>
        {/* Foreground color */}
        <div className="absolute top-0 left-0 w-7 h-7 rounded border border-zinc-400 overflow-hidden z-10">
          <input
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            title="Foreground Color"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: foregroundColor }}
          />
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={swapColors}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          title="Swap Colors (X)"
        >
          <ArrowDownUp size={12} />
        </button>
        <button
          onClick={() => {
            setForegroundColor('#000000');
            setBackgroundColor('#ffffff');
          }}
          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          title="Reset Colors"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
