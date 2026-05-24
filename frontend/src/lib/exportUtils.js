/**
 * Reusable utility to export dynamic grid arrays into Excel-compatible CSV sheets.
 * Runs completely client-side in the browser.
 * 
 * @param {string} filename - Target file name (e.g. 'adidas_gmb_schedule.csv')
 * @param {Array<object>} columns - Active table column definitions { key, label }
 * @param {Array<object>} rows - Database records array
 */
export function exportToCsv(filename, columns, rows) {
  if (!rows || rows.length === 0) {
    return false;
  }

  // 1. Extract headers line
  const headers = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // 2. Parse data rows
  const csvRows = rows.map(row => {
    return columns.map(col => {
      const val = row[col.key];
      // Convert value to string and escape double quotes
      let strVal = val === null || val === undefined ? '' : String(val);
      
      // Escape inner quotes
      strVal = strVal.replace(/"/g, '""');
      
      // If value contains comma, quotes, or new lines, wrap it in double quotes
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n') || strVal.includes('\r')) {
        return `"${strVal}"`;
      }
      return strVal;
    }).join(',');
  });

  // 3. Combine headers and rows
  const csvContent = [headers, ...csvRows].join('\r\n');

  // 4. Create Blob object and trigger direct browser download
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
  return false;
}
