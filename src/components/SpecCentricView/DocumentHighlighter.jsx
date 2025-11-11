import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProjectLogsReader from '../PdfReader/projectLogsReader';
import { createManualHighlight } from '../../api/SpecCentricView/api';
import { HIGHLIGHT_TYPES } from './highlightConstants';
import './DocumentHighlighter.css';

const toTitleCase = (value = '') =>
  value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const QA_COLOR_MAP = {
  inspections: { r: 255, g: 99, b: 71 },
  warranties: { r: 60, g: 179, b: 113 },
  certificates: { r: 255, g: 165, b: 0 },
  closeout_submittals: { r: 138, g: 43, b: 226 },
  test_reports: { r: 30, g: 144, b: 255 },
  commissioning: { r: 255, g: 20, b: 147 },
  delegated_design: { r: 75, g: 0, b: 130 },
  mock_ups_sample_construction: { r: 218, g: 165, b: 32 },
  pre_installation_meetings: { r: 32, g: 178, b: 170 },
};

const EXTRACTION_COLOR_MAP = {
  qa_planner: { r: 100, g: 149, b: 237 },
  inspection_log: { r: 255, g: 127, b: 80 },
  owner_deliverables_log: { r: 147, g: 112, b: 219 },
  manual_highlight: { r: 59, g: 130, b: 246 },
};

const rgbaString = ({ r, g, b }, alpha = 0.16) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const getSwatchColor = (itemType, extractionType) => {
  const key = itemType || extractionType;
  return (
    QA_COLOR_MAP[key] ||
    EXTRACTION_COLOR_MAP[extractionType] ||
    { r: 59, g: 130, b: 246 }
  );
};

const buildFallbackOptions = () =>
  HIGHLIGHT_TYPES.map((item) => {
    const color = getSwatchColor(item.key, 'qa_planner');
    return {
      key: `qa_planner__${item.key}`,
      label: item.type,
      extractionType: 'qa_planner',
      itemType: item.key,
      swatch: color,
    };
  });

const truncateText = (value = '', maxLength = 200) => {
  if (!value) {
    return '';
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

const DocumentHighlighter = ({
  highlights = [],
  aiLogHighlights = [],
  documentUrl = null,
  documentId = null,
  activeFilters = new Set(),
  projectId = null,
  projectVersionId = null,
  specSection = null,
  onRefreshSectionContent = () => {},
}) => {
  const mapHighlightLocations = useCallback((submittalHighlights) => {
    const highlightLocations = [];
    for (const highlight of submittalHighlights) {
      if (!highlight?.text_location) {
        continue;
      }

      const { page_no, x, y, width, height } = highlight.text_location;
      highlightLocations.push({
        page_no,
        x,
        y,
        width,
        height,
      });

      for (const additionalHighlight of highlight.additional_text_locations || []) {
        highlightLocations.push({
          page_no: additionalHighlight.page_no,
          x: additionalHighlight.x,
          y: additionalHighlight.y,
          width: additionalHighlight.width,
          height: additionalHighlight.height,
        });
      }
    }
    return highlightLocations;
  }, []);

  const mapAiLogHighlightLocations = useCallback((aiHighlights) => {
    const highlightLocations = [];
    for (const logItem of aiHighlights) {
      if (!logItem?.pdf_locations || !Array.isArray(logItem.pdf_locations)) {
        continue;
      }

      for (const location of logItem.pdf_locations) {
        highlightLocations.push({
          page_no: location.page_no,
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          extraction_type: logItem.extraction_type,
          item_type: logItem.item_type,
          requirement_text: logItem.requirement_text,
        });
      }
    }
    return highlightLocations;
  }, []);

  const [currentHighlights, setCurrentHighlights] = useState(() => mapHighlightLocations(highlights));
  const [localAiHighlights, setLocalAiHighlights] = useState(aiLogHighlights);
  const [currentAiLogHighlights, setCurrentAiLogHighlights] = useState(() =>
    mapAiLogHighlightLocations(aiLogHighlights)
  );
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const [highlightError, setHighlightError] = useState(null);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  useEffect(() => {
    setCurrentHighlights(mapHighlightLocations(highlights));
  }, [highlights, mapHighlightLocations]);

  useEffect(() => {
    setLocalAiHighlights(aiLogHighlights);
  }, [aiLogHighlights]);

  useEffect(() => {
    setCurrentAiLogHighlights(mapAiLogHighlightLocations(localAiHighlights));
  }, [localAiHighlights, mapAiLogHighlightLocations]);

  const highlightTypeOptions = useMemo(() => {
    const optionsMap = new Map();

    localAiHighlights.forEach((item) => {
      const mapKey = `${item?.extraction_type || 'manual'}__${item?.item_type || 'general'}`;
      if (!optionsMap.has(mapKey)) {
        const label = item?.item_type
          ? toTitleCase(item.item_type)
          : toTitleCase(item?.extraction_type || 'Highlight');

        const swatchColor = getSwatchColor(item?.item_type, item?.extraction_type);

        optionsMap.set(mapKey, {
          key: mapKey,
          label,
          extractionType: item?.extraction_type || 'manual_highlight',
          itemType: item?.item_type || null,
          swatch: swatchColor,
        });
      }
    });

    buildFallbackOptions().forEach((option) => {
      if (!optionsMap.has(option.key)) {
        optionsMap.set(option.key, option);
      }
    });

    return Array.from(optionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [localAiHighlights]);

  const handleRequestAddHighlight = useCallback((selectionPayload) => {
    if (!selectionPayload?.locations || selectionPayload.locations.length === 0) {
      return;
    }

    setPendingHighlight(selectionPayload);
    setHighlightPickerOpen(true);
    setHighlightError(null);
  }, []);

  const handleCloseHighlightPicker = useCallback(() => {
    setHighlightPickerOpen(false);
    setPendingHighlight(null);
    setHighlightError(null);
  }, []);

  const handleHighlightCreationSuccess = useCallback(
    (newHighlight) => {
      setLocalAiHighlights((previous) => [...previous, newHighlight]);
      handleCloseHighlightPicker();
      onRefreshSectionContent();
    },
    [handleCloseHighlightPicker, onRefreshSectionContent]
  );

  const handleHighlightTypeSelect = useCallback(
    async (option) => {
      if (!projectId || !specSection || !pendingHighlight || isSavingHighlight) {
        return;
      }

      try {
        setIsSavingHighlight(true);
        setHighlightError(null);

        const payload = {
          project: projectId,
          ...(projectVersionId && { project_version: projectVersionId }),
          spec_section: specSection.id,
          spec_section_number: specSection.masterformat_number,
          spec_section_name:
            specSection.custom_section_title ||
            specSection.masterformat_title ||
            specSection.document_name ||
            '',
          extraction_type: option.extractionType,
          item_type: option.itemType,
          paragraph_number: null,
          requirement_text: pendingHighlight.selectedText,
          responsible_party: null,
          metadata: {},
          pdf_locations: pendingHighlight.locations,
        };

        const response = await createManualHighlight(projectId, payload);

        const createdHighlight = {
          ...(response?.data || {}),
          extraction_type: response?.data?.extraction_type ?? option.extractionType,
          item_type: response?.data?.item_type ?? option.itemType,
          requirement_text: response?.data?.requirement_text ?? pendingHighlight.selectedText,
          pdf_locations: response?.data?.pdf_locations ?? pendingHighlight.locations,
        };

        handleHighlightCreationSuccess(createdHighlight);
      } catch (error) {
        console.error('Failed to create highlight:', error);
        setHighlightError('Unable to create highlight. Please try again.');
      } finally {
        setIsSavingHighlight(false);
      }
    },
    [
      handleHighlightCreationSuccess,
      isSavingHighlight,
      pendingHighlight,
      projectId,
      projectVersionId,
      specSection,
    ]
  );

  if (!documentUrl) {
    return (
      <div className="document-highlighter-container spec-viewer-pdf-wrapper">
        <div className="document-placeholder">
          <div className="placeholder-content">
            <h3>Document Viewer</h3>
            <p>Select a spec section to view its document.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-highlighter-container spec-viewer-pdf-wrapper">
      <ProjectLogsReader
        key={documentUrl}
        url={documentUrl}
        highlightLocations={currentHighlights}
        aiLogHighlightLocations={currentAiLogHighlights}
        docId={documentId}
        setPdfData={() => {}}
        setSubmittalIdParam={() => {}}
        handleAddNewRow={() => {}}
        handleAppendToSelectedRow={() => {}}
        setLogInViewer={() => {}}
        loading={false}
        setLoading={() => {}}
        onError={() => {}}
        activeFilters={activeFilters}
        useFiltering={true}
        isSpecViewMode
        onRequestAddHighlight={handleRequestAddHighlight}
      />

      {highlightPickerOpen && pendingHighlight && (
        <div className="highlight-picker-overlay">
          <div className="highlight-picker-modal">
            <h3>Add New Highlight</h3>
            <p className="highlight-picker-context">{truncateText(pendingHighlight.selectedText)}</p>

            <div className="highlight-picker-options">
              {highlightTypeOptions.length === 0 ? (
                <p className="highlight-picker-empty">
                  No highlight types are available yet. Generate AI highlights to enable manual tagging.
                </p>
              ) : (
                highlightTypeOptions.map((option) => (
                  <button
                    key={option.key}
                    className="highlight-picker-option"
                    style={{
                      '--highlight-border': rgbaString(option.swatch, 0.35),
                      '--highlight-border-hover': rgbaString(option.swatch, 1),
                      '--highlight-background': rgbaString(option.swatch, 0.12),
                      '--highlight-background-hover': rgbaString(option.swatch, 0.2),
                      '--highlight-text': rgbaString(option.swatch, 0.95),
                      '--highlight-text-hover': rgbaString(option.swatch, 1),
                      '--highlight-swatch': rgbaString(option.swatch, 0.85),
                    }}
                    onClick={() => handleHighlightTypeSelect(option)}
                    disabled={isSavingHighlight}
                  >
                    <span className="highlight-picker-swatch" />
                    <span>{option.label}</span>
                  </button>
                ))
              )}
            </div>

            {highlightError && <div className="highlight-picker-error">{highlightError}</div>}

            <div className="highlight-picker-actions">
              <button
                className="highlight-picker-cancel"
                onClick={handleCloseHighlightPicker}
                disabled={isSavingHighlight}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentHighlighter;

