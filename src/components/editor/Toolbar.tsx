'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import type { ToolType, ShapeType, BrushShape } from '@/lib/types';
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
  Scissors,
  Scan,
  CircleDot,
  Wand2,
  Circle,
  Square as SquareIcon,
  Minus as FlatIcon,
  ChevronRight,
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
import ScrubbySlider from './ScrubbySlider';

interface ToolDef {
  type: ToolType;
  icon: React.ElementType;
  label: string;
  shortcut: string;
}

interface ToolGroupDef {
  groupId: string;
  tools: ToolDef[];
  hasPopup?: 'shape' | 'brush'; // special popup types
}

const toolGroups: ToolGroupDef[] = [
  {
    groupId: 'select',
    tools: [
      { type: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
      { type: 'rect-select', icon: Scan, label: 'Rectangular Select', shortcut: 'M' },
      { type: 'ellipse-select', icon: CircleDot, label: 'Elliptical Select', shortcut: '' },
      { type: 'magic-wand', icon: Wand2, label: 'Magic Wand', shortcut: 'W' },
    ],
  },
  {
    groupId: 'move',
    tools: [
      { type: 'move', icon: Move, label: 'Move', shortcut: '' },
      { type: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
    ],
  },
  {
    groupId: 'zoom',
    tools: [
      { type: 'zoom', icon: ZoomIn, label: 'Zoom', shortcut: 'Z' },
    ],
  },
  {
    groupId: 'brush',
    hasPopup: 'brush',
    tools: [
      { type: 'brush', icon: Paintbrush, label: 'Brush', shortcut: 'B' },
      { type: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
      { type: 'blur-brush', icon: Sparkles, label: 'Blur Brush', shortcut: '' },
      { type: 'sharpen-brush', icon: Zap, label: 'Sharpen Brush', shortcut: '' },
    ],
  },
  {
    groupId: 'paint',
    tools: [
      { type: 'fill', icon: PaintBucket, label: 'Fill', shortcut: 'G' },
      { type: 'gradient', icon: Droplets, label: 'Gradient', shortcut: '' },
      { type: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
    ],
  },
  {
    groupId: 'text',
    tools: [
      { type: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    ],
  },
  {
    groupId: 'shape',
    hasPopup: 'shape',
    tools: [
      { type: 'shape', icon: Square, label: 'Shape', shortcut: 'U' },
    ],
  },
  {
    groupId: 'line',
    tools: [
      { type: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    ],
  },
  {
    groupId: 'pen',
    tools: [
      { type: 'pen', icon: PenTool, label: 'Pen', shortcut: 'P' },
    ],
  },
  {
    groupId: 'crop',
    tools: [
      { type: 'crop', icon: Crop, label: 'Rect Crop', shortcut: 'C' },
      { type: 'circle-crop', icon: Circle, label: 'Circle Crop', shortcut: '' },
    ],
  },
  {
    groupId: 'effects',
    hasPopup: 'brush',
    tools: [
      { type: 'clone-stamp', icon: Copy, label: 'Clone Stamp', shortcut: 'S' },
      { type: 'dodge', icon: Sun, label: 'Dodge', shortcut: '' },
      { type: 'burn', icon: Flame, label: 'Burn', shortcut: '' },
      { type: 'sponge', icon: Droplet, label: 'Sponge', shortcut: '' },
    ],
  },
  {
    groupId: 'measure',
    tools: [
      { type: 'measure', icon: Ruler, label: 'Measure', shortcut: '' },
    ],
  },
  {
    groupId: 'slice',
    tools: [
      { type: 'slice', icon: Scissors, label: 'Slice', shortcut: '' },
    ],
  },
];

// Shape selector component - popup grid of shapes
function ShapeSelectorPopup({ onClose, onSelectShape }: { onClose: () => void; onSelectShape: (type: ShapeType) => void }) {
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use a small delay so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
  }, [onClose]);

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
    <div ref={ref} className="absolute left-12 top-0 bg-zinc-800 border border-zinc-600 rounded-md p-2 shadow-xl z-50 w-52">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 px-1">Shapes</div>
      <div className="grid grid-cols-4 gap-1">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            className={`w-10 h-10 flex items-center justify-center rounded text-sm transition-colors ${
              activeShapeType === shape.type
                ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
            onClick={() => { onSelectShape(shape.type); onClose(); }}
            title={shape.label}
          >
            {shape.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// Brush popup menu with size/hardness/opacity/shape controls and presets
function BrushPopupMenu({ onClose }: { onClose: () => void }) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const brushSize = useEditorStore((s) => s.brushSize);
  const setBrushSize = useEditorStore((s) => s.setBrushSize);
  const brushHardness = useEditorStore((s) => s.brushHardness);
  const setBrushHardness = useEditorStore((s) => s.setBrushHardness);
  const brushOpacity = useEditorStore((s) => s.brushOpacity);
  const setBrushOpacity = useEditorStore((s) => s.setBrushOpacity);
  const eraserSize = useEditorStore((s) => s.eraserSize);
  const setEraserSize = useEditorStore((s) => s.setEraserSize);
  const brushShape = useEditorStore((s) => s.brushShape);
  const setBrushShape = useEditorStore((s) => s.setBrushShape);
  const ref = useRef<HTMLDivElement>(null);

  const currentSize = activeTool === 'eraser' ? eraserSize : brushSize;
  const setCurrentSize = activeTool === 'eraser' ? setEraserSize : setBrushSize;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
  }, [onClose]);

  const brushShapes: { type: BrushShape; label: string; icon: React.ReactNode }[] = [
    { type: 'round', label: 'Round', icon: <Circle size={12} /> },
    { type: 'square', label: 'Square', icon: <SquareIcon size={12} /> },
    { type: 'flat', label: 'Flat', icon: <FlatIcon size={12} /> },
  ];

  return (
    <div ref={ref} className="absolute left-12 bg-zinc-800 border border-zinc-600 rounded-md shadow-xl z-50 w-52 p-3 space-y-3">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Brush Settings</div>
      
      {/* Size */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Size</span>
          <ScrubbySlider
            value={currentSize}
            onChange={setCurrentSize}
            min={1}
            max={500}
            step={1}
            suffix="px"
            className="text-[10px] text-zinc-300"
          />
        </div>
        <Slider
          min={1}
          max={500}
          step={1}
          value={[currentSize]}
          onValueChange={(v) => setCurrentSize(v[0])}
          className="w-full"
        />
      </div>

      {/* Hardness (only for non-eraser) */}
      {activeTool !== 'eraser' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400">Hardness</span>
            <ScrubbySlider
              value={brushHardness}
              onChange={setBrushHardness}
              min={0}
              max={100}
              step={1}
              suffix="%"
              className="text-[10px] text-zinc-300"
            />
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[brushHardness]}
            onValueChange={(v) => setBrushHardness(v[0])}
            className="w-full"
          />
        </div>
      )}

      {/* Opacity */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Opacity</span>
          <ScrubbySlider
            value={brushOpacity}
            onChange={setBrushOpacity}
            min={1}
            max={100}
            step={1}
            suffix="%"
            className="text-[10px] text-zinc-300"
          />
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[brushOpacity]}
          onValueChange={(v) => setBrushOpacity(v[0])}
          className="w-full"
        />
      </div>

      {/* Brush Shape selector */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400">Shape</span>
        <div className="flex gap-1">
          {brushShapes.map((bs) => (
            <button
              key={bs.type}
              className={`flex-1 h-7 flex items-center justify-center gap-1 rounded text-[10px] transition-colors ${
                brushShape === bs.type
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
              onClick={() => setBrushShape(bs.type)}
              title={bs.label}
            >
              {bs.icon}
            </button>
          ))}
        </div>
      </div>
      
      <Separator className="bg-zinc-700" />
      <BrushPresets />
    </div>
  );
}

// Tool group flyout popup - shows sub-tools when clicking a tool with variants
function ToolFlyoutPopup({ group, onSelectTool, onClose }: { 
  group: ToolGroupDef; 
  onSelectTool: (tool: ToolDef) => void; 
  onClose: () => void;
}) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
  }, [onClose]);

  return (
    <div ref={ref} className="absolute left-12 top-0 bg-zinc-800 border border-zinc-600 rounded-md shadow-xl z-50 py-1 min-w-[160px]">
      {group.tools.map((tool) => {
        const ToolIcon = tool.icon;
        return (
          <button
            key={tool.type}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              activeTool === tool.type
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
            }`}
            onClick={() => { onSelectTool(tool); onClose(); }}
          >
            <ToolIcon size={14} />
            <span className="text-xs flex-1">{tool.label}</span>
            {tool.shortcut && (
              <span className="text-[10px] text-zinc-500 bg-zinc-700/50 px-1.5 py-0.5 rounded">{tool.shortcut}</span>
            )}
          </button>
        );
      })}
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
  const setCropMode = useEditorStore((s) => s.setCropMode);
  const setActiveShapeType = useEditorStore((s) => s.setActiveShapeType);

  // Track which popup is open: null, 'flyout-{groupId}', 'shape', 'brush'
  const [openPopup, setOpenPopup] = useState<string | null>(null);
  
  // Track which sub-tool is active per group (for displaying the right icon)
  const [activeSubTool, setActiveSubTool] = useState<Record<string, ToolType>>({
    select: 'select',
    move: 'move',
    brush: 'brush',
    paint: 'fill',
    crop: 'crop',
    effects: 'clone-stamp',
  });

  const brushTypeTools: ToolType[] = ['brush', 'eraser', 'dodge', 'burn', 'sponge', 'blur-brush', 'sharpen-brush', 'clone-stamp'];
  const showBrushSize = brushTypeTools.includes(activeTool);

  const handleToolSelect = useCallback((tool: ToolDef, groupId: string) => {
    setActiveTool(tool.type);
    setActiveSubTool((prev) => ({ ...prev, [groupId]: tool.type }));

    // Set crop mode based on tool selection
    if (tool.type === 'crop') {
      setCropMode('rect');
    } else if (tool.type === 'circle-crop') {
      setCropMode('circle');
    }

    // Close any open popup
    setOpenPopup(null);
  }, [setActiveTool, setCropMode]);

  // Handle main button click
  const handleMainButtonClick = useCallback((group: ToolGroupDef) => {
    const groupId = group.groupId;
    const hasMultipleTools = group.tools.length > 1;
    
    if (hasMultipleTools) {
      // Toggle flyout popup for multi-tool groups
      const flyoutId = `flyout-${groupId}`;
      setOpenPopup((prev) => prev === flyoutId ? null : flyoutId);
    } else if (group.hasPopup === 'shape') {
      // Toggle shape selector popup
      setOpenPopup((prev) => prev === 'shape' ? null : 'shape');
      // Also activate the shape tool
      const displayedTool = getDisplayedTool(group);
      setActiveTool(displayedTool.type);
    } else if (group.hasPopup === 'brush') {
      // Toggle brush popup
      setOpenPopup((prev) => prev === 'brush' ? null : 'brush');
      // Also activate the displayed tool
      const displayedTool = getDisplayedTool(group);
      setActiveTool(displayedTool.type);
    } else {
      // Single tool - just activate it
      setActiveTool(group.tools[0].type);
      setActiveSubTool((prev) => ({ ...prev, [groupId]: group.tools[0].type }));
      setOpenPopup(null);
    }
  }, [setActiveTool]);

  // Get the currently displayed tool for a group (shows last-used sub-tool icon)
  const getDisplayedTool = useCallback((group: ToolGroupDef): ToolDef => {
    const subTool = activeSubTool[group.groupId];
    if (subTool) {
      const found = group.tools.find((t) => t.type === subTool);
      if (found) return found;
    }
    // Also check if activeTool is in this group
    const activeInGroup = group.tools.find((t) => t.type === activeTool);
    if (activeInGroup) return activeInGroup;
    return group.tools[0];
  }, [activeSubTool, activeTool]);

  const isGroupActive = (group: ToolGroupDef): boolean => {
    return group.tools.some((t) => t.type === activeTool);
  };

  const hasMultipleTools = (group: ToolGroupDef): boolean => {
    return group.tools.length > 1 || !!group.hasPopup;
  };

  return (
    <TooltipProvider delayDuration={500}>
      <div className="w-12 bg-zinc-900 border-r border-zinc-700 flex flex-col items-center py-2 gap-0.5 overflow-y-auto custom-scrollbar relative">
        {toolGroups.map((group, gi) => {
          const displayedTool = getDisplayedTool(group);
          const Icon = displayedTool.icon;
          const isActive = isGroupActive(group);
          const hasSubTools = hasMultipleTools(group);
          
          // Determine which popup to show for this group
          let showFlyout = false;
          let showShapePopup = false;
          let showBrushPopup = false;
          
          if (group.tools.length > 1 && openPopup === `flyout-${group.groupId}`) {
            showFlyout = true;
          }
          if (group.hasPopup === 'shape' && openPopup === 'shape' && activeTool === 'shape') {
            showShapePopup = true;
          }
          if (group.hasPopup === 'brush' && openPopup === 'brush' && brushTypeTools.includes(activeTool)) {
            showBrushPopup = true;
          }

          return (
            <div key={group.groupId} className="relative">
              {gi > 0 && <Separator className="my-0.5 bg-zinc-700/50 w-8" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleMainButtonClick(group)}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-all relative group/btn ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={18} />
                    {/* Sub-tool indicator triangle */}
                    {hasSubTools && (
                      <span className="absolute bottom-0 right-0 w-0 h-0 border-l-[4px] border-l-transparent border-b-[4px] border-b-zinc-400 group-hover/btn:border-b-zinc-200" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 text-zinc-200 border-zinc-600">
                  <p>{displayedTool.label}{displayedTool.shortcut ? ` (${displayedTool.shortcut})` : ''}</p>
                  {hasSubTools && <p className="text-[10px] text-zinc-500">Click for more tools</p>}
                </TooltipContent>
              </Tooltip>

              {/* Flyout submenu for multi-tool groups */}
              {showFlyout && (
                <ToolFlyoutPopup
                  group={group}
                  onSelectTool={(tool) => handleToolSelect(tool, group.groupId)}
                  onClose={() => setOpenPopup(null)}
                />
              )}

              {/* Shape selector popup */}
              {showShapePopup && (
                <ShapeSelectorPopup
                  onClose={() => setOpenPopup(null)}
                  onSelectShape={(type) => {
                    setActiveShapeType(type);
                    setOpenPopup(null);
                  }}
                />
              )}

              {/* Brush settings popup */}
              {showBrushPopup && (
                <BrushPopupMenu onClose={() => setOpenPopup(null)} />
              )}
            </div>
          );
        })}

        <Separator className="my-1 bg-zinc-700 w-8" />

        {/* Quick brush size control */}
        {showBrushSize && (
          <div className="w-10 flex flex-col items-center gap-1 py-1">
            <ScrubbySlider
              value={activeTool === 'eraser' ? eraserSize : brushSize}
              onChange={activeTool === 'eraser' ? setEraserSize : setBrushSize}
              min={1}
              max={500}
              step={1}
              suffix="px"
              className="text-[10px] text-zinc-400"
            />
            <Slider
              min={1}
              max={500}
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

        {/* Fill tolerance control */}
        {activeTool === 'fill' && (
          <div className="w-10 flex flex-col items-center gap-1 py-1">
            <ScrubbySlider
              value={fillTolerance}
              onChange={setFillTolerance}
              min={0}
              max={255}
              step={1}
              suffix=""
              className="text-[10px] text-zinc-400"
            />
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

        <div className="mt-auto">
          <ColorPicker />
        </div>
      </div>
    </TooltipProvider>
  );
}
