import FileDownload from 'js-file-download';

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column definitions (optional, for custom ordering)
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, columns = null) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Use column definitions if provided, otherwise use keys from first row
  const headers = columns 
    ? columns.map(col => col.key || col.label) 
    : Object.keys(data[0]);
  
  // Create header row
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas, quotes, and newlines in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return csvContent;
};

/**
 * Download data as CSV file
 * @param {Array} data - Array of data objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Array of column definitions (optional)
 */
export const downloadCSV = (data, filename, columns = null) => {
  const csvContent = convertToCSV(data, columns);
  
  if (!csvContent) {
    console.warn('No data to export');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  
  FileDownload(blob, finalFilename);
  console.log(`📊 Exported ${data.length} rows to ${finalFilename}`);
};

/**
 * Generate a filename based on log type and current date
 * @param {string} logType - Type of log (e.g., 'qa_planner', 'inspection_log')
 * @param {string} customPrefix - Custom prefix for filename (optional)
 * @returns {string} Generated filename
 */
export const generateExportFilename = (logType, customPrefix = null) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const logTypeMap = {
    'qa_planner': 'QA_Planner',
    'inspection_log': 'Inspection_Log',
    'owner_deliverables': 'Owner_Deliverables',
    'default': 'Export'
  };
  
  const prefix = customPrefix || logTypeMap[logType] || logTypeMap.default;
  return `${prefix}_${today}`;
};
