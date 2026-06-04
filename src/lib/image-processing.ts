import type { FilterOptions, EditorObject, LayerEffects } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function adjustBrightness(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const adjustment = (value / 100) * 255;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + adjustment, 0, 255);
    data[i + 1] = clamp(data[i + 1] + adjustment, 0, 255);
    data[i + 2] = clamp(data[i + 2] + adjustment, 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function adjustContrast(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128, 0, 255);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128, 0, 255);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128, 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function adjustSaturation(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const adjustment = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = clamp(gray + (data[i] - gray) * (1 + adjustment), 0, 255);
    data[i + 1] = clamp(gray + (data[i + 1] - gray) * (1 + adjustment), 0, 255);
    data[i + 2] = clamp(gray + (data[i + 2] - gray) * (1 + adjustment), 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function adjustHue(imageData: ImageData, value: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const angle = (value / 180) * Math.PI;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = clamp(r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928), 0, 255);
    data[i + 1] = clamp(r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.14) + b * (0.072 - cos * 0.072 - sin * 0.283), 0, 255);
    data[i + 2] = clamp(r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072), 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function applyBlur(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return imageData;
  const size = Math.max(1, Math.round(radius));
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);

  // Box blur - horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dx = -size; dx <= size; dx++) {
        const nx = clamp(x + dx, 0, w - 1);
        const idx = (y * w + nx) * 4;
        r += src[idx];
        g += src[idx + 1];
        b += src[idx + 2];
        a += src[idx + 3];
        count++;
      }
      const idx = (y * w + x) * 4;
      dst[idx] = r / count;
      dst[idx + 1] = g / count;
      dst[idx + 2] = b / count;
      dst[idx + 3] = a / count;
    }
  }

  // Box blur - vertical pass
  const dst2 = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = -size; dy <= size; dy++) {
        const ny = clamp(y + dy, 0, h - 1);
        const idx = (ny * w + x) * 4;
        r += dst[idx];
        g += dst[idx + 1];
        b += dst[idx + 2];
        a += dst[idx + 3];
        count++;
      }
      const idx = (y * w + x) * 4;
      dst2[idx] = r / count;
      dst2[idx + 1] = g / count;
      dst2[idx + 2] = b / count;
      dst2[idx + 3] = a / count;
    }
  }

  return new ImageData(dst2, w, h);
}

// Gaussian blur approximation using 3-pass box blur
export function applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return imageData;
  // 3-pass box blur approximation of Gaussian
  let result = applyBlur(imageData, radius);
  result = applyBlur(result, radius);
  result = applyBlur(result, radius);
  return result;
}

export function applySharpen(imageData: ImageData, amount: number): ImageData {
  if (amount <= 0) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const factor = amount / 100;

  const kernel = [
    0, -factor, 0,
    -factor, 1 + 4 * factor, -factor,
    0, -factor, 0,
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            val += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        data[(y * w + x) * 4 + c] = clamp(val, 0, 255);
      }
      data[(y * w + x) * 4 + 3] = src[(y * w + x) * 4 + 3];
    }
  }

  return new ImageData(data, w, h);
}

export function applyGrayscale(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function applySepia(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    data[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189, 0, 255);
    data[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168, 0, 255);
    data[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131, 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function applyInvert(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function addNoise(imageData: ImageData, amount: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const intensity = (amount / 100) * 255;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = clamp(data[i] + noise, 0, 255);
    data[i + 1] = clamp(data[i + 1] + noise, 0, 255);
    data[i + 2] = clamp(data[i + 2] + noise, 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function applyEdgeDetection(imageData: ImageData): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const data = new Uint8ClampedArray(src.length);

  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sumGx = 0;
      let sumGy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = src[idx] * 0.2989 + src[idx + 1] * 0.587 + src[idx + 2] * 0.114;
          const ki = (ky + 1) * 3 + (kx + 1);
          sumGx += gray * gx[ki];
          sumGy += gray * gy[ki];
        }
      }
      const mag = clamp(Math.sqrt(sumGx * sumGx + sumGy * sumGy), 0, 255);
      const idx = (y * w + x) * 4;
      data[idx] = mag;
      data[idx + 1] = mag;
      data[idx + 2] = mag;
      data[idx + 3] = 255;
    }
  }

  return new ImageData(data, w, h);
}

// Posterize - reduce color levels
export function applyPosterize(imageData: ImageData, levels: number): ImageData {
  if (levels < 2) levels = 2;
  if (levels > 256) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

// Threshold - convert to black & white based on threshold value
export function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const t = (threshold / 100) * 255;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = gray >= t ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  return new ImageData(data, imageData.width, imageData.height);
}

// Vignette - darken edges
export function applyVignette(imageData: ImageData, amount: number): ImageData {
  if (amount <= 0) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const strength = amount / 100;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const factor = 1 - Math.pow(dist, 1.5) * strength;
      const clampedFactor = Math.max(0, factor);
      const idx = (y * w + x) * 4;
      data[idx] = clamp(data[idx] * clampedFactor, 0, 255);
      data[idx + 1] = clamp(data[idx + 1] * clampedFactor, 0, 255);
      data[idx + 2] = clamp(data[idx + 2] * clampedFactor, 0, 255);
    }
  }

  return new ImageData(data, w, h);
}

// Pixelate - mosaic effect
export function applyPixelate(imageData: ImageData, blockSize: number): ImageData {
  if (blockSize <= 1) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);

  for (let by = 0; by < h; by += blockSize) {
    for (let bx = 0; bx < w; bx += blockSize) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      // Average the block
      for (let y = by; y < Math.min(by + blockSize, h); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
          const idx = (y * w + x) * 4;
          r += src[idx];
          g += src[idx + 1];
          b += src[idx + 2];
          a += src[idx + 3];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);
      // Fill the block with the average
      for (let y = by; y < Math.min(by + blockSize, h); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, w); x++) {
          const idx = (y * w + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = a;
        }
      }
    }
  }

  return new ImageData(data, w, h);
}

// Emboss - directional emboss effect
export function applyEmboss(imageData: ImageData, strength: number): ImageData {
  if (strength <= 0) return imageData;
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const factor = strength / 100;

  // Emboss kernel
  const kernel = [
    -2 * factor, -1 * factor, 0,
    -1 * factor, 1, 1 * factor,
    0, 1 * factor, 2 * factor,
  ];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            val += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        data[(y * w + x) * 4 + c] = clamp(val + 128, 0, 255);
      }
      data[(y * w + x) * 4 + 3] = src[(y * w + x) * 4 + 3];
    }
  }

  return new ImageData(data, w, h);
}

// Oil Paint - simplified Kuwahara-like filter
export function applyOilPaint(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return imageData;
  const r = Math.max(1, Math.round(radius));
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const data = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Simplified: average a region around the pixel
      let totalR = 0, totalG = 0, totalB = 0, totalA = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = clamp(x + dx, 0, w - 1);
          const ny = clamp(y + dy, 0, h - 1);
          const idx = (ny * w + nx) * 4;
          totalR += src[idx];
          totalG += src[idx + 1];
          totalB += src[idx + 2];
          totalA += src[idx + 3];
          count++;
        }
      }
      const idx = (y * w + x) * 4;
      data[idx] = Math.round(totalR / count);
      data[idx + 1] = Math.round(totalG / count);
      data[idx + 2] = Math.round(totalB / count);
      data[idx + 3] = Math.round(totalA / count);
    }
  }

  return new ImageData(data, w, h);
}

export function adjustColorBalance(imageData: ImageData, r: number, g: number, b: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const rAdj = (r / 100) * 255;
  const gAdj = (g / 100) * 255;
  const bAdj = (b / 100) * 255;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + rAdj, 0, 255);
    data[i + 1] = clamp(data[i + 1] + gAdj, 0, 255);
    data[i + 2] = clamp(data[i + 2] + bAdj, 0, 255);
  }
  return new ImageData(data, imageData.width, imageData.height);
}

export function adjustLevels(imageData: ImageData, blacks: number, whites: number, mids: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const inputBlack = (blacks / 100) * 255;
  const inputWhite = ((100 - whites) / 100) * 255 + (100 - whites) / 100 * 255;
  const gamma = mids > 0 ? 1 / (1 + mids / 100) : 1 - mids / 100;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      if (inputWhite > inputBlack) {
        val = ((val - inputBlack) / (inputWhite - inputBlack)) * 255;
      }
      val = clamp(val, 0, 255);
      val = 255 * Math.pow(val / 255, gamma);
      data[i + c] = clamp(val, 0, 255);
    }
  }

  return new ImageData(data, imageData.width, imageData.height);
}

export function applyFilters(imageData: ImageData, options: FilterOptions): ImageData {
  let result = imageData;

  if (options.brightness !== 0) {
    result = adjustBrightness(result, options.brightness);
  }
  if (options.contrast !== 0) {
    result = adjustContrast(result, options.contrast);
  }
  if (options.saturation !== 0) {
    result = adjustSaturation(result, options.saturation);
  }
  if (options.hue !== 0) {
    result = adjustHue(result, options.hue);
  }
  if (options.blur > 0) {
    result = applyBlur(result, options.blur);
  }
  if (options.gaussianBlur > 0) {
    result = applyGaussianBlur(result, options.gaussianBlur);
  }
  if (options.sharpen > 0) {
    result = applySharpen(result, options.sharpen);
  }
  if (options.noise > 0) {
    result = addNoise(result, options.noise);
  }
  if (options.grayscale > 0) {
    const gray = applyGrayscale(result);
    const mix = options.grayscale / 100;
    const data = new Uint8ClampedArray(result.data.length);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = result.data[i] * (1 - mix) + gray.data[i] * mix;
      data[i + 1] = result.data[i + 1] * (1 - mix) + gray.data[i + 1] * mix;
      data[i + 2] = result.data[i + 2] * (1 - mix) + gray.data[i + 2] * mix;
      data[i + 3] = result.data[i + 3];
    }
    result = new ImageData(data, result.width, result.height);
  }
  if (options.sepia > 0) {
    const sepia = applySepia(result);
    const mix = options.sepia / 100;
    const data = new Uint8ClampedArray(result.data.length);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = result.data[i] * (1 - mix) + sepia.data[i] * mix;
      data[i + 1] = result.data[i + 1] * (1 - mix) + sepia.data[i + 1] * mix;
      data[i + 2] = result.data[i + 2] * (1 - mix) + sepia.data[i + 2] * mix;
      data[i + 3] = result.data[i + 3];
    }
    result = new ImageData(data, result.width, result.height);
  }
  if (options.invert > 0) {
    const inverted = applyInvert(result);
    const mix = options.invert / 100;
    const data = new Uint8ClampedArray(result.data.length);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = result.data[i] * (1 - mix) + inverted.data[i] * mix;
      data[i + 1] = result.data[i + 1] * (1 - mix) + inverted.data[i + 1] * mix;
      data[i + 2] = result.data[i + 2] * (1 - mix) + inverted.data[i + 2] * mix;
      data[i + 3] = result.data[i + 3];
    }
    result = new ImageData(data, result.width, result.height);
  }
  if (options.posterize > 0) {
    const levels = Math.max(2, Math.round(256 - (options.posterize / 100) * 254));
    result = applyPosterize(result, levels);
  }
  if (options.threshold > 0) {
    result = applyThreshold(result, options.threshold);
  }
  if (options.vignette > 0) {
    result = applyVignette(result, options.vignette);
  }
  if (options.pixelate > 0) {
    const blockSize = Math.max(2, Math.round(options.pixelate / 5));
    result = applyPixelate(result, blockSize);
  }
  if (options.emboss > 0) {
    result = applyEmboss(result, options.emboss);
  }
  if (options.oilPaint > 0) {
    const radius = Math.max(1, Math.round(options.oilPaint / 10));
    result = applyOilPaint(result, radius);
  }

  return result;
}

// Flood fill algorithm
export function floodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  fillColor: [number, number, number, number],
  tolerance: number = 32
): ImageData {
  const { width, height, data } = imageData;
  const result = new Uint8ClampedArray(data);
  const visited = new Uint8Array(width * height);

  // Clamp start position
  startX = clamp(Math.round(startX), 0, width - 1);
  startY = clamp(Math.round(startY), 0, height - 1);

  const startIdx = (startY * width + startX) * 4;
  const startR = data[startIdx];
  const startG = data[startIdx + 1];
  const startB = data[startIdx + 2];
  const startA = data[startIdx + 3];

  // Check if fill color is same as start color
  if (Math.abs(startR - fillColor[0]) + Math.abs(startG - fillColor[1]) +
      Math.abs(startB - fillColor[2]) + Math.abs(startA - fillColor[3]) < 4) {
    return imageData;
  }

  const stack: [number, number][] = [[startX, startY]];
  const tolerance4 = tolerance * 4;

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const pixIdx = idx * 4;
    const dr = Math.abs(data[pixIdx] - startR);
    const dg = Math.abs(data[pixIdx + 1] - startG);
    const db = Math.abs(data[pixIdx + 2] - startB);
    const da = Math.abs(data[pixIdx + 3] - startA);

    if (dr + dg + db + da > tolerance4) continue;

    result[pixIdx] = fillColor[0];
    result[pixIdx + 1] = fillColor[1];
    result[pixIdx + 2] = fillColor[2];
    result[pixIdx + 3] = fillColor[3];

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return new ImageData(result, width, height);
}

// Helper: parse hex color to RGBA
export function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b, 255];
}

export async function resizeImage(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement> {
  const pica = (await import('pica')).default;
  const target = document.createElement('canvas');
  target.width = targetWidth;
  target.height = targetHeight;
  await pica().resize(source, target, {
    quality: 3,
  });
  return target;
}

export function cropImage(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
): HTMLCanvasElement {
  const cropped = document.createElement('canvas');
  cropped.width = w;
  cropped.height = h;
  const ctx = cropped.getContext('2d')!;
  ctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  return cropped;
}

export function exportCanvas(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg' | 'webp',
  quality: number = 0.92
): Blob {
  const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper to get bounds of a brush stroke
function getBrushBounds(obj: EditorObject): { x: number; y: number; width: number; height: number } {
  const pts = obj.points || [];
  if (pts.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const pad = (obj.brushSize || 5) / 2;
  for (let i = 0; i < pts.length; i += 2) {
    minX = Math.min(minX, pts[i]);
    minY = Math.min(minY, pts[i + 1]);
    maxX = Math.max(maxX, pts[i]);
    maxY = Math.max(maxY, pts[i + 1]);
  }
  return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
}

// Rasterize a non-image object to an offscreen canvas and return dataURL
export function rasterizeObject(
  obj: EditorObject,
  canvasWidth: number,
  canvasHeight: number
): string | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  switch (obj.type) {
    case 'rect': {
      ctx.fillStyle = obj.fill || '#000000';
      ctx.strokeStyle = obj.stroke || 'transparent';
      ctx.lineWidth = obj.strokeWidth || 0;
      const w = obj.width || 100;
      const h = obj.height || 100;
      if (obj.cornerRadius) {
        ctx.beginPath();
        ctx.roundRect(obj.x, obj.y, w, h, obj.cornerRadius);
        ctx.fill();
        if (obj.strokeWidth && obj.stroke) ctx.stroke();
      } else {
        ctx.fillRect(obj.x, obj.y, w, h);
        if (obj.strokeWidth && obj.stroke) ctx.strokeRect(obj.x, obj.y, w, h);
      }
      break;
    }
    case 'ellipse':
    case 'circle': {
      ctx.fillStyle = obj.fill || '#000000';
      ctx.strokeStyle = obj.stroke || 'transparent';
      ctx.lineWidth = obj.strokeWidth || 0;
      const rx = (obj.width || 100) / 2;
      const ry = (obj.height || 100) / 2;
      ctx.beginPath();
      ctx.ellipse(obj.x + rx, obj.y + ry, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      if (obj.strokeWidth && obj.stroke) ctx.stroke();
      break;
    }
    case 'text': {
      ctx.fillStyle = obj.fill || '#000000';
      ctx.font = `${obj.fontStyle || 'normal'} ${obj.fontSize || 24}px ${obj.fontFamily || 'Arial'}`;
      ctx.fillText(obj.text || 'Text', obj.x, obj.y + (obj.fontSize || 24));
      break;
    }
    case 'gradient': {
      const w = obj.width || 100;
      const h = obj.height || 100;
      const direction = obj.gradientDirection || 'horizontal';
      let gradient: CanvasGradient;
      if (direction === 'radial') {
        gradient = ctx.createRadialGradient(
          obj.x + w / 2, obj.y + h / 2, 0,
          obj.x + w / 2, obj.y + h / 2, Math.max(w, h) / 2
        );
      } else {
        let x0 = obj.x, y0 = obj.y, x1 = obj.x + w, y1 = obj.y;
        if (direction === 'vertical') { x1 = obj.x; y1 = obj.y + h; }
        else if (direction === 'diagonal') { x1 = obj.x + w; y1 = obj.y + h; }
        gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      }
      gradient.addColorStop(0, obj.gradientStartColor || '#000000');
      gradient.addColorStop(1, obj.gradientEndColor || '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(obj.x, obj.y, w, h);
      break;
    }
    case 'line': {
      const pts = obj.linePoints || [0, 0, 100, 0];
      ctx.strokeStyle = obj.stroke || obj.fill || '#000000';
      ctx.lineWidth = obj.strokeWidth || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(pts[i], pts[i + 1]);
      }
      ctx.stroke();
      break;
    }
    case 'path': {
      if (obj.pathData) {
        ctx.fillStyle = obj.fill || 'transparent';
        ctx.strokeStyle = obj.stroke || '#000000';
        ctx.lineWidth = obj.strokeWidth || 2;
        const path = new Path2D(obj.pathData);
        if (obj.fill) ctx.fill(path);
        if (obj.stroke) ctx.stroke(path);
      }
      break;
    }
    case 'brush-stroke': {
      if (obj.points && obj.points.length >= 2) {
        ctx.strokeStyle = obj.brushColor === 'eraser' ? 'rgba(0,0,0,0)' : (obj.brushColor || '#000000');
        ctx.lineWidth = obj.brushSize || 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(obj.points[0], obj.points[1]);
        for (let i = 2; i < obj.points.length; i += 2) {
          ctx.lineTo(obj.points[i], obj.points[i + 1]);
        }
        ctx.stroke();
      }
      break;
    }
    default:
      return null;
  }

  return canvas.toDataURL('image/png');
}

// Apply filter to a single image data based on filter type
function applyFilterByType(imageData: ImageData, filterType: string, options: FilterOptions): ImageData {
  switch (filterType) {
    case 'blur': return applyBlur(imageData, options.blur);
    case 'gaussian-blur': return applyGaussianBlur(imageData, options.gaussianBlur);
    case 'sharpen': return applySharpen(imageData, options.sharpen);
    case 'grayscale': return applyGrayscale(imageData);
    case 'sepia': return applySepia(imageData);
    case 'invert': return applyInvert(imageData);
    case 'edge-detection': return applyEdgeDetection(imageData);
    case 'noise': return addNoise(imageData, options.noise);
    case 'brightness': return adjustBrightness(imageData, options.brightness);
    case 'contrast': return adjustContrast(imageData, options.contrast);
    case 'hue': return applyFilters(imageData, options);
    case 'color-balance': return adjustColorBalance(imageData, options.brightness, options.contrast, options.sharpen);
    case 'posterize': return applyPosterize(imageData, Math.max(2, Math.round(256 - (options.posterize / 100) * 254)));
    case 'threshold': return applyThreshold(imageData, options.threshold);
    case 'vignette': return applyVignette(imageData, options.vignette);
    case 'pixelate': return applyPixelate(imageData, Math.max(2, Math.round(options.pixelate / 5)));
    case 'emboss': return applyEmboss(imageData, options.emboss);
    case 'oil-paint': return applyOilPaint(imageData, Math.max(1, Math.round(options.oilPaint / 10)));
    default: return applyFilters(imageData, options);
  }
}

// Apply filter to a layer's objects by rasterizing and replacing content
export function applyFilterToLayerObjects(
  objects: EditorObject[],
  filterType: string,
  options: FilterOptions,
  _canvasWidth: number,
  _canvasHeight: number
): EditorObject[] {
  return objects.map(obj => {
    // All types are handled asynchronously
    return obj;
  });
}

// Async version that actually applies filters - now works on ALL object types
export async function applyFilterToLayerObjectsAsync(
  objects: EditorObject[],
  filterType: string,
  options: FilterOptions,
  canvasWidth?: number,
  canvasHeight?: number
): Promise<EditorObject[]> {
  const results: EditorObject[] = [];

  for (const obj of objects) {
    if (obj.type === 'image' && obj.imageSrc) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = obj.imageSrc!;
        });

        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = obj.width || img.naturalWidth || 1;
        imgCanvas.height = obj.height || img.naturalHeight || 1;
        const imgCtx = imgCanvas.getContext('2d')!;
        imgCtx.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);

        const imageData = imgCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
        const filtered = applyFilterByType(imageData, filterType, options);

        imgCtx.putImageData(filtered, 0, 0);
        results.push({ ...obj, imageSrc: imgCanvas.toDataURL('image/png') });
      } catch {
        results.push(obj);
      }
    } else if (obj.type === 'brush-stroke' && obj.points && obj.points.length >= 2) {
      try {
        const bounds = getBrushBounds(obj);
        if (bounds.width > 0 && bounds.height > 0) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = Math.ceil(bounds.width);
          tempCanvas.height = Math.ceil(bounds.height);
          const tempCtx = tempCanvas.getContext('2d')!;

          tempCtx.strokeStyle = obj.brushColor === 'eraser' ? 'rgba(0,0,0,0)' : (obj.brushColor || '#000000');
          tempCtx.lineWidth = obj.brushSize || 5;
          tempCtx.lineCap = 'round';
          tempCtx.lineJoin = 'round';
          tempCtx.beginPath();
          const pts = obj.points;
          tempCtx.moveTo(pts[0] - bounds.x, pts[1] - bounds.y);
          for (let i = 2; i < pts.length; i += 2) {
            tempCtx.lineTo(pts[i] - bounds.x, pts[i + 1] - bounds.y);
          }
          tempCtx.stroke();

          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const filtered = applyFilterByType(imageData, filterType, options);
          tempCtx.putImageData(filtered, 0, 0);

          results.push({
            ...obj,
            type: 'image' as const,
            imageSrc: tempCanvas.toDataURL('image/png'),
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            points: undefined,
            brushSize: undefined,
            brushColor: undefined,
          });
        } else {
          results.push(obj);
        }
      } catch {
        results.push(obj);
      }
    } else if (['rect', 'ellipse', 'circle', 'line', 'text', 'gradient', 'path'].includes(obj.type)) {
      // Rasterize the object, apply filter, convert to image
      try {
        const cw = canvasWidth || 1920;
        const ch = canvasHeight || 1080;
        const dataUrl = rasterizeObject(obj, cw, ch);
        if (dataUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = dataUrl;
          });

          const imgCanvas = document.createElement('canvas');
          imgCanvas.width = cw;
          imgCanvas.height = ch;
          const imgCtx = imgCanvas.getContext('2d')!;
          imgCtx.drawImage(img, 0, 0);

          const imageData = imgCtx.getImageData(0, 0, cw, ch);
          const filtered = applyFilterByType(imageData, filterType, options);
          imgCtx.putImageData(filtered, 0, 0);

          results.push({
            ...obj,
            type: 'image' as const,
            imageSrc: imgCanvas.toDataURL('image/png'),
            x: 0,
            y: 0,
            width: cw,
            height: ch,
            // Clear shape-specific props
            fill: undefined,
            stroke: undefined,
            strokeWidth: undefined,
            cornerRadius: undefined,
            text: undefined,
            fontSize: undefined,
            fontFamily: undefined,
            fontStyle: undefined,
            shapeType: undefined,
            linePoints: undefined,
            gradientStartColor: undefined,
            gradientEndColor: undefined,
            gradientDirection: undefined,
            pathData: undefined,
            pathAnchors: undefined,
            pathClosed: undefined,
          });
        } else {
          results.push(obj);
        }
      } catch {
        results.push(obj);
      }
    } else {
      results.push(obj);
    }
  }

  return results;
}

// Get shadow props from layer effects for Konva rendering
export function getShadowProps(effects: LayerEffects | undefined): Record<string, unknown> {
  if (!effects) return {};
  const props: Record<string, unknown> = {};

  // Drop shadow
  if (effects.dropShadow?.enabled) {
    const rad = (effects.dropShadow.angle * Math.PI) / 180;
    props.shadowColor = effects.dropShadow.color;
    props.shadowBlur = effects.dropShadow.blur;
    props.shadowOffsetX = Math.cos(rad) * effects.dropShadow.distance;
    props.shadowOffsetY = Math.sin(rad) * effects.dropShadow.distance;
    props.shadowOpacity = effects.dropShadow.opacity / 100;
  }

  // Outer glow - combine with shadow if drop shadow not enabled
  if (effects.outerGlow?.enabled && !effects.dropShadow?.enabled) {
    props.shadowColor = effects.outerGlow.color;
    props.shadowBlur = effects.outerGlow.blur;
    props.shadowOffsetX = 0;
    props.shadowOffsetY = 0;
    props.shadowOpacity = effects.outerGlow.opacity / 100;
  }

  return props;
}

// Get stroke effect props for Konva rendering (rendered as additional stroke behind)
export function getStrokeEffectProps(effects: LayerEffects | undefined): Record<string, unknown> | null {
  if (!effects?.stroke?.enabled) return null;
  return {
    stroke: effects.stroke.color,
    strokeWidth: (effects.stroke.size || 3) * 2 + 2,
    strokeOpacity: effects.stroke.opacity / 100,
  };
}

// Layer effects rendering helper (fixed version - does NOT restore before drawing)
export function renderLayerEffects(
  ctx: CanvasRenderingContext2D,
  effects: LayerEffects | undefined,
  _width: number,
  _height: number
): void {
  if (!effects) return;

  // Drop shadow
  if (effects.dropShadow?.enabled) {
    const { color, opacity, blur, distance, angle } = effects.dropShadow;
    const rad = (angle * Math.PI) / 180;
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = Math.cos(rad) * distance;
    ctx.shadowOffsetY = Math.sin(rad) * distance;
    // Note: caller must draw after this, then ctx.restore()
    return; // Caller is responsible for drawing and restoring
  }

  // Outer glow
  if (effects.outerGlow?.enabled) {
    ctx.save();
    ctx.globalAlpha = effects.outerGlow.opacity / 100;
    ctx.shadowColor = effects.outerGlow.color;
    ctx.shadowBlur = effects.outerGlow.blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return;
  }
}

// Export the full canvas with proper compositing
export function exportFullCanvas(
  canvasWidth: number,
  canvasHeight: number,
  layers: { visible: boolean; opacity: number; blendMode: string; objects: EditorObject[]; effects?: LayerEffects }[]
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    const ctx = exportCanvas.getContext('2d')!;

    // White background for JPG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render each visible layer
    const renderLayer = (layerIndex: number) => {
      if (layerIndex >= layers.length) {
        resolve(exportCanvas);
        return;
      }

      const layer = layers[layerIndex];
      if (!layer.visible) {
        renderLayer(layerIndex + 1);
        return;
      }

      // Create a temp canvas for this layer
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvasWidth;
      layerCanvas.height = canvasHeight;
      const layerCtx = layerCanvas.getContext('2d')!;

      // Draw all objects onto the layer canvas
      let pendingImages = 0;
      const objectImages: { img: HTMLImageElement; obj: EditorObject }[] = [];

      const drawObjects = () => {
        // Render non-image objects
        for (const obj of layer.objects) {
          if (obj.type === 'image') continue;
          if (obj.opacity !== undefined) layerCtx.globalAlpha = obj.opacity / 100;

          switch (obj.type) {
            case 'rect': {
              layerCtx.fillStyle = obj.fill || '#000000';
              if (obj.cornerRadius) {
                layerCtx.beginPath();
                layerCtx.roundRect(obj.x, obj.y, obj.width || 100, obj.height || 100, obj.cornerRadius);
                layerCtx.fill();
              } else {
                layerCtx.fillRect(obj.x, obj.y, obj.width || 100, obj.height || 100);
              }
              break;
            }
            case 'ellipse':
            case 'circle': {
              layerCtx.fillStyle = obj.fill || '#000000';
              const rx = (obj.width || 100) / 2;
              const ry = (obj.height || 100) / 2;
              layerCtx.beginPath();
              layerCtx.ellipse(obj.x + rx, obj.y + ry, rx, ry, 0, 0, Math.PI * 2);
              layerCtx.fill();
              break;
            }
            case 'text': {
              layerCtx.fillStyle = obj.fill || '#000000';
              layerCtx.font = `${obj.fontStyle || 'normal'} ${obj.fontSize || 24}px ${obj.fontFamily || 'Arial'}`;
              layerCtx.fillText(obj.text || 'Text', obj.x, obj.y + (obj.fontSize || 24));
              break;
            }
            case 'brush-stroke': {
              if (obj.points && obj.points.length >= 2) {
                layerCtx.strokeStyle = obj.brushColor || '#000000';
                layerCtx.lineWidth = obj.brushSize || 5;
                layerCtx.lineCap = 'round';
                layerCtx.lineJoin = 'round';
                layerCtx.beginPath();
                layerCtx.moveTo(obj.points[0], obj.points[1]);
                for (let i = 2; i < obj.points.length; i += 2) {
                  layerCtx.lineTo(obj.points[i], obj.points[i + 1]);
                }
                layerCtx.stroke();
              }
              break;
            }
          }
          layerCtx.globalAlpha = 1;
        }

        // Render image objects
        for (const { img, obj } of objectImages) {
          if (obj.opacity !== undefined) layerCtx.globalAlpha = obj.opacity / 100;
          layerCtx.drawImage(img, obj.x, obj.y, obj.width || img.naturalWidth, obj.height || img.naturalHeight);
          layerCtx.globalAlpha = 1;
        }

        // Composite layer onto export canvas
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        ctx.drawImage(layerCanvas, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        renderLayer(layerIndex + 1);
      };

      // Load image objects first
      for (const obj of layer.objects) {
        if (obj.type === 'image' && obj.imageSrc) {
          pendingImages++;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            objectImages.push({ img, obj });
            pendingImages--;
            if (pendingImages === 0) drawObjects();
          };
          img.onerror = () => {
            pendingImages--;
            if (pendingImages === 0) drawObjects();
          };
          img.src = obj.imageSrc;
        }
      }

      if (pendingImages === 0) drawObjects();
    };

    renderLayer(0);
  });
}
