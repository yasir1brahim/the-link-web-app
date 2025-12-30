import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProjectLogsReader from '../PdfReader/projectLogsReader';
import {
  createManualHighlight,
  getUserHighlightPreference,
  setUserHighlightPreference,
} from '../../api/SpecCentricView/api';
import {
  HIGHLIGHT_TYPES,
  formatCustomTypes,
  isCustomHighlight,
  getHighlightColor,
} from './highlightConstants';
import {
  QA_COLOR_MAP,
  EXTRACTION_COLOR_MAP,
  DEFAULT_RGB_COLOR,
} from './highlightColorMaps';
import CustomItemTypesManager from './shared/CustomItemTypesManager';
import SubmittalFormSection from './SubmittalFormSection';
import './DocumentHighlighter.css';

const toTitleCase = (value = '') =>
  value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const hexToRgb = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const sanitized = value.trim().replace(/^#/, '').slice(0, 6);
  if (sanitized.length !== 6) {
    return null;
  }

  const numeric = Number.parseInt(sanitized, 16);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const rgbaString = ({ r, g, b }, alpha = 0.16) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const getSwatchColor = (itemType, extractionType) => {
  const key = itemType || extractionType;
  return (
    QA_COLOR_MAP[key] ||
    EXTRACTION_COLOR_MAP[extractionType] ||
    DEFAULT_RGB_COLOR
  );
};

const buildFallbackOptions = () =>
  HIGHLIGHT_TYPES
    .map((item) => {
      const color = getSwatchColor(item.key, 'qa_planner');
      return {
        key: `qa_planner__${item.key}`,
        label: item.type,
        extractionType: 'qa_planner',
        itemType: item.key,
        swatch: color,
        isCustom: false,
        customTypeId: null,
      };
    });

const truncateText = (value = '', maxLength = 200) => {
  if (!value) {
    return '';
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

const buildHighlightPayload = ({
  projectId,
  projectVersionId,
  specSection,
  option,
  selectedText,
  locations,
}) => {
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
    requirement_text: selectedText,
    responsible_party: null,
    metadata: {},
    pdf_locations: locations,
  };

  if (option.isCustom && option.customTypeId) {
    payload.custom_item_type_id = option.customTypeId;
    payload.extraction_type = 'custom_highlights';
    payload.item_type = `custom_${option.customTypeId}`;
  }

  return payload;
};

const buildCreatedHighlight = ({
  responseData,
  payload,
  option,
  selectedText,
  locations,
  customItemTypes,
}) => {
  const createdHighlight = {
    ...(responseData || {}),
    extraction_type: responseData?.extraction_type ?? payload.extraction_type,
    item_type: responseData?.item_type ?? payload.item_type,
    requirement_text: responseData?.requirement_text ?? selectedText,
    pdf_locations: responseData?.pdf_locations ?? locations,
  };

  if (option.isCustom && option.customTypeId) {
    const matchedType = customItemTypes.find((type) => type.id === option.customTypeId);
    createdHighlight.custom_item_type =
      responseData?.custom_item_type ||
      matchedType ||
      {
        id: option.customTypeId,
        name: option.label,
        color: matchedType?.color,
      };
  }

  return createdHighlight;
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
  customItemTypes = [],
  onCustomTypesUpdate,
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

      const isCustom = isCustomHighlight(logItem);

      // Extract custom type ID from either custom_item_type object or item_type pattern
      let customTypeId = logItem?.custom_item_type?.id;
      if (!customTypeId && logItem?.item_type?.startsWith('custom_')) {
        customTypeId = parseInt(logItem.item_type.replace('custom_', ''), 10);
      }

      const itemTypeKey = customTypeId ? `custom_${customTypeId}` : logItem.item_type;
      const matchedType = customTypeId ? customItemTypes.find((type) => type.id === customTypeId) : null;

      // Determine if this is a custom highlight (either by full check or by item_type pattern)
      const isCustomType = isCustom || (logItem?.extraction_type === 'custom_highlights' && !!customTypeId);

      const highlightColorHex = isCustomType
        ? logItem?.custom_item_type?.color || matchedType?.color || logItem?.color
        : logItem?.color;
      const swatchColor = highlightColorHex ? hexToRgb(highlightColorHex) : getSwatchColor(logItem.item_type, logItem.extraction_type);
      const color = swatchColor || { r: 128, g: 128, b: 128 };

      for (const location of logItem.pdf_locations) {
        highlightLocations.push({
          page_no: location.page_no,
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          extraction_type: logItem.extraction_type,
          item_type: itemTypeKey,
          requirement_text: logItem.requirement_text,
          custom_item_type: logItem.custom_item_type,
          color,
          extracted_data_id: logItem.id, // CRITICAL for linking to notes
        });
      }
    }
    return highlightLocations;
  }, [customItemTypes]);

  const [currentHighlights, setCurrentHighlights] = useState(() => mapHighlightLocations(highlights));
  const [localAiHighlights, setLocalAiHighlights] = useState(aiLogHighlights);
  const [currentAiLogHighlights, setCurrentAiLogHighlights] = useState(() =>
    mapAiLogHighlightLocations(aiLogHighlights)
  );
  const [highlightPickerOpen, setHighlightPickerOpen] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState(null);
  const [pendingNoteText, setPendingNoteText] = useState('');
  const [highlightError, setHighlightError] = useState(null);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const [showCustomTypesManager, setShowCustomTypesManager] = useState(false);
  const [lastUsedHighlightType, setLastUsedHighlightType] = useState(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(false);
  const [selectedHighlightType, setSelectedHighlightType] = useState(null);
  const [submittalParaNo, setSubmittalParaNo] = useState('');
  const [submittalDescription, setSubmittalDescription] = useState('');
  const [submittalType, setSubmittalType] = useState('');

  // Unified cache for ExtractedData items with notes support
  const [extractedDataItems, setExtractedDataItems] = useState([]);

  // Populate extractedDataItems from localAiHighlights
  useEffect(() => {
    console.log('[NOTE_DEBUG] localAiHighlights changed:', localAiHighlights?.length || 0);
    const mapped = (localAiHighlights || []).map(item => {
      console.log('[NOTE_DEBUG] Item:', item.id, 'has notes:', item.notes?.length || 0);
      return {
        ...item,
        notes: item.notes || [],
        pdf_locations: item.pdf_locations || [],
      };
    });
    setExtractedDataItems(mapped);
    console.log('[NOTE_DEBUG] extractedDataItems updated with', mapped.length, 'items');
  }, [localAiHighlights]);

  // Memoized lookup map for fast access by ID
  const extractedDataById = useMemo(() => {
    return new Map(extractedDataItems.map(data => [data.id, data]));
  }, [extractedDataItems]);

  // Helper callback to pass down
  const getExtractedDataById = useCallback((id) => {
    return extractedDataById.get(id);
  }, [extractedDataById]);

  // Extract current user ID for permissions (set to null if not available)
  const currentUserId = null; // TODO: Wire up user context when available

  const customHighlightOptions = useMemo(() =>
    (customItemTypes || []).map((type) => {
      const swatch = hexToRgb(type.color) || { r: 128, g: 128, b: 128 };
      return {
        key: `custom_${type.id}`,
        label: type.name,
        extractionType: 'custom_highlights',
        itemType: null,
        customTypeId: type.id,
        swatch,
        isCustom: true,
      };
    }),
  [customItemTypes]
  );

  useEffect(() => {
    setCurrentHighlights(mapHighlightLocations(highlights));
  }, [highlights, mapHighlightLocations]);

  useEffect(() => {
    setLocalAiHighlights(aiLogHighlights);
  }, [aiLogHighlights]);

  useEffect(() => {
    setCurrentAiLogHighlights(mapAiLogHighlightLocations(localAiHighlights));
  }, [localAiHighlights, mapAiLogHighlightLocations]);

  // Load user's last used highlight preference
  useEffect(() => {
    if (!projectId) {
      return;
    }

    const loadPreference = async () => {
      setIsLoadingPreference(true);
      try {
        const response = await getUserHighlightPreference(projectId);
        if (response?.data) {
          setLastUsedHighlightType(response.data);
        } else {
          setLastUsedHighlightType(null);
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error('Failed to load highlight preference:', error);
        }
        setLastUsedHighlightType(null);
      } finally {
        setIsLoadingPreference(false);
      }
    };

    loadPreference();
  }, [projectId]);

  const highlightTypeOptions = useMemo(() => {
    const optionsMap = new Map();

    localAiHighlights.forEach((item) => {
      // Skip custom highlights - they're handled by customHighlightOptions
      if (isCustomHighlight(item) || item?.item_type?.startsWith('custom_')) {
        return;
      }

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
          isCustom: false,
          customTypeId: null,
        });
      }
    });

    buildFallbackOptions().forEach((option) => {
      if (!optionsMap.has(option.key)) {
        optionsMap.set(option.key, option);
      }
    });

    const standardOptions = Array.from(optionsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    const customOptions = [...customHighlightOptions].sort((a, b) => a.label.localeCompare(b.label));

    return [...standardOptions, ...customOptions];
  }, [localAiHighlights, customHighlightOptions]);

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
    setPendingNoteText('');
    setHighlightError(null);
    setSelectedHighlightType(null);
    setSubmittalParaNo('');
    setSubmittalDescription('');
    setSubmittalType('');
  }, []);

  const handleOpenCustomTypesManager = useCallback(() => {
    setHighlightPickerOpen(false);
    setShowCustomTypesManager(true);
  }, []);

  const handleCloseCustomTypesManager = useCallback(() => {
    setShowCustomTypesManager(false);
    if (pendingHighlight) {
      setHighlightPickerOpen(true);
    }
    onCustomTypesUpdate?.();
  }, [pendingHighlight, onCustomTypesUpdate]);

  const handleHighlightCreationSuccess = useCallback(
    (newHighlight) => {
      setLocalAiHighlights((previous) => [...previous, newHighlight]);
      handleCloseHighlightPicker();
      onRefreshSectionContent();
    },
    [handleCloseHighlightPicker, onRefreshSectionContent]
  );

  // Save user's highlight preference
  const saveHighlightPreference = useCallback(
    async (option) => {
      if (!projectId || !option) {
        return;
      }

      try {
        const preferencePayload = {
          is_custom_type: option.isCustom || false,
          custom_item_type: option.isCustom ? option.customTypeId : null,
          standard_item_type: !option.isCustom ? option.itemType || '' : '',
          extraction_type: option.extractionType || '',
          type_display_name: option.label || '',
          type_color: option.swatch
            ? `#${((option.swatch.r << 16) | (option.swatch.g << 8) | option.swatch.b).toString(16).padStart(6, '0')}`
            : '#3B82F6',
        };

        const response = await setUserHighlightPreference(projectId, preferencePayload);
        if (response?.data) {
          setLastUsedHighlightType(response.data);
        }
      } catch (error) {
        console.error('Failed to save highlight preference:', error);
      }
    },
    [projectId]
  );

  const handleHighlightTypeSelect = useCallback(
    async (option) => {
      if (!projectId || !specSection || !pendingHighlight || isSavingHighlight) {
        return;
      }

      try {
        setIsSavingHighlight(true);
        setHighlightError(null);

        const payload = buildHighlightPayload({
          projectId,
          projectVersionId,
          specSection,
          option,
          selectedText: pendingHighlight.selectedText,
          locations: pendingHighlight.locations,
        });

        // Add note_text if provided
        if (pendingNoteText.trim()) {
          payload.note_text = pendingNoteText.trim();
        }

          const response = await createManualHighlight(projectId, payload);

        const createdHighlight = buildCreatedHighlight({
          responseData: response?.data,
          payload,
          option,
          selectedText: pendingHighlight.selectedText,
          locations: pendingHighlight.locations,
          customItemTypes,
        });

        // Ensure notes array is included
        createdHighlight.notes = response?.data?.notes || [];

          // Update extractedDataItems cache with new highlight
          setExtractedDataItems(prev => [...prev, {
            ...createdHighlight,
            notes: createdHighlight.notes || [],
            pdf_locations: createdHighlight.pdf_locations || [],
          }]);

        handleHighlightCreationSuccess(createdHighlight);
        await saveHighlightPreference(option);
      } catch (error) {
        console.error('Failed to create highlight:', error);
        setHighlightError('Unable to create highlight. Please try again.');
      } finally {
        setIsSavingHighlight(false);
      }
    },
    [
      handleHighlightCreationSuccess,
      handleCloseHighlightPicker,
      isSavingHighlight,
      pendingHighlight,
      pendingNoteText,
      projectId,
      projectVersionId,
      specSection,
      customItemTypes,
      saveHighlightPreference,
    ]
  );

  // Handle quick highlight using last used type
  const handleQuickHighlight = useCallback(
    async (selectionPayload) => {
      if (!lastUsedHighlightType || !projectId || !specSection || isSavingHighlight) {
        return;
      }

      const option = {
        isCustom: lastUsedHighlightType.is_custom_type,
        customTypeId: lastUsedHighlightType.custom_item_type,
        itemType: lastUsedHighlightType.standard_item_type,
        extractionType: lastUsedHighlightType.extraction_type,
        label: lastUsedHighlightType.type_display_name,
        swatch: hexToRgb(lastUsedHighlightType.type_color) || { r: 128, g: 128, b: 128 },
      };

      try {
        setIsSavingHighlight(true);
        setHighlightError(null);

        const payload = buildHighlightPayload({
          projectId,
          projectVersionId,
          specSection,
          option,
          selectedText: selectionPayload.selectedText,
          locations: selectionPayload.locations,
        });

        const response = await createManualHighlight(projectId, payload);

        const createdHighlight = buildCreatedHighlight({
          responseData: response?.data,
          payload,
          option,
          selectedText: selectionPayload.selectedText,
          locations: selectionPayload.locations,
          customItemTypes,
        });

        setLocalAiHighlights((previous) => [...previous, createdHighlight]);

        // Update extractedDataItems cache with new highlight (for notes feature consistency)
        setExtractedDataItems(prev => [...prev, {
          ...createdHighlight,
          notes: createdHighlight.notes || [],
          pdf_locations: createdHighlight.pdf_locations || [],
        }]);

        onRefreshSectionContent();
      } catch (error) {
        console.error('Failed to create quick highlight:', error);
        setHighlightError('Unable to create highlight. Please try again.');
        setTimeout(() => setHighlightError(null), 5000);
      } finally {
        setIsSavingHighlight(false);
      }
    },
    [
      lastUsedHighlightType,
      projectId,
      projectVersionId,
      specSection,
      customItemTypes,
      isSavingHighlight,
      onRefreshSectionContent,
    ]
  );

  const handleToggleSelection = useCallback((option) => {
    if (selectedHighlightType?.key === option.key) {
      // Deselect and reset submittal fields
      setSelectedHighlightType(null);
      setSubmittalParaNo('');
      setSubmittalDescription('');
      setSubmittalType('');
    } else {
      setSelectedHighlightType(option);
    }
  }, [selectedHighlightType]);

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
        onQuickHighlight={handleQuickHighlight}
        lastUsedHighlightType={lastUsedHighlightType}
        extractedDataItems={extractedDataItems}
        getExtractedDataById={getExtractedDataById}
        currentUserId={currentUserId}
        projectId={projectId}
      />

      {highlightPickerOpen && pendingHighlight && (
        <div className="highlight-picker-overlay">
          <div className="highlight-picker-modal">
            <h3>Add New Highlight</h3>
            <p className="highlight-picker-context">{truncateText(pendingHighlight.selectedText)}</p>

            {/* Note input section */}
            <div className="note-input-section">
              <label htmlFor="highlight-note">Add Note (Optional)</label>
              <textarea
                id="highlight-note"
                className="note-textarea"
                placeholder="Add a note about this highlight..."
                value={pendingNoteText}
                onChange={(e) => setPendingNoteText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="highlight-picker-options">
              {highlightTypeOptions.length === 0 ? (
                <p className="highlight-picker-empty">
                  No highlight types are available yet. Generate AI highlights to enable manual tagging.
                </p>
              ) : (
                highlightTypeOptions.map((option) => {
                  if (option.itemType === 'submittal') {
                    const isSelected = selectedHighlightType?.key === option.key;
                    return (
                      <div key={option.key} role="group" className="submittal-option-group">
                        <button
                          className={`highlight-picker-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleSelection(option)}
                          disabled={isSavingHighlight}
                        >
                          <span
                            className="highlight-picker-swatch"
                            style={{
                              backgroundColor: `rgb(${option.swatch.r}, ${option.swatch.g}, ${option.swatch.b})`
                            }}
                          />
                          <span>{option.label}</span>
                        </button>
                        {isSelected && (
                          <SubmittalFormSection
                            isVisible={true}
                            paraNo={submittalParaNo}
                            description={submittalDescription}
                            type={submittalType}
                            onParaNoChange={setSubmittalParaNo}
                            onDescriptionChange={setSubmittalDescription}
                            onTypeChange={setSubmittalType}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={option.key}
                      className={`highlight-picker-option ${selectedHighlightType?.key === option.key ? 'selected' : ''}`}
                      onClick={() => setSelectedHighlightType(option)}
                      disabled={isSavingHighlight}
                    >
                      <span
                        className="highlight-picker-swatch"
                        style={{
                          backgroundColor: `rgb(${option.swatch.r}, ${option.swatch.g}, ${option.swatch.b})`
                        }}
                      />
                      <span>{option.label}</span>
                    </button>
                  );
                })
              )}
            </div>

            {highlightError && <div className="highlight-picker-error">{highlightError}</div>}

            <div className="highlight-picker-actions">
              <button
                className="highlight-picker-manage"
                onClick={handleOpenCustomTypesManager}
                disabled={isSavingHighlight}
              >
                Manage custom types
              </button>
              <button
                className="highlight-picker-cancel"
                onClick={handleCloseHighlightPicker}
                disabled={isSavingHighlight}
              >
                Cancel
              </button>
              <button
                className="highlight-picker-confirm"
                onClick={() => selectedHighlightType && handleHighlightTypeSelect(selectedHighlightType)}
                disabled={isSavingHighlight || !selectedHighlightType}
              >
                {isSavingHighlight ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomTypesManager && (
        <CustomItemTypesManager
          projectId={projectId}
          isOpen={showCustomTypesManager}
          onClose={handleCloseCustomTypesManager}
          onRefresh={onCustomTypesUpdate}
          initialTypes={customItemTypes}
        />
      )}
    </div>
  );
};

export default DocumentHighlighter;

