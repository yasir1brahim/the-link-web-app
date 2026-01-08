import React, { useState, useEffect, useRef, memo } from 'react';
import './SpecSectionNavigation.css';

const SpecSectionNavigation = memo(({
  sections,
  selectedSection,
  onSectionChange,
  loading = false,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('number'); // 'number' or 'title'
  const itemRefs = useRef({});

  // Scroll to selected section when it changes or when loading completes
  useEffect(() => {
    if (!loading && selectedSection && itemRefs.current[selectedSection.id]) {
      itemRefs.current[selectedSection.id].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedSection, loading]);

  if (!sections || sections.length === 0) {
    return (
      <div className="section-navigation">
        <div className="navigation-empty">
          <p>No spec sections available</p>
        </div>
      </div>
    );
  }

  // Filter and sort sections
  const filteredSections = sections
    .filter(section => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (section.masterformat_number && section.masterformat_number.toLowerCase().includes(searchLower)) ||
        (section.masterformat_title && section.masterformat_title.toLowerCase().includes(searchLower)) ||
        (section.custom_section_title && section.custom_section_title.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'number') {
        const numA = a.masterformat_number || '';
        const numB = b.masterformat_number || '';
        return numA.localeCompare(numB, undefined, { numeric: true });
      } else {
        const titleA = a.custom_section_title || a.masterformat_title || '';
        const titleB = b.custom_section_title || b.masterformat_title || '';
        return titleA.localeCompare(titleB);
      }
    });

  const handleSectionClick = (section) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className={`section-navigation ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="navigation-header">
          <div className="navigation-controls">
            <div className="search-control">
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {/* <div className="sort-control">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="number">Sort by Number</option>
                <option value="title">Sort by Title</option>
              </select>
            </div> */}
          </div>
        </div>
      )}

      <div className="navigation-list">
        {loading ? (
          <div className="navigation-loading">
            <div className="loading-spinner"></div>
            <p>Loading sections...</p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div
              key={section.id}
              ref={el => { itemRefs.current[section.id] = el; }}
              className={`navigation-item ${
                selectedSection && selectedSection.id === section.id ? 'selected' : ''
              }`}
              onClick={() => handleSectionClick(section)}
            >
              <div className="item-header">
                <span className="item-number">{section.masterformat_number}</span>
              </div>
              <div className="item-title">
                {section.custom_section_title || section.masterformat_title}
              </div>
              <div className="item-document">
                {section.document_name}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredSections.length === 0 && searchTerm && (
        <div className="navigation-no-results">
          <p>No sections found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
});

export default SpecSectionNavigation;
