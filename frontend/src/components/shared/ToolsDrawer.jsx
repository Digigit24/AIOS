import React, { useState, useRef } from 'react';
import { useUiStore } from '../../store/uiStore';
import { X, Wrench, Upload, Image, ArrowRight, Download, RefreshCw, FileImage, Percent } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cn } from '../../lib/utils';

export default function ToolsDrawer() {
  const isOpen = useUiStore((s) => s.isToolsOpen);
  const setOpen = useUiStore((s) => s.setToolsOpen);
  const addToast = useUiStore((s) => s.addToast);

  const [selectedFile, setSelectedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState('');
  const [convertedSize, setConvertedSize] = useState(0);
  const [converting, setConverting] = useState(false);
  const [quality, setQuality] = useState(0.9);
  
  const fileInputRef = useRef(null);

  // Lock scrolling when panel is open
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload a PNG or JPG image file.'
      });
      return;
    }

    setSelectedFile(file);
    setOriginalSize(file.size);
    setConvertedUrl('');
    setConvertedSize(0);
  };

  const handleConvert = () => {
    if (!selectedFile) return;

    setConverting(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = window.Image ? new window.Image() : document.createElement('img');
      img.onload = () => {
        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        // Fill canvas with white background (in case of transparent PNG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Convert to JPG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        setConvertedUrl(dataUrl);

        // Calculate converted size
        const head = 'data:image/jpeg;base64,';
        const fileSizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        setConvertedSize(fileSizeBytes);

        setConverting(false);
        addToast({
          type: 'success',
          title: 'Conversion Complete',
          message: 'Your PNG/JPG image was successfully converted to JPG.'
        });
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = () => {
    if (!convertedUrl) return;

    const link = document.createElement('a');
    const originalName = selectedFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    
    link.download = `${nameWithoutExt}_converted.jpg`;
    link.href = convertedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Image Downloaded',
      message: 'JPG file saved successfully.'
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalSize(0);
    setConvertedUrl('');
    setConvertedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionSavings = originalSize > 0 && convertedSize > 0
    ? Math.max(0, Math.round(((originalSize - convertedSize) / originalSize) * 100))
    : 0;

  return (
    <>
      {/* Backdrop overlay */}
      <button
        onClick={() => setOpen(false)}
        className="drawer-overlay cursor-pointer z-[100]"
        aria-label="Close tools drawer"
        style={{
          animation: 'drawer-overlay-fade 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      />

      {/* Drawer Panel */}
      <div
        className="drawer-panel z-[101]"
        style={{
          animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Wrench className="text-[var(--accent)]" size={20} />
            <h2 className="text-lg font-bold text-[var(--text)] font-nav">AgencyOS Tools Suite</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="drawer-body scrollbar-thin space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[var(--text)] font-nav">PNG to JPG Converter</h3>
            <p className="text-xs text-[var(--secondary)]">
              Convert any PNG or JPG/JPEG image to JPG in real-time, completely in the browser for maximum security and performance.
            </p>
          </div>

          {/* Upload Drop Zone */}
          {!selectedFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center bg-[var(--surface)] hover:bg-[var(--surface-strong)] hover:border-[var(--accent)]/40 transition-all cursor-pointer group space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mx-auto group-hover:scale-110 transition-transform duration-300">
                <Upload size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[var(--text)]">Click or Drag Image to Upload</p>
                <p className="text-[10px] text-[var(--secondary)]">Supports PNG, JPG, or JPEG formats</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="card p-4 space-y-4 border-[var(--border)] bg-[var(--surface)]">
              {/* File Info Block */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <FileImage size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text)] truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-[var(--secondary)]">{formatSize(originalSize)} • {selectedFile.type.toUpperCase()}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  title="Remove Image"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Compression Quality Slider */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[var(--secondary)]">
                  <span>Output Quality</span>
                  <span className="text-[var(--accent)]">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseFloat(e.target.value));
                    setConvertedUrl(''); // Reset conversion result to allow re-converting at new quality
                  }}
                  className="w-full accent-[var(--accent)] cursor-ew-resize bg-[var(--border)] h-1.5 rounded-lg appearance-none"
                />
              </div>

              {/* Action Trigger */}
              {!convertedUrl && (
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="btn-primary w-full h-11 rounded-xl text-xs font-bold shrink-0 shadow-sm disabled:opacity-50"
                >
                  {converting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Converting image...</span>
                    </>
                  ) : (
                    <>
                      <Image size={14} />
                      <span>Convert Image to JPG</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Success Conversion Result Panel */}
          {convertedUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">
                <ArrowRight size={13} />
                <span>Conversion Complete</span>
              </div>

              {/* Comparison Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wide">Original Size</span>
                  <p className="text-sm font-black text-[var(--secondary)]">{formatSize(originalSize)}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">New Size (JPG)</span>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatSize(convertedSize)}</p>
                </div>
              </div>

              {/* Savings Pill */}
              {compressionSavings > 0 && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <Percent size={14} />
                  <span>Image size optimized by {compressionSavings}%!</span>
                </div>
              )}

              {/* Download Action Banner */}
              <button
                onClick={handleDownload}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full h-12 rounded-2xl text-xs font-bold shrink-0 shadow-md flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>Download Converted JPG</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] h-11 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Convert Another Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
