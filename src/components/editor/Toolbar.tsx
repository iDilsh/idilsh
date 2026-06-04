'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import type { ToolType, ShapeType } from '@/lib/types';
import {
  MousePointer,
  Move,
  Hand,
  ZoomIn,
  Paintbrush,
  Eraser,
  PaintBucket,
  Pipette,
  Type,
  Square,
  Minus,
  Crop,
  PenTool,
  Droplets,
  Copy,
  Sparkles,
  Zap,
  Sun,
  Flame,
  Droplet,
  Ruler,
  Scan,
  Scissors,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import ColorPicker from './ColorPicker';
import BrushPresets from './BrushPresets';

interface ToolDef {
  type: ToolType;
  icon: React.ElementType;
  label: string;
  shortcut: string;
}

const tools: ToolDef[] = [
  { type: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
  { type: 'move', icon: Move, label: 'Move', shortcut: 'M' },
  { type: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { type: 'zoom', icon: ZoomIn, label: 'Zoom', shortcut: 'Z' },
  { type: 'brush', icon: Paintbrush, label: 'Brush', shortcut: 'B' },
  { type: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { type: 'fill', icon: PaintBucket, label: 'Fill', shortcut: 'G' },
  { type: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
  { type: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { type: 'shape', icon: Square, label: 'Shape', shortcut: 'U' },
  { type: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { type: 'pen', icon: PenTool, label: 'Pen', shortcut: 'P' },
  { type: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
  { type: 'slice', icon: Scissors, label: 'Slice', shortcut: '' },
  { type: 'gradient', icon: Droplets, label: 'Gradient', shortcut: '' },
  { type: 'clone-stamp', icon: Copy, label: 'Clone Stamp', shortcut: '' },
  { type: 'blur-brush', icon: Sparkles, label: 'Blur Brush', shortcut: '' },
  { type: 'sharpen-brush', icon: Zap, label: 'Sharpen Brush', shortcut: '' },
  { type: 'dodge', icon: Sun, label: 'Dodge', shortcut: '' },
  { type: 'burn', icon: Flame, label: 'Burn', shortcut: '' },
  { type: 'sponge', icon: Droplet, label: 'Sponge', shortcut: '' },
  { type: 'measure', icon: Ruler, label: 'Measure', shortcut: '' },
  { type: 'marquee', icon: Scan, label: 'Marquee', shortcut: '' },
];

const toolGroups = [
  tools.slice(0, 4),    // select, move, hand, zoom
  tools.slice(4, 8),    // brush, eraser, fill, eyedropper
  tools.slice(8, 12),   // text, shape, line, pen
  tools.slice(12, 15),  // crop, slice, gradient
  tools.slice(15, 23),  // clone-stamp, blur-brush, sharpen-brush, dodge, burn, sponge, measure, marquee
];

// Shape selector component
function ShapeSelector() {
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const setActiveShapeType = useEditorStore((s) => s.setActiveShapeType);

  const shapes: { type: ShapeType; label: string; icon: string }[] = [
    { type: 'rectangle', label: 'Rectangle', icon: '□' },
    { type: 'rounded-rect', label: 'Rounded Rect', icon: '▢' },
    { type: 'ellipse', label: 'Ellipse', icon: '○' },
    { type: 'circle', label: 'Circle', icon: '●' },
    { type: 'triangle', label: 'Triangle', icon: '△' },
    { type: 'star', label: 'Star', icon: '☆' },
    { type: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { type: 'diamond', label: 'Diamond', icon: '◇' },
    { type: 'arrow-right', label: 'Arrow Right', icon: '→' },
    { type: 'arrow-left', label: 'Arrow Left', icon: '←' },
    { type: 'arrow-up', label: 'Arrow Up', icon: '↑' },
    { type: 'arrow-down', label: 'Arrow Down', icon: '↓' },
    { type: 'heart', label: 'Heart', icon: '♥' },
    { type: 'pentagon', label: 'Pentagon', icon: '⬠' },
    { type: 'cross', label: 'Cross', icon: '✚' },
    { type: 'octagon', label: 'Octagon', icon: '⯃' },
  ];

  return (
    <div className="shape-selector absolute left-12 top-0 bg-zinc-800 border border-zinc-700 rounded-md p-1.5 shadow-lg z-50 w-44">
      <div className="grid grid-cols-4 gap-0.5">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            className={`w-9 h-9 flex items-center justify-center rounded text-sm transition-colors ${
              activeShapeType === shape.type
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
            onClick={() => setActiveShapeType(shape.type)}
            title={shape.label}
          >
            {shape.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Toolbar() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const brushSize = useEditorStore((s) => s.brushSize);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);
  const eraserSize = useEditorStore((s) => s.eraserSize);
  const setEraserSize = useEditorStore((s) => s.setEraserSize);
  const fillTolerance = useEditorStore((s) => s.fillTolerance);
  const setFillTolerance = useEditorStore((s) => s.setFillTolerance);
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [showBrushPresets, setShowBrushPresets] = useState(false);

  const showBrushSize = activeTool === 'brush' || activeTool === 'eraser' ||
    activeTool === 'dodge' || activeTool === 'burn' || activeTool === 'sponge' ||
    activeTool === 'blur-brush' || activeTool === 'sharpen-brush' || activeTool === 'clone-stamp';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-12 bg-zinc-900 border-r border-zinc-700 flex flex-col items-center py-2 gap-0.5 overflow-y-auto custom-scrollbar relative">
        {toolGroups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <Separator className="my-1 bg-zinc-700 w-8" />}
            {group.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.type;
              return (
                <Tooltip key={tool.type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setActiveTool(tool.type);
                        if (tool.type === 'shape') {
                          setShowShapeSelector(true);
                          setShowBrushPresets(false);
                        } else if (tool.type === 'brush') {
                          setShowBrushPresets(!showBrushPresets);
                          setShowShapeSelector(false);
                        } else {
                          setShowShapeSelector(false);
                          setShowBrushPresets(false);
                        }
                      }}
                      className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                    <p>{tool.label}{tool.shortcut ? ` (${tool.shortcut})` : ''}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}

        <Separator className="my-1 bg-zinc-700 w-8" />

        {showBrushSize && (
          <div className="w-10 flex flex-col items-center gap-1 py-1">
            <span className="text-[10px] text-zinc-500">
              {activeTool === 'eraser' ? eraserSize : brushSize}px
            </span>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[activeTool === 'eraser' ? eraserSize : brushSize]}
              onValueChange={(v) => {
                if (activeTool === 'eraser') setEraserSize(v[0]);
                else setBrushSize(v[0]);
              }}
              className="w-8 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
            />
          </div>
        )}

        {activeTool === 'fill' && (
          <div className="w-10 flex flex-col items-center gap-1 py-1">
            <span className="text-[10px] text-zinc-500">{fillTolerance}</span>
            <Slider
              min={0}
              max={255}
              step={1}
              value={[fillTolerance]}
              onValueChange={(v) => setFillTolerance(v[0])}
              className="w-8 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
            />
          </div>
        )}

        {/* Shape selector popup */}
        {showShapeSelector && activeTool === 'shape' && <ShapeSelector />}
        
        {/* Brush presets popup */}
        {showBrushPresets && activeTool === 'brush' && (
          <div className="shape-selector absolute left-12 bottom-24 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 w-44">
            <BrushPresets />
          </div>
        )}

        <div className="mt-auto">
          <ColorPicker />
        </div>
      </div>
    </TooltipProvider>
  );
}
