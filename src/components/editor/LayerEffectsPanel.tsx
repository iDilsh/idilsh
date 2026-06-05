'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import type { LayerEffects, LayerEffectShadow, LayerEffectStroke, LayerEffectGlow, LayerEffectBevel, LayerEffectSatin } from '@/lib/types';
import {
  DEFAULT_STROKE_EFFECT,
  DEFAULT_DROP_SHADOW,
  DEFAULT_INNER_SHADOW,
  DEFAULT_OUTER_GLOW,
  DEFAULT_INNER_GLOW,
  DEFAULT_BEVEL_EMBOSS,
  DEFAULT_SATIN,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, Trash2, ChevronDown, ChevronRight, Sparkles, Pin, X, GripVertical } from 'lucide-react';
import ScrubbySlider from './ScrubbySlider';

type EffectType = 'dropShadow' | 'innerShadow' | 'stroke' | 'outerGlow' | 'innerGlow' | 'bevelEmboss' | 'satin';

const effectLabels: Record<EffectType, string> = {
  dropShadow: 'Drop Shadow',
  innerShadow: 'Inner Shadow',
  stroke: 'Stroke',
  outerGlow: 'Outer Glow',
  innerGlow: 'Inner Glow',
  bevelEmboss: 'Bevel & Emboss',
  satin: 'Satin',
};

const effectDefaults: Record<EffectType, LayerEffects[EffectType]> = {
  dropShadow: { ...DEFAULT_DROP_SHADOW },
  innerShadow: { ...DEFAULT_INNER_SHADOW },
  stroke: { ...DEFAULT_STROKE_EFFECT },
  outerGlow: { ...DEFAULT_OUTER_GLOW },
  innerGlow: { ...DEFAULT_INNER_GLOW },
  bevelEmboss: { ...DEFAULT_BEVEL_EMBOSS },
  satin: { ...DEFAULT_SATIN },
};

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] text-zinc-500 w-14">{label}</span>}
      <div className="w-5 h-5 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full cursor-pointer opacity-0" />
        <div className="w-full h-full -mt-5" style={{ backgroundColor: value }} />
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-5 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 flex-1 min-w-0" />
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, onChange, suffix = '' }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-500 w-14">{label}</span>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} className="flex-1" />
      <ScrubbySlider value={value} onChange={onChange} min={min} max={max} step={step} suffix={suffix} className="text-[10px] text-zinc-400 w-10 text-right" />
    </div>
  );
}

function ShadowEffectEditor({ effect, onChange }: { effect: LayerEffectShadow; onChange: (e: LayerEffectShadow) => void }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <ColorInput label="Color" value={effect.color} onChange={(v) => onChange({ ...effect, color: v })} />
      <SliderRow label="Opacity" value={effect.opacity} min={0} max={100} onChange={(v) => onChange({ ...effect, opacity: v })} suffix="%" />
      <SliderRow label="Angle" value={effect.angle} min={0} max={360} onChange={(v) => onChange({ ...effect, angle: v })} suffix="°" />
      <SliderRow label="Distance" value={effect.distance} min={0} max={30000} onChange={(v) => onChange({ ...effect, distance: v })} />
      <SliderRow label="Blur" value={effect.blur} min={0} max={250} onChange={(v) => onChange({ ...effect, blur: v })} />
      <SliderRow label="Spread" value={effect.spread} min={0} max={100} onChange={(v) => onChange({ ...effect, spread: v })} />
    </div>
  );
}

function StrokeEffectEditor({ effect, onChange }: { effect: LayerEffectStroke; onChange: (e: LayerEffectStroke) => void }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <ColorInput label="Color" value={effect.color} onChange={(v) => onChange({ ...effect, color: v })} />
      <SliderRow label="Size" value={effect.size} min={1} max={250} onChange={(v) => onChange({ ...effect, size: v })} />
      <SliderRow label="Opacity" value={effect.opacity} min={0} max={100} onChange={(v) => onChange({ ...effect, opacity: v })} suffix="%" />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 w-14">Position</span>
        <Select value={effect.position} onValueChange={(v) => onChange({ ...effect, position: v as 'outside' | 'inside' | 'center' })}>
          <SelectTrigger className="h-5 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="outside" className="text-[10px] text-zinc-300">Outside</SelectItem>
            <SelectItem value="inside" className="text-[10px] text-zinc-300">Inside</SelectItem>
            <SelectItem value="center" className="text-[10px] text-zinc-300">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function GlowEffectEditor({ effect, onChange }: { effect: LayerEffectGlow; onChange: (e: LayerEffectGlow) => void }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <ColorInput label="Color" value={effect.color} onChange={(v) => onChange({ ...effect, color: v })} />
      <SliderRow label="Opacity" value={effect.opacity} min={0} max={100} onChange={(v) => onChange({ ...effect, opacity: v })} suffix="%" />
      <SliderRow label="Blur" value={effect.blur} min={0} max={250} onChange={(v) => onChange({ ...effect, blur: v })} />
      <SliderRow label="Spread" value={effect.spread} min={0} max={100} onChange={(v) => onChange({ ...effect, spread: v })} />
    </div>
  );
}

function BevelEffectEditor({ effect, onChange }: { effect: LayerEffectBevel; onChange: (e: LayerEffectBevel) => void }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 w-14">Style</span>
        <Select value={effect.style} onValueChange={(v) => onChange({ ...effect, style: v as 'outer' | 'inner' | 'emboss' })}>
          <SelectTrigger className="h-5 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="outer" className="text-[10px] text-zinc-300">Outer</SelectItem>
            <SelectItem value="inner" className="text-[10px] text-zinc-300">Inner</SelectItem>
            <SelectItem value="emboss" className="text-[10px] text-zinc-300">Emboss</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 w-14">Direction</span>
        <Select value={effect.direction} onValueChange={(v) => onChange({ ...effect, direction: v as 'up' | 'down' })}>
          <SelectTrigger className="h-5 text-[10px] bg-zinc-800 border-zinc-700 text-zinc-300 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="up" className="text-[10px] text-zinc-300">Up</SelectItem>
            <SelectItem value="down" className="text-[10px] text-zinc-300">Down</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SliderRow label="Depth" value={effect.depth} min={0} max={1000} onChange={(v) => onChange({ ...effect, depth: v })} />
      <SliderRow label="Size" value={effect.size} min={0} max={250} onChange={(v) => onChange({ ...effect, size: v })} />
      <SliderRow label="Soften" value={effect.soften} min={0} max={16} onChange={(v) => onChange({ ...effect, soften: v })} />
      <SliderRow label="Angle" value={effect.angle} min={0} max={360} onChange={(v) => onChange({ ...effect, angle: v })} suffix="°" />
      <SliderRow label="Altitude" value={effect.altitude} min={0} max={90} onChange={(v) => onChange({ ...effect, altitude: v })} suffix="°" />
      <Separator className="bg-zinc-700 my-1" />
      <ColorInput label="Highlight" value={effect.highlightColor} onChange={(v) => onChange({ ...effect, highlightColor: v })} />
      <SliderRow label="H-Opacity" value={effect.highlightOpacity} min={0} max={100} onChange={(v) => onChange({ ...effect, highlightOpacity: v })} suffix="%" />
      <ColorInput label="Shadow" value={effect.shadowColor} onChange={(v) => onChange({ ...effect, shadowColor: v })} />
      <SliderRow label="S-Opacity" value={effect.shadowOpacity} min={0} max={100} onChange={(v) => onChange({ ...effect, shadowOpacity: v })} suffix="%" />
    </div>
  );
}

function SatinEffectEditor({ effect, onChange }: { effect: LayerEffectSatin; onChange: (e: LayerEffectSatin) => void }) {
  return (
    <div className="space-y-1.5 px-2 pb-2">
      <ColorInput label="Color" value={effect.color} onChange={(v) => onChange({ ...effect, color: v })} />
      <SliderRow label="Opacity" value={effect.opacity} min={0} max={100} onChange={(v) => onChange({ ...effect, opacity: v })} suffix="%" />
      <SliderRow label="Angle" value={effect.angle} min={0} max={360} onChange={(v) => onChange({ ...effect, angle: v })} suffix="°" />
      <SliderRow label="Distance" value={effect.distance} min={0} max={50} onChange={(v) => onChange({ ...effect, distance: v })} />
      <SliderRow label="Blur" value={effect.blur} min={0} max={250} onChange={(v) => onChange({ ...effect, blur: v })} />
    </div>
  );
}

export default function LayerEffectsPanel() {
  const layers = useEditorStore((s) => s.layers);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const updateLayerEffects = useEditorStore((s) => s.updateLayerEffects);
  const showEffectsPanel = useEditorStore((s) => s.showEffectsPanel);
  const setShowEffectsPanel = useEditorStore((s) => s.setShowEffectsPanel);
  const effectsPanelPosition = useEditorStore((s) => s.effectsPanelPosition);
  const setEffectsPanelPosition = useEditorStore((s) => s.setEffectsPanelPosition);

  const [expandedEffects, setExpandedEffects] = useState<Set<EffectType>>(new Set());
  const [isPinned, setIsPinned] = useState(effectsPanelPosition === null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const hasEnabledEffects = activeLayer?.effects ? Object.entries(activeLayer.effects).some(
    ([, e]) => e && 'enabled' in e && e.enabled
  ) : false;

  const toggleExpanded = (type: EffectType) => {
    setExpandedEffects((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const updateEffect = (type: EffectType, value: unknown) => {
    if (activeLayerId) updateLayerEffects(activeLayerId, { [type]: value });
  };

  const toggleEnabled = (type: EffectType) => {
    if (!activeLayer) return;
    const current = activeLayer.effects?.[type] as { enabled: boolean } | undefined;
    if (current) {
      updateEffect(type, { ...current, enabled: !current.enabled });
    } else {
      const defaults = effectDefaults[type];
      updateEffect(type, { ...defaults, enabled: true });
    }
  };

  const removeEffect = (type: EffectType) => {
    const current = activeLayer?.effects?.[type] as { enabled: boolean } | undefined;
    if (current) updateEffect(type, { ...current, enabled: false });
  };

  const addNewEffect = (type: EffectType) => {
    const defaults = effectDefaults[type];
    updateEffect(type, { ...defaults, enabled: true });
    setExpandedEffects((prev) => new Set(prev).add(type));
  };

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isPinned) return;
    setIsDragging(true);
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [isPinned]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setEffectsPanelPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, setEffectsPanelPosition]);

  const handlePin = useCallback(() => {
    setIsPinned(true);
    setEffectsPanelPosition(null);
  }, [setEffectsPanelPosition]);

  const handleUnpin = useCallback(() => {
    setIsPinned(false);
    setEffectsPanelPosition({ x: 100, y: 100 });
  }, [setEffectsPanelPosition]);

  if (!showEffectsPanel || !activeLayer) return null;

  const effects = activeLayer.effects || {};
  const effectOrder: EffectType[] = ['dropShadow', 'innerShadow', 'stroke', 'outerGlow', 'innerGlow', 'bevelEmboss', 'satin'];

  const panelContent = (
    <div className="bg-zinc-900" ref={panelRef}>
      {/* Header with drag handle */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-1.5">
          <GripVertical size={12} className="text-zinc-500" />
          <Sparkles size={12} className="text-amber-400" />
          <span className="text-[11px] font-medium text-zinc-300">Layer Effects</span>
          {hasEnabledEffects && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={(e) => { e.stopPropagation(); if (isPinned) handleUnpin(); else handlePin(); }}
            title={isPinned ? 'Unpin panel' : 'Pin panel'}
          >
            <Pin size={10} className={isPinned ? 'text-emerald-400' : ''} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => setShowEffectsPanel(false)}
            title="Close"
          >
            <X size={10} />
          </Button>
        </div>
      </div>

      {/* Add effect button */}
      <div className="px-3 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 w-full justify-start">
              + Add Effect
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 border-zinc-700 min-w-40">
            {effectOrder.map((type) => (
              <DropdownMenuItem key={type} onClick={() => addNewEffect(type)} className="text-[11px] text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100">
                {effectLabels[type]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Effects list */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {effectOrder.map((type) => {
          const effect = effects[type] as { enabled: boolean } | undefined;
          if (!effect) return null;
          const isExpanded = expandedEffects.has(type);
          return (
            <div key={type} className="border-b border-zinc-800">
              <div className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-800">
                <button className="text-zinc-400 hover:text-zinc-200 flex-shrink-0" onClick={() => toggleEnabled(type)}>
                  {effect.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
                <button className="flex items-center gap-1 flex-1 min-w-0" onClick={() => toggleExpanded(type)}>
                  {isExpanded ? <ChevronDown size={10} className="text-zinc-500" /> : <ChevronRight size={10} className="text-zinc-500" />}
                  <span className={`text-[11px] ${effect.enabled ? 'text-zinc-300' : 'text-zinc-600'}`}>{effectLabels[type]}</span>
                </button>
                <button className="text-zinc-600 hover:text-red-400 flex-shrink-0" onClick={() => removeEffect(type)}>
                  <Trash2 size={10} />
                </button>
              </div>
              {isExpanded && (
                <div className="bg-zinc-850">
                  {type === 'dropShadow' && effects.dropShadow && <ShadowEffectEditor effect={effects.dropShadow} onChange={(e) => updateEffect('dropShadow', e)} />}
                  {type === 'innerShadow' && effects.innerShadow && <ShadowEffectEditor effect={effects.innerShadow} onChange={(e) => updateEffect('innerShadow', e)} />}
                  {type === 'stroke' && effects.stroke && <StrokeEffectEditor effect={effects.stroke} onChange={(e) => updateEffect('stroke', e)} />}
                  {type === 'outerGlow' && effects.outerGlow && <GlowEffectEditor effect={effects.outerGlow} onChange={(e) => updateEffect('outerGlow', e)} />}
                  {type === 'innerGlow' && effects.innerGlow && <GlowEffectEditor effect={effects.innerGlow} onChange={(e) => updateEffect('innerGlow', e)} />}
                  {type === 'bevelEmboss' && effects.bevelEmboss && <BevelEffectEditor effect={effects.bevelEmboss} onChange={(e) => updateEffect('bevelEmboss', e)} />}
                  {type === 'satin' && effects.satin && <SatinEffectEditor effect={effects.satin} onChange={(e) => updateEffect('satin', e)} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // If pinned, render inline (current position under layers panel)
  if (isPinned) {
    return <div className="border-t border-zinc-700">{panelContent}</div>;
  }

  // If floating, render as absolutely positioned div
  const pos = effectsPanelPosition || { x: 100, y: 100 };
  return (
    <div className="fixed z-50 shadow-xl border border-zinc-700 rounded-md" style={{ left: pos.x, top: pos.y }}>
      {panelContent}
    </div>
  );
}
