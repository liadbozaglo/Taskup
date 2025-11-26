import { useState, useRef, useEffect } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function DualRangeSlider({ min, max, step, value, onChange }: DualRangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef<HTMLInputElement>(null);
  const maxValRef = useRef<HTMLInputElement>(null);
  const range = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const getPercent = (val: number) => Math.round(((val - min) / (max - min)) * 100);

  useEffect(() => {
    if (maxValRef.current && range.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
        range.current.style.transition = 'all 0.1s ease';
      }
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    if (minValRef.current && range.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
        range.current.style.transition = 'all 0.1s ease';
      }
    }
  }, [maxVal, getPercent]);

  return (
    <div className="relative w-full" style={{ height: '40px', paddingTop: '16px' }}>
      {/* Background track (grey) */}
      <div className="absolute w-full h-2 rounded-lg bg-gray-200" style={{ top: '16px' }}></div>
      
      {/* Blue selected range */}
      <div
        ref={range}
        className="absolute h-2 rounded-lg bg-primary-light"
        style={{ 
          top: '16px',
          transition: 'all 0.1s ease'
        }}
      ></div>
      
      {/* Min input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const val = Math.min(+event.target.value, maxVal - step);
          setMinVal(val);
          onChange([val, maxVal]);
        }}
        className="absolute w-full"
        style={{ 
          top: '16px',
          zIndex: minVal > max - 100 ? 5 : 3,
          height: '4px',
          margin: 0,
          padding: 0
        }}
      />
      
      {/* Max input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const val = Math.max(+event.target.value, minVal + step);
          setMaxVal(val);
          onChange([minVal, val]);
        }}
        className="absolute w-full"
        style={{ 
          top: '16px',
          zIndex: maxVal < min + 100 ? 5 : 3,
          height: '4px',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}
