'use client';

import { useEditorStore } from '@/lib/editor-store';
import type { EditorObject } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { useCallback } from 'react';

export default function PropertiesPanel() {
  const layers = useEditorStore((s) => s.layers);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const updateObject = useEditorStore((s) => s.updateObject);

  // Find selected objects across all layers
  const selectedObjects: EditorObject[] = [];
  for (const layer of layers) {
    for (const obj of layer.objects) {
      if (selectedObjectIds.includes(obj.id)) {
        selectedObjects.push(obj);
      }
    }
  }

  const handleUpdateObject = useCallback(
    (objId: string, partial: Partial<EditorObject>) => {
      if (!activeLayerId) return;
      updateObject(activeLayerId, objId, partial);
    },
    [activeLayerId, updateObject]
  );

  if (selectedObjects.length === 0) {
    return (
      <div className="w-60 bg-zinc-900 border-l border-t border-zinc-700 flex flex-col items-center justify-center p-4">
        <Settings2 size={24} className="text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-500 text-center">No object selected</p>
        <p className="text-[10px] text-zinc-600 text-center mt-1">
          Select an object to edit its properties
        </p>
      </div>
    );
  }

  if (selectedObjects.length > 1) {
    return (
      <div className="w-60 bg-zinc-900 border-l border-t border-zinc-700 flex flex-col items-center justify-center p-4">
        <Settings2 size={24} className="text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-500 text-center">
          {selectedObjects.length} objects selected
        </p>
      </div>
    );
  }

  const obj = selectedObjects[0];

  return (
    <div className="w-60 bg-zinc-900 border-l border-t border-zinc-700 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="px-3 py-2 border-b border-zinc-700">
        <span className="text-xs font-medium text-zinc-300">
          Properties — {obj.type}
        </span>
      </div>

      <div className="px-3 py-2 space-y-3">
        {/* Position */}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Position</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <label className="text-[10px] text-zinc-500">X</label>
              <Input
                type="number"
                value={Math.round(obj.x)}
                onChange={(e) => handleUpdateObject(obj.id, { x: Number(e.target.value) })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Y</label>
              <Input
                type="number"
                value={Math.round(obj.y)}
                onChange={(e) => handleUpdateObject(obj.id, { y: Number(e.target.value) })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        {(obj.type === 'rect' || obj.type === 'ellipse' || obj.type === 'image' || obj.type === 'circle' || obj.type === 'gradient') && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Size</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-[10px] text-zinc-500">W</label>
                <Input
                  type="number"
                  value={Math.round(obj.width || 0)}
                  onChange={(e) => handleUpdateObject(obj.id, { width: Number(e.target.value) })}
                  className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">H</label>
                <Input
                  type="number"
                  value={Math.round(obj.height || 0)}
                  onChange={(e) => handleUpdateObject(obj.id, { height: Number(e.target.value) })}
                  className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rotation */}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Rotation</span>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              value={Math.round(obj.rotation || 0)}
              onChange={(e) => handleUpdateObject(obj.id, { rotation: Number(e.target.value) })}
              className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 w-20"
            />
            <span className="text-[10px] text-zinc-500">deg</span>
          </div>
        </div>

        {/* Gradient Properties */}
        {obj.type === 'gradient' && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Gradient</span>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-500 w-10">Start</label>
                <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                  <input
                    type="color"
                    value={obj.gradientStartColor || '#000000'}
                    onChange={(e) => handleUpdateObject(obj.id, { gradientStartColor: e.target.value })}
                    className="w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full -mt-6"
                    style={{ backgroundColor: obj.gradientStartColor || '#000000' }}
                  />
                </div>
                <Input
                  value={obj.gradientStartColor || '#000000'}
                  onChange={(e) => handleUpdateObject(obj.id, { gradientStartColor: e.target.value })}
                  className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-500 w-10">End</label>
                <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                  <input
                    type="color"
                    value={obj.gradientEndColor || '#ffffff'}
                    onChange={(e) => handleUpdateObject(obj.id, { gradientEndColor: e.target.value })}
                    className="w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full -mt-6"
                    style={{ backgroundColor: obj.gradientEndColor || '#ffffff' }}
                  />
                </div>
                <Input
                  value={obj.gradientEndColor || '#ffffff'}
                  onChange={(e) => handleUpdateObject(obj.id, { gradientEndColor: e.target.value })}
                  className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-zinc-500 w-10">Dir</label>
                <Select
                  value={obj.gradientDirection || 'horizontal'}
                  onValueChange={(v) => handleUpdateObject(obj.id, { gradientDirection: v as 'horizontal' | 'vertical' | 'diagonal' | 'radial' })}
                >
                  <SelectTrigger className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="horizontal" className="text-xs text-zinc-300">Horizontal</SelectItem>
                    <SelectItem value="vertical" className="text-xs text-zinc-300">Vertical</SelectItem>
                    <SelectItem value="diagonal" className="text-xs text-zinc-300">Diagonal</SelectItem>
                    <SelectItem value="radial" className="text-xs text-zinc-300">Radial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Fill */}
        {(obj.type === 'rect' || obj.type === 'circle' || obj.type === 'ellipse' || obj.type === 'path') && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Fill</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                <input
                  type="color"
                  value={obj.fill || '#000000'}
                  onChange={(e) => handleUpdateObject(obj.id, { fill: e.target.value })}
                  className="w-full h-full cursor-pointer opacity-0"
                />
                <div
                  className="w-full h-full -mt-6"
                  style={{ backgroundColor: obj.fill || '#000000' }}
                />
              </div>
              <Input
                value={obj.fill || '#000000'}
                onChange={(e) => handleUpdateObject(obj.id, { fill: e.target.value })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
              />
            </div>
          </div>
        )}

        {/* Stroke */}
        {(obj.type === 'rect' || obj.type === 'circle' || obj.type === 'ellipse' || obj.type === 'line' || obj.type === 'path') && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Stroke</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                <input
                  type="color"
                  value={obj.stroke || '#000000'}
                  onChange={(e) => handleUpdateObject(obj.id, { stroke: e.target.value })}
                  className="w-full h-full cursor-pointer opacity-0"
                />
                <div
                  className="w-full h-full -mt-6"
                  style={{ backgroundColor: obj.stroke || '#000000' }}
                />
              </div>
              <Input
                value={obj.stroke || '#000000'}
                onChange={(e) => handleUpdateObject(obj.id, { stroke: e.target.value })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
              />
            </div>
            <div className="mt-1">
              <label className="text-[10px] text-zinc-500">Width</label>
              <Input
                type="number"
                min={0}
                value={obj.strokeWidth || 0}
                onChange={(e) => handleUpdateObject(obj.id, { strokeWidth: Number(e.target.value) })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 w-20"
              />
            </div>
          </div>
        )}

        {/* Opacity */}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Opacity</span>
          <div className="flex items-center gap-2 mt-1">
            <Slider
              min={0}
              max={100}
              step={1}
              value={[obj.opacity ?? 100]}
              onValueChange={(v) => handleUpdateObject(obj.id, { opacity: v[0] })}
              className="flex-1"
            />
            <span className="text-[10px] text-zinc-400 w-8 text-right">
              {obj.opacity ?? 100}%
            </span>
          </div>
        </div>

        {/* Corner radius for rectangles */}
        {obj.type === 'rect' && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Corner Radius</span>
            <Input
              type="number"
              min={0}
              value={obj.cornerRadius || 0}
              onChange={(e) => handleUpdateObject(obj.id, { cornerRadius: Number(e.target.value) })}
              className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 w-20 mt-1"
            />
          </div>
        )}

        {/* Text properties */}
        {obj.type === 'text' && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Text</span>
            <div className="space-y-2 mt-1">
              <Input
                value={obj.text || ''}
                onChange={(e) => handleUpdateObject(obj.id, { text: e.target.value })}
                className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500">Size</label>
                  <Input
                    type="number"
                    min={1}
                    value={obj.fontSize || 24}
                    onChange={(e) => handleUpdateObject(obj.id, { fontSize: Number(e.target.value) })}
                    className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500">Font</label>
                  <Select
                    value={obj.fontFamily || 'Arial'}
                    onValueChange={(v) => handleUpdateObject(obj.id, { fontFamily: v })}
                  >
                    <SelectTrigger className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Comic Sans MS'].map(
                        (f) => (
                          <SelectItem key={f} value={f} className="text-xs text-zinc-300 focus:bg-zinc-700">
                            {f}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">Color</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                    <input
                      type="color"
                      value={obj.fill || '#000000'}
                      onChange={(e) => handleUpdateObject(obj.id, { fill: e.target.value })}
                      className="w-full h-full cursor-pointer opacity-0"
                    />
                    <div
                      className="w-full h-full -mt-6"
                      style={{ backgroundColor: obj.fill || '#000000' }}
                    />
                  </div>
                  <Input
                    value={obj.fill || '#000000'}
                    onChange={(e) => handleUpdateObject(obj.id, { fill: e.target.value })}
                    className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brush stroke properties */}
        {obj.type === 'brush-stroke' && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Brush</span>
            <div className="mt-1">
              <label className="text-[10px] text-zinc-500">Color</label>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-6 h-6 rounded border border-zinc-600 overflow-hidden flex-shrink-0">
                  <input
                    type="color"
                    value={obj.brushColor || '#000000'}
                    onChange={(e) => handleUpdateObject(obj.id, { brushColor: e.target.value })}
                    className="w-full h-full cursor-pointer opacity-0"
                  />
                  <div
                    className="w-full h-full -mt-6"
                    style={{ backgroundColor: obj.brushColor || '#000000' }}
                  />
                </div>
                <Input
                  value={obj.brushColor || '#000000'}
                  onChange={(e) => handleUpdateObject(obj.id, { brushColor: e.target.value })}
                  className="h-6 text-xs bg-zinc-800 border-zinc-700 text-zinc-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Path properties (pen tool) */}
        {obj.type === 'path' && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Path</span>
            <div className="space-y-2 mt-1">
              <div>
                <label className="text-[10px] text-zinc-500">Anchors</label>
                <span className="text-[10px] text-zinc-400 ml-2">{obj.pathAnchors?.length || 0} points</span>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">Closed</label>
                <span className="text-[10px] text-zinc-400 ml-2">{obj.pathClosed ? 'Yes' : 'No'}</span>
              </div>
              {obj.pathData && (
                <div>
                  <label className="text-[10px] text-zinc-500">SVG Path Data</label>
                  <div className="text-[9px] text-zinc-600 mt-0.5 break-all max-h-16 overflow-y-auto">
                    {obj.pathData}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
