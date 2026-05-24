import React, { useState, useEffect } from 'react';
import { FileText, LayoutTemplate, Play, Settings, ExternalLink, RefreshCw } from 'lucide-react';
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
  const [routineRunning, setRoutineRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [routineUrl, setRoutineUrl] = useState(() => localStorage.getItem('agencyos_routine_url') || '');
  const [routineToken, setRoutineToken] = useState(() => localStorage.getItem('agencyos_routine_token') || '');
  const [routineDraft, setRoutineDraft] = useState({ url: '', token: '' });
  const [toast, setToast] = useState(null);

  const activeClient = clients.find(c => c.workspace_id === activeClientId) || null;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleRunRoutine = async () => {
    if (!routineUrl) { openSettings(); return; }
    setRoutineRunning(true);
    setToast({ msg: 'Triggering routine — this may take a moment…', type: 'info' });
    try {
      const res = await fetch(routineUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(routineToken ? { Authorization: `Bearer ${routineToken}` } : {}),
        },
        body: JSON.stringify({ workspace_id: activeClientId }),
      });
      if (!res.ok) throw new Error(res.status);
      setToast({ msg: 'Routine triggered — PM page will update shortly.', type: 'success' });
    } catch {
      setToast({ msg: 'Failed to trigger routine. Check URL and token in settings.', type: 'error' });
    } finally {
      setRoutineRunning(false);
    }
  };

  const openSettings = () => {
    setRoutineDraft({ url: routineUrl, token: routineToken });
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    localStorage.setItem('agencyos_routine_url', routineDraft.url);
    localStorage.setItem('agencyos_routine_token', routineDraft.token);
    setRoutineUrl(routineDraft.url);
    setRoutineToken(routineDraft.token);
    setSettingsOpen(false);
    setToast({ msg: 'Routine settings saved.', type: 'success' });
  };

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
      <style>{`@keyframes pages-spin { to { transform: rotate(360deg); } }`}</style>

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

      {/* ── Action bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }} />

        {activeFile?.url && (
          <a
            href={activeFile.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              height: 30, padding: '0 10px', borderRadius: 8,
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--secondary)', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <ExternalLink size={12} />
            Open
          </a>
        )}

        <button
          onClick={handleRunRoutine}
          disabled={routineRunning}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 30, padding: '0 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, cursor: routineRunning ? 'not-allowed' : 'pointer',
            background: 'var(--accent)', color: '#fff', border: 'none',
            opacity: routineRunning ? 0.7 : 1, transition: 'opacity 0.15s',
          }}
        >
          {routineRunning
            ? <RefreshCw size={12} style={{ animation: 'pages-spin 1s linear infinite' }} />
            : <Play size={12} />}
          {routineRunning ? 'Running…' : 'Run Routine'}
        </button>

        <button
          onClick={openSettings}
          title="Routine settings"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 30, width: 30, borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Settings size={13} />
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          background: toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : 'var(--card)',
          color: toast.type === 'info' ? 'var(--text)' : '#fff',
          border: toast.type === 'info' ? '1px solid var(--border)' : 'none',
          maxWidth: 320,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Routine Settings Modal ── */}
      {settingsOpen && (
        <>
          <div
            onClick={() => setSettingsOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', zIndex: 51,
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380, maxWidth: 'calc(100vw - 2rem)',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            padding: '20px 22px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              Routine Settings
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
              Configure the webhook URL and API token used to trigger the PM report routine.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--secondary)', display: 'block', marginBottom: 5 }}>
                Webhook URL
              </label>
              <input
                value={routineDraft.url}
                onChange={e => setRoutineDraft(d => ({ ...d, url: e.target.value }))}
                placeholder="https://api.claude.ai/v1/routines/..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '7px 10px', borderRadius: 8, fontSize: 11,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--secondary)', display: 'block', marginBottom: 5 }}>
                API Token
              </label>
              <input
                type="password"
                value={routineDraft.token}
                onChange={e => setRoutineDraft(d => ({ ...d, token: e.target.value }))}
                placeholder="Bearer token (stored locally)"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '7px 10px', borderRadius: 8, fontSize: 11,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={saveSettings}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: 'var(--accent)', color: '#fff', border: 'none',
                }}
              >
                Save Settings
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: 'transparent', color: 'var(--secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

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
