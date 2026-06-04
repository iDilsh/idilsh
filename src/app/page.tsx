'use client';

import { useCallback, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useEditorStore } from '@/lib/editor-store';
import { exportCanvas, downloadBlob, exportFullCanvas } from '@/lib/image-processing';
import type { FilterOptions } from '@/lib/types';
import { DEFAULT_FILTER_OPTIONS, CANVAS_PRESETS } from '@/lib/types';
import Toolbar from '@/components/editor/Toolbar';
import TopMenuBar from '@/components/editor/TopMenuBar';
import LayerPanel from '@/components/editor/LayerPanel';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import TabBar from '@/components/editor/TabBar';
import LayerEffectsPanel from '@/components/editor/LayerEffectsPanel';
import HistoryPanel from '@/components/editor/HistoryPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileImage } from 'lucide-react';

const EditorCanvas = dynamic(() => import('@/components/editor/EditorCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Loading editor...</div>
    </div>
  ),
});

// New Canvas Dialog
function NewCanvasDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [name, setName] = useState('Untitled');
  const newProject = useEditorStore((s) => s.newProject);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">New Canvas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-xs">Width (px)</Label>
              <Input
                type="number"
                min={1}
                max={8192}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Height (px)</Label>
              <Input
                type="number"
                min={1}
                max={8192}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {CANVAS_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-7 bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
                  onClick={() => {
                    setWidth(preset.width);
                    setHeight(preset.height);
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              newProject(width, height, name);
              onOpenChange(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Export Dialog
function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'svg' | 'tiff'>('png');
  const [quality, setQuality] = useState(92);
  const [exportForWeb, setExportForWeb] = useState(false);
  const canvas = useEditorStore((s) => s.canvas);
  const layers = useEditorStore((s) => s.layers);
  const projectName = useEditorStore((s) => s.projectName);

  const handleExport = async () => {
    try {
      if (format === 'svg') {
        // SVG export - create an SVG with embedded image
        const exportCanvasEl = await exportFullCanvas(canvas.width, canvas.height, layers);
        const dataUrl = exportCanvasEl.toDataURL('image/png');
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        downloadBlob(blob, `${projectName}.svg`);
      } else if (format === 'tiff') {
        // TIFF - export as PNG (browser doesn't natively support TIFF)
        const exportCanvasEl = await exportFullCanvas(canvas.width, canvas.height, layers);
        const blob = exportCanvas(exportCanvasEl, 'png', 1);
        downloadBlob(blob, `${projectName}.png`);
      } else {
        const exportCanvasEl = await exportFullCanvas(canvas.width, canvas.height, layers);
        const exportFormat = format as 'png' | 'jpg' | 'webp';
        
        if (exportForWeb) {
          // Optimize for web - reduce quality
          const webQuality = Math.min(quality, 80) / 100;
          const blob = exportCanvas(exportCanvasEl, exportFormat, webQuality);
          downloadBlob(blob, `${projectName}.${exportFormat === 'jpg' ? 'jpeg' : exportFormat}`);
        } else {
          const blob = exportCanvas(exportCanvasEl, exportFormat, quality / 100);
          downloadBlob(blob, `${projectName}.${exportFormat === 'jpg' ? 'jpeg' : exportFormat}`);
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      // Fallback to simple export
      const stageEl = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement;
      if (stageEl) {
        try {
          const blob = exportCanvas(stageEl, format === 'svg' || format === 'tiff' ? 'png' : format as 'png' | 'jpg' | 'webp', quality / 100);
          downloadBlob(blob, `${projectName}.${format === 'jpg' ? 'jpeg' : format === 'svg' || format === 'tiff' ? 'png' : format}`);
        } catch {
          // Give up
        }
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Export As</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'png' | 'jpg' | 'webp' | 'svg' | 'tiff')}>
              <SelectTrigger className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="png" className="text-zinc-300">PNG</SelectItem>
                <SelectItem value="jpg" className="text-zinc-300">JPEG</SelectItem>
                <SelectItem value="webp" className="text-zinc-300">WebP</SelectItem>
                <SelectItem value="svg" className="text-zinc-300">SVG (embedded raster)</SelectItem>
                <SelectItem value="tiff" className="text-zinc-300">TIFF (as PNG)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {format !== 'png' && format !== 'svg' && format !== 'tiff' && (
            <div>
              <Label className="text-zinc-400 text-xs">Quality: {quality}%</Label>
              <Slider
                min={1}
                max={100}
                value={[quality]}
                onValueChange={(v) => setQuality(v[0])}
                className="mt-2"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="export-web"
              checked={exportForWeb}
              onCheckedChange={(v) => setExportForWeb(v === true)}
            />
            <Label htmlFor="export-web" className="text-zinc-400 text-xs cursor-pointer">
              Optimize for Web
            </Label>
          </div>
          <div className="text-xs text-zinc-500">
            Output size: {canvas.width} × {canvas.height}px
            {exportForWeb && ' (optimized)'}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Filter Dialog
function FilterDialog({ open, onOpenChange, filterType }: { open: boolean; onOpenChange: (v: boolean) => void; filterType: string }) {
  const [options, setOptions] = useState<FilterOptions>({ ...DEFAULT_FILTER_OPTIONS });
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const applyFilterToLayer = useEditorStore((s) => s.applyFilterToLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);

  const filterConfigs: Record<string, { key: keyof FilterOptions; label: string; min: number; max: number; default: number }[]> = {
    blur: [{ key: 'blur', label: 'Blur Radius', min: 0, max: 20, default: 5 }],
    'gaussian-blur': [{ key: 'gaussianBlur', label: 'Gaussian Blur Radius', min: 0, max: 30, default: 5 }],
    sharpen: [{ key: 'sharpen', label: 'Sharpen Amount', min: 0, max: 100, default: 50 }],
    noise: [{ key: 'noise', label: 'Noise Amount', min: 0, max: 100, default: 25 }],
    brightness: [
      { key: 'brightness', label: 'Brightness', min: -100, max: 100, default: 0 },
      { key: 'contrast', label: 'Contrast', min: -100, max: 100, default: 0 },
    ],
    hue: [
      { key: 'hue', label: 'Hue', min: -180, max: 180, default: 0 },
      { key: 'saturation', label: 'Saturation', min: -100, max: 100, default: 0 },
    ],
    'color-balance': [
      { key: 'brightness', label: 'Red', min: -100, max: 100, default: 0 },
      { key: 'contrast', label: 'Green', min: -100, max: 100, default: 0 },
      { key: 'sharpen', label: 'Blue', min: -100, max: 100, default: 0 },
    ],
    posterize: [{ key: 'posterize', label: 'Posterize Level', min: 0, max: 100, default: 50 }],
    threshold: [{ key: 'threshold', label: 'Threshold', min: 0, max: 100, default: 50 }],
    vignette: [{ key: 'vignette', label: 'Vignette Amount', min: 0, max: 100, default: 50 }],
    pixelate: [{ key: 'pixelate', label: 'Pixel Size', min: 0, max: 100, default: 30 }],
    emboss: [{ key: 'emboss', label: 'Emboss Strength', min: 0, max: 100, default: 50 }],
    'oil-paint': [{ key: 'oilPaint', label: 'Oil Paint Radius', min: 0, max: 100, default: 50 }],
  };

  const config = filterConfigs[filterType] || [];

  const handleApply = async () => {
    if (!activeLayerId) return;
    await applyFilterToLayer(activeLayerId, filterType, options);
    onOpenChange(false);
  };

  const titleMap: Record<string, string> = {
    blur: 'Blur',
    'gaussian-blur': 'Gaussian Blur',
    sharpen: 'Sharpen',
    noise: 'Add Noise',
    brightness: 'Brightness / Contrast',
    hue: 'Hue / Saturation',
    'color-balance': 'Color Balance',
    posterize: 'Posterize',
    threshold: 'Threshold',
    vignette: 'Vignette',
    pixelate: 'Pixelate',
    emboss: 'Emboss',
    'oil-paint': 'Oil Paint',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{titleMap[filterType] || filterType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {config.map((cfg) => (
            <div key={cfg.key}>
              <Label className="text-zinc-400 text-xs">
                {cfg.label}: {options[cfg.key]}
              </Label>
              <Slider
                min={cfg.min}
                max={cfg.max}
                value={[options[cfg.key]]}
                onValueChange={(v) => setOptions((prev) => ({ ...prev, [cfg.key]: v[0] }))}
                className="mt-2"
              />
            </div>
          ))}
          {config.length === 0 && (
            <p className="text-xs text-zinc-500">This filter will be applied directly.</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Canvas Size Dialog
function CanvasSizeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const canvas = useEditorStore((s) => s.canvas);
  const updateCanvas = useEditorStore((s) => s.updateCanvas);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const [width, setWidth] = useState(canvas.width);
  const [height, setHeight] = useState(canvas.height);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Canvas Size</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-xs">Width (px)</Label>
              <Input
                type="number"
                min={1}
                max={8192}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Height (px)</Label>
              <Input
                type="number"
                min={1}
                max={8192}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
              />
            </div>
          </div>
          <div className="text-xs text-zinc-500">
            Current: {canvas.width} × {canvas.height}px
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              pushHistory('Resize Canvas');
              updateCanvas({ width, height });
              onOpenChange(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Color Adjustment Dialog
function ColorAdjustDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [blacks, setBlacks] = useState(0);
  const [whites, setWhites] = useState(0);
  const [mids, setMids] = useState(0);
  const applyFilterToLayer = useEditorStore((s) => s.applyFilterToLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Color Adjustments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-zinc-400 text-xs">Input Blacks: {blacks}</Label>
            <Slider
              min={-100}
              max={100}
              value={[blacks]}
              onValueChange={(v) => setBlacks(v[0])}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Input Whites: {whites}</Label>
            <Slider
              min={-100}
              max={100}
              value={[whites]}
              onValueChange={(v) => setWhites(v[0])}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Midtones: {mids}</Label>
            <Slider
              min={-100}
              max={100}
              value={[mids]}
              onValueChange={(v) => setMids(v[0])}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (activeLayerId) {
                const options = { ...DEFAULT_FILTER_OPTIONS, brightness: blacks, contrast: whites, saturation: mids };
                await applyFilterToLayer(activeLayerId, 'brightness', options);
              }
              onOpenChange(false);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Welcome dialog
function WelcomeDialog({ open, onOpenChange, onNewCanvas, onOpenImage, onOpenPSD }: { open: boolean; onOpenChange: (v: boolean) => void; onNewCanvas: () => void; onOpenImage: () => void; onOpenPSD: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-zinc-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-xl">PixelForge Editor</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-zinc-400 text-sm mb-6">
            A powerful browser-based image editor. Create new canvases, open images, or import PSD files to get started.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => {
                onOpenChange(false);
                onNewCanvas();
              }}
              className="h-24 flex flex-col gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span className="text-xs">New Canvas</span>
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                onOpenImage();
              }}
              className="h-24 flex flex-col gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="text-xs">Open Image</span>
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                onOpenPSD();
              }}
              className="h-24 flex flex-col gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600"
            >
              <FileImage size={24} />
              <span className="text-xs">Open PSD</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EditorPage() {
  const [newCanvasOpen, setNewCanvasOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [canvasSizeOpen, setCanvasSizeOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [colorAdjustOpen, setColorAdjustOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const psdInputRef = useRef<HTMLInputElement>(null);
  const importImage = useEditorStore((s) => s.importImage);
  const importPSD = useEditorStore((s) => s.importPSD);
  const applyFilterToLayer = useEditorStore((s) => s.applyFilterToLayer);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const activeTool = useEditorStore((s) => s.activeTool);
  const canvas = useEditorStore((s) => s.canvas);
  const mousePos = useEditorStore((s) => s.mousePos);
  const removeTab = useEditorStore((s) => s.removeTab);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const showHistoryPanel = useEditorStore((s) => s.showHistoryPanel);

  const handleOpenImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOpenPSD = useCallback(() => {
    psdInputRef.current?.click();
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
        useEditorStore.getState().updateCanvas({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [importImage]);

  const handlePSDChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importPSD(file);
    e.target.value = '';
  }, [importPSD]);

  const handleFilter = useCallback((type: string) => {
    // Quick filters (no dialog) - apply directly
    if (type === 'grayscale' || type === 'sepia' || type === 'invert' || type === 'edge-detection') {
      if (activeLayerId) {
        const options = { ...DEFAULT_FILTER_OPTIONS };
        switch (type) {
          case 'grayscale': options.grayscale = 100; break;
          case 'sepia': options.sepia = 100; break;
          case 'invert': options.invert = 100; break;
          case 'edge-detection': break; // uses defaults
        }
        applyFilterToLayer(activeLayerId, type, options);
      }
      return;
    }
    setFilterType(type);
    setFilterOpen(true);
  }, [activeLayerId, applyFilterToLayer]);

  const handleCloseTab = useCallback(() => {
    if (activeTabId) {
      removeTab(activeTabId);
    }
  }, [activeTabId, removeTab]);

  const toolNameMap: Record<string, string> = {
    select: 'Select',
    move: 'Move',
    hand: 'Hand',
    zoom: 'Zoom',
    brush: 'Brush',
    eraser: 'Eraser',
    fill: 'Fill',
    eyedropper: 'Eyedropper',
    text: 'Text',
    shape: 'Shape',
    line: 'Line',
    crop: 'Crop',
    pen: 'Pen',
    gradient: 'Gradient',
    'clone-stamp': 'Clone Stamp',
    'blur-brush': 'Blur Brush',
    'sharpen-brush': 'Sharpen Brush',
    dodge: 'Dodge',
    burn: 'Burn',
    sponge: 'Sponge',
    measure: 'Measure',
    marquee: 'Marquee',
    slice: 'Slice',
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden select-none">
      {/* Top Menu Bar */}
      <TopMenuBar
        onNewCanvas={() => setNewCanvasOpen(true)}
        onOpenImage={handleOpenImage}
        onOpenPSD={handleOpenPSD}
        onExport={() => setExportOpen(true)}
        onFilter={handleFilter}
        onCanvasSize={() => setCanvasSizeOpen(true)}
        onCloseTab={handleCloseTab}
        onColorAdjust={() => setColorAdjustOpen(true)}
      />

      {/* Tab Bar */}
      <TabBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar />

        {/* Center Canvas */}
        <EditorCanvas />

        {/* Right Panel */}
        <div className="flex flex-col">
          <LayerPanel />
          <LayerEffectsPanel />
          <PropertiesPanel />
        </div>
      </div>

      {/* History Panel (toggleable) */}
      {showHistoryPanel && (
        <div className="flex">
          <HistoryPanel />
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 bg-zinc-800 border-t border-zinc-700 flex items-center px-3 gap-4">
        <span className="text-[10px] text-zinc-500">
          {toolNameMap[activeTool] || activeTool}
        </span>
        <Separator orientation="vertical" className="h-3 bg-zinc-700" />
        <span className="text-[10px] text-zinc-500">
          {Math.round(canvas.zoom * 100)}%
        </span>
        <Separator orientation="vertical" className="h-3 bg-zinc-700" />
        <span className="text-[10px] text-zinc-500">
          {canvas.width} × {canvas.height}px
        </span>
        <Separator orientation="vertical" className="h-3 bg-zinc-700" />
        <span className="text-[10px] text-zinc-500">
          X: {mousePos.x} Y: {mousePos.y}
        </span>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={psdInputRef}
        type="file"
        accept=".psd"
        className="hidden"
        onChange={handlePSDChange}
      />

      {/* Dialogs */}
      <NewCanvasDialog open={newCanvasOpen} onOpenChange={setNewCanvasOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <FilterDialog key={filterType} open={filterOpen} onOpenChange={setFilterOpen} filterType={filterType} />
      <CanvasSizeDialog key={canvasSizeOpen ? 'open' : 'closed'} open={canvasSizeOpen} onOpenChange={setCanvasSizeOpen} />
      <ColorAdjustDialog open={colorAdjustOpen} onOpenChange={setColorAdjustOpen} />
      <WelcomeDialog
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        onNewCanvas={() => setNewCanvasOpen(true)}
        onOpenImage={handleOpenImage}
        onOpenPSD={handleOpenPSD}
      />
    </div>
  );
}
