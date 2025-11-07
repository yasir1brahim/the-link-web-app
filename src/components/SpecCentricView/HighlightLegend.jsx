import React, { useState, useEffect, useRef } from 'react';
import { HIGHLIGHT_TYPES } from './highlightConstants';
import './HighlightLegend.css';

const HighlightLegend = ({ submittalHighlights = [], aiLogHighlights = [], onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [statistics, setStatistics] = useState({});
  const isInitialMount = useRef(true);

  // Calculate statistics whenever highlights change
  useEffect(() => {
    const stats = {};
    
    // Count submittals (count unique highlights, not individual locations)
    const submittalCount = submittalHighlights.length;
    if (submittalCount > 0) {
      stats['submittal'] = submittalCount;
    }
    
    // Count AI log highlights by item_type
    const itemTypeCounts = {};
    aiLogHighlights.forEach(highlight => {
      const itemType = highlight.item_type;
      if (itemType) {
        itemTypeCounts[itemType] = (itemTypeCounts[itemType] || 0) + 1;
      }
    });
    
    // Merge counts into stats
    Object.assign(stats, itemTypeCounts);
    
    setStatistics(stats);

    // Initialize activeFilters with all known highlight types (start with all checked)
    // Only do this on initial mount to preserve user's filter selections when switching sections
    if (isInitialMount.current) {
      // Initialize with all known highlight types, not just ones with data
      const allTypes = HIGHLIGHT_TYPES.map(item => item.key);
      const newActiveFilters = new Set(allTypes);
      setActiveFilters(newActiveFilters);

      // Notify parent component of initial filters
      if (onFilterChange) {
        onFilterChange(newActiveFilters);
      }

      isInitialMount.current = false;
    }
  }, [submittalHighlights, aiLogHighlights, onFilterChange]);

  const handleFilterToggle = (key) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(key)) {
      newFilters.delete(key);
    } else {
      newFilters.add(key);
    }
    setActiveFilters(newFilters);
    
    // Notify parent component of filter changes
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  return (
    <div className={`highlight-legend ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="legend-toggle" 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
      >
        <span className="legend-title">Highlight Colors</span>
        <span className={`legend-arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="legend-content">
          <div className="legend-items">
            {HIGHLIGHT_TYPES.map((item) => {
              const count = statistics[item.key] || 0;
              const isActive = activeFilters.has(item.key);
              const isAvailable = count > 0;
              
              return (
                <div 
                  key={item.key} 
                  className={`legend-item ${isAvailable ? 'clickable' : 'disabled'} ${isActive ? 'active' : ''}`}
                  onClick={() => isAvailable && handleFilterToggle(item.key)}
                  title={isAvailable ? (isActive ? 'Click to hide this type' : 'Click to show this type') : 'No highlights of this type'}
                >
                  <div 
                    className="legend-color-box" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="legend-label">
                    {item.type}
                    {isAvailable && <span className="legend-count"> ({count})</span>}
                  </span>
                  {isActive && <span className="legend-check">✓</span>}
                </div>
              );
            })}
          </div>
          
          {activeFilters.size < Object.keys(statistics).length && Object.keys(statistics).length > 0 && (
            <div className="legend-actions">
              <button 
                className="legend-clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const allTypes = new Set(Object.keys(statistics));
                  setActiveFilters(allTypes);
                  if (onFilterChange) {
                    onFilterChange(allTypes);
                  }
                }}
              >
                Show All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HighlightLegend;

