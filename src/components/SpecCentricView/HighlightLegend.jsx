import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HIGHLIGHT_TYPES, formatCustomTypes, isCustomHighlight } from './highlightConstants';
import './HighlightLegend.css';

const HighlightLegend = ({ submittalHighlights = [], aiLogHighlights = [], onFilterChange, customItemTypes = [] }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [statistics, setStatistics] = useState({});
  const isInitialMount = useRef(true);
  const previousCustomTypeIds = useRef(new Set());

  const sortedHighlightTypes = useMemo(
    () => [...HIGHLIGHT_TYPES].sort((a, b) => a.type.localeCompare(b.type)),
    []
  );

  const formattedCustomTypes = useMemo(
    () => formatCustomTypes(customItemTypes).sort((a, b) => a.type.localeCompare(b.type)),
    [customItemTypes]
  );

  const combinedHighlightTypes = useMemo(
    () => [...sortedHighlightTypes, ...formattedCustomTypes],
    [sortedHighlightTypes, formattedCustomTypes]
  );

  // Calculate statistics whenever highlights change
  useEffect(() => {
    const stats = {};
    
    const submittalCount = submittalHighlights.length;
    if (submittalCount > 0) {
      stats['submittal'] = submittalCount;
    }
    
    aiLogHighlights.forEach((highlight) => {
      if (!highlight) {
        return;
      }

      if (isCustomHighlight(highlight)) {
        const customId = highlight.custom_item_type?.id;
        if (!customId) {
          return;
        }
        const key = `custom_${customId}`;
        stats[key] = (stats[key] || 0) + 1;
        return;
      }

      const itemType = highlight.item_type;
      if (itemType) {
        stats[itemType] = (stats[itemType] || 0) + 1;
      }
    });

    formattedCustomTypes.forEach((type) => {
      if (!Object.prototype.hasOwnProperty.call(stats, type.key)) {
        stats[type.key] = 0;
      }
    });
    
    setStatistics(stats);

    const customKeys = formattedCustomTypes.map((type) => type.key);

    if (isInitialMount.current) {
      const allTypes = [
        ...sortedHighlightTypes.map((item) => item.key),
        ...customKeys,
      ];
      const newActiveFilters = new Set(allTypes);
      setActiveFilters(newActiveFilters);

      if (onFilterChange) {
        onFilterChange(newActiveFilters);
      }

      isInitialMount.current = false;
      // Track all initial custom type IDs
      const initialCustomIds = new Set(formattedCustomTypes.map(t => t.customTypeId));
      previousCustomTypeIds.current = initialCustomIds;
    } else {
      // Only auto-enable genuinely NEW custom types, not ones the user toggled off
      const currentCustomIds = new Set(formattedCustomTypes.map(t => t.customTypeId));
      const newCustomIds = [...currentCustomIds].filter(id => !previousCustomTypeIds.current.has(id));

      if (newCustomIds.length > 0) {
        const updatedFilters = new Set(activeFilters);
        newCustomIds.forEach(id => {
          const key = `custom_${id}`;
          updatedFilters.add(key);
        });
        setActiveFilters(updatedFilters);
        if (onFilterChange) {
          onFilterChange(updatedFilters);
        }
        // Update the ref to include the new IDs
        previousCustomTypeIds.current = currentCustomIds;
      }
    }
  }, [
    submittalHighlights,
    aiLogHighlights,
    onFilterChange,
    sortedHighlightTypes,
    formattedCustomTypes,
    activeFilters,
  ]);

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
            {combinedHighlightTypes.map((item) => {
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
                    {item.isCustom && <span className="legend-color-custom-badge">Custom</span>}
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

