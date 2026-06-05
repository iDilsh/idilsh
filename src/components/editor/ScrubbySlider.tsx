'use client';

import { useCallback, useRef, useState } from 'react';

interface ScrubbySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  className?: string;
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
}: ScrubbySliderProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsScrubbing(true);
      startXRef.current = e.clientX;
      startValueRef.current = value;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        const sensitivity = moveEvent.shiftKey ? 0.1 : 1;
        const delta = deltaX * sensitivity * step;
        const newValue = Math.min(max, Math.max(min, startValueRef.current + delta));
        onChange(Math.round(newValue / step) * step);
      };

      const handleMouseUp = () => {
        setIsScrubbing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [value, min, max, step, onChange]
  );

  return (
    <span
      className={`inline-block select-none ${
        isScrubbing ? 'cursor-ew-resize text-emerald-400' : 'cursor-default hover:text-zinc-200'
      } ${className}`}
      onMouseDown={handleMouseDown}
      title={label || 'Click and drag to adjust'}
    >
      {value}{suffix}
    </span>
  );
}
