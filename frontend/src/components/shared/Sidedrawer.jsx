import React from 'react';
import { useUiStore } from '../../store/uiStore';
import { X, Check, RotateCcw, Palette, Type, Sun, Moon } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cn } from '../../lib/utils';

// Theme Presets
const PRIMARY_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' }
];

const SECONDARY_COLORS = [
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Slate', value: '#64748b' }
];

const FONTS = [
  { id: 'Inter', name: 'Inter (Sleek UI)', desc: 'Clean, neutral sans-serif body' },
  { id: 'DM Sans', name: 'DM Sans (Dynamic)', desc: 'Modern geometric navigation' },
  { id: 'Playfair Display', name: 'Playfair Display (Display)', desc: 'Elegant editorial display serif' }
];

export default function Sidedrawer() {
  const isOpen = useUiStore((s) => s.isSettingsOpen);
  const setOpen = useUiStore((s) => s.setSettingsOpen);

  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const config = useUiStore((s) => s.themeConfig);
  const setThemeConfig = useUiStore((s) => s.setThemeConfig);
  const resetThemeConfig = useUiStore((s) => s.resetThemeConfig);

  // Lock scrolling when settings panel is open
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        onClick={() => setOpen(false)}
        className="drawer-overlay cursor-pointer"
        aria-label="Close settings drawer"
        style={{
          animation: 'drawer-overlay-fade 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      />

      {/* Settings Drawer Panel */}
      <div
        className="drawer-panel"
        style={{
          animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      >
        {/* Pull bar for mobile bottom sheet */}
        <div className="w-12 h-1 bg-[color:var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />

        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Palette className="text-[var(--accent)]" size={20} />
            <h2 className="text-lg font-bold text-[var(--text)]">Design Settings</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-body scrollbar-thin">
          
          {/* Light / Dark Mode Toggle */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--muted)] uppercase block">
              Color Scheme
            </span>
            <div className="scheme-toggle-grid">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={cn(
                  "scheme-toggle-btn",
                  theme === 'light' ? "active" : ""
                )}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={cn(
                  "scheme-toggle-btn",
                  theme === 'dark' ? "active" : ""
                )}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Primary Accent Colors */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--muted)] uppercase block">
              Primary Accent Color
            </span>
            <div className="color-swatch-list">
              {PRIMARY_COLORS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => setThemeConfig({ primaryColor: col.value })}
                  className={cn(
                    "color-swatch-circle",
                    config.primaryColor === col.value ? "active" : ""
                  )}
                  style={{
                    backgroundColor: col.value
                  }}
                  title={col.name}
                >
                  {config.primaryColor === col.value && (
                    <Check size={16} className="text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Accent Colors */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.16em] text-[var(--muted)] uppercase block">
              Secondary Accent Color
            </span>
            <div className="color-swatch-list">
              {SECONDARY_COLORS.map((col) => (
                <button
                  key={col.value}
                  onClick={() => setThemeConfig({ secondaryColor: col.value })}
                  className={cn(
                    "color-swatch-circle",
                    config.secondaryColor === col.value ? "active" : ""
                  )}
                  style={{
                    backgroundColor: col.value
                  }}
                  title={col.name}
                >
                  {config.secondaryColor === col.value && (
                    <Check size={16} className="text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Typography Fonts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.16em] text-[var(--muted)] uppercase">
              <Type size={12} />
              <span>Typography Font</span>
            </div>
            <div className="font-list-vertical">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setThemeConfig({ font: font.id })}
                  className={cn(
                    "font-option-card",
                    config.font === font.id ? "active" : ""
                  )}
                >
                  <span
                    className="font-bold text-sm text-[var(--text)]"
                    style={{
                      fontFamily:
                        font.id === 'DM Sans'
                          ? "'DM Sans', sans-serif"
                          : font.id === 'Playfair Display'
                          ? "'Playfair Display', serif"
                          : "'Inter', sans-serif"
                    }}
                  >
                    {font.name}
                  </span>
                  <span className="text-[11px] text-[var(--secondary)] font-normal">{font.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-footer">
          <button
            onClick={resetThemeConfig}
            className="flex-grow flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] h-12 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <style>{`
        /* Keyframe declarations */
        @keyframes drawer-overlay-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive keyframes */
        @media (min-width: 901px) {
          @keyframes drawer-panel-slide {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        }

        @media (max-width: 900px) {
          @keyframes drawer-panel-slide {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </>
  );
}
