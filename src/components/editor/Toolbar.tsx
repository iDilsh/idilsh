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

interface ToolGroupDef {
  groupId: string;
  tools: ToolDef[];
}

const toolGroups: ToolGroupDef[] = [
  {
    groupId: 'select',
    tools: [
      { type: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
      { type: 'rect-select', icon: Scan, label: 'Rect Select', shortcut: '' },
      { type: 'ellipse-select', icon: CircleDot, label: 'Ellipse Select', shortcut: '' },
      { type: 'magic-wand', icon: Wand2, label: 'Magic Wand', shortcut: '' },
    ],
  },
  {
    groupId: 'move',
    tools: [
      { type: 'move', icon: Move, label: 'Move', shortcut: 'M' },
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
    tools: [
      { type: 'clone-stamp', icon: Copy, label: 'Clone Stamp', shortcut: '' },
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

// Shape selector component
function ShapeSelector({ onClose }: { onClose: () => void }) {
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const setActiveShapeType = useEditorStore((s) => s.setActiveShapeType);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div ref={ref} className="shape-selector absolute left-12 top-0 bg-zinc-800 border border-zinc-700 rounded-md p-1.5 shadow-lg z-50 w-44">
      <div className="grid grid-cols-4 gap-0.5">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            className={`w-9 h-9 flex items-center justify-center rounded text-sm transition-colors ${
              activeShapeType === shape.type
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
            onClick={() => { setActiveShapeType(shape.type); onClose(); }}
            title={shape.label}
          >
            {shape.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// Brush popup menu
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const brushShapes: { type: BrushShape; label: string; icon: React.ReactNode }[] = [
    { type: 'round', label: 'Round', icon: <Circle size={12} /> },
    { type: 'square', label: 'Square', icon: <SquareIcon size={12} /> },
    { type: 'flat', label: 'Flat', icon: <FlatIcon size={12} /> },
  ];

  return (
    <div ref={ref} className="absolute left-12 bottom-24 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 w-48 p-3 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Size</span>
          <span className="text-[10px] text-zinc-300">{currentSize}px</span>
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
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Hardness</span>
          <span className="text-[10px] text-zinc-300">{brushHardness}%</span>
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
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Opacity</span>
          <span className="text-[10px] text-zinc-300">{brushOpacity}%</span>
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
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [showBrushPresets, setShowBrushPresets] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [clickedGroup, setClickedGroup] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleMouseEnterGroup = useCallback((groupId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredGroup(groupId);
    }, 300);
  }, []);

  const handleMouseLeaveGroup = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredGroup(null);
    }, 200);
  }, []);

  const handleToolClick = useCallback((tool: ToolDef, groupId: string) => {
    setActiveTool(tool.type);
    setActiveSubTool((prev) => ({ ...prev, [groupId]: tool.type }));

    if (tool.type === 'shape') {
      setShowShapeSelector((prev) => !prev);
      setShowBrushPresets(false);
    } else if (brushTypeTools.includes(tool.type)) {
      setShowBrushPresets((prev) => !prev);
      setShowShapeSelector(false);
    } else {
      setShowShapeSelector(false);
      setShowBrushPresets(false);
    }

    // Set crop mode based on tool selection
    if (tool.type === 'crop') {
      setCropMode('rect');
    } else if (tool.type === 'circle-crop') {
      setCropMode('circle');
    }

    setClickedGroup(null);
    setHoveredGroup(null);
  }, [setActiveTool, setCropMode]);

  // Get the currently displayed tool for a group
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

  // Handle main button click (opens flyout or activates tool)
  const handleMainButtonClick = useCallback((group: ToolGroupDef) => {
    const displayedTool = getDisplayedTool(group);
    
    if (group.tools.length > 1) {
      // Toggle flyout on click for multi-tool groups
      if (group.groupId === 'shape') {
        setShowShapeSelector((prev) => !prev);
        setShowBrushPresets(false);
      } else if (group.groupId === 'brush' || group.groupId === 'effects') {
        setShowBrushPresets((prev) => !prev);
        setShowShapeSelector(false);
      } else {
        // For other groups, toggle clicked flyout
        setClickedGroup((prev) => prev === group.groupId ? null : group.groupId);
      }
    }
    
    handleToolClick(displayedTool, group.groupId);
  }, [handleToolClick, getDisplayedTool]);

  const isGroupActive = (group: ToolGroupDef): boolean => {
    return group.tools.some((t) => t.type === activeTool);
  };

  const hasMultipleTools = (group: ToolGroupDef): boolean => {
    return group.tools.length > 1;
  };

  // Determine which flyout is showing
  const getShowingFlyout = (group: ToolGroupDef): boolean => {
    if (hoveredGroup === group.groupId) return true;
    if (clickedGroup === group.groupId) return true;
    // Shape selector shows on hover/click for shape group
    if (group.groupId === 'shape' && showShapeSelector) return true;
    return false;
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-12 bg-zinc-900 border-r border-zinc-700 flex flex-col items-center py-2 gap-0.5 overflow-y-auto custom-scrollbar relative">
        {toolGroups.map((group, gi) => {
          const displayedTool = getDisplayedTool(group);
          const Icon = displayedTool.icon;
          const isActive = isGroupActive(group);
          const showFlyout = hasMultipleTools(group) && getShowingFlyout(group);

          return (
            <div
              key={group.groupId}
              onMouseEnter={() => handleMouseEnterGroup(group.groupId)}
              onMouseLeave={handleMouseLeaveGroup}
              className="relative"
            >
              {gi > 0 && gi <= toolGroups.length && <Separator className="my-1 bg-zinc-700 w-8" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleMainButtonClick(group)}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors relative ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={18} />
                    {hasMultipleTools(group) && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  <p>{displayedTool.label}{displayedTool.shortcut ? ` (${displayedTool.shortcut})` : ''}</p>
                </TooltipContent>
              </Tooltip>

              {/* Flyout submenu for tool groups */}
              {showFlyout && group.groupId !== 'shape' && (
                <div className="absolute left-12 top-0 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-50 py-1 min-w-[120px]">
                  {group.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.type}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                          activeTool === tool.type
                            ? 'bg-emerald-600/20 text-emerald-400'
                            : 'text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'
                        }`}
                        onClick={() => handleToolClick(tool, group.groupId)}
                      >
                        <ToolIcon size={14} />
                        <span className="text-xs">{tool.label}</span>
                        {tool.shortcut && (
                          <span className="text-[10px] text-zinc-500 ml-auto">{tool.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <Separator className="my-1 bg-zinc-700 w-8" />

        {showBrushSize && (
          <div className="w-10 flex flex-col items-center gap-1 py-1">
            <span className="text-[10px] text-zinc-500">
              {activeTool === 'eraser' ? eraserSize : brushSize}px
            </span>
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
        {showShapeSelector && activeTool === 'shape' && <ShapeSelector onClose={() => setShowShapeSelector(false)} />}
        
        {/* Brush presets popup */}
        {showBrushPresets && brushTypeTools.includes(activeTool) && <BrushPopupMenu onClose={() => setShowBrushPresets(false)} />}

        <div className="mt-auto">
          <ColorPicker />
        </div>
      </div>
    </TooltipProvider>
  );
}
