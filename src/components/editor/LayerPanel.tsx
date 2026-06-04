'use client';

import { useEditorStore } from '@/lib/editor-store';
import type { BlendMode, EditorLayer } from '@/lib/types';
import { DEFAULT_LAYER_EFFECTS } from '@/lib/types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useCallback } from 'react';

const blendModes: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation-blend', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

function hasEnabledEffects(effects: typeof DEFAULT_LAYER_EFFECTS | undefined): boolean {
  if (!effects) return false;
  return Object.values(effects).some(e => e && 'enabled' in e && e.enabled);
}

export default function LayerPanel() {
  const layers = useEditorStore((s) => s.layers);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const setActiveLayerId = useEditorStore((s) => s.setActiveLayerId);
  const addLayer = useEditorStore((s) => s.addLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const moveLayerUp = useEditorStore((s) => s.moveLayerUp);
  const moveLayerDown = useEditorStore((s) => s.moveLayerDown);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const showEffectsPanel = useEditorStore((s) => s.showEffectsPanel);
  const setShowEffectsPanel = useEditorStore((s) => s.setShowEffectsPanel);
  const addLayerMask = useEditorStore((s) => s.addLayerMask);
  const removeLayerMask = useEditorStore((s) => s.removeLayerMask);

  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  const startEditName = useCallback((layer: EditorLayer) => {
    setEditingName(layer.id);
    setEditNameValue(layer.name);
  }, []);

  const finishEditName = useCallback(() => {
    if (editingName && editNameValue.trim()) {
      updateLayer(editingName, { name: editNameValue.trim() });
    }
    setEditingName(null);
  }, [editingName, editNameValue, updateLayer]);

  return (
    <div className="w-60 bg-zinc-900 border-l border-zinc-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300">Layers</span>
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => {
              addLayer();
              pushHistory('New Layer');
            }}
            title="Add Layer"
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => {
              if (activeLayerId && layers.length > 1) {
                removeLayer(activeLayerId);
                pushHistory('Delete Layer');
              }
            }}
            title="Delete Layer"
            disabled={!activeLayerId || layers.length <= 1}
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => {
              if (activeLayerId) {
                duplicateLayer(activeLayerId);
                pushHistory('Duplicate Layer');
              }
            }}
            title="Duplicate Layer"
            disabled={!activeLayerId}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => {
              if (activeLayerId) moveLayerUp(activeLayerId);
            }}
            title="Move Up"
            disabled={!activeLayerId}
          >
            <ChevronUp size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={() => {
              if (activeLayerId) moveLayerDown(activeLayerId);
            }}
            title="Move Down"
            disabled={!activeLayerId}
          >
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>

      {/* Layer list */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {[...layers].reverse().map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer border-b border-zinc-800 ${
                layer.id === activeLayerId
                  ? 'bg-zinc-700'
                  : 'hover:bg-zinc-800'
              }`}
              onClick={() => setActiveLayerId(layer.id)}
            >
              {/* Visibility toggle */}
              <button
                className="text-zinc-400 hover:text-zinc-200 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { visible: !layer.visible });
                }}
              >
                {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>

              {/* Lock toggle */}
              <button
                className="text-zinc-400 hover:text-zinc-200 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, { locked: !layer.locked });
                }}
              >
                {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>

              {/* fx button */}
              <button
                className={`flex-shrink-0 ${hasEnabledEffects(layer.effects) ? 'text-amber-400' : 'text-zinc-500'} hover:text-amber-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLayerId(layer.id);
                  setShowEffectsPanel(!showEffectsPanel);
                }}
                title="Layer Effects"
              >
                <Sparkles size={11} />
              </button>

              {/* Mask button */}
              <button
                className={`flex-shrink-0 ${layer.hasMask ? 'text-sky-400' : 'text-zinc-500'} hover:text-sky-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (layer.hasMask) {
                    removeLayerMask(layer.id);
                    pushHistory('Remove Layer Mask');
                  } else {
                    addLayerMask(layer.id);
                  }
                }}
                title={layer.hasMask ? 'Remove Mask' : 'Add Mask'}
              >
                <CircleDot size={11} />
              </button>

              {/* Layer name */}
              <div className="flex-1 min-w-0">
                {editingName === layer.id ? (
                  <input
                    className="w-full bg-zinc-600 text-zinc-200 text-xs px-1 py-0.5 rounded outline-none border border-zinc-500"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={finishEditName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditName();
                      if (e.key === 'Escape') setEditingName(null);
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="text-xs text-zinc-300 truncate block"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditName(layer);
                    }}
                  >
                    {layer.name}
                    {hasEnabledEffects(layer.effects) && (
                      <span className="text-amber-400 ml-1 text-[9px]">fx</span>
                    )}
                    {layer.hasMask && (
                      <span className="text-sky-400 ml-1 text-[9px]">◉</span>
                    )}
                  </span>
                )}
              </div>

              {/* Opacity preview */}
              <span className="text-[10px] text-zinc-500 flex-shrink-0">
                {layer.opacity}%
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Active layer properties */}
      {activeLayer && (
        <div className="border-t border-zinc-700 px-3 py-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-12">Opacity</span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[activeLayer.opacity]}
              onValueChange={(v) => updateLayer(activeLayer.id, { opacity: v[0] })}
              className="flex-1"
            />
            <span className="text-[10px] text-zinc-400 w-8 text-right">{activeLayer.opacity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 w-12">Blend</span>
            <Select
              value={activeLayer.blendMode}
              onValueChange={(v) => updateLayer(activeLayer.id, { blendMode: v as BlendMode })}
            >
              <SelectTrigger className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {blendModes.map((bm) => (
                  <SelectItem key={bm.value} value={bm.value} className="text-xs text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100">
                    {bm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
