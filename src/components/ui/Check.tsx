import React from 'react';
import { Checkbox } from '@heroui/react';

/** A checkbox with its label on HeroUI's Checkbox */
export const Check: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
  isDisabled?: boolean;
  'aria-label'?: string;
  className?: string;
}> = ({ checked, onChange, children, isDisabled, className, ...rest }) => (
  <Checkbox isSelected={checked} onChange={onChange} isDisabled={isDisabled} aria-label={rest['aria-label']} className={className}>
    <Checkbox.Content>
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      {children}
    </Checkbox.Content>
  </Checkbox>
);

export default Check;
