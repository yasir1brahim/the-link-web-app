import React, { useState, useEffect, useRef } from 'react';

const HighlightInteraction = ({ 
  highlights = [], 
  onHighlightHover, 
  onHighlightClick,
  onHighlightLeave 
}) => {
  const [hoveredHighlight, setHoveredHighlight] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHighlightMouseEnter = (highlight, event) => {
    setHoveredHighlight(highlight);
    if (onHighlightHover) {
      onHighlightHover(highlight, { x: event.clientX, y: event.clientY });
    }
  };

  const handleHighlightMouseLeave = (highlight) => {
    setHoveredHighlight(null);
    if (onHighlightLeave) {
      onHighlightLeave(highlight);
    }
  };

  const handleHighlightClick = (highlight, event) => {
    event.stopPropagation();
    if (onHighlightClick) {
      onHighlightClick(highlight, { x: event.clientX, y: event.clientY });
    }
  };

  // Create highlight overlays
  useEffect(() => {
    if (!highlights.length) return;

    const container = document.querySelector('.document-highlighter-container');
    if (!container) return;

    const highlightElements = [];

    highlights.forEach((highlight, index) => {
      if (!highlight.text_location) return;

      const { page, x, y, width, height } = highlight.text_location;
      
      const highlightElement = document.createElement('div');
      highlightElement.className = 'interactive-highlight-overlay';
      highlightElement.dataset.highlightId = highlight.id;
      highlightElement.dataset.highlightIndex = index;
      
      // Position the highlight
      highlightElement.style.position = 'absolute';
      highlightElement.style.left = `${x}px`;
      highlightElement.style.top = `${y}px`;
      highlightElement.style.width = `${width || 100}px`;
      highlightElement.style.height = `${height || 20}px`;
      highlightElement.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
      highlightElement.style.border = '2px solid #ffc107';
      highlightElement.style.borderRadius = '4px';
      highlightElement.style.cursor = 'pointer';
      highlightElement.style.zIndex = '10';
      highlightElement.style.transition = 'all 0.2s ease';
      highlightElement.style.pointerEvents = 'auto';

      // Add event listeners
      highlightElement.addEventListener('mouseenter', (e) => {
        handleHighlightMouseEnter(highlight, e);
        highlightElement.style.backgroundColor = 'rgba(255, 235, 59, 0.5)';
        highlightElement.style.borderColor = '#ff9800';
        highlightElement.style.transform = 'scale(1.02)';
        highlightElement.style.zIndex = '20';
      });

      highlightElement.addEventListener('mouseleave', (e) => {
        handleHighlightMouseLeave(highlight);
        if (hoveredHighlight?.id !== highlight.id) {
          highlightElement.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
          highlightElement.style.borderColor = '#ffc107';
          highlightElement.style.transform = 'scale(1)';
          highlightElement.style.zIndex = '10';
        }
      });

      highlightElement.addEventListener('click', (e) => {
        handleHighlightClick(highlight, e);
      });

      container.appendChild(highlightElement);
      highlightElements.push(highlightElement);
    });

    return () => {
      highlightElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [highlights, hoveredHighlight]);

  return null; // This component doesn't render anything directly
};

export default HighlightInteraction;
