import React from 'react';
import { Label, ListBox, Select } from '@heroui/react';

export interface ChoiceOption {
  value: string;
  label: React.ReactNode;
  /** plain text for typeahead and the accessible name when the label is not a string */
  text?: string;
}

/** A drop-down choice on HeroUI's Select: a trigger showing the value and a list of options */
export const Choice: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: ChoiceOption[];
  label?: React.ReactNode;
  'aria-label'?: string;
  isDisabled?: boolean;
  className?: string;
}> = ({ value, onChange, options, label, isDisabled, className, ...rest }) => (
  <Select value={value} onChange={(k) => k !== null && onChange(String(k))} isDisabled={isDisabled} aria-label={rest['aria-label']} className={className}>
    {label && <Label>{label}</Label>}
    <Select.Trigger>
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        {options.map((o) => (
          <ListBox.Item key={o.value} id={o.value} textValue={o.text ?? (typeof o.label === 'string' ? o.label : o.value)}>
            {o.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
);

export default Choice;
