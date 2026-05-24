import React, { useState, useRef } from 'react';
import { X, Upload, Check, Table, HelpCircle, FileSpreadsheet, ArrowRight, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useScrollLock } from '../../hooks/useScrollLock';

/**
 * Standard RFC-compliant CSV Parser
 * Handles double quotes, nested commas, and newlines in quoted text.
 */
function parseCsv(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++; // skip \n in CRLF
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

/**
 * Reusable Column Mapping Sidedrawer
 * Can be dropped into any dashboard view to map Excel/CSV rows directly to database columns.
 */
export default function ImportDrawer({
  isOpen = false,
  onClose = () => {},
  columns = [], // Array of { key, label, required }
  onImport = () => {} // Callback on submit: (mappedRows) => {}
}) {
  const fileInputRef = useRef(null);
  
  // File details states
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fileRows, setFileRows] = useState([]);
  
  // Mapping state: { [dbColumnKey]: excelHeaderName }
  const [mappings, setMappings] = useState({});
  const [previewRows, setPreviewRows] = useState([]);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  // Reset all states
  const handleReset = () => {
    setFileLoaded(false);
    setFileName('');
    setFileHeaders([]);
    setFileRows([]);
    setMappings({});
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Heuristic fuzzy match logic for auto-mapping columns
  const runAutoHeuristics = (headers) => {
    const autoMap = {};
    columns.forEach(col => {
      const dbKey = col.key.toLowerCase();
      const dbLabel = col.label.toLowerCase();
      
      // Look for a close spelling match
      const matchedHeader = headers.find(h => {
        const headerLower = h.trim().toLowerCase();
        return (
          headerLower === dbKey ||
          headerLower === dbLabel ||
          headerLower.replace(/[\s_-]/g, '') === dbKey ||
          headerLower.replace(/[\s_-]/g, '') === dbLabel ||
          headerLower.includes(dbKey) ||
          dbKey.includes(headerLower)
        );
      });
      
      if (matchedHeader) {
        autoMap[col.key] = matchedHeader;
      } else {
        autoMap[col.key] = ''; // default empty
      }
    });
    setMappings(autoMap);
    generatePreviews(fileRows, autoMap);
  };

  // Handle uploaded text parsing
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCsv(text);
        
        if (parsed.length === 0) {
          throw new Error("This file is empty.");
        }
        
        // 1. Extract headers line
        const rawHeaders = parsed[0].map(h => h.trim());
        setFileHeaders(rawHeaders);
        
        // 2. Extract remaining data rows
        const rawRows = parsed.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));
        setFileRows(rawRows);
        setFileLoaded(true);
        
        // 3. Trigger auto mapping heuristic check
        runAutoHeuristics(rawHeaders);
      } catch (err) {
        console.error(err);
        alert(err.message || "Failed to parse CSV spreadsheet.");
        handleReset();
      }
    };
    reader.readAsText(file);
  };

  // Trigger mapping dropdown changes
  const handleMappingChange = (dbKey, excelHeader) => {
    const nextMappings = { ...mappings, [dbKey]: excelHeader };
    setMappings(nextMappings);
    generatePreviews(fileRows, nextMappings);
  };

  // Generate real-time preview data (first 3 rows) based on current mapping coordinates
  const generatePreviews = (rows, activeMaps) => {
    const list = rows.slice(0, 3).map(row => {
      const entry = {};
      columns.forEach(col => {
        const excelHeader = activeMaps[col.key];
        if (excelHeader) {
          const headerIdx = fileHeaders.indexOf(excelHeader);
          entry[col.key] = headerIdx !== -1 ? row[headerIdx] : '';
        } else {
          entry[col.key] = '';
        }
      });
      return entry;
    });
    setPreviewRows(list);
  };

  // Confirm and Submit mapped rows
  const handleConfirmImport = (e) => {
    e.preventDefault();
    
    // Check if required columns are mapped
    const missingRequired = columns.filter(col => col.required && !mappings[col.key]);
    if (missingRequired.length > 0) {
      alert(`Please map all required fields: ${missingRequired.map(c => c.label).join(', ')}`);
      return;
    }

    // Map ALL Excel rows according to mapping configuration
    const mappedRows = fileRows.map(row => {
      const obj = {};
      columns.forEach(col => {
        const excelHeader = mappings[col.key];
        if (excelHeader) {
          const headerIdx = fileHeaders.indexOf(excelHeader);
          obj[col.key] = headerIdx !== -1 ? row[headerIdx] : '';
        } else {
          obj[col.key] = '';
        }
      });
      return obj;
    });

    onImport(mappedRows);
    handleReset();
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <button
        onClick={onClose}
        className="drawer-overlay cursor-pointer"
        aria-label="Close import drawer"
        style={{ animation: 'drawer-overlay-fade 0.3s forwards' }}
      />

      {/* Sidedrawer Mapping panel */}
      <div
        className="drawer-panel"
        style={{ animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
      >
        {/* Mobile sheet pull bar */}
        <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />

        {/* Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-[var(--accent)]" size={20} />
            <h3 className="text-base font-bold text-[var(--text)] font-nav">Spreadsheet Import Mapping</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Dynamic Body */}
        <div className="drawer-body">
          
          {!fileLoaded ? (
            /* Zone 1: File Uploader dropzone */
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)] text-center space-y-4 hover:border-[var(--accent)]/40 transition-colors py-12">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10">
                <Upload size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-[var(--text)] font-nav">Upload CSV Spreadsheet</h4>
                <p className="text-xs text-[var(--secondary)] max-w-xs leading-relaxed">
                  Select an Excel-exported .csv file. We will dynamically map headers together.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary h-10 text-xs px-4.5 rounded-xl cursor-pointer"
              >
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Zone 2: Column Mapper list */
            <div className="space-y-6 flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* File details banner */}
              <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-xs select-none">
                <div className="min-w-0">
                  <span className="font-bold text-[var(--text)] font-nav block truncate">{fileName}</span>
                  <span className="text-[var(--muted)] mt-0.5 block">{fileRows.length} rows loaded successfully</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Clear File
                </button>
              </div>

              {/* Mapper Fields Container */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                  Column Mappings
                </span>
                
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {columns.map(col => (
                    <div 
                      key={col.key}
                      className="flex flex-col gap-1.5 p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--text)] font-nav">
                          {col.label}
                          {col.required && <span className="text-red-500 ml-0.5">*</span>}
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">Database Column</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ArrowRight size={14} className="text-[var(--muted)] shrink-0" />
                        <select
                          className="flex-grow h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] font-semibold w-full cursor-pointer"
                          value={mappings[col.key] || ''}
                          onChange={(e) => handleMappingChange(col.key, e.target.value)}
                        >
                          <option value="">
                            {col.required ? '-- Select Excel Header (Required) --' : '-- Ignore / Do Not Map --'}
                          </option>
                          {fileHeaders.map(hdr => (
                            <option key={hdr} value={hdr}>{hdr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Cards Grid */}
              {previewRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">
                    <Table size={12} />
                    <span>Mapped Data Preview (First {previewRows.length} Rows)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2.5 max-h-44 overflow-y-auto pr-1">
                    {previewRows.map((pRow, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 text-xs space-y-1.5 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-[var(--border)] text-[10px] font-black text-[var(--muted)] px-2 py-0.5 rounded-bl-xl uppercase select-none">
                          Row {idx + 1}
                        </div>
                        {columns.map(col => (
                          <div key={col.key} className="flex justify-between gap-4">
                            <span className="text-[var(--muted)] font-semibold">{col.label}:</span>
                            <span className="text-[var(--text)] font-bold text-right truncate max-w-[200px]">
                              {pRow[col.key] || <span className="italic text-[var(--muted)] font-normal">empty</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        {fileLoaded && (
          <div className="drawer-footer">
            <button
              onClick={handleReset}
              className="flex-1 h-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] text-xs font-bold text-[var(--secondary)] transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex-1 btn-primary h-12 text-xs rounded-2xl cursor-pointer"
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Confirm Import</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
