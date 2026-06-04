'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Line, Ellipse, Text, Image as KonvaImage, Transformer, Shape, Group, Path } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore } from '@/lib/editor-store';
import type { EditorObject, LayerEffects, CropState, SnapGuide } from '@/lib/types';
import { getShadowProps, getStrokeEffectProps, floodFill, hexToRgba } from '@/lib/image-processing';
import { v4 as uuidv4 } from 'uuid';

// Image cache to avoid re-creating HTMLImageElement
const imageCache = new Map<string, HTMLImageElement>();

// Preload image and call callback
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

// Separate component for image objects (needs its own state)
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

// Shape rendering helper
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

  // Get shadow props from layer effects
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

  // Render stroke effect behind the main shape (for "outside" stroke)
  const renderStrokeEffect = () => {
    if (!strokeEffectProps) return null;
    // Render a slightly larger version of the shape behind for the stroke effect
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
        </Group>
      );

    case 'circle':
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
        </Group>
      );

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
      // Handle custom shapes via shapeType
      if (obj.shapeType && obj.type === 'rect') {
        const shapeType = obj.shapeType;
        const w = obj.width || 100;
        const h = obj.height || 100;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy);

        switch (shapeType) {
          case 'triangle':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  context.beginPath();
                  context.moveTo(cx, 0);
                  context.lineTo(w, h);
                  context.lineTo(0, h);
                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'star':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawStar(context, cx, cy, radius, radius * 0.4, 5);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'diamond':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawDiamond(context, w, h);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'hexagon':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawRegularPolygon(context, cx, cy, radius, 6);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'pentagon':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawRegularPolygon(context, cx, cy, radius, 5);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'octagon':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawRegularPolygon(context, cx, cy, radius, 8);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'heart':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawHeart(context, cx, cy, w, h);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'arrow-right':
          case 'arrow-left':
          case 'arrow-up':
          case 'arrow-down':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawArrow(context, w, h, shapeType.split('-')[1] as 'right' | 'left' | 'up' | 'down');
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'cross':
            return (
              <Shape
                {...commonProps}
                {...shadowProps}
                sceneFunc={(context, shape) => {
                  drawCross(context, w, h);
                  context.fillStrokeShape(shape);
                }}
                fill={obj.fill}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth || 0}
              />
            );

          case 'rounded-rect':
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

          default:
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
      }
      return null;
  }
}

// Transformer wrapper component
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

// Marquee/selection overlay component
function MarqueeOverlay({ startPos, endPos }: { startPos: { x: number; y: number } | null; endPos: { x: number; y: number } | null }) {
  if (!startPos || !endPos) return null;
  const x = Math.min(startPos.x, endPos.x);
  const y = Math.min(startPos.y, endPos.y);
  const w = Math.abs(endPos.x - startPos.x);
  const h = Math.abs(endPos.y - startPos.y);

  return (
    <Rect
      x={x}
      y={y}
      width={w}
      height={h}
      stroke="#10b981"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
}

// Measure overlay component
function MeasureOverlay({ startPos, endPos }: { startPos: { x: number; y: number } | null; endPos: { x: number; y: number } | null }) {
  if (!startPos || !endPos) return null;
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const dist = Math.round(Math.sqrt(dx * dx + dy * dy));

  return (
    <>
      <Line
        points={[startPos.x, startPos.y, endPos.x, endPos.y]}
        stroke="#10b981"
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />
      <Text
        x={(startPos.x + endPos.x) / 2 - 20}
        y={(startPos.y + endPos.y) / 2 - 10}
        text={`${dist}px`}
        fontSize={12}
        fill="#10b981"
        listening={false}
      />
    </>
  );
}

// Crop overlay component
function CropOverlay({ cropStart, cropEnd, canvasWidth, canvasHeight }: { 
  cropStart: { x: number; y: number } | null; 
  cropEnd: { x: number; y: number } | null;
  canvasWidth: number;
  canvasHeight: number;
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
      {/* Dark overlay outside crop area */}
      <Rect x={0} y={0} width={canvasWidth} height={y1} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={0} y={y2} width={canvasWidth} height={canvasHeight - y2} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={0} y={y1} width={x1} height={h} fill="rgba(0,0,0,0.5)" listening={false} />
      <Rect x={x2} y={y1} width={canvasWidth - x2} height={h} fill="rgba(0,0,0,0.5)" listening={false} />
      {/* Crop border */}
      <Rect
        x={x1}
        y={y1}
        width={w}
        height={h}
        stroke="#ffffff"
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />
      {/* Dimension text */}
      <Text
        x={x1}
        y={y1 - 16}
        text={`${Math.round(w)} × ${Math.round(h)}`}
        fontSize={12}
        fill="#ffffff"
        listening={false}
      />
    </>
  );
}

// Snap guides overlay
function SnapGuidesOverlay({ guides }: { guides: SnapGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <>
      {guides.map((guide, i) => {
        if (guide.type === 'horizontal') {
          return (
            <Line
              key={`snap-h-${i}`}
              points={[-10000, guide.position, 10000, guide.position]}
              stroke="#ff4081"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          );
        } else {
          return (
            <Line
              key={`snap-v-${i}`}
              points={[guide.position, -10000, guide.position, 10000]}
              stroke="#ff4081"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          );
        }
      })}
    </>
  );
}

// Pen tool preview
function PenPreview({ anchors, isClosed }: { anchors: { x: number; y: number }[]; isClosed: boolean }) {
  if (anchors.length < 1) return null;
  
  const points: number[] = [];
  for (const a of anchors) {
    points.push(a.x, a.y);
  }
  
  return (
    <>
      <Line
        points={points}
        stroke="#10b981"
        strokeWidth={1}
        dash={[4, 4]}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      {/* Anchor points */}
      {anchors.map((a, i) => (
        <Rect
          key={`anchor-${i}`}
          x={a.x - 3}
          y={a.y - 3}
          width={6}
          height={6}
          fill={i === 0 ? '#10b981' : '#ffffff'}
          stroke="#10b981"
          strokeWidth={1}
          listening={false}
        />
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
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);
  // Crop state
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  // Pen state
  const [penAnchors, setPenAnchors] = useState<{ x: number; y: number }[]>([]);
  // Clone stamp state
  const [cloneOffset, setCloneOffset] = useState<{ x: number; y: number } | null>(null);
  // Slice state
  const [sliceStart, setSliceStart] = useState<{ x: number; y: number } | null>(null);
  const [sliceEnd, setSliceEnd] = useState<{ x: number; y: number } | null>(null);

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
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const setIsDrawing = useEditorStore((s) => s.setIsDrawing);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setMousePos = useEditorStore((s) => s.setMousePos);
  const showGrid = useEditorStore((s) => s.showGrid);
  const activeShapeType = useEditorStore((s) => s.activeShapeType);
  const cloneSource = useEditorStore((s) => s.cloneSource);
  const setCloneSource = useEditorStore((s) => s.setCloneSource);
  const fillTolerance = useEditorStore((s) => s.fillTolerance);
  const applyCrop = useEditorStore((s) => s.applyCrop);
  const showSnapGuides = useEditorStore((s) => s.showSnapGuides);
  const setSnapGuides = useEditorStore((s) => s.setSnapGuides);

  // Container resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
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
      updateCanvas({
        zoom,
        offsetX: (containerSize.width - canvas.width * zoom) / 2,
        offsetY: (containerSize.height - canvas.height * zoom) / 2,
      });
    }
  }, [containerSize.width, containerSize.height, canvas.width, canvas.height]);

  // Compute snap guides
  const computeSnapGuides = useCallback((dragPos: { x: number; y: number }, objWidth: number, objHeight: number): SnapGuide[] => {
    if (!showSnapGuides) return [];
    const guides: SnapGuide[] = [];
    const threshold = 5;
    const cx = dragPos.x + objWidth / 2;
    const cy = dragPos.y + objHeight / 2;
    const canvasCx = canvas.width / 2;
    const canvasCy = canvas.height / 2;

    // Canvas center guides
    if (Math.abs(cx - canvasCx) < threshold) {
      guides.push({ type: 'vertical', position: canvasCx });
    }
    if (Math.abs(cy - canvasCy) < threshold) {
      guides.push({ type: 'horizontal', position: canvasCy });
    }

    // Edge alignment
    if (Math.abs(dragPos.x) < threshold) {
      guides.push({ type: 'vertical', position: 0 });
    }
    if (Math.abs(dragPos.y) < threshold) {
      guides.push({ type: 'horizontal', position: 0 });
    }
    if (Math.abs(dragPos.x + objWidth - canvas.width) < threshold) {
      guides.push({ type: 'vertical', position: canvas.width });
    }
    if (Math.abs(dragPos.y + objHeight - canvas.height) < threshold) {
      guides.push({ type: 'horizontal', position: canvas.height });
    }

    return guides;
  }, [showSnapGuides, canvas.width, canvas.height]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              useEditorStore.getState().redo();
            } else {
              useEditorStore.getState().undo();
            }
            break;
          case 'y':
            e.preventDefault();
            useEditorStore.getState().redo();
            break;
          case 'a':
            e.preventDefault();
            const allIds = useEditorStore.getState().layers.flatMap((l) => l.objects.map((o) => o.id));
            setSelectedObjectIds(allIds);
            break;
          case 'd':
            e.preventDefault();
            setSelectedObjectIds([]);
            break;
        }
        return;
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace': {
          const state = useEditorStore.getState();
          const ids = state.selectedObjectIds;
          if (ids.length > 0) {
            state.pushHistory('Delete');
            for (const layer of state.layers) {
              for (const id of ids) {
                state.removeObject(layer.id, id);
              }
            }
          }
          break;
        }
        case 'v': setActiveTool('select'); break;
        case 'm': setActiveTool('move'); break;
        case 'h': setActiveTool('hand'); break;
        case 'z': setActiveTool('zoom'); break;
        case 'b': setActiveTool('brush'); break;
        case 'e': setActiveTool('eraser'); break;
        case 'g': setActiveTool('fill'); break;
        case 'i': setActiveTool('eyedropper'); break;
        case 't': setActiveTool('text'); break;
        case 'u': setActiveTool('shape'); break;
        case 'l': setActiveTool('line'); break;
        case 'c': setActiveTool('crop'); break;
        case 'p': setActiveTool('pen'); break;
        case 'x': useEditorStore.getState().swapColors(); break;
        case ' ':
          e.preventDefault();
          setIsPanning(true);
          break;
        case 'Escape':
          // Cancel current operation
          setCropStart(null);
          setCropEnd(null);
          setPenAnchors([]);
          setSliceStart(null);
          setSliceEnd(null);
          break;
        case 'Enter':
          // Apply crop if in crop mode
          if (activeTool === 'crop' && cropStart && cropEnd) {
            const x = Math.min(cropStart.x, cropEnd.x);
            const y = Math.min(cropStart.y, cropEnd.y);
            const w = Math.abs(cropEnd.x - cropStart.x);
            const h = Math.abs(cropEnd.y - cropStart.y);
            if (w > 1 && h > 1) {
              applyCrop(x, y, w, h);
              setCropStart(null);
              setCropEnd(null);
            }
          }
          // Finish pen path
          if (activeTool === 'pen' && penAnchors.length >= 2) {
            finishPenPath();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveTool, setSelectedObjectIds, activeTool, cropStart, cropEnd, penAnchors]);

  const getPointerPos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return {
      x: (pos.x - canvas.offsetX) / canvas.zoom,
      y: (pos.y - canvas.offsetY) / canvas.zoom,
    };
  }, [canvas.offsetX, canvas.offsetY, canvas.zoom]);

  // Finish pen path - create a path object
  const finishPenPath = useCallback(() => {
    if (penAnchors.length < 2 || !activeLayerId) return;
    
    // Build SVG path data from anchors
    const first = penAnchors[0];
    let pathData = `M ${first.x} ${first.y}`;
    for (let i = 1; i < penAnchors.length; i++) {
      pathData += ` L ${penAnchors[i].x} ${penAnchors[i].y}`;
    }
    // Close the path if near first point
    const last = penAnchors[penAnchors.length - 1];
    const dist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);
    if (dist < 20 || penAnchors.length > 3) {
      pathData += ' Z';
    }

    const id = uuidv4();
    const pathObj: EditorObject = {
      id,
      type: 'path',
      x: 0,
      y: 0,
      pathData,
      fill: foregroundColor,
      stroke: foregroundColor,
      strokeWidth: 2,
      opacity: 100,
      pathAnchors: penAnchors.map(a => ({ x: a.x, y: a.y })),
    };
    addObjectToLayer(activeLayerId, pathObj);
    pushHistory('Draw Path');
    setPenAnchors([]);
  }, [penAnchors, activeLayerId, foregroundColor, addObjectToLayer, pushHistory]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPos();
    const target = e.target;

    // Handle hand tool panning
    if (activeTool === 'hand' || isPanning) {
      return;
    }

    // Handle zoom tool
    if (activeTool === 'zoom') {
      if (e.evt.shiftKey) {
        useEditorStore.getState().zoomOut();
      } else {
        useEditorStore.getState().zoomIn();
      }
      return;
    }

    // Handle select tool
    if (activeTool === 'select' || activeTool === 'move') {
      if (target === e.target.getStage()) {
        setSelectedObjectIds([]);
        return;
      }
      const id = target.id();
      if (id) {
        if (e.evt.shiftKey) {
          setSelectedObjectIds(
            selectedObjectIds.includes(id)
              ? selectedObjectIds.filter((i) => i !== id)
              : [...selectedObjectIds, id]
          );
        } else {
          setSelectedObjectIds([id]);
        }
      }
      return;
    }

    // Handle marquee tool
    if (activeTool === 'marquee') {
      setMarqueeStart(pos);
      setMarqueeEnd(pos);
      return;
    }

    // Handle measure tool
    if (activeTool === 'measure') {
      setMeasureStart(pos);
      setMeasureEnd(pos);
      return;
    }

    // Handle crop tool
    if (activeTool === 'crop') {
      setCropStart(pos);
      setCropEnd(pos);
      return;
    }

    // Handle slice tool
    if (activeTool === 'slice') {
      setSliceStart(pos);
      setSliceEnd(pos);
      return;
    }

    // Handle pen tool
    if (activeTool === 'pen') {
      // Check if clicking near the first point to close the path
      if (penAnchors.length >= 3) {
        const first = penAnchors[0];
        const dist = Math.sqrt((pos.x - first.x) ** 2 + (pos.y - first.y) ** 2);
        if (dist < 15) {
          finishPenPath();
          return;
        }
      }
      setPenAnchors(prev => [...prev, { x: pos.x, y: pos.y }]);
      return;
    }

    // Handle brush/eraser tool
    if (activeTool === 'brush' || activeTool === 'eraser') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      const id = uuidv4();
      drawingIdRef.current = id;
      const brushObj: EditorObject = {
        id,
        type: 'brush-stroke',
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        brushSize: activeTool === 'eraser' ? eraserSize : brushSize,
        brushColor: activeTool === 'eraser' ? 'eraser' : foregroundColor,
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, brushObj);
      return;
    }

    // Handle dodge/burn/sponge/blur-brush/sharpen-brush
    if (activeTool === 'dodge' || activeTool === 'burn' || activeTool === 'sponge' || activeTool === 'blur-brush' || activeTool === 'sharpen-brush') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      const id = uuidv4();
      drawingIdRef.current = id;
      let brushColor = foregroundColor;
      if (activeTool === 'dodge') brushColor = 'rgba(255,255,255,0.3)';
      else if (activeTool === 'burn') brushColor = 'rgba(0,0,0,0.3)';
      else if (activeTool === 'sponge') brushColor = foregroundColor;
      else if (activeTool === 'blur-brush') brushColor = foregroundColor;
      else if (activeTool === 'sharpen-brush') brushColor = foregroundColor;

      const brushObj: EditorObject = {
        id,
        type: 'brush-stroke',
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        brushSize: brushSize,
        brushColor,
        opacity: activeTool === 'dodge' || activeTool === 'burn' ? 30 : 100,
      };
      addObjectToLayer(activeLayerId, brushObj);
      return;
    }

    // Handle clone stamp
    if (activeTool === 'clone-stamp') {
      if (e.evt.altKey) {
        // Alt+click sets the clone source
        setCloneSource({ x: pos.x, y: pos.y });
        setCloneOffset(null);
        return;
      }
      // Regular click starts painting from clone source offset
      if (!activeLayerId) return;
      if (cloneSource) {
        const offset = { x: pos.x - cloneSource.x, y: pos.y - cloneSource.y };
        setCloneOffset(offset);
        setIsDrawing(true);
        const id = uuidv4();
        drawingIdRef.current = id;
        // Create brush stroke - the clone stamp paints using the foreground color at lower opacity
        // In a full implementation we'd sample from the canvas, simplified version just paints
        const brushObj: EditorObject = {
          id,
          type: 'brush-stroke',
          x: 0,
          y: 0,
          points: [pos.x, pos.y],
          brushSize: brushSize,
          brushColor: foregroundColor,
          opacity: 70,
        };
        addObjectToLayer(activeLayerId, brushObj);
      }
      return;
    }

    // Handle fill tool (flood fill)
    if (activeTool === 'fill') {
      if (!activeLayerId) return;
      const stage = stageRef.current;
      if (!stage) return;
      
      try {
        // Get the canvas pixel data
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
            const fillRgba = hexToRgba(foregroundColor);
            const filled = floodFill(imageData, startX, startY, fillRgba, fillTolerance);
            ctx.putImageData(filled, 0, 0);
            
            // Add the filled result as an image object on the active layer
            const imgDataUrl = tempCanvas.toDataURL('image/png');
            const id = uuidv4();
            const fillObj: EditorObject = {
              id,
              type: 'image',
              x: 0,
              y: 0,
              width: canvas.width,
              height: canvas.height,
              imageSrc: imgDataUrl,
              opacity: 100,
            };
            addObjectToLayer(activeLayerId, fillObj);
            pushHistory('Flood Fill');
          }
        }
      } catch {
        // Cross-origin image may prevent reading pixels
      }
      setActiveTool('select');
      return;
    }

    // Handle gradient tool
    if (activeTool === 'gradient') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;
      const gradientObj: EditorObject = {
        id,
        type: 'gradient',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        gradientStartColor: foregroundColor,
        gradientEndColor: backgroundColor,
        gradientDirection: 'horizontal',
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, gradientObj);
      return;
    }

    // Handle shape tool
    if (activeTool === 'shape') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;

      let objType: EditorObject['type'] = 'rect';
      if (activeShapeType === 'ellipse' || activeShapeType === 'circle') {
        objType = 'ellipse';
      }

      const shapeObj: EditorObject = {
        id,
        type: objType,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: foregroundColor,
        stroke: '#000000',
        strokeWidth: 1,
        opacity: 100,
        shapeType: activeShapeType,
      };
      addObjectToLayer(activeLayerId, shapeObj);
      return;
    }

    // Handle line tool
    if (activeTool === 'line') {
      if (!activeLayerId) return;
      setIsDrawing(true);
      shapeStartRef.current = pos;
      const id = uuidv4();
      drawingIdRef.current = id;
      const lineObj: EditorObject = {
        id,
        type: 'line',
        x: 0,
        y: 0,
        linePoints: [pos.x, pos.y, pos.x, pos.y],
        stroke: foregroundColor,
        strokeWidth: 2,
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, lineObj);
      return;
    }

    // Handle text tool
    if (activeTool === 'text') {
      if (!activeLayerId) return;
      const id = uuidv4();
      const textObj: EditorObject = {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Text',
        fontSize,
        fontFamily,
        fill: foregroundColor,
        opacity: 100,
      };
      addObjectToLayer(activeLayerId, textObj);
      setSelectedObjectIds([id]);
      pushHistory('Add Text');
      setActiveTool('select');
      return;
    }

    // Handle eyedropper
    if (activeTool === 'eyedropper') {
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
          const imageData = ctx.getImageData(
            Math.round(pos.x * pixelRatio),
            Math.round(pos.y * pixelRatio),
            1,
            1
          );
          const [r, g, b] = imageData.data;
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          useEditorStore.getState().setForegroundColor(hex);
        }
      } catch {
        // Cross-origin image may prevent reading pixels
      }
      setActiveTool('select');
      return;
    }
  }, [activeTool, activeLayerId, activeShapeType, isPanning, canvas, selectedObjectIds, foregroundColor, backgroundColor, brushSize, eraserSize, fontSize, fontFamily, getPointerPos, addObjectToLayer, updateObject, setSelectedObjectIds, pushHistory, setIsDrawing, setActiveTool, cloneSource, setCloneSource, penAnchors, finishPenPath, fillTolerance, applyCrop, cropStart, cropEnd]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (pointerPos) {
      setMousePos({
        x: Math.round((pointerPos.x - canvas.offsetX) / canvas.zoom),
        y: Math.round((pointerPos.y - canvas.offsetY) / canvas.zoom),
      });
    }

    // Handle panning
    if (activeTool === 'hand' || isPanning) {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      updateCanvas({
        offsetX: canvas.offsetX + dx,
        offsetY: canvas.offsetY + dy,
      });
      return;
    }

    // Handle marquee tool
    if (activeTool === 'marquee' && marqueeStart) {
      const pos = getPointerPos();
      setMarqueeEnd(pos);
      return;
    }

    // Handle measure tool
    if (activeTool === 'measure' && measureStart) {
      const pos = getPointerPos();
      setMeasureEnd(pos);
      return;
    }

    // Handle crop tool
    if (activeTool === 'crop' && cropStart) {
      const pos = getPointerPos();
      setCropEnd(pos);
      return;
    }

    // Handle slice tool
    if (activeTool === 'slice' && sliceStart) {
      const pos = getPointerPos();
      setSliceEnd(pos);
      return;
    }

    if (!activeLayerId) return;

    const pos = getPointerPos();

    // Drawing with brush/eraser/dodge/burn/sponge/blur/sharpen/clone-stamp
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
        updateObject(activeLayerId, id, {
          x: width < 0 ? pos.x : start.x,
          y: height < 0 ? pos.y : start.y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
      } else if (obj.type === 'gradient') {
        const start = shapeStartRef.current;
        if (!start) return;
        const width = pos.x - start.x;
        const height = pos.y - start.y;
        updateObject(activeLayerId, id, {
          x: width < 0 ? pos.x : start.x,
          y: height < 0 ? pos.y : start.y,
          width: Math.abs(width),
          height: Math.abs(height),
          gradientDirection: Math.abs(width) > Math.abs(height) ? 'horizontal' : 'vertical',
        });
      } else if (obj.type === 'line') {
        const start = shapeStartRef.current;
        if (!start) return;
        updateObject(activeLayerId, id, {
          linePoints: [start.x, start.y, pos.x, pos.y],
        });
      }
    }
  }, [activeTool, activeLayerId, isPanning, canvas, getPointerPos, updateCanvas, updateObject, setMousePos, marqueeStart, measureStart, cropStart, sliceStart]);

  const handleMouseUp = useCallback(() => {
    if (useEditorStore.getState().isDrawing) {
      setIsDrawing(false);
      if (drawingIdRef.current) {
        const desc = activeTool === 'brush' ? 'Brush Stroke' :
                     activeTool === 'eraser' ? 'Eraser Stroke' :
                     activeTool === 'shape' ? 'Draw Shape' :
                     activeTool === 'line' ? 'Draw Line' :
                     activeTool === 'gradient' ? 'Draw Gradient' :
                     activeTool === 'dodge' ? 'Dodge Stroke' :
                     activeTool === 'burn' ? 'Burn Stroke' :
                     activeTool === 'sponge' ? 'Sponge Stroke' :
                     activeTool === 'blur-brush' ? 'Blur Brush Stroke' :
                     activeTool === 'sharpen-brush' ? 'Sharpen Brush Stroke' :
                     activeTool === 'clone-stamp' ? 'Clone Stamp Stroke' :
                     'Draw';
        pushHistory(desc);
      }
      drawingIdRef.current = null;
      shapeStartRef.current = null;
    }
    // Clear marquee
    if (activeTool === 'marquee') {
      setMarqueeStart(null);
      setMarqueeEnd(null);
    }
    // Keep measure visible until next click
    
    // Handle slice tool completion
    if (activeTool === 'slice' && sliceStart && sliceEnd) {
      // Create guide lines from the slice
      const x1 = Math.min(sliceStart.x, sliceEnd.x);
      const y1 = Math.min(sliceStart.y, sliceEnd.y);
      const x2 = Math.max(sliceStart.x, sliceEnd.x);
      const y2 = Math.max(sliceStart.y, sliceEnd.y);
      const guides: SnapGuide[] = [
        { type: 'vertical', position: x1 },
        { type: 'vertical', position: x2 },
        { type: 'horizontal', position: y1 },
        { type: 'horizontal', position: y2 },
      ];
      setSnapGuides(guides);
      setSliceStart(null);
      setSliceEnd(null);
    }
  }, [activeTool, setIsDrawing, pushHistory, sliceStart, sliceEnd, setSnapGuides]);

  // Handle wheel for zoom/pan
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom
      const scaleBy = 1.05;
      const oldZoom = canvas.zoom;
      const newZoom = e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy;
      const clampedZoom = Math.max(0.05, Math.min(32, newZoom));

      const mousePointTo = {
        x: (pointer.x - canvas.offsetX) / oldZoom,
        y: (pointer.y - canvas.offsetY) / oldZoom,
      };

      updateCanvas({
        zoom: clampedZoom,
        offsetX: pointer.x - mousePointTo.x * clampedZoom,
        offsetY: pointer.y - mousePointTo.y * clampedZoom,
      });
    } else {
      // Pan
      updateCanvas({
        offsetX: canvas.offsetX - e.evt.deltaX,
        offsetY: canvas.offsetY - e.evt.deltaY,
      });
    }
  }, [canvas, updateCanvas]);

  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    switch (activeTool) {
      case 'hand': return 'grab';
      case 'zoom': return 'zoom-in';
      case 'brush':
      case 'eraser':
      case 'dodge':
      case 'burn':
      case 'sponge':
      case 'blur-brush':
      case 'sharpen-brush':
      case 'clone-stamp': return 'crosshair';
      case 'text': return 'text';
      case 'eyedropper': return 'crosshair';
      case 'fill': return 'crosshair';
      case 'crop': return 'crosshair';
      case 'pen': return 'crosshair';
      case 'gradient': return 'crosshair';
      case 'measure': return 'crosshair';
      case 'marquee': return 'crosshair';
      case 'slice': return 'crosshair';
      default: return 'default';
    }
  };

  // Grid lines
  const gridSize = 50;
  const gridLines: React.ReactNode[] = [];
  if (showGrid) {
    for (let x = 0; x <= canvas.width; x += gridSize) {
      gridLines.push(
        <Line
          key={`gv-${x}`}
          points={[x, 0, x, canvas.height]}
          stroke="#888888"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      gridLines.push(
        <Line
          key={`gh-${y}`}
          points={[0, y, canvas.width, y]}
          stroke="#888888"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="canvas-container flex-1 bg-zinc-950 overflow-hidden relative"
      style={{ cursor: getCursorStyle() }}
    >
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
        {/* Checkerboard background pattern */}
        <Layer listening={false}>
          <Rect
            x={4}
            y={4}
            width={canvas.width}
            height={canvas.height}
            fill="rgba(0,0,0,0.3)"
            shadowBlur={20}
            shadowColor="rgba(0,0,0,0.5)"
            shadowOffsetX={4}
            shadowOffsetY={4}
          />
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fill="#ffffff"
          />
          {/* Checkerboard pattern */}
          <Shape
            sceneFunc={(context, shape) => {
              const size = 10;
              for (let y = 0; y < canvas.height; y += size) {
                for (let x = 0; x < canvas.width; x += size) {
                  const isLight = ((x / size + y / size) % 2) === 0;
                  if (!isLight) {
                    context.rect(x, y, size, size);
                  }
                }
              }
              context.fillStrokeShape(shape);
            }}
            fill="#e5e5e5"
          />
        </Layer>

        {/* Layer objects */}
        {layers.map((layer) => (
          <Layer
            key={layer.id}
            visible={layer.visible}
            opacity={layer.opacity / 100}
            listening={!layer.locked}
          >
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
        {showGrid && (
          <Layer listening={false}>
            {gridLines}
          </Layer>
        )}

        {/* Snap guides */}
        {showSnapGuides && (
          <Layer listening={false}>
            <SnapGuidesOverlay guides={useEditorStore.getState().snapGuides} />
          </Layer>
        )}

        {/* UI overlays */}
        <Layer listening={false}>
          {/* Marquee */}
          {activeTool === 'marquee' && <MarqueeOverlay startPos={marqueeStart} endPos={marqueeEnd} />}
          {/* Measure */}
          {activeTool === 'measure' && <MeasureOverlay startPos={measureStart} endPos={measureEnd} />}
          {/* Crop */}
          {activeTool === 'crop' && <CropOverlay cropStart={cropStart} cropEnd={cropEnd} canvasWidth={canvas.width} canvasHeight={canvas.height} />}
          {/* Slice */}
          {activeTool === 'slice' && sliceStart && sliceEnd && (
            <>
              <Line
                points={[sliceStart.x, sliceStart.y, sliceEnd.x, sliceStart.y, sliceEnd.x, sliceEnd.y, sliceStart.x, sliceEnd.y, sliceStart.x, sliceStart.y]}
                stroke="#ff6600"
                strokeWidth={1}
                dash={[6, 3]}
                listening={false}
              />
            </>
          )}
          {/* Pen preview */}
          {activeTool === 'pen' && <PenPreview anchors={penAnchors} isClosed={false} />}
          {/* Clone stamp source indicator */}
          {activeTool === 'clone-stamp' && cloneSource && (
            <>
              <Line
                points={[cloneSource.x - 10, cloneSource.y, cloneSource.x + 10, cloneSource.y]}
                stroke="#ff4081"
                strokeWidth={1}
                listening={false}
              />
              <Line
                points={[cloneSource.x, cloneSource.y - 10, cloneSource.x, cloneSource.y + 10]}
                stroke="#ff4081"
                strokeWidth={1}
                listening={false}
              />
            </>
          )}
        </Layer>

        {/* Transformer */}
        <Layer>
          <TransformerComponent selectedIds={selectedObjectIds} />
        </Layer>
      </Stage>

      {/* Crop apply button */}
      {activeTool === 'crop' && cropStart && cropEnd && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          <button
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
            onClick={() => {
              const x = Math.min(cropStart.x, cropEnd.x);
              const y = Math.min(cropStart.y, cropEnd.y);
              const w = Math.abs(cropEnd.x - cropStart.x);
              const h = Math.abs(cropEnd.y - cropStart.y);
              if (w > 1 && h > 1) {
                applyCrop(x, y, w, h);
                setCropStart(null);
                setCropEnd(null);
              }
            }}
          >
            Apply Crop
          </button>
          <button
            className="px-4 py-2 bg-zinc-700 text-zinc-200 text-sm rounded hover:bg-zinc-600 transition-colors"
            onClick={() => {
              setCropStart(null);
              setCropEnd(null);
            }}
          >
            Cancel
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
    </div>
  );
}
