import React, { useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import './ColorPickerPopover.css';

const ColorPickerPopover = ({ color, onChange, onClose, anchorRef }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, anchorRef]);

  if (!anchorRef.current) {
    return null;
  }

  const anchorRect = anchorRef.current.getBoundingClientRect();
  const shouldPositionAbove = anchorRect.bottom + 250 > window.innerHeight;

  const style = {
    position: 'fixed',
    left: `${anchorRect.left}px`,
    [shouldPositionAbove ? 'bottom' : 'top']: shouldPositionAbove
      ? `${window.innerHeight - anchorRect.top}px`
      : `${anchorRect.bottom + 8}px`,
    zIndex: 1000,
  };

  return (
    <div ref={popoverRef} className="color-picker-popover" style={style}>
      <HexColorPicker color={color} onChange={onChange} />
      <div className="color-picker-hex-display">
        <input
          type="text"
          value={color}
          readOnly
          className="color-picker-hex-input"
          aria-label="Selected color hex value"
        />
      </div>
    </div>
  );
};

export default ColorPickerPopover;
