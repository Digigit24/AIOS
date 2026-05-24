import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({
  sections = [],
  role = "Administrator",
  collapsed = false,
  onToggleCollapse = () => {},
  mobileOpen = false,
  onClose = () => {},
  footer = null
}) {
  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] md:hidden cursor-pointer"
          aria-label="Close sidebar"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={cn(
          "app-sidebar",
          collapsed ? "sidebar-collapsed" : "",
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+24px)] md:translate-x-0",
          "max-w-[calc(100vw-32px)]"
        )}
        aria-label="Sidebar navigation"
      >
        {/* Header Logo Area */}
        <div className="sidebar-logo-block">
          <div className="flex items-center justify-between">
            {/* Logo details */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                A
              </div>
              {!collapsed && (
                <span className="font-bold text-lg tracking-tight font-nav truncate text-[var(--text)]">
                  AgencyOS
                </span>
              )}
            </div>

            {/* Mobile close / Desktop triggers */}
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)] cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>

              <button
                onClick={onToggleCollapse}
                className="hidden md:grid place-items-center w-7 h-7 rounded-lg border border-[var(--border)] text-[var(--secondary)] bg-[var(--card)] hover:bg-[var(--surface)] hover:text-[var(--text)] shadow-sm absolute right-[-12px] top-6 z-10 cursor-pointer"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>
          </div>

          {/* User Role Pill */}
          {!collapsed && (
            <div className="px-3.5 py-1.5 rounded-full text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] self-start border border-[var(--accent)]/15 uppercase tracking-widest truncate max-w-full">
              {role}
            </div>
          )}
        </div>

        {/* Navigation Middle scroller */}
        <div className="sidebar-nav-scroller scrollbar-thin">
          {sections.map((section, idx) => (
            <div key={section.title || idx} className="mb-4">
              {/* Section Header Label */}
              {section.title && !collapsed && (
                <span className="sidebar-label">
                  {section.title}
                </span>
              )}

              {/* Navigation Items */}
              <div className="space-y-1">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  if (item.onClick) {
                    return (
                      <button
                        key={item.label || idx}
                        onClick={(e) => {
                          e.preventDefault();
                          item.onClick();
                          if (window.innerWidth <= 900) {
                            onClose();
                          }
                        }}
                        className="sidebar-link-btn font-nav w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-2"
                      >
                        <Icon size={17} strokeWidth={2} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  }
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth <= 900) {
                          onClose();
                        }
                      }}
                      className={({ isActive }) =>
                        cn(
                          "sidebar-link-btn font-nav",
                          isActive ? "sidebar-link-btn-active" : ""
                        )
                      }
                      end={item.end}
                    >
                      <Icon size={17} strokeWidth={2} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Card */}
        <div className="shrink-0 border-t border-[var(--border)]">
          {footer ? (
            footer
          ) : (
            <div className={cn("sidebar-user-island", collapsed ? "justify-center" : "")}>
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-strong)] flex items-center justify-center font-bold text-[var(--accent)] shrink-0 border border-[var(--border)]">
                JD
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--text)] truncate leading-tight">
                    John Doe
                  </div>
                  <div className="text-xs text-[var(--muted)] truncate leading-tight mt-0.5">
                    john.doe@agency.os
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
