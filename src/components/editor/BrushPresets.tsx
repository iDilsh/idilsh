'use client';

import { useEditorStore } from '@/lib/editor-store';
import { BRUSH_PRESETS } from '@/lib/types';
import type { BrushPreset } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function BrushPresets() {
  const activeBrushPreset = useEditorStore((s) => s.activeBrushPreset);
  const applyBrushPreset = useEditorStore((s) => s.applyBrushPreset);
  const brushSize = useEditorStore((s) => s.brushSize);
  const brushOpacity = useEditorStore((s) => s.brushOpacity);
  const brushHardness = useEditorStore((s) => s.brushHardness);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-zinc-900 border-l border-t border-zinc-700 p-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-2">Brush Presets</div>
        <div className="grid grid-cols-3 gap-1">
          {BRUSH_PRESETS.map((preset: BrushPreset) => (
            <Tooltip key={preset.id}>
              <TooltipTrigger asChild>
                <button
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded text-xs transition-colors ${
                    activeBrushPreset === preset.id
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-700'
                      : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-transparent'
                  }`}
                  onClick={() => applyBrushPreset(preset)}
                >
                  <span className="text-base leading-none">{preset.icon}</span>
                  <span className="text-[9px] truncate w-full text-center">{preset.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-zinc-800 text-zinc-200 border-zinc-700 text-[10px]">
                <p>{preset.name}: {preset.size}px, {preset.opacity}%, {preset.hardness}% hardness</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Size</span>
            <span className="text-[10px] text-zinc-400">{brushSize}px</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Opacity</span>
            <span className="text-[10px] text-zinc-400">{brushOpacity}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">Hardness</span>
            <span className="text-[10px] text-zinc-400">{brushHardness}%</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
