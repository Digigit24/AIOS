import React, { useState, useEffect } from 'react';
import { FileText, LayoutTemplate } from 'lucide-react';
import { authFetch, BACKEND_URL } from '../lib/api';

function parseFileName(filename) {
  const noExt = filename.replace(/\.html?$/i, '');
  const match = noExt.match(/^(\d{4})-(\d{2})_(.+)$/);
  if (match) {
    const [, year, month, slug] = match;
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = `${monthNames[parseInt(month) - 1]} ${year}`;
    const label = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { label, date };
  }
  return { label: noExt.replace(/-/g, ' '), date: null };
}

export default function Pages() {
  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/workspaces/pages-map`)
      .then(r => r.json())
      .then(data => {
        const ws = data.workspaces || [];
        setClients(ws);
        if (ws.length > 0) setActiveClientId(ws[0].workspace_id);
      })
      .catch(console.error)
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (!activeClientId) return;
    setLoadingFiles(true);
    setFiles([]);
    setActiveFile(null);
    authFetch(`${BACKEND_URL}/workspace/${activeClientId}/pm-files`)
      .then(r => r.json())
      .then(data => {
        const f = data.files || [];
        setFiles(f);
        if (f.length > 0) setActiveFile(f[0]);
      })
      .catch(console.error)
      .finally(() => setLoadingFiles(false));
  }, [activeClientId]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
      margin: '-24px -1px -24px -1px'
    }}>

      {/* ── Sticky client tab bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 12px', height: 48,
        overflowX: 'auto'
      }}>
        {loadingClients ? (
          [1,2,3].map(i => (
            <div key={i} style={{ height: 28, width: 110, borderRadius: 8, flexShrink: 0 }} className="shimmer" />
          ))
        ) : clients.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            No pages found — upload HTML files via the Agent API to see them here.
          </p>
        ) : clients.map(c => {
          const isActive = activeClientId === c.workspace_id;
          return (
            <button
              key={c.workspace_id}
              onClick={() => setActiveClientId(c.workspace_id)}
              style={{
                flexShrink: 0, padding: '0 14px', height: 32, borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: isActive ? 'none' : '1px solid transparent',
                transition: 'all 0.15s',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--secondary)',
              }}
            >
              {c.client_name}
              <span style={{
                display: 'inline-block', marginLeft: 6,
                fontSize: 10, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--muted)',
                borderRadius: 99, padding: '1px 6px'
              }}>
                {c.file_count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left document sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--card)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--muted)'
            }}>
              Documents
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 8, flex: 1 }}>
            {loadingFiles ? (
              [1,2,3].map(i => (
                <div key={i} style={{ height: 52, borderRadius: 8 }} className="shimmer" />
              ))
            ) : files.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 6px' }}>
                No pages uploaded yet.
              </p>
            ) : files.map(f => {
              const { label, date } = parseFileName(f.name);
              const isActive = activeFile?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 10px',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    cursor: 'pointer',
                    border: isActive
                      ? '1px solid rgba(124,111,247,0.35)'
                      : '1px solid transparent',
                    background: isActive ? 'rgba(124,111,247,0.1)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <FileText
                    size={13}
                    style={{
                      marginTop: 2, flexShrink: 0,
                      color: isActive ? 'var(--accent)' : 'var(--muted)'
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: 12, fontWeight: 600, lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: isActive ? 'var(--accent)' : 'var(--text)'
                    }}>
                      {label}
                    </p>
                    {date && (
                      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                        {date}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right iframe viewer */}
        <main style={{
          flex: 1, minWidth: 0, overflow: 'hidden',
          background: '#0f0f12',
          display: 'flex', flexDirection: 'column'
        }}>
          {activeFile ? (
            <iframe
              key={activeFile.id}
              src={activeFile.url}
              title={activeFile.name}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-top-navigation"
            />
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, color: 'var(--muted)'
            }}>
              <LayoutTemplate size={44} strokeWidth={1.2} />
              <p style={{ fontSize: 13 }}>Select a page from the sidebar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
