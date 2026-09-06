/**
 * Utility for exporting data arrays to formatted CSV files.
 * Correctly escapes strings containing quotes, commas, and newlines according to RFC-4180.
 *
 * @param {string} filename - Output filename (without or with .csv extension)
 * @param {Array<{ label: string, key: string, transform?: (row: any) => any }>} columns - Column definitions
 * @param {Array<Object>} data - Array of row records
 */
export const exportToCSV = (filename = 'export', columns = [], data = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  // 1. Format Header Row
  const headers = columns.map((col) => escapeCSVField(col.label || col.key));
  const csvRows = [headers.join(',')];

  // 2. Format Data Rows
  for (const row of data) {
    const values = columns.map((col) => {
      let val;
      if (typeof col.transform === 'function') {
        val = col.transform(row);
      } else {
        // Support nested keys like 'student.name'
        val = getNestedValue(row, col.key);
      }
      return escapeCSVField(val);
    });
    csvRows.push(values.join(','));
  }

  // 3. Assemble CSV string with UTF-8 BOM for Excel compatibility
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Browser Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}_${formatDateStamp(new Date())}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringVal = String(field);
  // If field contains quote, comma, or newline, escape double quotes and wrap in quotes
  if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
};

const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
};

const formatDateStamp = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${min}`;
};

export default exportToCSV;
