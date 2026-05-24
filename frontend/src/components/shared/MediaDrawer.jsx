import React, { useState, useEffect, useRef } from 'react';
import { useUiStore } from '../../store/uiStore';
import { 
  X, 
  Folder, 
  FolderPlus, 
  Upload, 
  Copy, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Loader2, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { authFetch, BACKEND_URL } from '../../lib/api';

export default function MediaDrawer() {
  const isMediaOpen = useUiStore((s) => s.isMediaOpen);
  const setMediaOpen = useUiStore((s) => s.setMediaOpen);
  const addToast = useUiStore((s) => s.addToast);

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderManifest, setFolderManifest] = useState(null);
  
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  // Load workspaces on drawer open
  useEffect(() => {
    if (isMediaOpen) {
      fetchWorkspaces();
    } else {
      // Clear state when closed
      setActiveFolder(null);
      setFolderManifest(null);
    }
  }, [isMediaOpen]);

  // Load folders when selected workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      fetchFolders(selectedWorkspace);
    } else {
      setFolders([]);
    }
    setActiveFolder(null);
    setFolderManifest(null);
  }, [selectedWorkspace]);

  // Load folder contents when active folder changes
  useEffect(() => {
    if (activeFolder) {
      fetchFolderManifest(activeFolder.id);
    } else {
      setFolderManifest(null);
    }
  }, [activeFolder]);

  const fetchWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`, {
        headers: {}
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
      if (data.workspaces?.length > 0) {
        setSelectedWorkspace(data.workspaces[0]);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'System Error', message: 'Failed to retrieve workspaces.' });
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const fetchFolders = async (workspace) => {
    setLoadingFolders(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/video-folders?workspace_id=${workspace.id}`, {
        headers: {}
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Fetch Error', message: 'Failed to load folders for workspace.' });
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchFolderManifest = async (folderId) => {
    setLoadingManifest(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/video-folders/${folderId}/manifest`, {
        headers: {}
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFolderManifest(data);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Fetch Error', message: 'Failed to load folder manifest.' });
    } finally {
      setLoadingManifest(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !selectedWorkspace) return;
    setCreatingFolder(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/video-folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName.trim(),
          bucket: selectedWorkspace.bucket
        })
      });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', title: 'Folder Created', message: `Added folder "${newFolderName}"` });
      setNewFolderName('');
      fetchFolders(selectedWorkspace);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Creation Failed', message: 'Could not create new folder.' });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeFolder) return;
    
    const formData = new FormData();
    formData.append('video', file);
    
    setUploading(true);
    addToast({ type: 'info', title: 'Uploading Asset', message: `Sending "${file.name}" to Zata S3...` });

    try {
      const res = await authFetch(`${BACKEND_URL}/video-folders/${activeFolder.id}/videos`, {
        method: 'POST',
        headers: {},
        body: formData
      });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', title: 'Upload Successful', message: 'Media asset is ready to be copied.' });
      fetchFolderManifest(activeFolder.id);
      fetchFolders(selectedWorkspace);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Upload Failure', message: 'Failed to host asset in this folder.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = (link, fileId) => {
    navigator.clipboard.writeText(link);
    setCopiedId(fileId);
    addToast({ type: 'success', title: 'Copied', message: 'Direct public link copied to clipboard!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isMediaOpen) return null;

  return (
    <>
      {/* Drawer Overlay */}
      <button 
        onClick={() => setMediaOpen(false)}
        className="drawer-overlay cursor-pointer"
        aria-label="Close media drawer"
        style={{ animation: 'drawer-overlay-fade 0.3s forwards', zIndex: 100 }}
      />
      
      {/* Drawer Panel */}
      <div 
        className="drawer-panel"
        style={{ 
          animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          zIndex: 101,
          width: 'min(850px, calc(100vw - 32px))',
          background: 'var(--card)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid var(--border)'
        }}
      >
        {/* Drawer Header */}
        <div className="drawer-header border-b border-[var(--border)] px-6 py-4 md:px-8 md:py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent-tint)] flex items-center justify-center text-[var(--accent)]">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text)] uppercase tracking-wider font-nav">
                Zata Asset Vault
              </h3>
              <p className="text-[10px] font-bold text-[var(--secondary)] uppercase tracking-widest mt-0.5">
                Host photos & videos to direct public URLs
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMediaOpen(false)}
            className="p-2 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Body Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Workspace selection and Folder Creation Header bar */}
          <div className="p-6 md:p-8 border-b border-[var(--border)] shrink-0 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[var(--surface-strong)]/30">
            <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
              <label className="text-[9px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">
                Active Client Workspace
              </label>
              {loadingWorkspaces ? (
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Loading clients...</span>
                </div>
              ) : (
                <select
                  value={selectedWorkspace?.id || ''}
                  onChange={(e) => {
                    const match = workspaces.find(ws => ws.id === e.target.value);
                    if (match) setSelectedWorkspace(match);
                  }}
                  className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-bold font-nav outline-none focus:border-[var(--accent)] w-full cursor-pointer transition-colors"
                >
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id} className="bg-[var(--card)] text-[var(--text)]">
                      {ws.client_name} ({ws.bucket})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Folder creation form */}
            {!activeFolder && selectedWorkspace && (
              <form onSubmit={handleCreateFolder} className="flex items-end gap-2.5">
                <div className="flex flex-col gap-1.5 w-48">
                  <label className="text-[9px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">
                    New Folder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q2 Campaigns"
                    className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs outline-none focus:border-[var(--accent)] transition-colors"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="btn-primary h-9 text-xs rounded-xl px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {creatingFolder ? <Loader2 size={13} className="animate-spin" /> : <FolderPlus size={14} />}
                  <span>Add Folder</span>
                </button>
              </form>
            )}
          </div>

          {/* Core Content Area */}
          <div className="flex-grow flex overflow-hidden min-h-0">
            
            {/* If folder manifest is NOT active, display folder selection lists */}
            {!activeFolder ? (
              <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin">
                {loadingFolders ? (
                  <div className="flex flex-col items-center justify-center p-20 text-center gap-3">
                    <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                    <span className="text-xs text-[var(--secondary)] uppercase tracking-widest font-bold">Scanning workspace vaults...</span>
                  </div>
                ) : folders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 md:p-20 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]/20">
                    <Folder className="text-[var(--muted)]" size={36} />
                    <h4 className="text-sm font-bold text-[var(--text)] mt-4 uppercase tracking-wider font-nav">No Vault Folders</h4>
                    <p className="text-xs text-[var(--secondary)] mt-1 max-w-xs">
                      Create your first asset directory folder using the input form in the headers above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setActiveFolder(folder)}
                        className="flex items-center justify-between p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] hover:border-[var(--border)] transition-all cursor-pointer text-left group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[var(--surface)] group-hover:bg-[var(--accent-tint)] group-hover:text-[var(--accent)] flex items-center justify-center text-[var(--secondary)] transition-all shrink-0">
                            <Folder size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-[var(--text)] font-nav group-hover:text-[var(--accent)] transition-colors truncate">
                              {folder.name}
                            </h4>
                            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">
                              {folder.media_count} Assets ({folder.photo_count} photos, {folder.video_count} videos)
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--text)] transition-colors ml-2 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* If folder IS active, display manifest grid with asset upload dropzone */
              <div className="flex-grow flex flex-col overflow-hidden min-h-0">
                {/* Active Folder Title bar */}
                <div className="px-6 py-4 md:px-8 bg-[var(--surface)]/40 border-b border-[var(--border)] flex flex-wrap md:flex-nowrap gap-3 items-center justify-between shrink-0 select-none">
                  <button
                    onClick={() => setActiveFolder(null)}
                    className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[var(--secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                    <span>Back to Folders</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[var(--text)] font-nav uppercase">
                      📂 {activeFolder.name}
                    </span>
                    
                    {/* Hidden input and trigger button for upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="sr-only"
                      accept="image/*,video/*"
                      onChange={handleUploadFile}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-primary h-8 text-[10px] rounded-xl px-3 flex items-center gap-1.5 shadow-sm"
                    >
                      {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={12} />}
                      <span>Upload Asset</span>
                    </button>
                  </div>
                </div>

                {/* Manifest Grid list */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin">
                  {loadingManifest ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center gap-3">
                      <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                      <span className="text-xs text-[var(--secondary)] uppercase tracking-widest font-bold">Downloading manifest...</span>
                    </div>
                  ) : !folderManifest || folderManifest.videos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 md:p-20 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]/20">
                      <Upload className="text-[var(--muted)] animate-bounce" size={32} />
                      <h4 className="text-sm font-bold text-[var(--text)] mt-4 uppercase tracking-wider font-nav">Directory is Empty</h4>
                      <p className="text-xs text-[var(--secondary)] mt-1.5 max-w-xs">
                        Upload your first image or video into this folder using the "Upload Asset" trigger.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {folderManifest.videos.map((file) => {
                        const isPhoto = file.media_type === 'photo' || file.content_type.startsWith('image/');
                        // Force https — backend may return http if reverse proxy headers aren't set
                        const rawUrl = file.download_url || '';
                        const directUrl = rawUrl.startsWith('http://') ? 'https://' + rawUrl.slice(7) : rawUrl;

                        
                        return (
                          <div 
                            key={file.id} 
                            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] hover:border-[var(--border)] transition-all overflow-hidden shadow-sm hover:shadow-md"
                          >
                            {/* Graphic Preview Box */}
                            <div className="h-40 bg-[var(--surface-strong)] border-b border-[var(--border)] relative overflow-hidden flex items-center justify-center select-none">
                              {isPhoto ? (
                                <img
                                  src={directUrl}
                                  alt={file.filename}
                                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                                  loading="lazy"
                                />
                              ) : (
                                <video
                                  src={directUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                  onMouseEnter={(e) => e.target.play().catch(() => {})}
                                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                />
                              )}
                              
                              {/* Media Type pill badge */}
                              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-white shadow-sm">
                                {isPhoto ? <ImageIcon size={9} /> : <VideoIcon size={9} />}
                                <span>{isPhoto ? 'Photo' : 'Video'}</span>
                              </span>
                            </div>

                            {/* Details & Actions Footer */}
                            <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-black text-[var(--text)] font-nav leading-snug truncate" title={file.filename}>
                                  {file.filename}
                                </h5>
                                <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">
                                  {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 select-none shrink-0">
                                {/* Copy Direct public redirect media link */}
                                <button
                                  onClick={() => handleCopyLink(directUrl, file.id)}
                                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--accent-tint)] hover:text-[var(--accent)] text-[9px] font-black uppercase tracking-wider text-[var(--secondary)] border border-[var(--border)] hover:border-transparent transition-all cursor-pointer shadow-sm"
                                  title="Copy URL for Make.com / Campaigns"
                                >
                                  {copiedId === file.id ? (
                                    <>
                                      <Check size={11} className="text-emerald-500" />
                                      <span className="text-emerald-500">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy URL</span>
                                    </>
                                  )}
                                </button>

                                {/* Open Link in new tab */}
                                <a
                                  href={directUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-strong)] text-[9px] font-black uppercase tracking-wider text-[var(--secondary)] hover:text-[var(--text)] border border-[var(--border)] transition-all text-center shadow-sm"
                                  title="Open in new window"
                                >
                                  <ExternalLink size={11} />
                                  <span>Preview</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </>
  );
}
