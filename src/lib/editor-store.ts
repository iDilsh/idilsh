import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ToolType,
  ShapeType,
  BlendMode,
  EditorLayer,
  EditorObject,
  CanvasState,
  HistoryEntry,
  LayerEffects,
  FilterOptions,
  ProjectTab,
  CropState,
  SnapGuide,
  BrushPreset,
} from './types';
import { DEFAULT_LAYER_EFFECTS } from './types';
import { parsePSDFile } from './psd-parser';
import { applyFilterToLayerObjectsAsync } from './image-processing';

const MAX_HISTORY = 50;

interface EditorState {
  canvas: CanvasState;
  layers: EditorLayer[];
  activeLayerId: string | null;
  selectedObjectIds: string[];
  activeTool: ToolType;
  activeShapeType: ShapeType;
  foregroundColor: string;
  backgroundColor: string;
  brushSize: number;
  eraserSize: number;
  brushHardness: number;
  brushOpacity: number;
  activeBrushPreset: string;
  fontSize: number;
  fontFamily: string;
  history: HistoryEntry[];
  historyIndex: number;
  isDrawing: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  showSnapGuides: boolean;
  snapGuides: SnapGuide[];
  projectName: string;
  projectId: string | null;
  mousePos: { x: number; y: number };
  // Tab system
  tabs: ProjectTab[];
  activeTabId: string | null;
  // Effects panel
  showEffectsPanel: boolean;
  // History panel
  showHistoryPanel: boolean;
  // Clone stamp source
  cloneSource: { x: number; y: number } | null;
  // Crop state
  cropState: CropState | null;
  // Fill tolerance
  fillTolerance: number;
}

interface EditorActions {
  setCanvas: (state: CanvasState) => void;
  updateCanvas: (partial: Partial<CanvasState>) => void;
  addLayer: (name?: string) => string;
  removeLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  setActiveLayerId: (id: string | null) => void;
  updateLayer: (id: string, partial: Partial<EditorLayer>) => void;
  addObjectToLayer: (layerId: string, obj: EditorObject) => void;
  updateObject: (layerId: string, objId: string, partial: Partial<EditorObject>) => void;
  removeObject: (layerId: string, objId: string) => void;
  setActiveTool: (tool: ToolType) => void;
  setActiveShapeType: (shape: ShapeType) => void;
  setForegroundColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  swapColors: () => void;
  setBrushSize: (size: number) => void;
  setEraserSize: (size: number) => void;
  setBrushHardness: (hardness: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setActiveBrushPreset: (presetId: string) => void;
  applyBrushPreset: (preset: BrushPreset) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  pushHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  jumpToHistory: (index: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  importImage: (imageSrc: string, width: number, height: number) => void;
  clearCanvas: () => void;
  setIsDrawing: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setShowSnapGuides: (v: boolean) => void;
  setSnapGuides: (guides: SnapGuide[]) => void;
  setMousePos: (pos: { x: number; y: number }) => void;
  newProject: (width: number, height: number, name?: string) => void;
  flattenImage: () => void;
  mergeDown: (layerId: string) => void;
  rotateCanvas: (direction: 'cw' | 'ccw' | '180') => void;
  flipCanvas: (direction: 'horizontal' | 'vertical') => void;
  getActiveLayer: () => EditorLayer | undefined;
  getSelectedObjects: () => EditorObject[];
  // Tab system
  addTab: (tab: ProjectTab) => void;
  removeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  // Layer effects
  updateLayerEffects: (layerId: string, effects: Partial<LayerEffects>) => void;
  applyFilterToLayer: (layerId: string, filterType: string, options: FilterOptions) => Promise<void>;
  // PSD import
  importPSD: (file: File) => Promise<void>;
  // Effects panel
  setShowEffectsPanel: (v: boolean) => void;
  // History panel
  setShowHistoryPanel: (v: boolean) => void;
  // Clone stamp
  setCloneSource: (pos: { x: number; y: number } | null) => void;
  // Crop
  setCropState: (state: CropState | null) => void;
  applyCrop: (x: number, y: number, w: number, h: number) => void;
  // Fill tolerance
  setFillTolerance: (tolerance: number) => void;
  // Layer mask
  addLayerMask: (layerId: string) => void;
  removeLayerMask: (layerId: string) => void;
  // Tab sync
  syncToTab: () => void;
  loadFromTab: (tab: ProjectTab) => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createDefaultLayer(name?: string): EditorLayer {
  return {
    id: uuidv4(),
    name: name || 'Layer 1',
    type: 'raster',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    objects: [],
    effects: { ...DEFAULT_LAYER_EFFECTS },
    hasMask: false,
    maskData: undefined,
  };
}

const initialLayer = createDefaultLayer();
const initialTabId = uuidv4();

const initialTab: ProjectTab = {
  id: initialTabId,
  name: 'Untitled',
  canvasWidth: 1920,
  canvasHeight: 1080,
  layers: [initialLayer],
  activeLayerId: initialLayer.id,
  selectedObjectIds: [],
  canvas: {
    width: 1920,
    height: 1080,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  history: [],
  historyIndex: -1,
  projectName: 'Untitled',
  modified: false,
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  canvas: {
    width: 1920,
    height: 1080,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  },
  layers: [initialLayer],
  activeLayerId: initialLayer.id,
  selectedObjectIds: [],
  activeTool: 'select',
  activeShapeType: 'rectangle',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  brushSize: 5,
  eraserSize: 20,
  brushHardness: 100,
  brushOpacity: 100,
  activeBrushPreset: 'hard-round',
  fontSize: 24,
  fontFamily: 'Arial',
  history: [],
  historyIndex: -1,
  isDrawing: false,
  showGrid: false,
  snapToGrid: false,
  showSnapGuides: true,
  snapGuides: [],
  projectName: 'Untitled',
  projectId: null,
  mousePos: { x: 0, y: 0 },
  tabs: [initialTab],
  activeTabId: initialTabId,
  showEffectsPanel: false,
  showHistoryPanel: false,
  cloneSource: null,
  cropState: null,
  fillTolerance: 32,

  // Sync current state to the active tab
  syncToTab: () => {
    const state = get();
    if (!state.activeTabId) return;
    set((s) => ({
      tabs: s.tabs.map((tab) =>
        tab.id === s.activeTabId
          ? {
              ...tab,
              name: s.projectName,
              canvasWidth: s.canvas.width,
              canvasHeight: s.canvas.height,
              layers: deepClone(s.layers),
              activeLayerId: s.activeLayerId,
              selectedObjectIds: [...s.selectedObjectIds],
              canvas: { ...s.canvas },
              history: deepClone(s.history),
              historyIndex: s.historyIndex,
              projectName: s.projectName,
              modified: true,
            }
          : tab
      ),
    }));
  },

  // Load state from a tab
  loadFromTab: (tab: ProjectTab) => {
    set({
      canvas: { ...tab.canvas },
      layers: deepClone(tab.layers),
      activeLayerId: tab.activeLayerId,
      selectedObjectIds: [...tab.selectedObjectIds],
      history: deepClone(tab.history),
      historyIndex: tab.historyIndex,
      projectName: tab.projectName || tab.name,
      projectId: tab.id,
    });
  },

  setCanvas: (state) => set({ canvas: state }),
  updateCanvas: (partial) =>
    set((s) => ({ canvas: { ...s.canvas, ...partial } })),

  addLayer: (name?) => {
    const state = get();
    const layerNum = state.layers.length + 1;
    const newLayer = createDefaultLayer(name || `Layer ${layerNum}`);
    set((s) => ({
      layers: [...s.layers, newLayer],
      activeLayerId: newLayer.id,
    }));
    return newLayer.id;
  },

  removeLayer: (id) => {
    set((s) => {
      if (s.layers.length <= 1) return s;
      const newLayers = s.layers.filter((l) => l.id !== id);
      const newActiveId = s.activeLayerId === id ? newLayers[newLayers.length - 1]?.id || null : s.activeLayerId;
      return { layers: newLayers, activeLayerId: newActiveId };
    });
  },

  duplicateLayer: (id) => {
    set((s) => {
      const layer = s.layers.find((l) => l.id === id);
      if (!layer) return s;
      const cloned = deepClone({ ...layer, id: uuidv4(), name: `${layer.name} copy` });
      const idx = s.layers.findIndex((l) => l.id === id);
      const newLayers = [...s.layers];
      newLayers.splice(idx + 1, 0, cloned);
      return { layers: newLayers, activeLayerId: cloned.id };
    });
  },

  moveLayerUp: (id) => {
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx >= s.layers.length - 1) return s;
      const newLayers = [...s.layers];
      [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
      return { layers: newLayers };
    });
  },

  moveLayerDown: (id) => {
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx <= 0) return s;
      const newLayers = [...s.layers];
      [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
      return { layers: newLayers };
    });
  },

  setActiveLayerId: (id) => set({ activeLayerId: id }),

  updateLayer: (id, partial) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    })),

  addObjectToLayer: (layerId, obj) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === layerId ? { ...l, objects: [...l.objects, obj] } : l
      ),
    })),

  updateObject: (layerId, objId, partial) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === layerId
          ? {
              ...l,
              objects: l.objects.map((o) =>
                o.id === objId ? { ...o, ...partial } : o
              ),
            }
          : l
      ),
    })),

  removeObject: (layerId, objId) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === layerId
          ? { ...l, objects: l.objects.filter((o) => o.id !== objId) }
          : l
      ),
      selectedObjectIds: s.selectedObjectIds.filter((id) => id !== objId),
    })),

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActiveShapeType: (shape) => set({ activeShapeType: shape }),

  setForegroundColor: (color) => set({ foregroundColor: color }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  swapColors: () =>
    set((s) => ({
      foregroundColor: s.backgroundColor,
      backgroundColor: s.foregroundColor,
    })),

  setBrushSize: (size) => set({ brushSize: size }),
  setEraserSize: (size) => set({ eraserSize: size }),
  setBrushHardness: (hardness) => set({ brushHardness: hardness }),
  setBrushOpacity: (opacity) => set({ brushOpacity: opacity }),
  setActiveBrushPreset: (presetId) => set({ activeBrushPreset: presetId }),
  applyBrushPreset: (preset) => set({
    brushSize: preset.size,
    brushOpacity: preset.opacity,
    brushHardness: preset.hardness,
    activeBrushPreset: preset.id,
  }),

  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),

  pushHistory: (description) => {
    const state = get();
    const entry: HistoryEntry = {
      layers: deepClone(state.layers),
      description,
      timestamp: Date.now(),
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;
    const entry = state.history[state.historyIndex];
    set({
      layers: deepClone(entry.layers),
      historyIndex: state.historyIndex - 1,
      selectedObjectIds: [],
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const nextIndex = state.historyIndex + 1;
    const entry = state.history[nextIndex];
    if (!entry) return;
    set({
      layers: deepClone(entry.layers),
      historyIndex: nextIndex,
      selectedObjectIds: [],
    });
  },

  jumpToHistory: (index: number) => {
    const state = get();
    if (index < 0 || index >= state.history.length) return;
    const entry = state.history[index];
    if (!entry) return;
    set({
      layers: deepClone(entry.layers),
      historyIndex: index,
      selectedObjectIds: [],
    });
  },

  setZoom: (zoom) => set((s) => ({ canvas: { ...s.canvas, zoom: Math.max(0.05, Math.min(32, zoom)) } })),
  zoomIn: () => {
    const state = get();
    state.setZoom(state.canvas.zoom * 1.2);
  },
  zoomOut: () => {
    const state = get();
    state.setZoom(state.canvas.zoom / 1.2);
  },
  resetZoom: () => set((s) => ({ canvas: { ...s.canvas, zoom: 1 } })),

  importImage: (imageSrc, width, height) => {
    const state = get();
    const layerId = state.addLayer('Image');
    const obj: EditorObject = {
      id: uuidv4(),
      type: 'image',
      x: 0,
      y: 0,
      width,
      height,
      imageSrc,
      opacity: 100,
    };
    state.addObjectToLayer(layerId, obj);
    state.pushHistory('Import Image');
  },

  clearCanvas: () => {
    const state = get();
    state.pushHistory('Clear Canvas');
    set((s) => ({
      layers: [createDefaultLayer()],
      activeLayerId: null,
      selectedObjectIds: [],
    }));
  },

  setIsDrawing: (v) => set({ isDrawing: v }),
  setShowGrid: (v) => set({ showGrid: v }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),
  setShowSnapGuides: (v) => set({ showSnapGuides: v }),
  setSnapGuides: (guides) => set({ snapGuides: guides }),
  setMousePos: (pos) => set({ mousePos: pos }),

  newProject: (width, height, name?) => {
    // Save current tab state first
    const state = get();
    state.syncToTab();

    const newLayer = createDefaultLayer('Layer 1');
    const tabId = uuidv4();
    const newTab: ProjectTab = {
      id: tabId,
      name: name || 'Untitled',
      canvasWidth: width,
      canvasHeight: height,
      layers: [deepClone(newLayer)],
      activeLayerId: newLayer.id,
      selectedObjectIds: [],
      canvas: { width, height, zoom: 1, offsetX: 0, offsetY: 0 },
      history: [],
      historyIndex: -1,
      projectName: name || 'Untitled',
      modified: false,
    };

    set({
      canvas: { width, height, zoom: 1, offsetX: 0, offsetY: 0 },
      layers: [newLayer],
      activeLayerId: newLayer.id,
      selectedObjectIds: [],
      history: [],
      historyIndex: -1,
      projectName: name || 'Untitled',
      projectId: tabId,
      tabs: [...state.tabs, newTab],
      activeTabId: tabId,
    });
  },

  flattenImage: () => {
    set((s) => {
      const allObjects = s.layers.flatMap((l) => l.objects);
      const flatLayer: EditorLayer = {
        id: uuidv4(),
        name: 'Background',
        type: 'raster',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
        objects: allObjects,
        effects: { ...DEFAULT_LAYER_EFFECTS },
      };
      return { layers: [flatLayer], activeLayerId: flatLayer.id, selectedObjectIds: [] };
    });
  },

  mergeDown: (layerId) => {
    set((s) => {
      const idx = s.layers.findIndex((l) => l.id === layerId);
      if (idx <= 0) return s;
      const upper = s.layers[idx];
      const lower = s.layers[idx - 1];
      const merged: EditorLayer = {
        ...lower,
        id: uuidv4(),
        name: lower.name,
        objects: [...lower.objects, ...upper.objects],
      };
      const newLayers = [...s.layers];
      newLayers.splice(idx - 1, 2, merged);
      return { layers: newLayers, activeLayerId: merged.id };
    });
  },

  rotateCanvas: (direction) => {
    set((s) => {
      let newW = s.canvas.width;
      let newH = s.canvas.height;
      if (direction !== '180') {
        newW = s.canvas.height;
        newH = s.canvas.width;
      }
      return { canvas: { ...s.canvas, width: newW, height: newH } };
    });
  },

  flipCanvas: (_direction) => {
    // Flipping is handled at render/export time
  },

  getActiveLayer: () => {
    const state = get();
    return state.layers.find((l) => l.id === state.activeLayerId);
  },

  getSelectedObjects: () => {
    const state = get();
    const objects: EditorObject[] = [];
    for (const layer of state.layers) {
      for (const obj of layer.objects) {
        if (state.selectedObjectIds.includes(obj.id)) {
          objects.push(obj);
        }
      }
    }
    return objects;
  },

  // Tab system actions
  addTab: (tab: ProjectTab) => {
    const state = get();
    state.syncToTab();
    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
    }));
    state.loadFromTab(tab);
  },

  removeTab: (id: string) => {
    const state = get();
    state.syncToTab();

    set((s) => {
      const newTabs = s.tabs.filter((t) => t.id !== id);
      if (newTabs.length === 0) {
        // Create a new empty tab
        const newLayer = createDefaultLayer('Layer 1');
        const newTabId = uuidv4();
        const newTab: ProjectTab = {
          id: newTabId,
          name: 'Untitled',
          canvasWidth: 1920,
          canvasHeight: 1080,
          layers: [deepClone(newLayer)],
          activeLayerId: newLayer.id,
          selectedObjectIds: [],
          canvas: { width: 1920, height: 1080, zoom: 1, offsetX: 0, offsetY: 0 },
          history: [],
          historyIndex: -1,
          projectName: 'Untitled',
          modified: false,
        };
        return {
          tabs: [newTab],
          activeTabId: newTabId,
        };
      }

      // If removing the active tab, switch to the previous one
      let newActiveTabId = s.activeTabId;
      if (s.activeTabId === id) {
        const removedIdx = s.tabs.findIndex((t) => t.id === id);
        const prevIdx = Math.max(0, removedIdx - 1);
        newActiveTabId = newTabs[prevIdx]?.id || newTabs[0].id;
      }

      return { tabs: newTabs, activeTabId: newActiveTabId };
    });

    // Load the new active tab
    const newState = get();
    const activeTab = newState.tabs.find((t) => t.id === newState.activeTabId);
    if (activeTab) {
      newState.loadFromTab(activeTab);
    }
  },

  setActiveTabId: (id: string) => {
    const state = get();
    if (state.activeTabId === id) return;
    state.syncToTab();
    set({ activeTabId: id });
    const tab = state.tabs.find((t) => t.id === id);
    if (tab) {
      state.loadFromTab(tab);
    }
  },

  renameTab: (id: string, name: string) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, name, projectName: name } : t)),
      projectName: s.activeTabId === id ? name : s.projectName,
    }));
  },

  // Layer effects
  updateLayerEffects: (layerId: string, effects: Partial<LayerEffects>) => {
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === layerId
          ? { ...l, effects: { ...DEFAULT_LAYER_EFFECTS, ...l.effects, ...effects } }
          : l
      ),
    }));
  },

  // Apply filter to a layer
  applyFilterToLayer: async (layerId: string, filterType: string, options: FilterOptions) => {
    const state = get();
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const filteredObjects = await applyFilterToLayerObjectsAsync(
      layer.objects,
      filterType,
      options,
      state.canvas.width,
      state.canvas.height
    );

    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === layerId ? { ...l, objects: filteredObjects } : l
      ),
    }));

    state.pushHistory(`Apply Filter: ${filterType}`);
  },

  // PSD import
  importPSD: async (file: File) => {
    try {
      const result = await parsePSDFile(file);

      // Save current tab
      const state = get();
      state.syncToTab();

      const tabId = uuidv4();
      const firstLayer = result.layers[0];
      const newTab: ProjectTab = {
        id: tabId,
        name: file.name.replace(/\.psd$/i, ''),
        canvasWidth: result.width,
        canvasHeight: result.height,
        layers: deepClone(result.layers),
        activeLayerId: firstLayer?.id || null,
        selectedObjectIds: [],
        canvas: { width: result.width, height: result.height, zoom: 1, offsetX: 0, offsetY: 0 },
        history: [],
        historyIndex: -1,
        projectName: file.name.replace(/\.psd$/i, ''),
        isPsd: true,
        modified: false,
      };

      set({
        canvas: { width: result.width, height: result.height, zoom: 1, offsetX: 0, offsetY: 0 },
        layers: result.layers,
        activeLayerId: firstLayer?.id || null,
        selectedObjectIds: [],
        history: [],
        historyIndex: -1,
        projectName: file.name.replace(/\.psd$/i, ''),
        projectId: tabId,
        tabs: [...state.tabs, newTab],
        activeTabId: tabId,
      });
    } catch (error) {
      console.error('Failed to import PSD:', error);
    }
  },

  setShowEffectsPanel: (v) => set({ showEffectsPanel: v }),
  setShowHistoryPanel: (v) => set({ showHistoryPanel: v }),
  setCloneSource: (pos) => set({ cloneSource: pos }),
  setCropState: (state) => set({ cropState: state }),
  setFillTolerance: (tolerance) => set({ fillTolerance: tolerance }),

  applyCrop: (x: number, y: number, w: number, h: number) => {
    const state = get();
    state.pushHistory('Crop Canvas');
    // Adjust all object positions relative to the crop origin
    const adjustedLayers = state.layers.map((layer) => ({
      ...layer,
      objects: layer.objects.map((obj) => ({
        ...obj,
        x: obj.x - x,
        y: obj.y - y,
      })),
    }));
    set({
      layers: adjustedLayers,
      canvas: { ...state.canvas, width: Math.round(w), height: Math.round(h) },
      cropState: null,
    });
  },

  addLayerMask: (layerId: string) => {
    const state = get();
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer || layer.hasMask) return;
    // Create a white mask (fully opaque)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = state.canvas.width;
    maskCanvas.height = state.canvas.height;
    const ctx = maskCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    const maskData = maskCanvas.toDataURL('image/png');
    state.updateLayer(layerId, { hasMask: true, maskData });
    state.pushHistory('Add Layer Mask');
  },

  removeLayerMask: (layerId: string) => {
    const state = get();
    state.updateLayer(layerId, { hasMask: false, maskData: undefined });
    state.pushHistory('Remove Layer Mask');
  },
}));
