'use client';

import { useCallback, useRef } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { saveProject } from '@/lib/project-storage';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';

interface TopMenuBarProps {
  onNewCanvas: () => void;
  onOpenImage: () => void;
  onOpenPSD: () => void;
  onExport: () => void;
  onFilter: (filterType: string) => void;
  onCanvasSize: () => void;
  onCloseTab: () => void;
  onColorAdjust: () => void;
}

export default function TopMenuBar({ onNewCanvas, onOpenImage, onOpenPSD, onExport, onFilter, onCanvasSize, onCloseTab, onColorAdjust }: TopMenuBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const addLayer = useEditorStore((s) => s.addLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const mergeDown = useEditorStore((s) => s.mergeDown);
  const flattenImage = useEditorStore((s) => s.flattenImage);
  const clearCanvas = useEditorStore((s) => s.clearCanvas);
  const layers = useEditorStore((s) => s.layers);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetZoom = useEditorStore((s) => s.resetZoom);
  const showGrid = useEditorStore((s) => s.showGrid);
  const setShowGrid = useEditorStore((s) => s.setShowGrid);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const setSnapToGrid = useEditorStore((s) => s.setSnapToGrid);
  const showSnapGuides = useEditorStore((s) => s.showSnapGuides);
  const setShowSnapGuides = useEditorStore((s) => s.setShowSnapGuides);
  const showHistoryPanel = useEditorStore((s) => s.showHistoryPanel);
  const setShowHistoryPanel = useEditorStore((s) => s.setShowHistoryPanel);
  const canvas = useEditorStore((s) => s.canvas);
  const updateCanvas = useEditorStore((s) => s.updateCanvas);
  const rotateCanvas = useEditorStore((s) => s.rotateCanvas);
  const projectName = useEditorStore((s) => s.projectName);
  const projectId = useEditorStore((s) => s.projectId);
  const importImage = useEditorStore((s) => s.importImage);
  const setSelectedObjectIds = useEditorStore((s) => s.setSelectedObjectIds);
  const addLayerMask = useEditorStore((s) => s.addLayerMask);
  const removeLayerMask = useEditorStore((s) => s.removeLayerMask);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        importImage(src, img.naturalWidth, img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [importImage]);

  const handleSaveProject = useCallback(async () => {
    const state = useEditorStore.getState();
    const id = projectId || crypto.randomUUID();
    await saveProject({
      id,
      name: projectName,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      layers: state.layers,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }, [projectId, projectName, canvas.width, canvas.height]);

  return (
    <div className="flex items-center bg-zinc-800 border-b border-zinc-700 h-8 px-2">
      <Menubar className="bg-transparent border-none h-7 shadow-none gap-0">
        {/* File Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={onNewCanvas} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              New <MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleOpenFile} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Open Image <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onOpenPSD} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Open PSD... <MenubarShortcut>Ctrl+Shift+O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={handleSaveProject} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Save Project <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onExport} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Export As...
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={onCloseTab} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Close Tab <MenubarShortcut>Ctrl+W</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Edit Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            Edit
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={undo} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={redo} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => {
              pushHistory('Select All');
              const allIds = layers.flatMap((l) => l.objects.map((o) => o.id));
              setSelectedObjectIds(allIds);
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Select All <MenubarShortcut>Ctrl+A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setSelectedObjectIds([])} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Deselect <MenubarShortcut>Ctrl+D</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Image Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            Image
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={onCanvasSize} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Canvas Size...
            </MenubarItem>
            <MenubarItem onClick={onColorAdjust} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Color Adjustments...
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => {
              pushHistory('Rotate 90° CW');
              rotateCanvas('cw');
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Rotate 90° CW
            </MenubarItem>
            <MenubarItem onClick={() => {
              pushHistory('Rotate 90° CCW');
              rotateCanvas('ccw');
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Rotate 90° CCW
            </MenubarItem>
            <MenubarItem onClick={() => {
              pushHistory('Rotate 180°');
              rotateCanvas('180');
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Rotate 180°
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => {
              pushHistory('Flip Horizontal');
              updateCanvas({ width: canvas.width });
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Flip Horizontal
            </MenubarItem>
            <MenubarItem onClick={() => {
              pushHistory('Flip Vertical');
              updateCanvas({ height: canvas.height });
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Flip Vertical
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Layer Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            Layer
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={() => {
              addLayer();
              pushHistory('New Layer');
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              New Layer
            </MenubarItem>
            {activeLayerId && (
              <MenubarItem onClick={() => {
                duplicateLayer(activeLayerId);
                pushHistory('Duplicate Layer');
              }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
                Duplicate Layer
              </MenubarItem>
            )}
            {activeLayerId && layers.length > 1 && (
              <MenubarItem onClick={() => {
                removeLayer(activeLayerId);
                pushHistory('Delete Layer');
              }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
                Delete Layer
              </MenubarItem>
            )}
            <MenubarSeparator className="bg-zinc-700" />
            {activeLayerId && (
              <MenubarItem onClick={() => addLayerMask(activeLayerId)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
                Add Layer Mask
              </MenubarItem>
            )}
            {activeLayerId && layers.find(l => l.id === activeLayerId)?.hasMask && (
              <MenubarItem onClick={() => removeLayerMask(activeLayerId)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
                Remove Layer Mask
              </MenubarItem>
            )}
            <MenubarSeparator className="bg-zinc-700" />
            {activeLayerId && (
              <MenubarItem onClick={() => {
                mergeDown(activeLayerId);
                pushHistory('Merge Down');
              }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
                Merge Down <MenubarShortcut>Ctrl+E</MenubarShortcut>
              </MenubarItem>
            )}
            <MenubarItem onClick={() => {
              flattenImage();
              pushHistory('Flatten Image');
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Flatten Image
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Filter Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            Filter
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={() => onFilter('blur')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Blur...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('gaussian-blur')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Gaussian Blur...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('sharpen')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Sharpen...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('noise')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Add Noise...
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => onFilter('brightness')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Brightness / Contrast...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('hue')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Hue / Saturation...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('color-balance')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Color Balance...
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => onFilter('grayscale')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Grayscale
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('sepia')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Sepia
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('invert')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Invert
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('edge-detection')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Edge Detection
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => onFilter('posterize')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Posterize...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('threshold')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Threshold...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('vignette')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Vignette...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('pixelate')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Pixelate...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('emboss')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Emboss...
            </MenubarItem>
            <MenubarItem onClick={() => onFilter('oil-paint')} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Oil Paint...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* View Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-zinc-300 text-xs h-7 px-2 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
            View
          </MenubarTrigger>
          <MenubarContent className="bg-zinc-800 border-zinc-700 min-w-48">
            <MenubarItem onClick={zoomIn} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Zoom In <MenubarShortcut>Ctrl++</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={zoomOut} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Zoom Out <MenubarShortcut>Ctrl+-</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={resetZoom} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Actual Size <MenubarShortcut>Ctrl+1</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => {
              const container = document.querySelector('.canvas-container');
              if (container) {
                const rect = container.getBoundingClientRect();
                const scaleX = (rect.width - 40) / canvas.width;
                const scaleY = (rect.height - 40) / canvas.height;
                const zoom = Math.min(scaleX, scaleY);
                useEditorStore.getState().setZoom(zoom);
              }
            }} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              Fit to Screen <MenubarShortcut>Ctrl+0</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => setShowGrid(!showGrid)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              {showGrid ? '✓ ' : ''}Show Grid
            </MenubarItem>
            <MenubarItem onClick={() => setSnapToGrid(!snapToGrid)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              {snapToGrid ? '✓ ' : ''}Snap to Grid
            </MenubarItem>
            <MenubarItem onClick={() => setShowSnapGuides(!showSnapGuides)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              {showSnapGuides ? '✓ ' : ''}Show Snap Guides
            </MenubarItem>
            <MenubarSeparator className="bg-zinc-700" />
            <MenubarItem onClick={() => setShowHistoryPanel(!showHistoryPanel)} className="text-zinc-300 text-xs focus:bg-zinc-700 focus:text-zinc-100">
              {showHistoryPanel ? '✓ ' : ''}History Panel
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="ml-auto text-xs text-zinc-500 pr-2">
        {Math.round(canvas.zoom * 100)}% | {canvas.width} × {canvas.height}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
