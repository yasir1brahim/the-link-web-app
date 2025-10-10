import React, { useState, useEffect } from 'react';
import './HighlightLegend.css';

const HighlightLegend = ({ submittalHighlights = [], aiLogHighlights = [], onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [statistics, setStatistics] = useState({});

  const highlightTypes = [
    { type: 'Submittals', color: 'rgba(213, 231, 62, 0.6)', key: 'submittal' },
    { type: 'Inspections', color: 'rgba(255, 99, 71, 0.6)', key: 'inspections' },
    { type: 'Warranties', color: 'rgba(60, 179, 113, 0.6)', key: 'warranties' },
    { type: 'Certificates', color: 'rgba(255, 165, 0, 0.6)', key: 'certificates' },
    { type: 'Closeout Submittals', color: 'rgba(138, 43, 226, 0.6)', key: 'closeout_submittals' },
    { type: 'Test Reports', color: 'rgba(30, 144, 255, 0.6)', key: 'test_reports' },
    { type: 'Commissioning', color: 'rgba(255, 20, 147, 0.6)', key: 'commissioning' },
    { type: 'Delegated Design', color: 'rgba(75, 0, 130, 0.6)', key: 'delegated_design' },
    { type: 'Mock-ups/Sample Construction', color: 'rgba(218, 165, 32, 0.6)', key: 'mock_ups_sample_construction' },
    { type: 'Pre-installation Meetings', color: 'rgba(32, 178, 170, 0.6)', key: 'pre_installation_meetings' },
  ];

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
    
    console.log('[LEGEND_DEBUG] Calculated statistics:', stats);
    setStatistics(stats);
  }, [submittalHighlights, aiLogHighlights]);

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
            {highlightTypes.map((item) => {
              const count = statistics[item.key] || 0;
              const isActive = activeFilters.has(item.key);
              const isAvailable = count > 0;
              
              return (
                <div 
                  key={item.key} 
                  className={`legend-item ${isAvailable ? 'clickable' : 'disabled'} ${isActive ? 'active' : ''}`}
                  onClick={() => isAvailable && handleFilterToggle(item.key)}
                  title={isAvailable ? (isActive ? 'Click to hide' : 'Click to show only this type') : 'No highlights of this type'}
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
          
          {activeFilters.size > 0 && (
            <div className="legend-actions">
              <button 
                className="legend-clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilters(new Set());
                  if (onFilterChange) {
                    onFilterChange(new Set());
                  }
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HighlightLegend;

