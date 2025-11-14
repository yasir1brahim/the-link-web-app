import React, { useState, useEffect } from 'react';
import './ExportModal.css';

/**
 * Export Modal Component
 * Displays a modal for selecting and exporting spec section PDFs
 */
const ExportModal = ({ isOpen, onClose, sections = [], onExport }) => {
  const [selectedSections, setSelectedSections] = useState(new Set());

  // Initialize with all sections selected
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      const availableSectionIds = sections
        .filter((section) => section.pdf_url)
        .map((section) => section.id);
      setSelectedSections(new Set(availableSectionIds));
    }
  }, [isOpen, sections]);

  if (!isOpen) {
    return null;
  }

  const handleToggleSection = (sectionId) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  const handleToggleAll = () => {
    const availableSections = sections.filter((section) => section.pdf_url);
    if (selectedSections.size === availableSections.length) {
      // Deselect all
      setSelectedSections(new Set());
    } else {
      // Select all available
      const allIds = availableSections.map((section) => section.id);
      setSelectedSections(new Set(allIds));
    }
  };

  const handleExport = () => {
    const sectionsToExport = sections.filter((section) =>
      selectedSections.has(section.id)
    );
    onExport(sectionsToExport);
  };

  const availableSections = sections.filter((section) => section.pdf_url);
  const allSelected = availableSections.length > 0 && selectedSections.size === availableSections.length;
  const someSelected = selectedSections.size > 0 && selectedSections.size < availableSections.length;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div
        className="export-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="export-modal-header">
          <h2>Export Spec Sections</h2>
          <button
            className="export-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="export-modal-body">
          <div className="export-modal-info">
            Select the sections you want to export as PDF files.
            {selectedSections.size > 1 &&
              ' Multiple sections will be packaged as a ZIP file.'}
          </div>

          <div className="export-modal-section-list">
            {availableSections.length > 1 && (
              <div className="export-modal-section-item export-modal-select-all">
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = someSelected;
                      }
                    }}
                    onChange={handleToggleAll}
                  />
                  <span className="export-modal-section-label">
                    Select All ({availableSections.length})
                  </span>
                </label>
              </div>
            )}

            {sections.map((section) => {
              const hasPdf = !!section.pdf_url;
              const isSelected = selectedSections.has(section.id);
              const sectionNumber = section.masterformat_number || '';
              const sectionTitle =
                section.custom_section_title ||
                section.masterformat_title ||
                section.document_name ||
                'Untitled';

              return (
                <div
                  key={section.id}
                  className={`export-modal-section-item ${
                    !hasPdf ? 'export-modal-section-disabled' : ''
                  }`}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!hasPdf}
                      onChange={() => handleToggleSection(section.id)}
                    />
                    <span className="export-modal-section-label">
                      {sectionNumber && (
                        <span className="export-modal-section-number">
                          {sectionNumber}
                        </span>
                      )}
                      <span className="export-modal-section-title">
                        {sectionTitle}
                      </span>
                      {!hasPdf && (
                        <span className="export-modal-section-warning">
                          (No PDF available)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="export-modal-footer">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleExport}
            disabled={selectedSections.size === 0}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
