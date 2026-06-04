export type ToolType =
  | 'select' | 'move' | 'hand' | 'zoom'
  | 'brush' | 'eraser' | 'fill' | 'eyedropper'
  | 'text' | 'shape' | 'line' | 'pen'
  | 'crop' | 'slice'
  | 'gradient' | 'clone-stamp' | 'blur-brush' | 'sharpen-brush'
  | 'dodge' | 'burn' | 'sponge' | 'measure' | 'marquee';

export type ShapeType = 
  | 'rectangle' | 'rounded-rect' | 'ellipse' | 'circle'
  | 'triangle' | 'star' | 'polygon' | 'diamond'
  | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down'
  | 'heart' | 'hexagon' | 'pentagon' | 'cross' | 'octagon';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation-blend' | 'color' | 'luminosity';

// Layer Effects
export interface LayerEffectStroke {
  enabled: boolean;
  color: string;
  size: number;
  position: 'outside' | 'inside' | 'center';
  opacity: number;
}

export interface LayerEffectShadow {
  enabled: boolean;
  color: string;
  opacity: number;
  angle: number;
  distance: number;
  blur: number;
  spread: number;
}

export interface LayerEffectGlow {
  enabled: boolean;
  color: string;
  opacity: number;
  blur: number;
  spread: number;
}

export interface LayerEffectBevel {
  enabled: boolean;
  style: 'outer' | 'inner' | 'emboss';
  depth: number;
  direction: 'up' | 'down';
  size: number;
  soften: number;
  angle: number;
  altitude: number;
  highlightColor: string;
  highlightOpacity: number;
  shadowColor: string;
  shadowOpacity: number;
}

export interface LayerEffectSatin {
  enabled: boolean;
  color: string;
  opacity: number;
  angle: number;
  distance: number;
  blur: number;
}

export interface LayerEffects {
  stroke?: LayerEffectStroke;
  dropShadow?: LayerEffectShadow;
  innerShadow?: LayerEffectShadow;
  outerGlow?: LayerEffectGlow;
  innerGlow?: LayerEffectGlow;
  bevelEmboss?: LayerEffectBevel;
  satin?: LayerEffectSatin;
}

// Pen tool path anchor point
export interface PathAnchor {
  x: number;
  y: number;
  handleInX?: number;
  handleInY?: number;
  handleOutX?: number;
  handleOutY?: number;
}

// Brush preset
export interface BrushPreset {
  id: string;
  name: string;
  size: number;
  opacity: number;
  hardness: number;
  icon: string;
}

// Crop state
export interface CropState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isCropping: boolean;
}

// Snap guide
export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
}

// Tab system
export interface ProjectTab {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  layers: EditorLayer[];
  activeLayerId: string | null;
  selectedObjectIds: string[];
  canvas: CanvasState;
  history: HistoryEntry[];
  historyIndex: number;
  projectName: string;
  isPsd?: boolean;
  psdData?: unknown;
  modified?: boolean;
}

export interface EditorLayer {
  id: string;
  name: string;
  type: 'raster' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  objects: EditorObject[];
  effects?: LayerEffects;
  maskData?: string; // base64 encoded image data for the mask
  hasMask?: boolean;
}

export interface EditorObject {
  id: string;
  type: 'image' | 'rect' | 'circle' | 'ellipse' | 'line' | 'text' | 'path' | 'brush-stroke' | 'gradient';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  // Image Specific
  imageSrc?: string;
  // Text Specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  // Brush stroke Specific
  points?: number[];
  brushSize?: number;
  brushColor?: string;
  // Shape Specific
  shapeType?: ShapeType;
  cornerRadius?: number;
  // Line Specific
  linePoints?: number[];
  // Gradient Specific
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
  // Path (pen tool) Specific
  pathData?: string; // SVG path data string
  pathAnchors?: PathAnchor[];
  pathClosed?: boolean;
}

export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface HistoryEntry {
  layers: EditorLayer[];
  description: string;
  timestamp?: number;
}

export interface ProjectData {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  layers: EditorLayer[];
  createdAt: number;
  updatedAt: number;
}

export interface FilterOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  noise: number;
  grayscale: number;
  sepia: number;
  invert: number;
  // New filters
  gaussianBlur: number;
  posterize: number;
  threshold: number;
  vignette: number;
  pixelate: number;
  emboss: number;
  oilPaint: number;
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  noise: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  gaussianBlur: 0,
  posterize: 0,
  threshold: 0,
  vignette: 0,
  pixelate: 0,
  emboss: 0,
  oilPaint: 0,
};

export const DEFAULT_STROKE_EFFECT: LayerEffectStroke = { enabled: false, color: '#000000', size: 3, position: 'outside', opacity: 100 };
export const DEFAULT_DROP_SHADOW: LayerEffectShadow = { enabled: false, color: '#000000', opacity: 75, angle: 135, distance: 5, blur: 5, spread: 0 };
export const DEFAULT_INNER_SHADOW: LayerEffectShadow = { enabled: false, color: '#000000', opacity: 75, angle: 135, distance: 5, blur: 5, spread: 0 };
export const DEFAULT_OUTER_GLOW: LayerEffectGlow = { enabled: false, color: '#ffff00', opacity: 75, blur: 5, spread: 0 };
export const DEFAULT_INNER_GLOW: LayerEffectGlow = { enabled: false, color: '#ffff00', opacity: 75, blur: 5, spread: 0 };
export const DEFAULT_BEVEL_EMBOSS: LayerEffectBevel = { enabled: false, style: 'outer', depth: 100, direction: 'up', size: 5, soften: 0, angle: 135, altitude: 30, highlightColor: '#ffffff', highlightOpacity: 75, shadowColor: '#000000', shadowOpacity: 75 };
export const DEFAULT_SATIN: LayerEffectSatin = { enabled: false, color: '#000000', opacity: 50, angle: 19, distance: 11, blur: 14 };

export const DEFAULT_LAYER_EFFECTS: LayerEffects = {
  stroke: { ...DEFAULT_STROKE_EFFECT },
  dropShadow: { ...DEFAULT_DROP_SHADOW },
  innerShadow: { ...DEFAULT_INNER_SHADOW },
  outerGlow: { ...DEFAULT_OUTER_GLOW },
  innerGlow: { ...DEFAULT_INNER_GLOW },
  bevelEmboss: { ...DEFAULT_BEVEL_EMBOSS },
  satin: { ...DEFAULT_SATIN },
};

export const CANVAS_PRESETS = [
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: 'HD', width: 1280, height: 720 },
  { name: 'Square', width: 1080, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'A4 (300 DPI)', width: 2480, height: 3508 },
  { name: 'Social Media', width: 1200, height: 630 },
] as const;

// Brush presets
export const BRUSH_PRESETS: BrushPreset[] = [
  { id: 'hard-round', name: 'Hard Round', size: 10, opacity: 100, hardness: 100, icon: '●' },
  { id: 'soft-round', name: 'Soft Round', size: 20, opacity: 80, hardness: 0, icon: '○' },
  { id: 'calligraphy', name: 'Calligraphy', size: 15, opacity: 100, hardness: 80, icon: '✒' },
  { id: 'airbrush', name: 'Airbrush', size: 30, opacity: 40, hardness: 10, icon: '◌' },
  { id: 'pencil', name: 'Pencil', size: 3, opacity: 100, hardness: 100, icon: '✏' },
  { id: 'marker', name: 'Marker', size: 25, opacity: 60, hardness: 50, icon: '▮' },
];

// All filter types for the menu
export const FILTER_TYPES = [
  'blur', 'gaussian-blur', 'sharpen', 'noise',
  'brightness', 'hue', 'color-balance',
  'grayscale', 'sepia', 'invert', 'edge-detection',
  'posterize', 'threshold', 'vignette', 'pixelate', 'emboss', 'oil-paint',
] as const;

export type FilterType = typeof FILTER_TYPES[number];
