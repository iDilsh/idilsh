'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Line, Ellipse, Text, Image as KonvaImage, Transformer, Shape, Group, Path } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/editor-store';
import type { EditorObject, LayerEffects, SnapGuide, PathAnchor } from '@/lib/types';
import { getShadowProps, getStrokeEffectProps, floodFill, hexToRgba, getOuterGlowProps, getInnerShadowProps, getInnerGlowProps, getBevelProps, getSatinProps, applyBlur, applySharpen, adjustBrightness, adjustSaturation } from '@/lib/image-processing';
import { v4 as uuidv4 } from 'uuid';

// Image cache
const imageCache = new Map<string, HTMLImageElement>();

function preloadImage(src: string, callback: (img: HTMLImageElement) => void) {
  if (imageCache.has(src)) {
    callback(imageCache.get(src)!);
    return;
  }
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    imageCache.set(src, img);
    callback(img);
  };
  img.src = src;
}

function ImageObjectRenderer({ obj, commonProps, shadowProps }: { obj: EditorObject; commonProps: Record<string, unknown>; shadowProps: Record<string, unknown> }) {
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (obj.imageSrc) {
      preloadImage(obj.imageSrc, (img) => {
        setImgElement(img);
      });
    }
  }, [obj.imageSrc]);

  if (!imgElement) {
    return <Rect {...commonProps} {...shadowProps} width={obj.width || 100} height={obj.height || 100} fill="#cccccc" />;
  }

  return (
    <KonvaImage
      {...commonProps}
      {...shadowProps}
      image={imgElement}
      width={obj.width || imgElement.naturalWidth}
      height={obj.height || imgElement.naturalHeight}
    />
  );
}

// Shape drawing helpers
function drawRegularPolygon(context: Konva.Context, cx: number, cy: number, radius: number, sides: number, startAngle: number = -Math.PI / 2) {
  context.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (2 * Math.PI * i) / sides;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function drawStar(context: Konva.Context, cx: number, cy: number, outerR: number, innerR: number, points: number) {
  context.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function drawHeart(context: Konva.Context, cx: number, cy: number, w: number, h: number) {
  const topCurveHeight = h * 0.3;
  context.beginPath();
  context.moveTo(cx, cy + h * 0.35);
  context.bezierCurveTo(cx, cy + h * 0.35 - topCurveHeight, cx - w / 2, cy + h * 0.35 - topCurveHeight, cx - w / 2, cy + h * 0.35);
  context.bezierCurveTo(cx - w / 2, cy + h * 0.65, cx, cy + h * 0.75, cx, cy + h);
  context.bezierCurveTo(cx, cy + h * 0.75, cx + w / 2, cy + h * 0.65, cx + w / 2, cy + h * 0.35);
  context.bezierCurveTo(cx + w / 2, cy + h * 0.35 - topCurveHeight, cx, cy + h * 0.35 - topCurveHeight, cx, cy + h * 0.35);
  context.closePath();
}

function drawArrow(context: Konva.Context, w: number, h: number, direction: 'right' | 'left' | 'up' | 'down') {
  const arrowHeadSize = Math.min(w, h) * 0.4;
  context.beginPath();
  switch (direction) {
    case 'right':
      context.moveTo(0, h / 2 - arrowHeadSize / 2);
      context.lineTo(w - arrowHeadSize, h / 2 - arrowHeadSize / 2);
      context.lineTo(w - arrowHeadSize, 0);
      context.lineTo(w, h / 2);
      context.lineTo(w - arrowHeadSize, h);
      context.lineTo(w - arrowHeadSize, h / 2 + arrowHeadSize / 2);
      context.lineTo(0, h / 2 + arrowHeadSize / 2);
      break;
    case 'left':
      context.moveTo(w, h / 2 - arrowHeadSize / 2);
      context.lineTo(arrowHeadSize, h / 2 - arrowHeadSize / 2);
      context.lineTo(arrowHeadSize, 0);
      context.lineTo(0, h / 2);
      context.lineTo(arrowHeadSize, h);
      context.lineTo(arrowHeadSize, h / 2 + arrowHeadSize / 2);
      context.lineTo(w, h / 2 + arrowHeadSize / 2);
      break;
    case 'up':
      context.moveTo(w / 2 - arrowHeadSize / 2, h);
      context.lineTo(w / 2 - arrowHeadSize / 2, arrowHeadSize);
      context.lineTo(0, arrowHeadSize);
      context.lineTo(w / 2, 0);
      context.lineTo(w, arrowHeadSize);
      context.lineTo(w / 2 + arrowHeadSize / 2, arrowHeadSize);
      context.lineTo(w / 2 + arrowHeadSize / 2, h);
      break;
    case 'down':
      context.moveTo(w / 2 - arrowHeadSize / 2, 0);
      context.lineTo(w / 2 - arrowHeadSize / 2, h - arrowHeadSize);
      context.lineTo(0, h - arrowHeadSize);
      context.lineTo(w / 2, h);
      context.lineTo(w, h - arrowHeadSize);
      context.lineTo(w / 2 + arrowHeadSize / 2, h - arrowHeadSize);
      context.lineTo(w / 2 + arrowHeadSize / 2, 0);
      break;
  }
  context.closePath();
}

function drawCross(context: Konva.Context, w: number, h: number) {
  const armWidth = Math.min(w, h) / 3;
  context.beginPath();
  context.moveTo(w / 2 - armWidth / 2, 0);
  context.lineTo(w / 2 + armWidth / 2, 0);
  context.lineTo(w / 2 + armWidth / 2, h / 2 - armWidth / 2);
  context.lineTo(w, h / 2 - armWidth / 2);
  context.lineTo(w, h / 2 + armWidth / 2);
  context.lineTo(w / 2 + armWidth / 2, h / 2 + armWidth / 2);
  context.lineTo(w / 2 + armWidth / 2, h);
  context.lineTo(w / 2 - armWidth / 2, h);
  context.lineTo(w / 2 - armWidth / 2, h / 2 + armWidth / 2);
  context.lineTo(0, h / 2 + armWidth / 2);
  context.lineTo(0, h / 2 - armWidth / 2);
  context.lineTo(w / 2 - armWidth / 2, h / 2 - armWidth / 2);
  context.closePath();
}

function drawDiamond(context: Konva.Context, w: number, h: number) {
  context.beginPath();
  context.moveTo(w / 2, 0);
  context.lineTo(w, h / 2);
  context.lineTo(w / 2, h);
  context.lineTo(0, h / 2);
  context.closePath();
}

// Layer effects rendering for Konva
function LayerEffectsOverlay({ obj, layerEffects }: { obj: EditorObject; layerEffects?: LayerEffects }) {
  if (!layerEffects) return null;
  const w = obj.width || 100;
  const h = obj.height || 100;

  const elements: React.ReactNode[] = [];

  // FIX 12: Outer glow (separate from drop shadow - always renders when enabled, even if drop shadow is also enabled)
  const outerGlowProps = getOuterGlowProps(layerEffects);
  if (outerGlowProps) {
    if (obj.type === 'rect' || (obj.shapeType && obj.type === 'rect')) {
      elements.push(
        <Rect
          key="outer-glow"
          x={obj.x}
          y={obj.y}
          width={w}
          height={h}
          fill={obj.fill}
          cornerRadius={obj.cornerRadius || 0}
          {...outerGlowProps}
          listening={false}
        />
      );
    } else if (obj.type === 'ellipse' || obj.type === 'circle') {
      elements.push(
        <Ellipse
          key="outer-glow"
          x={obj.x + w / 2}
          y={obj.y + h / 2}
          radiusX={w / 2}
          radiusY={h / 2}
          fill={obj.fill}
          {...outerGlowProps}
          listening={false}
        />
      );
    }
  }

  // FIX 12: Inner shadow - improved rendering with inverted shadow
  const innerShadowProps = getInnerShadowProps(layerEffects);
  if (innerShadowProps) {
    const offX = innerShadowProps.innerShadowOffsetX as number;
    const offY = innerShadowProps.innerShadowOffsetY as number;
    const blur = innerShadowProps.innerShadowBlur as number;
    const color = innerShadowProps.innerShadowColor as string;
    const opacity = innerShadowProps.innerShadowOpacity as number;

    if (obj.type === 'rect' || (obj.shapeType && obj.type === 'rect')) {
      elements.push(
        <Group key="inner-shadow" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Rect
            x={obj.x + offX}
            y={obj.y + offY}
            width={w}
            height={h}
            fill={color}
            cornerRadius={obj.cornerRadius || 0}
            shadowColor={color}
            shadowBlur={blur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            shadowOpacity={1}
            opacity={opacity}
            listening={false}
          />
        </Group>
      );
    } else if (obj.type === 'ellipse' || obj.type === 'circle') {
      elements.push(
        <Group key="inner-shadow" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Ellipse
            x={obj.x + w / 2 + offX}
            y={obj.y + h / 2 + offY}
            radiusX={w / 2}
            radiusY={h / 2}
            fill={color}
            shadowColor={color}
            shadowBlur={blur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            shadowOpacity={1}
            opacity={opacity}
            listening={false}
          />
        </Group>
      );
    }
  }

  // FIX 12: Inner glow rendering
  const innerGlowProps = getInnerGlowProps(layerEffects);
  if (innerGlowProps) {
    const glowColor = innerGlowProps.innerGlowColor as string;
    const glowBlur = innerGlowProps.innerGlowBlur as number;
    const glowOpacity = innerGlowProps.innerGlowOpacity as number;
    const spread = (innerGlowProps.innerGlowSpread as number) || 0;
    const inset = spread / 100 * Math.min(w, h) / 2;

    if (obj.type === 'rect' || (obj.shapeType && obj.type === 'rect')) {
      elements.push(
        <Group key="inner-glow" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Rect
            x={obj.x + inset}
            y={obj.y + inset}
            width={w - inset * 2}
            height={h - inset * 2}
            fill={glowColor}
            cornerRadius={Math.max(0, (obj.cornerRadius || 0) - inset)}
            shadowColor={glowColor}
            shadowBlur={glowBlur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            shadowOpacity={1}
            opacity={glowOpacity}
            listening={false}
          />
        </Group>
      );
    } else if (obj.type === 'ellipse' || obj.type === 'circle') {
      elements.push(
        <Group key="inner-glow" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Ellipse
            x={obj.x + w / 2}
            y={obj.y + h / 2}
            radiusX={w / 2 - inset}
            radiusY={h / 2 - inset}
            fill={glowColor}
            shadowColor={glowColor}
            shadowBlur={glowBlur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            shadowOpacity={1}
            opacity={glowOpacity}
            listening={false}
          />
        </Group>
      );
    }
  }

  // FIX 12: Improved Bevel & Emboss with gradient-based rendering
  const bevelProps = getBevelProps(layerEffects);
  if (bevelProps) {
    const size = (bevelProps.bevelSize as number) || 5;
    const direction = (bevelProps.bevelDirection as string) || 'up';
    const depth = ((bevelProps.bevelDepth as number) || 100) / 100;
    const highlightShift = direction === 'up' ? -size / 2 : size / 2;
    const shadowShift = direction === 'up' ? size / 2 : -size / 2;
    const highlightColor = (bevelProps.highlightColor as string) || '#ffffff';
    const shadowColor = (bevelProps.shadowColor as string) || '#000000';
    const highlightOpacity = ((bevelProps.highlightOpacity as number) || 75) / 200 * depth;
    const shadowOpacity = ((bevelProps.shadowOpacity as number) || 75) / 200 * depth;
    
    if (obj.type === 'rect' || (obj.shapeType && obj.type === 'rect')) {
      elements.push(
        <Group key="bevel" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Rect
            x={obj.x}
            y={obj.y + highlightShift}
            width={w}
            height={h * 0.4}
            fill={highlightColor}
            opacity={highlightOpacity}
            cornerRadius={obj.cornerRadius || 0}
            listening={false}
          />
          <Rect
            x={obj.x}
            y={obj.y + h * 0.6 + shadowShift}
            width={w}
            height={h * 0.4}
            fill={shadowColor}
            opacity={shadowOpacity}
            cornerRadius={obj.cornerRadius || 0}
            listening={false}
          />
        </Group>
      );
    } else if (obj.type === 'ellipse' || obj.type === 'circle') {
      elements.push(
        <Group key="bevel" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Ellipse
            x={obj.x + w / 2}
            y={obj.y + h / 2 + highlightShift}
            radiusX={w / 2}
            radiusY={h / 3}
            fill={highlightColor}
            opacity={highlightOpacity}
            listening={false}
          />
          <Ellipse
            x={obj.x + w / 2}
            y={obj.y + h / 2 + shadowShift}
            radiusX={w / 2}
            radiusY={h / 3}
            fill={shadowColor}
            opacity={shadowOpacity}
            listening={false}
          />
        </Group>
      );
    }
  }

  // FIX 12: Improved Satin effect with blend mode
  const satinProps = getSatinProps(layerEffects);
  if (satinProps) {
    const dist = (satinProps.satinDistance as number) || 11;
    const angle = ((satinProps.satinAngle as number) || 19) * Math.PI / 180;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const satinColor = (satinProps.satinColor as string) || '#000000';
    const satinOpacity = ((satinProps.satinOpacity as number) || 50) / 150;
    const satinBlur = (satinProps.satinBlur as number) || 14;
    
    if (obj.type === 'rect' || (obj.shapeType && obj.type === 'rect')) {
      elements.push(
        <Group key="satin" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Rect
            x={obj.x + dx}
            y={obj.y + dy}
            width={w}
            height={h}
            fill={satinColor}
            opacity={satinOpacity}
            cornerRadius={obj.cornerRadius || 0}
            shadowColor={satinColor}
            shadowBlur={satinBlur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            listening={false}
          />
        </Group>
      );
    } else if (obj.type === 'ellipse' || obj.type === 'circle') {
      elements.push(
        <Group key="satin" clipX={obj.x} clipY={obj.y} clipWidth={w} clipHeight={h}>
          <Ellipse
            x={obj.x + w / 2 + dx}
            y={obj.y + h / 2 + dy}
            radiusX={w / 2}
            radiusY={h / 2}
            fill={satinColor}
            opacity={satinOpacity}
            shadowColor={satinColor}
            shadowBlur={satinBlur}
            shadowOffsetX={0}
            shadowOffsetY={0}
            listening={false}
          />
        </Group>
      );
    }
  }

  return elements.length > 0 ? <>{elements}</> : null;
}

function EditorObjectRenderer({ obj, isSelected, onSelect, layerEffects }: { 
  obj: EditorObject; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  layerEffects?: LayerEffects;
}) {
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const updateObject = useEditorStore((s) => s.updateObject);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const id = node.id();
    if (!id || !activeLayerId) return;
    updateObject(activeLayerId, id, { x: node.x(), y: node.y() });
    pushHistory('Move Object');
  }, [activeLayerId, updateObject, pushHistory]);

  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const id = node.id();
    if (!id || !activeLayerId) return;
    updateObject(activeLayerId, id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, (node.width() || 0) * (node.scaleX() || 1)),
      height: Math.max(5, (node.height() || 0) * (node.scaleY() || 1)),
      rotation: node.rotation(),
      scaleX: 1,
      scaleY: 1,
    });
    node.scaleX(1);
    node.scaleY(1);
    pushHistory('Transform Object');
  }, [activeLayerId, updateObject, pushHistory]);

  const shadowProps = getShadowProps(layerEffects);
  const strokeEffectProps = getStrokeEffectProps(layerEffects);

  const commonProps = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    rotation: obj.rotation || 0,
    scaleX: obj.scaleX || 1,
    scaleY: obj.scaleY || 1,
    opacity: (obj.opacity ?? 100) / 100,
    draggable: true,
    onClick: () => onSelect(obj.id),
    onTap: () => onSelect(obj.id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  const renderStrokeEffect = () => {
    if (!strokeEffectProps) return null;
    const strokeSize = (layerEffects?.stroke?.size || 3);
    const strokeExpand = layerEffects?.stroke?.position === 'outside' ? strokeSize : 0;
    
    switch (obj.type) {
      case 'rect':
        return (
          <Rect
            x={obj.x - strokeExpand}
            y={obj.y - strokeExpand}
            width={(obj.width || 100) + strokeExpand * 2}
            height={(obj.height || 100) + strokeExpand * 2}
            fill="transparent"
            stroke={strokeEffectProps.stroke as string}
            strokeWidth={strokeEffectProps.strokeWidth as number}
            opacity={strokeEffectProps.strokeOpacity as number}
            cornerRadius={obj.cornerRadius || 0}
            listening={false}
          />
        );
      case 'circle':
      case 'ellipse':
        return (
          <Ellipse
            x={(obj.x - strokeExpand) + (obj.width || 100) / 2 + strokeExpand}
            y={(obj.y - strokeExpand) + (obj.height || 100) / 2 + strokeExpand}
            radiusX={(obj.width || 100) / 2 + strokeExpand}
            radiusY={(obj.height || 100) / 2 + strokeExpand}
            fill="transparent"
            stroke={strokeEffectProps.stroke as string}
            strokeWidth={strokeEffectProps.strokeWidth as number}
            opacity={strokeEffectProps.strokeOpacity as number}
            listening={false}
          />
        );
      default:
        return null;
    }
  };

  switch (obj.type) {
    case 'rect':
      return (
        <Group>
          {renderStrokeEffect()}
          <Rect
            {...commonProps}
            {...shadowProps}
            width={obj.width || 100}
            height={obj.height || 100}
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth || 0}
            cornerRadius={obj.cornerRadius || 0}
          />
          <LayerEffectsOverlay obj={obj} layerEffects={layerEffects} />
        </Group>
      );

    case 'circle':
    case 'ellipse':
      return (
        <Group>
          {renderStrokeEffect()}
          <Ellipse
            {...commonProps}
            {...shadowProps}
            radiusX={(obj.width || 100) / 2}
            radiusY={(obj.height || 100) / 2}
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth || 0}
          />
          <LayerEffectsOverlay obj={obj} layerEffects={layerEffects} />
        </Group>
      );

    case 'line':
      return (
        <Line
          {...commonProps}
          {...shadowProps}
          points={obj.linePoints || [0, 0, 100, 0]}
          stroke={obj.stroke || obj.fill || '#000000'}
          strokeWidth={obj.strokeWidth || 2}
          lineCap="round"
          lineJoin="round"
        />
      );

    case 'text':
      return (
        <Text
          {...commonProps}
          {...shadowProps}
          text={obj.text || 'Text'}
          fontSize={obj.fontSize || 24}
          fontFamily={obj.fontFamily || 'Arial'}
          fill={obj.fill || '#000000'}
          fontStyle={obj.fontStyle || 'normal'}
        />
      );

    case 'brush-stroke':
      return (
        <Line
          {...commonProps}
          points={obj.points || []}
          stroke={obj.brushColor || '#000000'}
          strokeWidth={obj.brushSize || 5}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          globalCompositeOperation={
            obj.brushColor === 'eraser' ? 'destination-out' : 'source-over'
          }
        />
      );

    case 'gradient':
      return (
        <Shape
          {...commonProps}
          {...shadowProps}
          sceneFunc={(context, shape) => {
            const w = obj.width || 100;
            const h = obj.height || 100;
            const direction = obj.gradientDirection || 'horizontal';
            let gradient: CanvasGradient;
            if (direction === 'radial') {
              gradient = context.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
            } else {
              let x0 = 0, y0 = 0, x1 = w, y1 = 0;
              if (direction === 'vertical') { x1 = 0; y1 = h; }
              else if (direction === 'diagonal') { x1 = w; y1 = h; }
              gradient = context.createLinearGradient(x0, y0, x1, y1);
            }
            gradient.addColorStop(0, obj.gradientStartColor || '#000000');
            gradient.addColorStop(1, obj.gradientEndColor || '#ffffff');
            context.beginPath();
            context.rect(0, 0, w, h);
            context.fillStyle = gradient;
            context.fill();
            context.fillStrokeShape(shape);
          }}
          stroke={obj.stroke}
          strokeWidth={obj.strokeWidth || 0}
        />
      );

    case 'path':
      return (
        <Group>
          {obj.pathData && (
            <Path
              {...commonProps}
              {...shadowProps}
              data={obj.pathData}
              fill={obj.fill}
              stroke={obj.stroke || '#000000'}
              strokeWidth={obj.strokeWidth || 2}
            />
          )}
        </Group>
      );

    case 'image':
      return <ImageObjectRenderer obj={obj} commonProps={commonProps} shadowProps={shadowProps} />;

    default:
      if (obj.shapeType && obj.type === 'rect') {
        const shapeType = obj.shapeType;
        const w = obj.width || 100;
        const h = obj.height || 100;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy);

        const shapeRenderers: Record<string, (context: Konva.Context, shape: Konva.Shape) => void> = {
          'triangle': (ctx, shape) => { ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fillStrokeShape(shape); },
          'star': (ctx, shape) => { drawStar(ctx, cx, cy, radius, radius * 0.4, 5); ctx.fillStrokeShape(shape); },
          'diamond': (ctx, shape) => { drawDiamond(ctx, w, h); ctx.fillStrokeShape(shape); },
          'hexagon': (ctx, shape) => { drawRegularPolygon(ctx, cx, cy, radius, 6); ctx.fillStrokeShape(shape); },
          'pentagon': (ctx, shape) => { drawRegularPolygon(ctx, cx, cy, radius, 5); ctx.fillStrokeShape(shape); },
          'octagon': (ctx, shape) => { drawRegularPolygon(ctx, cx, cy, radius, 8); ctx.fillStrokeShape(shape); },
          'heart': (ctx, shape) => { drawHeart(ctx, cx, cy, w, h); ctx.fillStrokeShape(shape); },
          'cross': (ctx, shape) => { drawCross(ctx, w, h); ctx.fillStrokeShape(shape); },
          'arrow-right': (ctx, shape) => { drawArrow(ctx, w, h, 'right'); ctx.fillStrokeShape(shape); },
          'arrow-left': (ctx, shape) => { drawArrow(ctx, w, h, 'left'); ctx.fillStrokeShape(shape); },
          'arrow-up': (ctx, shape) => { drawArrow(ctx, w, h, 'up'); ctx.fillStrokeShape(shape); },
          'arrow-down': (ctx, shape) => { drawArrow(ctx, w, h, 'down'); ctx.fillStrokeShape(shape); },
        };

        if (shapeType === 'rounded-rect') {
          return (
            <Rect
              {...commonProps}
              {...shadowProps}
              width={w}
              height={h}
              fill={obj.fill}
              stroke={obj.stroke}
              strokeWidth={obj.strokeWidth || 0}
              cornerRadius={obj.cornerRadius || Math.min(w, h) / 4}
            />
          );
        }

        const sceneFunc = shapeRenderers[shapeType];
        if (sceneFunc) {
          return (
            <Shape
              {...commonProps}
              {...shadowProps}
              sceneFunc={sceneFunc}
              fill={obj.fill}
              stroke={obj.stroke}
              strokeWidth={obj.strokeWidth || 0}
            />
          );
        }

        return (
          <Rect
            {...commonProps}
            {...shadowProps}
            width={w}
            height={h}
            fill={obj.fill}
            stroke={obj.stroke}
            strokeWidth={obj.strokeWidth || 0}
            cornerRadius={obj.cornerRadius || 0}
          />
        );
      }
      return null;
  }
}

function TransformerComponent({ selectedIds }: { selectedIds: string[] }) {
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!trRef.current) return;
    const stage = trRef.current.getStage();
    if (!stage) return;
    const nodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const node = stage.findOne(`#${id}`);
      if (node) nodes.push(node);
    }
    trRef.current.nodes(nodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds]);

  return (
    <Transformer
      ref={trRef}
      borderStroke="#10b981"
      borderStrokeWidth={1}
      anchorFill="#10b981"
      anchorStroke="#fff"
      anchorSize={8}
      anchorCornerRadius={2}
      rotateEnabled={true}
      keepRatio={false}
    />
  );
}

// Selection overlay component
function SelectionOverlay({ selection }: { selection: { type: string; x: number; y: number; width: number; height: number } | null }) {
  if (!selection) return null;
  if (selection.type === 'ellipse') {
    return (
      <Ellipse
        x={selection.x + selection.width / 2}
        y={selection.y + selection.height / 2}
        radiusX={selection.width / 2}
        radiusY={selection.height / 2}
        stroke="#10b981"
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />
    );
  }
  return (
    <Rect
      x={selection.x}
      y={selection.y}
      width={selection.width}
      height={selection.height}
      stroke="#10b981"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
}

// Measure overlay
function MeasureOverlay({ startPos, endPos }: { startPos: { x: number; y: number } | null; endPos: { x: number; y: number } | null }) {
  if (!startPos || !endPos) return null;
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
  return (
    <>
      <Line points={[startPos.x, startPos.y, endPos.x, endPos.y]} stroke="#10b981" strokeWidth={1} dash={[4, 4]} listening={false} />
      <Text x={(startPos.x + endPos.x) / 2 - 20} y={(startPos.y + endPos.y) / 2 - 10} text={`${dist}px`} fontSize={12} fill="#10b981" listening={false} />
    </>
  );
}

// Crop overlay - with listening={false} so it doesn't capture mouse events
function CropOverlay({ cropStart, cropEnd, canvasWidth, canvasHeight, cropMode }: { 
  cropStart: { x: number; y: number } | null; 
  cropEnd: { x: number; y: number } | null;
  canvasWidth: number;
  canvasHeight: number;
  cropMode: 'rect' | 'circle';
}) {
  if (!cropStart || !cropEnd) return null;
  const x1 = Math.max(0, Math.min(cropStart.x, cropEnd.x));
  const y1 = Math.max(0, Math.min(cropStart.y, cropEnd.y));
  const x2 = Math.min(canvasWidth, Math.max(cropStart.x, cropEnd.x));
  const y2 = Math.min(canvasHeight, Math.max(cropStart.y, cropEnd.y));
  const w = x2 - x1;
  const h = y2 - y1;

  return (
    <>
      <Rect x={0} y={0} width={canvasWidth} height={y1} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={0} y={y2} width={canvasWidth} height={canvasHeight - y2} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={0} y={y1} width={x1} height={h} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={x2} y={y1} width={canvasWidth - x2} height={h} fill="rgba(0,0,0,0.5)" listening={false} />
      {cropMode === 'circle' ? (
        <Ellipse
          x={x1 + w / 2}
          y={y1 + h / 2}
          radiusX={w / 2}
          radiusY={h / 2}
          stroke="#ffffff"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      ) : (
        <Rect x={x1} y={y1} width={w} height={h} stroke="#ffffff" strokeWidth={1} dash={[4, 4]} listening={false} />
      )}
      <Text x={x1} y={y1 - 16} text={`${Math.round(w)} × ${Math.round(h)}`} fontSize={12} fill="#ffffff" listening={false} />
    </>
  );
}

// Snap guides overlay
function SnapGuidesOverlay({ guides }: { guides: SnapGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <>
      {guides.map((guide, i) => (
        guide.type === 'horizontal' ? (
          <Line key={`snap-h-${i}`} points={[-10000, guide.position, 10000, guide.position]} stroke="#ff4081" strokeWidth={1} dash={[4, 4]} listening={false} />
        ) : (
          <Line key={`snap-v-${i}`} points={[guide.position, -10000, guide.position, 10000]} stroke="#ff4081" strokeWidth={1} dash={[4, 4]} listening={false} />
        )
      ))}
    </>
  );
}

// Pen tool preview with bezier support
function PenPreview({ anchors }: { anchors: PathAnchor[] }) {
  if (anchors.length < 1) return null;

  // Build SVG path from anchors with handles
  let pathData = '';
  if (anchors.length >= 1) {
    pathData = `M ${anchors[0].x} ${anchors[0].y}`;
    for (let i = 1; i < anchors.length; i++) {
      const prev = anchors[i - 1];
      const curr = anchors[i];
      if (prev.handleOutX !== undefined && prev.handleOutY !== undefined && curr.handleInX !== undefined && curr.handleInY !== undefined) {
        pathData += ` C ${prev.handleOutX} ${prev.handleOutY}, ${curr.handleInX} ${curr.handleInY}, ${curr.x} ${curr.y}`;
      } else if (prev.handleOutX !== undefined && prev.handleOutY !== undefined) {
        pathData += ` Q ${prev.handleOutX} ${prev.handleOutY}, ${curr.x} ${curr.y}`;
      } else {
        pathData += ` L ${curr.x} ${curr.y}`;
      }
    }
  }

  return (
    <>
      {pathData && (
        <Path
          data={pathData}
          stroke="#10b981"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
      {/* Anchor points and handles */}
      {anchors.map((a, i) => (
        <React.Fragment key={`anchor-${i}`}>
          <Rect
            x={a.x - 3}
            y={a.y - 3}
            width={6}
            height={6}
            fill={i === 0 ? '#10b981' : '#ffffff'}
            stroke="#10b981"
            strokeWidth={1}
            listening={false}
          />
          {/* Handle lines */}
          {a.handleInX !== undefined && a.handleInY !== undefined && (
            <>
              <Line points={[a.handleInX, a.handleInY, a.x, a.y]} stroke="#10b981" strokeWidth={0.5} listening={false} />
              <Ellipse x={a.handleInX} y={a.handleInY} radiusX={3} radiusY={3} fill="#10b981" listening={false} />
            </>
          )}
          {a.handleOutX !== undefined && a.handleOutY !== undefined && (
            <>
              <Line points={[a.x, a.y, a.handleOutX, a.handleOutY]} stroke="#10b981" strokeWidth={0.5} listening={false} />
              <Ellipse x={a.handleOutX} y={a.handleOutY} radiusX={3} radiusY={3} fill="#10b981" listening={false} />
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const drawingIdRef = useRef<string | null>(null);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);
  // Selection tools state
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  // Crop state
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  // Pen state with handles
  const [penAnchors, setPenAnchors] = useState<PathAnchor[]>([]);
  const [penDragging, setPenDragging] = useState(false);
  // Clone stamp state
  const [cloneOffset, setCloneOffset] = useState<{ x: number; y: number } | null>(null);
  // Slice state
  const [sliceStart, setSliceStart] = useState<{ x: number; y: number } | null>(null);
  const [sliceEnd, setSliceEnd] = useState<{ x: number; y: number } | null>(null);
  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState('');

  const canvas = useEditorStore((s) => s.canvas);
  const layers = useEditorStore((s) => s.layers);
  const activeTool = useEditorStore((s) => s.activeTool);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const selectedObjectIds = useEditorStore((s) => s.selectedObjectIds);
  const setSelectedObjectIds = useEditorStore((s) => s.setSelectedObjectIds);
  const foregroundColor = useEditorStore((s) => s.foregroundColor);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const brushSize = useEditorStore((s) => s.brushSize);
  const eraserSize = useEditorStore((s) => s.eraserSize);
  const fontSize = useEditorStore((s) => s.fontSize);
  const fontFamily = useEditorStore((s) => s.fontFamily);
  const updateCanvas = useEditorStore((s) => s.updateCanvas);
  const addObjectToLayer = useEditorStore((s) => s.addObjectToLayer);
  const updateObject = useEditorStore((s) => s.updateObject);
  const removeObject = useEditorStore((s) => s.removeObject);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const setIsDrawing = useEditorStore((s) => s.setIsDrawing);
  const setMousePos = useEditorStore((s) => s.setMousePos);
  const showGrid = useEditorStore((s) => s.showGrid);
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const cloneSource = useEditorStore((s) => s.cloneSource);
  const setCloneSource = useEditorStore((s) => s.setCloneSource);
  const fillTolerance = useEditorStore((s) => s.fillTolerance);
  const applyCrop = useEditorStore((s) => s.applyCrop);
  const showSnapGuides = useEditorStore((s) => s.showSnapGuides);
  const setSnapGuides = useEditorStore((s) => s.setSnapGuides);
  const setSelection = useEditorStore((s) => s.setSelection);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const cropMode = useEditorStore((s) => s.cropMode);
  const brushHardness = useEditorStore((s) => s.brushHardness);
  const brushOpacity = useEditorStore((s) => s.brushOpacity);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      setContainerSize({ width: container.clientWidth, height: container.clientHeight });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Center canvas initially
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      const scaleX = (containerSize.width - 40) / canvas.width;
      const scaleY = (containerSize.height - 40) / canvas.height;
      const zoom = Math.min(scaleX, scaleY, 1);
      updateCanvas({ zoom, offsetX: (containerSize.width - canvas.width * zoom) / 2, offsetY: (containerSize.height - canvas.height * zoom) / 2 });
    }
  }, [containerSize.width, containerSize.height, canvas.width, canvas.height]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z': e.preventDefault(); useEditorStore.getState().undo(); break;
          case 'y': e.preventDefault(); useEditorStore.getState().redo(); break;
          case 'a': e.preventDefault(); setSelectedObjectIds(useEditorStore.getState().layers.flatMap((l) => l.objects.map((o) => o.id))); break;
          case 'd': e.preventDefault(); setSelectedObjectIds([]); break;
        }
        return;
      }

      const brushTypeTools = ['brush', 'eraser', 'dodge', 'burn', 'sponge', 'blur-brush', 'sharpen-brush', 'clone-stamp'];
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace': {
          const state = useEditorStore.getState();
          if (state.selectedObjectIds.length > 0) {
            state.pushHistory('Delete');
            for (const layer of state.layers) {
              for (const id of state.selectedObjectIds) state.removeObject(layer.id, id);
            }
          }
          break;
        }
        case 'v': useEditorStore.getState().setActiveTool('select'); break;
        case 'm': useEditorStore.getState().setActiveTool('move'); break;
        case 'h': useEditorStore.getState().setActiveTool('hand'); break;
        case 'z': useEditorStore.getState().setActiveTool('zoom'); break;
        case 'b': useEditorStore.getState().setActiveTool('brush'); break;
        case 'e': useEditorStore.getState().setActiveTool('eraser'); break;
        case 'g': useEditorStore.getState().setActiveTool('fill'); break;
        case 'i': useEditorStore.getState().setActiveTool('eyedropper'); break;
        case 't': useEditorStore.getState().setActiveTool('text'); break;
        case 'u': useEditorStore.getState().setActiveTool('shape'); break;
        case 'l': useEditorStore.getState().setActiveTool('line'); break;
        case 'c': useEditorStore.getState().setActiveTool('crop'); break;
        case 'p': useEditorStore.getState().setActiveTool('pen'); break;
        case 'w': useEditorStore.getState().setActiveTool('magic-wand'); break;
        case 's': useEditorStore.getState().setActiveTool('clone-stamp'); break;
        case 'x': useEditorStore.getState().swapColors(); break;
        case '[': {
          // FIX 6: Decrease brush/eraser size with [ key
          if (brushTypeTools.includes(activeTool)) {
            if (activeTool === 'eraser') {
              const newSize = Math.max(1, useEditorStore.getState().eraserSize - 5);
              useEditorStore.getState().setEraserSize(newSize);
            } else {
              const newSize = Math.max(1, useEditorStore.getState().brushSize - 5);
              useEditorStore.getState().setBrushSize(newSize);
            }
          }
          break;
        }
        case ']': {
          // FIX 6: Increase brush/eraser size with ] key
          if (brushTypeTools.includes(activeTool)) {
            if (activeTool === 'eraser') {
              const newSize = Math.min(500, useEditorStore.getState().eraserSize + 5);
              useEditorStore.getState().setEraserSize(newSize);
            } else {
              const newSize = Math.min(500, useEditorStore.getState().brushSize + 5);
              useEditorStore.getState().setBrushSize(newSize);
            }
          }
          break;
        }
        case ' ': e.preventDefault(); setIsPanning(true); break;
        case 'Escape':
          setCropStart(null); setCropEnd(null);
          setPenAnchors([]);
          setSliceStart(null); setSliceEnd(null);
          clearSelection();
          setEditingTextId(null);
          break;
        case 'Enter':
          if ((activeTool === 'crop' || activeTool === 'circle-crop') && cropStart && cropEnd) {
            const x = Math.min(cropStart.x, cropEnd.x);
            const y = Math.min(cropStart.y, cropEnd.y);
            const w = Math.abs(cropEnd.x - cropStart.x);
            const h = Math.abs(cropEnd.y - cropStart.y);
            if (w > 1 && h > 1) { applyCrop(x, y, w, h); setCropStart(null); setCropEnd(null); }
          }
          if (activeTool === 'pen' && penAnchors.length >= 2) finishPenPath();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setIsPanning(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [activeTool, cropStart, cropEnd, penAnchors, brushSize, clearSelection]);

  const getPointerPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return { x: (pos.x - canvas.offsetX) / canvas.zoom, y: (pos.y - canvas.offsetY) / canvas.zoom };
  }, [canvas.offsetX, canvas.offsetY, canvas.zoom]);

  // FIX 5: Finish pen path with bezier support
  const finishPenPath = useCallback(() => {
    if (penAnchors.length < 2 || !activeLayerId) return;
    
    const first = penAnchors[0];
    let pathData = `M ${first.x} ${first.y}`;
    for (let i = 1; i < penAnchors.length; i++) {
      const prev = penAnchors[i - 1];
      const curr = penAnchors[i];
      if (prev.handleOutX !== undefined && prev.handleOutY !== undefined && curr.handleInX !== undefined && curr.handleInY !== undefined) {
        pathData += ` C ${prev.handleOutX} ${prev.handleOutY}, ${curr.handleInX} ${curr.handleInY}, ${curr.x} ${curr.y}`;
      } else if (prev.handleOutX !== undefined && prev.handleOutY !== undefined) {
        pathData += ` Q ${prev.handleOutX} ${prev.handleOutY}, ${curr.x} ${curr.y}`;
      } else {
        pathData += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    const last = penAnchors[penAnchors.length - 1];
    const dist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);
    if (dist < 20 || penAnchors.length > 3) pathData += ' Z';

    const pathObj: EditorObject = {
      id: uuidv4(),
      type: 'path',
      x: 0, y: 0,
      pathData,
      fill: foregroundColor,
      stroke: foregroundColor,
      strokeWidth: 2,
      opacity: 100,
      pathAnchors: penAnchors.map(a => ({ x: a.x, y: a.y, handleInX: a.handleInX, handleInY: a.handleInY, handleOutX: a.handleOutX, handleOutY: a.handleOutY })),
    };
    addObjectToLayer(activeLayerId, pathObj);
    pushHistory('Draw Path');
    setPenAnchors([]);
  }, [penAnchors, activeLayerId, foregroundColor, addObjectToLayer, pushHistory]);

  // FIX 7: Apply effect brush - improved with full canvas approach
  const applyEffectBrush = useCallback(async (strokeObj: EditorObject, toolType: string) => {
    if (!activeLayerId) return;
    const pts = strokeObj.points || [];
    if (pts.length < 2) return;
    
    const pad = (strokeObj.brushSize || 5);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < pts.length; i += 2) {
      minX = Math.min(minX, pts[i]);
      minY = Math.min(minY, pts[i + 1]);
      maxX = Math.max(maxX, pts[i]);
      maxY = Math.max(maxY, pts[i + 1]);
    }
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;
    // Clamp to canvas bounds
    minX = Math.max(0, Math.floor(minX));
    minY = Math.max(0, Math.floor(minY));
    maxX = Math.min(canvas.width, Math.ceil(maxX));
    maxY = Math.min(canvas.height, Math.ceil(maxY));
    const bw = maxX - minX;
    const bh = maxY - minY;
    if (bw <= 0 || bh <= 0) return;

    const stage = stageRef.current;
    if (!stage) return;

    try {
      // Get full stage canvas first, then extract the region
      const fullStageCanvas = stage.toCanvas({ pixelRatio: 1 });
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = bw;
      tempCanvas.height = bh;
      const ctx = tempCanvas.getContext('2d')!;
      // Account for zoom and offset when extracting from the stage canvas
      const sx = minX * canvas.zoom + canvas.offsetX;
      const sy = minY * canvas.zoom + canvas.offsetY;
      const sw = bw * canvas.zoom;
      const sh = bh * canvas.zoom;
      ctx.drawImage(fullStageCanvas, sx, sy, sw, sh, 0, 0, bw, bh);
      
      let imageData = ctx.getImageData(0, 0, bw, bh);
      switch (toolType) {
        case 'blur-brush': imageData = applyBlur(imageData, 3); break;
        case 'sharpen-brush': imageData = applySharpen(imageData, 50); break;
        case 'dodge': imageData = adjustBrightness(imageData, 30); break;
        case 'burn': imageData = adjustBrightness(imageData, -30); break;
        case 'sponge': imageData = adjustSaturation(imageData, 30); break;
      }
      ctx.putImageData(imageData, 0, 0);

      // Remove original invisible stroke, add filtered image
      removeObject(activeLayerId, strokeObj.id);
      const imgObj: EditorObject = {
        id: uuidv4(),
        type: 'image',
        x: minX,
        y: minY,
        width: bw,
        height: bh,
        imageSrc: tempCanvas.toDataURL('image/png'),
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, imgObj);
    } catch {
      // If effect fails, remove the invisible stroke
      removeObject(activeLayerId, strokeObj.id);
    }
  }, [activeLayerId, addObjectToLayer, removeObject, canvas.width, canvas.height, canvas.zoom, canvas.offsetX, canvas.offsetY]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPos();
    const target = e.target;

    if (activeTool === 'hand' || isPanning) return;

    if (activeTool === 'zoom') {
      if (e.evt.shiftKey) useEditorStore.getState().zoomOut();
      else useEditorStore.getState().zoomIn();
      return;
    }

    // Selection tools
    if (activeTool === 'select' || activeTool === 'move') {
      if (target === e.target.getStage()) {
        setSelectedObjectIds([]);
        return;
      }
      const id = target.id();
      if (id) {
        if (e.evt.shiftKey) {
          setSelectedObjectIds(selectedObjectIds.includes(id) ? selectedObjectIds.filter((i) => i !== id) : [...selectedObjectIds, id]);
        } else {
          setSelectedObjectIds([id]);
        }
      }
      return;
    }

    // FIX 1: Rectangular marquee selection
    if (activeTool === 'rect-select') {
      setSelectionStart(pos);
      setSelectionEnd(pos);
      return;
    }

    // FIX 1: Elliptical marquee selection
    if (activeTool === 'ellipse-select') {
      setSelectionStart(pos);
      setSelectionEnd(pos);
      return;
    }

    // FIX 1: Magic wand selection
    if (activeTool === 'magic-wand') {
      const stage = stageRef.current;
      if (!stage) return;
      try {
        const pixelRatio = 1;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width * pixelRatio;
        tempCanvas.height = canvas.height * pixelRatio;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          const stageCanvas = stage.toCanvas({ pixelRatio });
          ctx.drawImage(stageCanvas, 0, 0);
          const startX = Math.round(pos.x * pixelRatio);
          const startY = Math.round(pos.y * pixelRatio);
          if (startX >= 0 && startX < tempCanvas.width && startY >= 0 && startY < tempCanvas.height) {
            const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const startIdx = (startY * tempCanvas.width + startX) * 4;
            const startR = imageData.data[startIdx];
            const startG = imageData.data[startIdx + 1];
            const startB = imageData.data[startIdx + 2];
            const tolerance = fillTolerance;
            // Simple flood fill to find selection bounds
            const visited = new Uint8Array(tempCanvas.width * tempCanvas.height);
            const stack: [number, number][] = [[startX, startY]];
            let minX = startX, minY = startY, maxX = startX, maxY = startY;
            while (stack.length > 0) {
              const [sx, sy] = stack.pop()!;
              if (sx < 0 || sx >= tempCanvas.width || sy < 0 || sy >= tempCanvas.height) continue;
              const idx = sy * tempCanvas.width + sx;
              if (visited[idx]) continue;
              visited[idx] = 1;
              const pixIdx = idx * 4;
              const dr = Math.abs(imageData.data[pixIdx] - startR);
              const dg = Math.abs(imageData.data[pixIdx + 1] - startG);
              const db = Math.abs(imageData.data[pixIdx + 2] - startB);
              if (dr + dg + db > tolerance * 3) continue;
              minX = Math.min(minX, sx); minY = Math.min(minY, sy);
              maxX = Math.max(maxX, sx); maxY = Math.max(maxY, sy);
              stack.push([sx + 1, sy], [sx - 1, sy], [sx, sy + 1], [sx, sy - 1]);
            }
            setSelection({ type: 'magic-wand', x: minX / pixelRatio, y: minY / pixelRatio, width: (maxX - minX) / pixelRatio, height: (maxY - minY) / pixelRatio });
          }
        }
      } catch { /* cross-origin */ }
      return;
    }

    if (activeTool === 'measure') { setMeasureStart(pos); setMeasureEnd(pos); return; }
    if (activeTool === 'crop' || activeTool === 'circle-crop') { setCropStart(pos); setCropEnd(pos); return; }
    if (activeTool === 'slice') { setSliceStart(pos); setSliceEnd(pos); return; }

    // FIX 4: Pen tool - click for straight points, click+drag for curves
    if (activeTool === 'pen') {
      if (penAnchors.length >= 3) {
        const first = penAnchors[0];
        const dist = Math.sqrt((pos.x - first.x) ** 2 + (pos.y - first.y) ** 2);
        if (dist < 15) { finishPenPath(); return; }
      }
      setPenAnchors(prev => [...prev, { x: pos.x, y: pos.y }]);
      setPenDragging(true);
      // Store the mousedown position for drag detection
      shapeStartRef.current = pos;
      return;
    }

    // Brush/eraser
    if (activeTool === 'brush' || activeTool === 'eraser') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      const id = uuidv4();
      drawingIdRef.current = id;
      const brushObj: EditorObject = {
        id, type: 'brush-stroke', x: 0, y: 0,
        points: [pos.x, pos.y],
        brushSize: activeTool === 'eraser' ? eraserSize : brushSize,
        brushColor: activeTool === 'eraser' ? 'eraser' : foregroundColor,
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, brushObj);
      return;
    }

    // FIX 7: Effect brushes (dodge/burn/sponge/blur/sharpen) - use transparent stroke
    if (['dodge', 'burn', 'sponge', 'blur-brush', 'sharpen-brush'].includes(activeTool)) {
      if (!activeLayerId) return;
      setIsDrawing(true);
      const id = uuidv4();
      drawingIdRef.current = id;
      // Use transparent color so stroke is invisible during drawing
      const brushObj: EditorObject = {
        id, type: 'brush-stroke', x: 0, y: 0,
        points: [pos.x, pos.y],
        brushSize,
        brushColor: 'transparent',
        opacity: 0,
      };
      addObjectToLayer(activeLayerId, brushObj);
      return;
    }

    // FIX 7: Clone stamp - use transparent stroke during drawing
    if (activeTool === 'clone-stamp') {
      if (e.evt.altKey) { setCloneSource({ x: pos.x, y: pos.y }); setCloneOffset(null); return; }
      if (!activeLayerId) return;
      if (cloneSource) {
        const offset = { x: pos.x - cloneSource.x, y: pos.y - cloneSource.y };
        setCloneOffset(offset);
        setIsDrawing(true);
        const id = uuidv4();
        drawingIdRef.current = id;
        const brushObj: EditorObject = {
          id, type: 'brush-stroke', x: 0, y: 0,
          points: [pos.x, pos.y],
          brushSize,
          brushColor: 'transparent',
          opacity: 0,
        };
        addObjectToLayer(activeLayerId, brushObj);
      }
      return;
    }

    // Fill tool - renders only layer content (no background) for proper flood fill
    if (activeTool === 'fill') {
      if (!activeLayerId) return;
      const stage = stageRef.current;
      if (!stage) return;
      try {
        // Render only visible layer objects to a temp canvas (no background, no checkerboard)
        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = canvas.width;
        renderCanvas.height = canvas.height;
        const renderCtx = renderCanvas.getContext('2d');
        if (renderCtx) {
          // Draw white background as the "canvas" color (like Photoshop)
          renderCtx.fillStyle = '#ffffff';
          renderCtx.fillRect(0, 0, canvas.width, canvas.height);
          // Render each visible layer's objects using the stage but with only content layers
          // Use stage.toCanvas but crop to canvas dimensions, ignoring UI overlays
          const stageCanvas = stage.toCanvas({ pixelRatio: 1 });
          // Extract only the canvas area from the stage render
          renderCtx.drawImage(
            stageCanvas,
            canvas.offsetX, canvas.offsetY, canvas.width * canvas.zoom, canvas.height * canvas.zoom,
            0, 0, canvas.width, canvas.height
          );
          
          const startX = Math.round(pos.x);
          const startY = Math.round(pos.y);
          if (startX >= 0 && startX < renderCanvas.width && startY >= 0 && startY < renderCanvas.height) {
            const imageData = renderCtx.getImageData(0, 0, renderCanvas.width, renderCanvas.height);
            const fillRgba = hexToRgba(foregroundColor);
            const filled = floodFill(imageData, startX, startY, fillRgba, fillTolerance);
            renderCtx.putImageData(filled, 0, 0);
            
            // Find the bounding box of changed pixels to create a minimal image
            const filledData = filled.data;
            const origData = imageData.data;
            let minFX = canvas.width, minFY = canvas.height, maxFX = 0, maxFY = 0;
            let hasChanges = false;
            for (let y = 0; y < canvas.height; y++) {
              for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                if (filledData[idx] !== origData[idx] || filledData[idx+1] !== origData[idx+1] || 
                    filledData[idx+2] !== origData[idx+2] || filledData[idx+3] !== origData[idx+3]) {
                  if (x < minFX) minFX = x;
                  if (y < minFY) minFY = y;
                  if (x > maxFX) maxFX = x;
                  if (y > maxFY) maxFY = y;
                  hasChanges = true;
                }
              }
            }
            
            if (hasChanges) {
              // Add small padding
              minFX = Math.max(0, minFX - 1);
              minFY = Math.max(0, minFY - 1);
              maxFX = Math.min(canvas.width - 1, maxFX + 1);
              maxFY = Math.min(canvas.height - 1, maxFY + 1);
              const cropW = maxFX - minFX + 1;
              const cropH = maxFY - minFY + 1;
              
              // Create a minimal image with only the filled area
              const cropCanvas = document.createElement('canvas');
              cropCanvas.width = cropW;
              cropCanvas.height = cropH;
              const cropCtx = cropCanvas.getContext('2d')!;
              // Extract only changed pixels with transparency for unchanged areas
              const cropImageData = cropCtx.createImageData(cropW, cropH);
              for (let cy = 0; cy < cropH; cy++) {
                for (let cx = 0; cx < cropW; cx++) {
                  const srcIdx = ((minFY + cy) * canvas.width + (minFX + cx)) * 4;
                  const dstIdx = (cy * cropW + cx) * 4;
                  // Only include pixels that were actually changed by the fill
                  if (filledData[srcIdx] !== origData[srcIdx] || filledData[srcIdx+1] !== origData[srcIdx+1] || 
                      filledData[srcIdx+2] !== origData[srcIdx+2] || filledData[srcIdx+3] !== origData[srcIdx+3]) {
                    cropImageData.data[dstIdx] = filledData[srcIdx];
                    cropImageData.data[dstIdx+1] = filledData[srcIdx+1];
                    cropImageData.data[dstIdx+2] = filledData[srcIdx+2];
                    cropImageData.data[dstIdx+3] = filledData[srcIdx+3];
                  } else {
                    // Transparent for unchanged areas
                    cropImageData.data[dstIdx+3] = 0;
                  }
                }
              }
              cropCtx.putImageData(cropImageData, 0, 0);
              
              const fillObj: EditorObject = {
                id: uuidv4(), type: 'image', x: minFX, y: minFY,
                width: cropW, height: cropH,
                imageSrc: cropCanvas.toDataURL('image/png'), opacity: 100,
              };
              addObjectToLayer(activeLayerId, fillObj);
              pushHistory('Flood Fill');
            }
          }
        }
      } catch { /* cross-origin */ }
      return;
    }

    if (activeTool === 'gradient') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;
      const gradientObj: EditorObject = {
        id, type: 'gradient', x: pos.x, y: pos.y, width: 0, height: 0,
        gradientStartColor: foregroundColor, gradientEndColor: backgroundColor,
        gradientDirection: 'horizontal', opacity: 100,
      };
      addObjectToLayer(activeLayerId, gradientObj);
      return;
    }

    if (activeTool === 'shape') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;
      let objType: EditorObject['type'] = 'rect';
      if (activeShapeType === 'ellipse' || activeShapeType === 'circle') objType = 'ellipse';
      const shapeObj: EditorObject = {
        id, type: objType, x: pos.x, y: pos.y, width: 0, height: 0,
        fill: foregroundColor, stroke: '#000000', strokeWidth: 1, opacity: 100,
        shapeType: activeShapeType,
      };
      addObjectToLayer(activeLayerId, shapeObj);
      return;
    }

    if (activeTool === 'line') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;
      const lineObj: EditorObject = {
        id, type: 'line', x: 0, y: 0,
        linePoints: [pos.x, pos.y, pos.x, pos.y],
        stroke: foregroundColor, strokeWidth: 2, opacity: 100,
      };
      addObjectToLayer(activeLayerId, lineObj);
      return;
    }

    // FIX 4: Text tool - stays active after adding
    if (activeTool === 'text') {
      if (!activeLayerId) return;
      const id = uuidv4();
      const textObj: EditorObject = {
        id, type: 'text', x: pos.x, y: pos.y,
        text: 'Text', fontSize, fontFamily,
        fill: foregroundColor, opacity: 100,
      };
      addObjectToLayer(activeLayerId, textObj);
      setSelectedObjectIds([id]);
      pushHistory('Add Text');
      // FIX 4: Don't switch to select tool
      // Open inline editing
      setEditingTextId(id);
      setEditTextValue('Text');
      return;
    }

    if (activeTool === 'eyedropper') {
      const stage = stageRef.current;
      if (!stage) return;
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          // Render with white background like the actual canvas
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const stageCanvas = stage.toCanvas({ pixelRatio: 1 });
          ctx.drawImage(
            stageCanvas,
            canvas.offsetX, canvas.offsetY, canvas.width * canvas.zoom, canvas.height * canvas.zoom,
            0, 0, canvas.width, canvas.height
          );
          const pickX = Math.max(0, Math.min(canvas.width - 1, Math.round(pos.x)));
          const pickY = Math.max(0, Math.min(canvas.height - 1, Math.round(pos.y)));
          const imageData = ctx.getImageData(pickX, pickY, 1, 1);
          const [r, g, b] = imageData.data;
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          useEditorStore.getState().setForegroundColor(hex);
        }
      } catch { /* cross-origin */ }
      return;
    }
  }, [activeTool, activeLayerId, activeShapeType, isPanning, canvas, selectedObjectIds, foregroundColor, backgroundColor, brushSize, eraserSize, fontSize, fontFamily, getPointerPos, addObjectToLayer, setSelectedObjectIds, pushHistory, setIsDrawing, cloneSource, setCloneSource, penAnchors, finishPenPath, fillTolerance, applyCrop, cropStart, cropEnd, setSelection]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (pointerPos) {
      setMousePos({ x: Math.round((pointerPos.x - canvas.offsetX) / canvas.zoom), y: Math.round((pointerPos.y - canvas.offsetY) / canvas.zoom) });
    }

    if (activeTool === 'hand' || isPanning) {
      updateCanvas({ offsetX: canvas.offsetX + e.evt.movementX, offsetY: canvas.offsetY + e.evt.movementY });
      return;
    }

    const pos = getPointerPos();

    // Selection tools
    if ((activeTool === 'rect-select' || activeTool === 'ellipse-select') && selectionStart) {
      setSelectionEnd(pos);
      return;
    }

    if (activeTool === 'measure' && measureStart) { setMeasureEnd(pos); return; }
    if ((activeTool === 'crop' || activeTool === 'circle-crop') && cropStart) { setCropEnd(pos); return; }
    if (activeTool === 'slice' && sliceStart) { setSliceEnd(pos); return; }

    // FIX 4: Pen tool dragging - only create handles if dragged more than 3px
    if (activeTool === 'pen' && penDragging && penAnchors.length > 0) {
      const lastIdx = penAnchors.length - 1;
      const anchor = penAnchors[lastIdx];
      const start = shapeStartRef.current;
      if (start) {
        const dx = pos.x - start.x;
        const dy = pos.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 3) {
          setPenAnchors(prev => {
            const updated = [...prev];
            const a = { ...updated[lastIdx] };
            a.handleOutX = pos.x;
            a.handleOutY = pos.y;
            updated[lastIdx] = a;
            return updated;
          });
        }
      }
      return;
    }

    if (!activeLayerId) return;

    // Drawing with brush/eraser/effects/clone
    if (useEditorStore.getState().isDrawing && drawingIdRef.current) {
      const id = drawingIdRef.current;
      const layer = useEditorStore.getState().layers.find((l) => l.id === activeLayerId);
      if (!layer) return;
      const obj = layer.objects.find((o) => o.id === id);
      if (!obj) return;

      if (obj.type === 'brush-stroke') {
        const newPoints = [...(obj.points || []), pos.x, pos.y];
        updateObject(activeLayerId, id, { points: newPoints });
      } else if (obj.type === 'rect' || obj.type === 'ellipse') {
        const start = shapeStartRef.current;
        if (!start) return;
        const width = pos.x - start.x;
        const height = pos.y - start.y;
        updateObject(activeLayerId, id, { x: width < 0 ? pos.x : start.x, y: height < 0 ? pos.y : start.y, width: Math.abs(width), height: Math.abs(height) });
      } else if (obj.type === 'gradient') {
        const start = shapeStartRef.current;
        if (!start) return;
        const width = pos.x - start.x;
        const height = pos.y - start.y;
        updateObject(activeLayerId, id, { x: width < 0 ? pos.x : start.x, y: height < 0 ? pos.y : start.y, width: Math.abs(width), height: Math.abs(height), gradientDirection: Math.abs(width) > Math.abs(height) ? 'horizontal' : 'vertical' });
      } else if (obj.type === 'line') {
        const start = shapeStartRef.current;
        if (!start) return;
        updateObject(activeLayerId, id, { linePoints: [start.x, start.y, pos.x, pos.y] });
      }
    }
  }, [activeTool, activeLayerId, isPanning, canvas, getPointerPos, updateCanvas, updateObject, setMousePos, selectionStart, measureStart, cropStart, sliceStart, penDragging, penAnchors]);

  const handleMouseUp = useCallback(() => {
    // FIX 4: Pen tool - finalize handle on mouseup
    if (penDragging && penAnchors.length > 0) {
      setPenDragging(false);
      const lastIdx = penAnchors.length - 1;
      if (penAnchors[lastIdx].handleOutX !== undefined) {
        // User dragged - set handleIn as the mirror of handleOut
        setPenAnchors(prev => {
          const updated = [...prev];
          const anchor = { ...updated[lastIdx] };
          anchor.handleInX = 2 * anchor.x - anchor.handleOutX!;
          anchor.handleInY = 2 * anchor.y - anchor.handleOutY!;
          updated[lastIdx] = anchor;
          return updated;
        });
      }
      // If no handleOut was set, this was a simple click - leave as straight point (no handles)
      shapeStartRef.current = null;
    }

    if (useEditorStore.getState().isDrawing) {
      setIsDrawing(false);
      if (drawingIdRef.current && activeLayerId) {
        const state = useEditorStore.getState();
        const layer = state.layers.find((l) => l.id === activeLayerId);
        const obj = layer?.objects.find((o) => o.id === drawingIdRef.current);

        // FIX 8: Apply effect brushes on mouseup
        if (obj && obj.type === 'brush-stroke' && ['blur-brush', 'sharpen-brush', 'dodge', 'burn', 'sponge'].includes(activeTool)) {
          applyEffectBrush(obj, activeTool);
        }

        // FIX 7: Clone stamp - sample from source using full canvas approach
        if (obj && obj.type === 'brush-stroke' && activeTool === 'clone-stamp' && cloneSource) {
          const stage = stageRef.current;
          if (stage) {
            try {
              const pts = obj.points || [];
              if (pts.length >= 2) {
                const pad = brushSize;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (let i = 0; i < pts.length; i += 2) {
                  minX = Math.min(minX, pts[i]); minY = Math.min(minY, pts[i+1]);
                  maxX = Math.max(maxX, pts[i]); maxY = Math.max(maxY, pts[i+1]);
                }
                minX -= pad; minY -= pad; maxX += pad; maxY += pad;
                minX = Math.max(0, Math.floor(minX));
                minY = Math.max(0, Math.floor(minY));
                maxX = Math.min(canvas.width, Math.ceil(maxX));
                maxY = Math.min(canvas.height, Math.ceil(maxY));
                const bw = maxX - minX; const bh = maxY - minY;
                if (bw > 0 && bh > 0) {
                  const offset = cloneOffset || { x: 0, y: 0 };
                  // Get the full stage canvas and extract the clone source region
                  const fullStageCanvas = stage.toCanvas({ pixelRatio: 1 });
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = bw; tempCanvas.height = bh;
                  const ctx = tempCanvas.getContext('2d')!;
                  // Source region is offset from the destination by the clone offset
                  const srcX = (minX + offset.x) * canvas.zoom + canvas.offsetX;
                  const srcY = (minY + offset.y) * canvas.zoom + canvas.offsetY;
                  const srcW = bw * canvas.zoom;
                  const srcH = bh * canvas.zoom;
                  ctx.drawImage(fullStageCanvas, srcX, srcY, srcW, srcH, 0, 0, bw, bh);
                  removeObject(activeLayerId, obj.id);
                  const imgObj: EditorObject = {
                    id: uuidv4(), type: 'image', x: minX, y: minY,
                    width: bw, height: bh,
                    imageSrc: tempCanvas.toDataURL('image/png'),
                    opacity: 100,
                  };
                  addObjectToLayer(activeLayerId, imgObj);
                }
              }
            } catch {
              // If clone fails, remove the invisible stroke
              if (obj) removeObject(activeLayerId, obj.id);
            }
          }
        }

        const desc = activeTool === 'brush' ? 'Brush Stroke' :
                     activeTool === 'eraser' ? 'Eraser Stroke' :
                     activeTool === 'shape' ? 'Draw Shape' :
                     activeTool === 'line' ? 'Draw Line' :
                     activeTool === 'gradient' ? 'Draw Gradient' :
                     activeTool === 'dodge' ? 'Dodge Stroke' :
                     activeTool === 'burn' ? 'Burn Stroke' :
                     activeTool === 'sponge' ? 'Sponge Stroke' :
                     activeTool === 'blur-brush' ? 'Blur Brush' :
                     activeTool === 'sharpen-brush' ? 'Sharpen Brush' :
                     activeTool === 'clone-stamp' ? 'Clone Stamp' :
                     'Draw';
        pushHistory(desc);
      }
      drawingIdRef.current = null;
      shapeStartRef.current = null;
    }

    // Finalize selection
    if ((activeTool === 'rect-select' || activeTool === 'ellipse-select') && selectionStart && selectionEnd) {
      const x = Math.min(selectionStart.x, selectionEnd.x);
      const y = Math.min(selectionStart.y, selectionEnd.y);
      const w = Math.abs(selectionEnd.x - selectionStart.x);
      const h = Math.abs(selectionEnd.y - selectionStart.y);
      if (w > 1 && h > 1) {
        setSelection({ type: activeTool === 'ellipse-select' ? 'ellipse' : 'rect', x, y, width: w, height: h });
      }
      setSelectionStart(null);
      setSelectionEnd(null);
    }

    // Slice tool completion
    if (activeTool === 'slice' && sliceStart && sliceEnd) {
      const x1 = Math.min(sliceStart.x, sliceEnd.x);
      const y1 = Math.min(sliceStart.y, sliceEnd.y);
      const x2 = Math.max(sliceStart.x, sliceEnd.x);
      const y2 = Math.max(sliceStart.y, sliceEnd.y);
      setSnapGuides([
        { type: 'vertical', position: x1 },
        { type: 'vertical', position: x2 },
        { type: 'horizontal', position: y1 },
        { type: 'horizontal', position: y2 },
      ]);
      setSliceStart(null);
      setSliceEnd(null);
    }
  }, [activeTool, setIsDrawing, pushHistory, sliceStart, sliceEnd, setSnapGuides, selectionStart, selectionEnd, setSelection, penDragging, penAnchors, activeLayerId, applyEffectBrush, cloneSource, cloneOffset, brushSize, removeObject, addObjectToLayer]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.05;
      const oldZoom = canvas.zoom;
      const newZoom = e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy;
      const clampedZoom = Math.max(0.05, Math.min(32, newZoom));
      const mousePointTo = { x: (pointer.x - canvas.offsetX) / oldZoom, y: (pointer.y - canvas.offsetY) / oldZoom };
      updateCanvas({ zoom: clampedZoom, offsetX: pointer.x - mousePointTo.x * clampedZoom, offsetY: pointer.y - mousePointTo.y * clampedZoom });
    } else {
      updateCanvas({ offsetX: canvas.offsetX - e.evt.deltaX, offsetY: canvas.offsetY - e.evt.deltaY });
    }
  }, [canvas, updateCanvas]);

  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    switch (activeTool) {
      case 'hand': return 'grab';
      case 'zoom': return 'zoom-in';
      case 'brush': case 'eraser': case 'dodge': case 'burn': case 'sponge':
      case 'blur-brush': case 'sharpen-brush': case 'clone-stamp': return 'crosshair';
      case 'text': return 'text';
      case 'eyedropper': case 'fill': case 'crop': case 'pen': case 'gradient':
      case 'measure': case 'slice': case 'rect-select': case 'ellipse-select': case 'magic-wand': return 'crosshair';
      default: return 'default';
    }
  };

  // Grid lines
  const gridSize = 50;
  const gridLines: React.ReactNode[] = [];
  if (showGrid) {
    for (let x = 0; x <= canvas.width; x += gridSize) gridLines.push(<Line key={`gv-${x}`} points={[x, 0, x, canvas.height]} stroke="#888888" strokeWidth={0.5} listening={false} />);
    for (let y = 0; y <= canvas.height; y += gridSize) gridLines.push(<Line key={`gh-${y}`} points={[0, y, canvas.width, y]} stroke="#888888" strokeWidth={0.5} listening={false} />);
  }

  // Current selection for display
  const currentSelection = useEditorStore((s) => s.selection);
  // Build temp selection overlay from drag
  const displaySelection = selectionStart && selectionEnd ? {
    type: activeTool === 'ellipse-select' ? 'ellipse' : 'rect' as const,
    x: Math.min(selectionStart.x, selectionEnd.x),
    y: Math.min(selectionStart.y, selectionEnd.y),
    width: Math.abs(selectionEnd.x - selectionStart.x),
    height: Math.abs(selectionEnd.y - selectionStart.y),
  } : currentSelection;

  return (
    <div ref={containerRef} className="canvas-container flex-1 bg-zinc-950 overflow-hidden relative" style={{ cursor: getCursorStyle() }}>
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={canvas.zoom}
        scaleY={canvas.zoom}
        x={canvas.offsetX}
        y={canvas.offsetY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Checkerboard background */}
        <Layer listening={false}>
          <Rect x={4} y={4} width={canvas.width} height={canvas.height} fill="rgba(0,0,0,0.3)" shadowBlur={20} shadowColor="rgba(0,0,0,0.5)" shadowOffsetX={4} shadowOffsetY={4} />
          <Rect x={0} y={0} width={canvas.width} height={canvas.height} fill="#ffffff" />
          <Shape
            sceneFunc={(context, shape) => {
              const size = 10;
              for (let y = 0; y < canvas.height; y += size) {
                for (let x = 0; x < canvas.width; x += size) {
                  if (((x / size + y / size) % 2) !== 0) context.rect(x, y, size, size);
                }
              }
              context.fillStrokeShape(shape);
            }}
            fill="#e5e5e5"
          />
        </Layer>

        {/* Layer objects */}
        {layers.map((layer) => (
          <Layer key={layer.id} visible={layer.visible} opacity={layer.opacity / 100} listening={!layer.locked}>
            {layer.objects.map((obj) => (
              <EditorObjectRenderer
                key={obj.id}
                obj={obj}
                isSelected={selectedObjectIds.includes(obj.id)}
                onSelect={(id) => setSelectedObjectIds([id])}
                layerEffects={layer.effects}
              />
            ))}
          </Layer>
        ))}

        {/* Grid overlay */}
        {showGrid && <Layer listening={false}>{gridLines}</Layer>}

        {/* Snap guides */}
        {showSnapGuides && <Layer listening={false}><SnapGuidesOverlay guides={useEditorStore.getState().snapGuides} /></Layer>}

        {/* UI overlays */}
        <Layer listening={false}>
          {/* Selection overlay */}
          {displaySelection && <SelectionOverlay selection={displaySelection} />}
          {/* Measure */}
          {activeTool === 'measure' && <MeasureOverlay startPos={measureStart} endPos={measureEnd} />}
          {/* Crop */}
          {(activeTool === 'crop' || activeTool === 'circle-crop') && <CropOverlay cropStart={cropStart} cropEnd={cropEnd} canvasWidth={canvas.width} canvasHeight={canvas.height} cropMode={cropMode} />}
          {/* Slice */}
          {activeTool === 'slice' && sliceStart && sliceEnd && (
            <Line points={[sliceStart.x, sliceStart.y, sliceEnd.x, sliceStart.y, sliceEnd.x, sliceEnd.y, sliceStart.x, sliceEnd.y, sliceStart.x, sliceStart.y]} stroke="#ff6600" strokeWidth={1} dash={[6, 3]} listening={false} />
          )}
          {/* Pen preview */}
          {activeTool === 'pen' && <PenPreview anchors={penAnchors} />}
          {/* Clone stamp source indicator */}
          {activeTool === 'clone-stamp' && cloneSource && (
            <>
              <Line points={[cloneSource.x - 10, cloneSource.y, cloneSource.x + 10, cloneSource.y]} stroke="#ff4081" strokeWidth={1} listening={false} />
              <Line points={[cloneSource.x, cloneSource.y - 10, cloneSource.x, cloneSource.y + 10]} stroke="#ff4081" strokeWidth={1} listening={false} />
            </>
          )}
        </Layer>

        {/* Transformer */}
        <Layer>
          <TransformerComponent selectedIds={selectedObjectIds} />
        </Layer>
      </Stage>

      {/* FIX 5: Crop apply/cancel buttons as HTML overlay */}
      {(activeTool === 'crop' || activeTool === 'circle-crop') && cropStart && cropEnd && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          <button
            className="px-4 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors shadow-lg"
            onClick={() => {
              const x = Math.min(cropStart.x, cropEnd.x);
              const y = Math.min(cropStart.y, cropEnd.y);
              const w = Math.abs(cropEnd.x - cropStart.x);
              const h = Math.abs(cropEnd.y - cropStart.y);
              if (w > 1 && h > 1) { applyCrop(x, y, w, h); setCropStart(null); setCropEnd(null); }
            }}
          >
            ✓ Apply (Enter)
          </button>
          <button
            className="px-4 py-1.5 bg-zinc-700 text-zinc-200 text-xs rounded hover:bg-zinc-600 transition-colors shadow-lg"
            onClick={() => { setCropStart(null); setCropEnd(null); }}
          >
            ✕ Cancel (Esc)
          </button>
        </div>
      )}

      {/* Clone stamp hint */}
      {activeTool === 'clone-stamp' && !cloneSource && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded border border-zinc-700 z-10">
          Alt+Click to set clone source
        </div>
      )}
      {activeTool === 'clone-stamp' && cloneSource && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-emerald-300 text-xs px-3 py-2 rounded border border-zinc-700 z-10">
          Source set. Click and drag to clone.
        </div>
      )}

      {/* FIX 4: Text edit overlay */}
      {editingTextId && activeTool === 'text' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-md p-3 z-20 min-w-[200px]">
          <label className="text-xs text-zinc-400 block mb-1">Edit Text</label>
          <input
            className="w-full bg-zinc-700 text-zinc-200 text-sm px-2 py-1 rounded border border-zinc-600 outline-none focus:border-emerald-500"
            value={editTextValue}
            onChange={(e) => {
              setEditTextValue(e.target.value);
              if (activeLayerId) {
                updateObject(activeLayerId, editingTextId, { text: e.target.value });
              }
            }}
            onBlur={() => {
              if (activeLayerId && editTextValue.trim()) {
                updateObject(activeLayerId, editingTextId, { text: editTextValue });
                pushHistory('Edit Text');
              }
              setEditingTextId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (activeLayerId && editTextValue.trim()) {
                  updateObject(activeLayerId, editingTextId, { text: editTextValue });
                  pushHistory('Edit Text');
                }
                setEditingTextId(null);
              }
              if (e.key === 'Escape') setEditingTextId(null);
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
