import type { EditorLayer, EditorObject, LayerEffects, BlendMode } from './types';
import { v4 as uuidv4 } from 'uuid';

export interface PSDImportResult {
  width: number;
  height: number;
  layers: EditorLayer[];
}

export async function parsePSDFile(file: File): Promise<PSDImportResult> {
  // Dynamic import to prevent build-time resolution of Node.js 'canvas' module
  const { readPsd } = await import('ag-psd');
  const buffer = await file.arrayBuffer();
  const psd = readPsd(buffer, {
    skipCompositeImageData: false,
    skipThumbnail: false,
    skipLayerImageData: false,
    createCanvas: () => {
      const c = document.createElement('canvas');
      return c as unknown as import('canvas').Canvas;
    },
  });

  const width = psd.width || 800;
  const height = psd.height || 600;
  const layers: EditorLayer[] = [];

  function processPsdLayer(psdLayer: Record<string, unknown>, index: number): void {
    const layerId = uuidv4();
    const objects: EditorObject[] = [];

    // FIX 13: If the layer has a canvas (rasterized content), add it as image object
    const canvas = psdLayer.canvas as HTMLCanvasElement | undefined;
    if (canvas && canvas.width > 0 && canvas.height > 0) {
      const dataUrl = canvas.toDataURL('image/png');
      const left = (psdLayer.left as number) || 0;
      const top = (psdLayer.top as number) || 0;
      const right = (psdLayer.right as number) || canvas.width;
      const bottom = (psdLayer.bottom as number) || canvas.height;
      objects.push({
        id: uuidv4(),
        type: 'image',
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        imageSrc: dataUrl,
        opacity: 100,
      });
    } else if (psdLayer.canvas && (psdLayer.canvas as HTMLCanvasElement).width === 0) {
      // FIX 13: Layer has a canvas but it's empty - try using imageData if available
      const imageData = psdLayer.imageData as ImageData | undefined;
      if (imageData && imageData.width > 0 && imageData.height > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(imageData, 0, 0);
          const dataUrl = tempCanvas.toDataURL('image/png');
          const left = (psdLayer.left as number) || 0;
          const top = (psdLayer.top as number) || 0;
          objects.push({
            id: uuidv4(),
            type: 'image',
            x: left,
            y: top,
            width: imageData.width,
            height: imageData.height,
            imageSrc: dataUrl,
            opacity: 100,
          });
        }
      }
    }

    // Parse PSD layer effects
    const effects: LayerEffects = {};
    const layerEffects = psdLayer.layerEffects as Record<string, unknown> | undefined;
    if (layerEffects) {
      // Drop shadow
      const dropShadow = layerEffects.dropShadow as Record<string, unknown> | undefined;
      if (dropShadow) {
        effects.dropShadow = {
          enabled: (dropShadow.enabled as boolean) ?? false,
          color: (dropShadow.color as string) || '#000000',
          opacity: ((dropShadow.opacity as number) ?? 75),
          angle: ((dropShadow.angle as number) ?? 135),
          distance: ((dropShadow.distance as number) ?? 5),
          blur: ((dropShadow.blur as number) ?? 5),
          spread: ((dropShadow.spread as number) ?? 0),
        };
      }

      // Inner shadow
      const innerShadow = layerEffects.innerShadow as Record<string, unknown> | undefined;
      if (innerShadow) {
        effects.innerShadow = {
          enabled: (innerShadow.enabled as boolean) ?? false,
          color: (innerShadow.color as string) || '#000000',
          opacity: ((innerShadow.opacity as number) ?? 75),
          angle: ((innerShadow.angle as number) ?? 135),
          distance: ((innerShadow.distance as number) ?? 5),
          blur: ((innerShadow.blur as number) ?? 5),
          spread: ((innerShadow.spread as number) ?? 0),
        };
      }

      // Outer glow
      const outerGlow = layerEffects.outerGlow as Record<string, unknown> | undefined;
      if (outerGlow) {
        effects.outerGlow = {
          enabled: (outerGlow.enabled as boolean) ?? false,
          color: (outerGlow.color as string) || '#ffff00',
          opacity: ((outerGlow.opacity as number) ?? 75),
          blur: ((outerGlow.blur as number) ?? 5),
          spread: ((outerGlow.spread as number) ?? 0),
        };
      }

      // Stroke
      const strokeFx = layerEffects.stroke as Record<string, unknown> | undefined;
      if (strokeFx) {
        effects.stroke = {
          enabled: (strokeFx.enabled as boolean) ?? false,
          color: (strokeFx.color as string) || '#000000',
          size: ((strokeFx.size as number) ?? 3),
          position: ((strokeFx.position as string) as 'outside' | 'inside' | 'center') || 'outside',
          opacity: ((strokeFx.opacity as number) ?? 100),
        };
      }

      // Bevel & Emboss
      const bevelEmboss = layerEffects.bevelEmboss as Record<string, unknown> | undefined;
      if (bevelEmboss) {
        effects.bevelEmboss = {
          enabled: (bevelEmboss.enabled as boolean) ?? false,
          style: ((bevelEmboss.style as string) as 'outer' | 'inner' | 'emboss') || 'outer',
          depth: ((bevelEmboss.depth as number) ?? 100),
          direction: ((bevelEmboss.direction as string) as 'up' | 'down') || 'up',
          size: ((bevelEmboss.size as number) ?? 5),
          soften: ((bevelEmboss.soften as number) ?? 0),
          angle: ((bevelEmboss.angle as number) ?? 135),
          altitude: ((bevelEmboss.altitude as number) ?? 30),
          highlightColor: (bevelEmboss.highlightColor as string) || '#ffffff',
          highlightOpacity: ((bevelEmboss.highlightOpacity as number) ?? 75),
          shadowColor: (bevelEmboss.shadowColor as string) || '#000000',
          shadowOpacity: ((bevelEmboss.shadowOpacity as number) ?? 75),
        };
      }

      // Satin
      const satin = layerEffects.satin as Record<string, unknown> | undefined;
      if (satin) {
        effects.satin = {
          enabled: (satin.enabled as boolean) ?? false,
          color: (satin.color as string) || '#000000',
          opacity: ((satin.opacity as number) ?? 50),
          angle: ((satin.angle as number) ?? 19),
          distance: ((satin.distance as number) ?? 11),
          blur: ((satin.blur as number) ?? 14),
        };
      }
    }

    const hasEffects = Object.values(effects).some(e => e && 'enabled' in e && e.enabled);

    const editorLayer: EditorLayer = {
      id: layerId,
      name: (psdLayer.name as string) || `Layer ${index + 1}`,
      type: 'raster',
      visible: (psdLayer.hidden as boolean) !== true,
      locked: false,
      opacity: psdLayer.opacity !== undefined ? (psdLayer.opacity as number) : 100,
      blendMode: mapBlendMode(psdLayer.blendMode as string | undefined),
      objects,
      effects: hasEffects ? effects : undefined,
    };

    layers.push(editorLayer);

    // Process children (group layers)
    const children = psdLayer.children as Record<string, unknown>[] | undefined;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        processPsdLayer(children[i], i);
      }
    }
  }

  const children = psd.children as Record<string, unknown>[] | undefined;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      processPsdLayer(children[i], i);
    }
  }

  // FIX 13: If all layers are empty but there's a composite image, use it
  if (layers.every(l => l.objects.length === 0) && (psd as Record<string, unknown>).canvas) {
    const compositeCanvas = (psd as Record<string, unknown>).canvas as HTMLCanvasElement;
    if (compositeCanvas && compositeCanvas.width > 0 && compositeCanvas.height > 0) {
      const dataUrl = compositeCanvas.toDataURL('image/png');
      const bgLayer: EditorLayer = {
        id: uuidv4(),
        name: 'Background',
        type: 'raster',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
        objects: [{
          id: uuidv4(),
          type: 'image',
          x: 0,
          y: 0,
          width: compositeCanvas.width,
          height: compositeCanvas.height,
          imageSrc: dataUrl,
          opacity: 100,
        }],
      };
      // Replace empty layers with the composite image
      if (layers.length > 0) {
        // Keep named layers but add composite as background
        layers.push(bgLayer);
      } else {
        layers.push(bgLayer);
      }
    }
  }

  // If no layers, create a default one
  if (layers.length === 0) {
    layers.push({
      id: uuidv4(),
      name: 'Layer 1',
      type: 'raster',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      objects: [],
    });
  }

  return { width, height, layers };
}

function mapBlendMode(psdBlendMode?: string): BlendMode {
  const map: Record<string, BlendMode> = {
    'normal': 'normal',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation-blend',
    'color': 'color',
    'luminosity': 'luminosity',
  };
  return map[psdBlendMode || 'normal'] || 'normal';
}
