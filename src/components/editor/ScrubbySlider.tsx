'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

interface ScrubbySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  className?: string;
  /** If true, render as a label that can be dragged (Photoshop style) */
  asLabel?: boolean;
}

export default function ScrubbySlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  suffix = '',
  className = '',
  asLabel = false,
}: ScrubbySliderProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsScrubbing(true);
      startXRef.current = e.clientX;
      startValueRef.current = value;

      // Create a full-screen overlay to capture mouse events outside the element
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.cursor = 'ew-resize';
      overlay.style.zIndex = '99999';
      document.body.appendChild(overlay);
      overlayRef.current = overlay;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        // Shift key = finer control (0.1x), no modifier = normal, Ctrl = coarse (5x)
        const sensitivity = moveEvent.shiftKey ? 0.1 : (moveEvent.ctrlKey || moveEvent.metaKey ? 5 : 1);
        // Scale delta based on range for better UX
        const range = max - min;
        const scaleFactor = range > 1000 ? 2 : range > 100 ? 1 : 0.5;
        const delta = deltaX * sensitivity * step * scaleFactor;
        const newValue = Math.min(max, Math.max(min, startValueRef.current + delta));
        onChange(Math.round(newValue / step) * step);
      };

      const handleMouseUp = () => {
        setIsScrubbing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (overlayRef.current && overlayRef.current.parentNode) {
          overlayRef.current.parentNode.removeChild(overlayRef.current);
        }
        overlayRef.current = null;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [value, min, max, step, onChange]
  );

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
      }
    };
  }, []);

  if (asLabel) {
    // Render as a label that can be scrubbed (Photoshop-style "Opacity:" drag)
    return (
      <span
        className={`select-none ${
          isScrubbing ? 'cursor-ew-resize text-emerald-400' : 'cursor-default hover:text-zinc-200'
        } ${className}`}
        onMouseDown={handleMouseDown}
        title={label || 'Drag left/right to adjust'}
      >
        {label && <span className="mr-1">{label}</span>}
        {value}{suffix}
      </span>
    );
  }

  // Default: render as a value display that can be scrubbed
  return (
    <span
      className={`inline-block select-none rounded px-0.5 ${
        isScrubbing 
          ? 'cursor-ew-resize text-emerald-400 bg-emerald-400/10' 
          : 'cursor-ew-resize hover:text-zinc-200 hover:bg-zinc-700/50'
      } ${className}`}
      onMouseDown={handleMouseDown}
      title={label || 'Click and drag to adjust'}
    >
      {value}{suffix}
    </span>
  );
}
