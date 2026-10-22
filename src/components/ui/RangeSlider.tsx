import React from 'react';
import { Slider } from '@heroui/react';

/** A numeric slider on HeroUI's Slider: track, fill and thumb, optionally in a subject or lab colour.
    Inside a <label> it takes its name from the label text, like a native range input. */
export const RangeSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** fill and thumb colour (defaults to the theme accent) */
  color?: string;
  isDisabled?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, min = 0, max = 100, step = 1, color, isDisabled, className = '', style, ...rest }) => (
  <Slider
    value={value}
    onChange={(v) => onChange(v as number)}
    minValue={min}
    maxValue={max}
    step={step}
    isDisabled={isDisabled}
    aria-label={rest['aria-label']}
    className={`w-full ${className}`}
    style={{ ...(color ? ({ '--accent': color } as React.CSSProperties) : null), ...style }}
  >
    <Slider.Track>
      <Slider.Fill />
      <Slider.Thumb />
    </Slider.Track>
  </Slider>
);

export default RangeSlider;
