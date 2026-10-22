import React from 'react';
import { Modal } from '@heroui/react';
import { useTheme } from '../../lib/theme';

/** A dialog on HeroUI's Modal for windows that are mounted while open: Esc and a click on the backdrop call
    onClose; focus stays inside and the page behind does not scroll. Wider than HeroUI's sizes through className. */
export const Dialog: React.FC<{
  onClose: () => void;
  /** accessible name when the dialog has no visible heading wired up */
  label: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'cover' | 'full';
  placement?: 'auto' | 'center' | 'top' | 'bottom';
  scroll?: 'inside' | 'outside';
  /** classes for the dialog panel (width, padding, background) */
  className?: string;
  backdrop?: 'opaque' | 'blur' | 'transparent';
  children: React.ReactNode;
}> = ({ onClose, label, size = 'lg', placement = 'center', scroll = 'inside', className, backdrop = 'opaque', children }) => {
  // the dialog is portalled out of the app, so it carries the light lab layer itself in the white theme
  const [theme] = useTheme();
  return (
  <Modal>
    <Modal.Backdrop isOpen variant={backdrop} className={theme === 'light' ? 'lab-light' : undefined} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container size={size} placement={placement} scroll={scroll}>
        <Modal.Dialog aria-label={label} className={className}>
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>
  );
};

export default Dialog;
