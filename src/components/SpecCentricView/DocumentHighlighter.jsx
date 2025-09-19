import React, { useEffect, useRef, useState } from 'react';
import HighlightInteraction from './HighlightInteraction';
import './DocumentHighlighter.css';

const DocumentHighlighter = ({ 
  highlights = [], 
  highlightsEnabled = true, 
  onHighlightClick,
  documentContent = null 
}) => {
  const containerRef = useRef(null);
  const [highlightedElements, setHighlightedElements] = useState([]);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hoveredHighlight, setHoveredHighlight] = useState(null);

  // Create highlight overlays
  useEffect(() => {
    if (!highlightsEnabled || !highlights.length || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const newHighlightedElements = [];

    highlights.forEach((highlight, index) => {
      if (!highlight.text_location) return;

      const { page, x, y, width, height } = highlight.text_location;
      
      // Create highlight overlay element
      const highlightElement = document.createElement('div');
      highlightElement.className = 'document-highlight-overlay';
      highlightElement.dataset.highlightId = highlight.id;
      highlightElement.dataset.highlightIndex = index;
      
      // Position the highlight overlay
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

      // Add hover effects
      highlightElement.addEventListener('mouseenter', () => {
        highlightElement.style.backgroundColor = 'rgba(255, 235, 59, 0.5)';
        highlightElement.style.borderColor = '#ff9800';
        highlightElement.style.transform = 'scale(1.02)';
      });

      highlightElement.addEventListener('mouseleave', () => {
        if (activeHighlight !== highlight.id) {
          highlightElement.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
          highlightElement.style.borderColor = '#ffc107';
          highlightElement.style.transform = 'scale(1)';
        }
      });

      // Add click handler
      highlightElement.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveHighlight(highlight.id);
        if (onHighlightClick) {
          onHighlightClick(highlight);
        }
      });

      container.appendChild(highlightElement);
      newHighlightedElements.push(highlightElement);
    });

    setHighlightedElements(newHighlightedElements);

    // Cleanup function
    return () => {
      newHighlightedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [highlights, highlightsEnabled, onHighlightClick, activeHighlight]);

  // Update active highlight styling
  useEffect(() => {
    highlightedElements.forEach((element, index) => {
      const highlightId = element.dataset.highlightId;
      if (highlightId === activeHighlight) {
        element.style.backgroundColor = 'rgba(33, 150, 243, 0.4)';
        element.style.borderColor = '#2196f3';
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
      } else {
        element.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
        element.style.borderColor = '#ffc107';
        element.style.transform = 'scale(1)';
        element.style.boxShadow = 'none';
      }
    });
  }, [activeHighlight, highlightedElements]);

  // Clear highlights when disabled
  useEffect(() => {
    if (!highlightsEnabled) {
      highlightedElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      setHighlightedElements([]);
      setActiveHighlight(null);
    }
  }, [highlightsEnabled, highlightedElements]);

  const handleContainerClick = (e) => {
    // Clear active highlight when clicking on container
    if (e.target === containerRef.current) {
      setActiveHighlight(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="document-highlighter-container"
      onClick={handleContainerClick}
    >
      {documentContent ? (
        <div className="document-content">
          {documentContent}
        </div>
      ) : (
        <div className="document-placeholder">
          <div className="placeholder-content">
            <h3>Spec Document Viewer</h3>
            <p>This will display the actual spec document with interactive highlights</p>
            <div className="placeholder-features">
              <div className="feature-item">
                <span className="feature-icon">📍</span>
                <span>Click highlights to view details</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Hover to preview submittal info</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📄</span>
                <span>Navigate between sections</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {highlightsEnabled && highlights.length > 0 && (
        <div className="highlights-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(255, 235, 59, 0.3)', border: '2px solid #ffc107' }}></div>
            <span>Submittal Items ({highlights.length})</span>
          </div>
        </div>
      )}

      {/* Interactive Highlight System */}
      <HighlightInteraction
        highlights={highlights}
        onHighlightHover={(highlight, position) => {
          setHoveredHighlight(highlight);
        }}
        onHighlightClick={(highlight, position) => {
          setActiveHighlight(highlight.id);
          if (onHighlightClick) {
            onHighlightClick(highlight);
          }
        }}
        onHighlightLeave={(highlight) => {
          setHoveredHighlight(null);
        }}
      />
    </div>
  );
};

export default DocumentHighlighter;
