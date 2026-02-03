/**
 * NCS (US National CAD Standard) discipline codes for drawing classification
 */
export const DISCIPLINE_CODES = [
  'general',
  'hazardous_materials',
  'survey_mapping',
  'geotechnical',
  'civil',
  'landscape',
  'structural',
  'architectural',
  'interiors',
  'equipment',
  'fire_protection',
  'plumbing',
  'process',
  'mechanical',
  'electrical',
  'distributed_energy',
  'telecommunications',
  'resource',
  'other',
  'contractor_shop',
  'operations',
];

/**
 * Map of discipline codes to display names
 */
const DISCIPLINE_DISPLAY_NAMES = {
  general: 'General',
  hazardous_materials: 'Hazardous Materials',
  survey_mapping: 'Survey/Mapping',
  geotechnical: 'Geotechnical',
  civil: 'Civil',
  landscape: 'Landscape',
  structural: 'Structural',
  architectural: 'Architectural',
  interiors: 'Interiors',
  equipment: 'Equipment',
  fire_protection: 'Fire Protection',
  plumbing: 'Plumbing',
  process: 'Process',
  mechanical: 'Mechanical',
  electrical: 'Electrical',
  distributed_energy: 'Distributed Energy',
  telecommunications: 'Telecommunications',
  resource: 'Resource',
  other: 'Other',
  contractor_shop: 'Contractor/Shop',
  operations: 'Operations',
};

/**
 * Get display name for a discipline code
 * @param {string} code - Discipline code
 * @returns {string} Display name or the code if not found
 */
export const getDisciplineDisplayName = (code) => {
  return DISCIPLINE_DISPLAY_NAMES[code] || code;
};
