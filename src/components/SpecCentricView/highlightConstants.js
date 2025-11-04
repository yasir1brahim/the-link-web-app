// Highlight type definitions with display names, colors, and keys
export const HIGHLIGHT_TYPES = [
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

// Extract just the keys for filter initialization
export const DEFAULT_FILTER_KEYS = HIGHLIGHT_TYPES.map(item => item.key);
