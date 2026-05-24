import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import ImportDrawer from '../components/shared/ImportDrawer';
import { 
  Palette, 
  Terminal, 
  Sparkles, 
  Users, 
  Plus, 
  X, 
  Globe, 
  Instagram, 
  Upload, 
  ChevronRight,
  TrendingUp,
  Activity,
  Play
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useScrollLock } from '../hooks/useScrollLock';
import { authFetch, BACKEND_URL } from '../lib/api';

const GMB_COLUMNS = [
  { key: 'title', label: 'Title', required: true },
  { key: 'summary', label: 'Summary', required: false },
  { key: 'mediaurl', label: 'Media URL', required: false }
];

const INSTAGRAM_COLUMNS = [
  { key: 'caption', label: 'Caption', required: true },
  { key: 'mediaurl', label: 'Media URL', required: false }
];

const LINKEDIN_COLUMNS = [
  { key: 'title', label: 'Title', required: true },
  { key: 'summary', label: 'Summary', required: false },
  { key: 'mediaurl', label: 'Media URL', required: false }
];

const TWITTER_COLUMNS = [
  { key: 'tweet_text', label: 'Tweet Text', required: true },
  { key: 'mediaurl', label: 'Media URL', required: false }
];

const YOUTUBE_COLUMNS = [
  { key: 'video_title', label: 'Video Title', required: true },
  { key: 'description', label: 'Description', required: false },
  { key: 'video_url', label: 'Video URL', required: false }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const setSettingsOpen = useUiStore((s) => s.setSettingsOpen);
  const addToast = useUiStore((s) => s.addToast);

  // Core States
  const [clientsData, setClientsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Client drawer states
  const [isNewClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPlatforms, setNewClientPlatforms] = useState(['gmb', 'instagram']);
  
  const [newClientGmbPromised, setNewClientGmbPromised] = useState(10);
  const [newClientIgPromised, setNewClientIgPromised] = useState(15);
  const [newClientLinkedinPromised, setNewClientLinkedinPromised] = useState(10);
  const [newClientTwitterPromised, setNewClientTwitterPromised] = useState(15);
  const [newClientYoutubePromised, setNewClientYoutubePromised] = useState(5);

  // Import drawer states
  const [importTargetClientId, setImportTargetClientId] = useState(null);
  const [isGmbImportOpen, setGmbImportOpen] = useState(false);
  const [isIgImportOpen, setIgImportOpen] = useState(false);
  const [isLinkedinImportOpen, setLinkedinImportOpen] = useState(false);
  const [isTwitterImportOpen, setTwitterImportOpen] = useState(false);
  const [isYoutubeImportOpen, setYoutubeImportOpen] = useState(false);

  useScrollLock(isNewClientOpen);

  // Gather clients & their metrics dynamically from Zata backend
  const loadDashboardData = async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`);
      if (!res.ok) throw new Error("Failed to load clients.");
      const data = await res.json();
      const clientsList = (data.workspaces || [])
        .filter(ws => ws.client_active !== false)
        .map(ws => ({ ...ws, name: ws.client_name }));

      const fullyHydrated = await Promise.all(clientsList.map(async (client) => {
        try {
          const [gmbRes, igRes, liRes, twRes, ytRes] = await Promise.all([
            authFetch(`${BACKEND_URL}/workspace/${client.id}/gmb`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/instagram`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/linkedin`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/twitter`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/youtube`)
          ]);

          const gmbPosts = gmbRes.ok ? await gmbRes.json() : [];
          const igPosts  = igRes.ok  ? await igRes.json()  : [];
          const liPosts  = liRes.ok  ? await liRes.json()  : [];
          const twPosts  = twRes.ok  ? await twRes.json()  : [];
          const ytPosts  = ytRes.ok  ? await ytRes.json()  : [];

          return {
            ...client,
            gmbTotal:   gmbPosts.length,
            igTotal:    igPosts.length,
            liTotal:    liPosts.length,
            twTotal:    twPosts.length,
            ytTotal:    ytPosts.length,
            gmbPosted:  gmbPosts.filter(p => p.status === 'posted').length,
            igPosted:   igPosts.filter(p => p.status === 'posted').length,
            liPosted:   liPosts.filter(p => p.status === 'posted').length,
            twPosted:   twPosts.filter(p => p.status === 'posted').length,
            ytPosted:   ytPosts.filter(p => p.status === 'posted').length,
            gmbPercent: Math.min(Math.round((gmbPosts.length / (client.gmb_promised  || 10)) * 100), 100),
            igPercent:  Math.min(Math.round((igPosts.length  / (client.instagram_promised || 15)) * 100), 100),
            liPercent:  Math.min(Math.round((liPosts.length  / (client.linkedin_promised  || 10)) * 100), 100),
            twPercent:  Math.min(Math.round((twPosts.length  / (client.twitter_promised   || 15)) * 100), 100),
            ytPercent:  Math.min(Math.round((ytPosts.length  / (client.youtube_promised   || 5))  * 100), 100)
          };
        } catch (e) {
          console.error(`Error loading metrics for client ${client.id}:`, e);
          return {
            ...client,
            gmbTotal: 0, igTotal: 0, liTotal: 0, twTotal: 0, ytTotal: 0,
            gmbPosted: 0, igPosted: 0, liPosted: 0, twPosted: 0, ytPosted: 0,
            gmbPercent: 0, igPercent: 0, liPercent: 0, twPercent: 0, ytPercent: 0
          };
        }
      }));

      setClientsData(fullyHydrated);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Data Fetch Error', message: 'Could not sync dashboard metrics with Zata backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sidedrawer client submission
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: newClientName.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        addToast({ type: 'error', title: 'Submission Denied', message: data.error || 'Failed to add client.' });
        return;
      }

      addToast({ type: 'success', title: 'Client Configured', message: `Added new workspace for "${data.name}"` });
      setNewClientName('');
      setNewClientOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'System Failure', message: 'Could not connect to database.' });
    }
  };

  // Mapped Batch CSV Importers
  const handleImportGmb = async (mappedRows) => {
    if (mappedRows.length === 0 || !importTargetClientId) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.title || !row.title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/gmb`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: row.title, summary: row.summary, mediaurl: row.mediaurl })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Loaded ${count} GMB rows successfully.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportIg = async (mappedRows) => {
    if (mappedRows.length === 0 || !importTargetClientId) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.caption || !row.caption.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/instagram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: row.caption, mediaurl: row.mediaurl })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Loaded ${count} Instagram rows successfully.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportLinkedin = async (mappedRows) => {
    if (mappedRows.length === 0 || !importTargetClientId) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.title || !row.title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/linkedin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: row.title, summary: row.summary, mediaurl: row.mediaurl })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Loaded ${count} LinkedIn rows successfully.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportTwitter = async (mappedRows) => {
    if (mappedRows.length === 0 || !importTargetClientId) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.tweet_text || !row.tweet_text.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/twitter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tweet_text: row.tweet_text, mediaurl: row.mediaurl })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Loaded ${count} Twitter tweets successfully.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportYoutube = async (mappedRows) => {
    if (mappedRows.length === 0 || !importTargetClientId) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.video_title || !row.video_title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_title: row.video_title, description: row.description, video_url: row.video_url })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Loaded ${count} YouTube videos successfully.` });
      loadDashboardData();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  // Launch Excel sheets mapper triggers
  const triggerGmbImport = (clientId) => {
    setImportTargetClientId(clientId);
    setGmbImportOpen(true);
  };

  const triggerIgImport = (clientId) => {
    setImportTargetClientId(clientId);
    setIgImportOpen(true);
  };

  const triggerLinkedinImport = (clientId) => {
    setImportTargetClientId(clientId);
    setLinkedinImportOpen(true);
  };

  const triggerTwitterImport = (clientId) => {
    setImportTargetClientId(clientId);
    setTwitterImportOpen(true);
  };

  const triggerYoutubeImport = (clientId) => {
    setImportTargetClientId(clientId);
    setYoutubeImportOpen(true);
  };

  if (loading) {
    return (
      <div className="card p-6 space-y-6 shimmer flex-grow">
        <div className="h-8 bg-[var(--surface-strong)] rounded-lg w-[30%]" />
        <div className="h-32 bg-[var(--surface-strong)] rounded-2xl w-full" />
        <div className="h-64 bg-[var(--surface-strong)] rounded-2xl w-full" />
      </div>
    );
  }

  // Gather overall stats across all platforms
  const totalClients    = clientsData.length;
  const grandTotalGmb   = clientsData.reduce((acc, curr) => acc + curr.gmbTotal, 0);
  const grandTotalIg    = clientsData.reduce((acc, curr) => acc + curr.igTotal, 0);
  const grandTotalLi    = clientsData.reduce((acc, curr) => acc + curr.liTotal, 0);
  const grandTotalTw    = clientsData.reduce((acc, curr) => acc + curr.twTotal, 0);
  const grandTotalYt    = clientsData.reduce((acc, curr) => acc + curr.ytTotal, 0);
  const grandPostedGmb  = clientsData.reduce((acc, curr) => acc + curr.gmbPosted, 0);
  const grandPostedIg   = clientsData.reduce((acc, curr) => acc + curr.igPosted, 0);
  const grandPostedLi   = clientsData.reduce((acc, curr) => acc + curr.liPosted, 0);
  const grandPostedTw   = clientsData.reduce((acc, curr) => acc + curr.twPosted, 0);
  const grandPostedYt   = clientsData.reduce((acc, curr) => acc + curr.ytPosted, 0);
  const grandTotalPosted = grandPostedGmb + grandPostedIg + grandPostedLi + grandPostedTw + grandPostedYt;

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between select-none">
      
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-[32px] font-bold tracking-tight text-[var(--text)] font-nav leading-tight">
            Agency Overview
          </h1>
          <p className="mt-1 text-sm text-[var(--secondary)] leading-relaxed">
            Real-time delivery progress metrics and master spreadsheet imports for all managed client platforms.
          </p>
        </div>

        <div className="shrink-0 safe-actions">
          <button
            onClick={() => setNewClientOpen(true)}
            className="btn-primary shrink-0 text-xs tracking-wide px-5 py-2.5 rounded-xl shadow-sm"
          >
            <Plus size={14} />
            <span>Add Client Workspace</span>
          </button>
        </div>
      </div>

      {/* Dynamic Key Performance Indicators (KPI Cards) */}
      <div className="responsive-kpis shrink-0">
        <div className="card p-5 bg-gradient-to-br from-[var(--card)] to-[var(--surface)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Total Clients</span>
              <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">{totalClients}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10">
              <Users size={16} />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-[var(--card)] to-[var(--surface)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Total Campaigns</span>
              <h3 className="text-xl font-black text-[var(--text)] leading-none font-nav">
                {grandTotalGmb + grandTotalIg + grandTotalLi + grandTotalTw + grandTotalYt}
              </h3>
              <span className="text-[10px] font-bold text-emerald-500">{grandTotalPosted} posted live</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10">
              <Activity size={16} />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-[var(--card)] to-[var(--surface)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Posted by Platform</span>
              <div className="text-[10px] font-bold text-[var(--secondary)] flex flex-wrap gap-x-2 pt-0.5 max-w-[180px]">
                <span>GMB: <span className="text-emerald-500">{grandPostedGmb}</span>/{grandTotalGmb}</span>
                <span>IG: <span className="text-emerald-500">{grandPostedIg}</span>/{grandTotalIg}</span>
                <span>LI: <span className="text-emerald-500">{grandPostedLi}</span>/{grandTotalLi}</span>
                <span>TW: <span className="text-emerald-500">{grandPostedTw}</span>/{grandTotalTw}</span>
                <span>YT: <span className="text-emerald-500">{grandPostedYt}</span>/{grandTotalYt}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[var(--secondary-accent-tint)] flex items-center justify-center text-[var(--secondary-accent)] border border-[var(--secondary-accent)]/10">
              <Sparkles size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace grid view */}
      <div className="flex-1 flex flex-col justify-between">
        {clientsData.length > 0 ? (
          <div className="responsive-cards shrink-0">
            {clientsData.map((client) => {
              const activePlats = client.active_platforms ? client.active_platforms.split(',') : ['gmb', 'instagram'];
              return (
                <div 
                  key={client.id} 
                  className="card card-hover p-6 flex flex-col justify-between border-[var(--border)] bg-[var(--card)] relative group"
                >
                  <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)] font-nav truncate max-w-[200px]" title={client.name}>
                        {client.name}
                      </h3>
                      <span className="text-[9px] font-extrabold text-[var(--muted)] tracking-wider uppercase block mt-0.5">
                        Supabase Workspace {client.id}
                      </span>
                    </div>
                    <button 
                      onClick={() => navigate('/clients')}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                      title="Open Pipeline Sheets"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* Platform metrics containers */}
                  <div className="py-4 space-y-4 flex-grow max-h-[300px] overflow-y-auto pr-1">
                    
                    {/* GMB */}
                    {activePlats.includes('gmb') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--secondary)] text-[10px]">
                            <Globe size={12} className="text-[var(--accent)]" />
                            <span>GOOGLE MY BUSINESS</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-nav">
                            <span className="text-emerald-500">{client.gmbPosted} posted</span>
                            <span className="text-[var(--muted)]">{client.gmbTotal} / {client.gmb_promised}</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${client.gmbPercent}%` }} />
                        </div>

                        <button
                          onClick={() => triggerGmbImport(client.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[var(--accent)] hover:underline cursor-pointer select-none"
                        >
                          <Upload size={10} />
                          <span>Upload GMB CSV</span>
                        </button>
                      </div>
                    )}

                    {/* INSTAGRAM */}
                    {activePlats.includes('instagram') && (
                      <div className="space-y-2 border-t border-[var(--border)] pt-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--secondary)] text-[10px]">
                            <Instagram size={12} className="text-[var(--secondary-accent)]" />
                            <span>INSTAGRAM FEED</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-nav">
                            <span className="text-emerald-500">{client.igPosted} posted</span>
                            <span className="text-[var(--muted)]">{client.igTotal} / {client.instagram_promised}</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--secondary-accent)]" style={{ width: `${client.igPercent}%` }} />
                        </div>

                        <button
                          onClick={() => triggerIgImport(client.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[var(--secondary-accent)] hover:underline cursor-pointer select-none"
                        >
                          <Upload size={10} />
                          <span>Upload Instagram CSV</span>
                        </button>
                      </div>
                    )}

                    {/* LINKEDIN */}
                    {activePlats.includes('linkedin') && (
                      <div className="space-y-2 border-t border-[var(--border)] pt-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--secondary)] text-[10px]">
                            <Globe size={12} className="text-blue-500" />
                            <span>LINKEDIN POSTS</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-nav">
                            <span className="text-emerald-500">{client.liPosted} posted</span>
                            <span className="text-[var(--muted)]">{client.liTotal} / {client.linkedin_promised || 10}</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${client.liPercent}%` }} />
                        </div>

                        <button
                          onClick={() => triggerLinkedinImport(client.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-600 hover:underline cursor-pointer select-none"
                        >
                          <Upload size={10} />
                          <span>Upload LinkedIn CSV</span>
                        </button>
                      </div>
                    )}

                    {/* TWITTER */}
                    {activePlats.includes('twitter') && (
                      <div className="space-y-2 border-t border-[var(--border)] pt-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--secondary)] text-[10px]">
                            <Sparkles size={12} className="text-gray-400" />
                            <span>TWITTER (X)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-nav">
                            <span className="text-emerald-500">{client.twPosted} posted</span>
                            <span className="text-[var(--muted)]">{client.twTotal} / {client.twitter_promised || 15}</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                          <div className="h-full rounded-full bg-gray-700" style={{ width: `${client.twPercent}%` }} />
                        </div>

                        <button
                          onClick={() => triggerTwitterImport(client.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-gray-500 hover:underline cursor-pointer select-none"
                        >
                          <Upload size={10} />
                          <span>Upload Twitter CSV</span>
                        </button>
                      </div>
                    )}

                    {/* YOUTUBE */}
                    {activePlats.includes('youtube') && (
                      <div className="space-y-2 border-t border-[var(--border)] pt-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-[var(--secondary)] text-[10px]">
                            <Play size={12} className="text-red-500" />
                            <span>YOUTUBE VIDEOS</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold font-nav">
                            <span className="text-emerald-500">{client.ytPosted} posted</span>
                            <span className="text-[var(--muted)]">{client.ytTotal} / {client.youtube_promised || 5}</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${client.ytPercent}%` }} />
                        </div>

                        <button
                          onClick={() => triggerYoutubeImport(client.id)}
                          className="inline-flex items-center gap-1 text-[9px] font-extrabold text-red-500 hover:underline cursor-pointer select-none"
                        >
                          <Upload size={10} />
                          <span>Upload YouTube CSV</span>
                        </button>
                      </div>
                    )}

                  </div>

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted)] select-none font-medium">
                    <div className="flex items-center gap-1">
                      <Activity size={10} className="text-emerald-500" />
                      <span>Connected</span>
                    </div>
                    <span className="uppercase text-[9px]">
                      {activePlats.length} platforms
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center p-8 md:p-16 text-center border-dashed border-[var(--border)] border-2 bg-gradient-to-br from-[var(--card)] to-[var(--surface)] shadow-inner flex-1 min-h-[380px]">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10 animate-pulse-slow">
                <Sparkles size={36} className="text-[var(--accent)]" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[var(--secondary-accent)] animate-ping opacity-60" />
            </div>

            <div className="max-w-md space-y-2.5">
              <h3 className="text-xl font-bold text-[var(--text)] font-nav">
                Configure Your First Client Workspace
              </h3>
              <p className="text-sm text-[var(--secondary)] leading-relaxed">
                No active client workspace was detected in your Supabase database. Add your first client workspace to start uploading spreadsheets and monitoring delivery metrics.
              </p>
            </div>

            <button
              onClick={() => setNewClientOpen(true)}
              className="btn-primary tracking-wide text-xs px-5 py-3 rounded-2xl cursor-pointer"
            >
              <Plus size={14} />
              <span>Configure First Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* SLIDING DRAW PANEL: Add New Client directly from Dashboard */}
      {isNewClientOpen && (
        <>
          <button 
            onClick={() => setNewClientOpen(false)}
            className="drawer-overlay cursor-pointer"
            aria-label="Close modal"
            style={{ animation: 'drawer-overlay-fade 0.3s forwards' }}
          />
          <div 
            className="drawer-panel"
            style={{ animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />
            
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <Users className="text-[var(--accent)]" size={18} />
                <h3 className="text-base font-bold text-[var(--text)] font-nav">Add New Client Tab</h3>
              </div>
              <button 
                onClick={() => setNewClientOpen(false)}
                className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="drawer-body">
                <div className="space-y-1.5 p-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                    Client Details
                  </span>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Configure promised targets to establish campaign limits.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Client / Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Adidas Soccer"
                      required
                      className="input text-sm"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>

                  {/* Platforms Multiselect */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Enable Platforms
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['gmb', 'instagram', 'linkedin', 'twitter', 'youtube'].map((plat) => (
                        <label 
                          key={plat}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all",
                            newClientPlatforms.includes(plat)
                              ? "bg-[var(--accent-tint)] border-[var(--accent)] text-[var(--accent)]"
                              : "bg-[var(--card)] border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)]"
                          )}
                        >
                          <input 
                            type="checkbox"
                            className="sr-only"
                            checked={newClientPlatforms.includes(plat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewClientPlatforms([...newClientPlatforms, plat]);
                              } else {
                                if (newClientPlatforms.length > 1) {
                                  setNewClientPlatforms(newClientPlatforms.filter(p => p !== plat));
                                } else {
                                  addToast({ type: 'warning', title: 'Action Denied', message: 'At least one platform must be enabled.' });
                                }
                              }
                            }}
                          />
                          <span className="uppercase text-[9px]">{plat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {newClientPlatforms.includes('gmb') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Promised Google My Business (GMB) Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        required
                        value={newClientGmbPromised}
                        onChange={(e) => setNewClientGmbPromised(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  {newClientPlatforms.includes('instagram') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Promised Instagram Feed Posts Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        required
                        value={newClientIgPromised}
                        onChange={(e) => setNewClientIgPromised(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  {newClientPlatforms.includes('linkedin') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Promised LinkedIn Posts Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        required
                        value={newClientLinkedinPromised}
                        onChange={(e) => setNewClientLinkedinPromised(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  {newClientPlatforms.includes('twitter') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Promised Twitter Tweets Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        required
                        value={newClientTwitterPromised}
                        onChange={(e) => setNewClientTwitterPromised(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  {newClientPlatforms.includes('youtube') && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Promised YouTube Videos Total
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        required
                        value={newClientYoutubePromised}
                        onChange={(e) => setNewClientYoutubePromised(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  onClick={() => setNewClientOpen(false)}
                  className="flex-1 h-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] text-xs font-bold text-[var(--secondary)] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary h-12 text-xs rounded-2xl"
                >
                  Create Tab
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* GMB COLUMN MAPPER DRAWER */}
      <ImportDrawer
        isOpen={isGmbImportOpen}
        onClose={() => setGmbImportOpen(false)}
        columns={GMB_COLUMNS}
        onImport={handleImportGmb}
      />

      {/* INSTAGRAM COLUMN MAPPER DRAWER */}
      <ImportDrawer
        isOpen={isIgImportOpen}
        onClose={() => setIgImportOpen(false)}
        columns={INSTAGRAM_COLUMNS}
        onImport={handleImportIg}
      />

      {/* LINKEDIN REUSABLE IMPORT DRAWER */}
      <ImportDrawer
        isOpen={isLinkedinImportOpen}
        onClose={() => setLinkedinImportOpen(false)}
        columns={LINKEDIN_COLUMNS}
        onImport={handleImportLinkedin}
      />

      {/* TWITTER REUSABLE IMPORT DRAWER */}
      <ImportDrawer
        isOpen={isTwitterImportOpen}
        onClose={() => setTwitterImportOpen(false)}
        columns={TWITTER_COLUMNS}
        onImport={handleImportTwitter}
      />

      {/* YOUTUBE REUSABLE IMPORT DRAWER */}
      <ImportDrawer
        isOpen={isYoutubeImportOpen}
        onClose={() => setYoutubeImportOpen(false)}
        columns={YOUTUBE_COLUMNS}
        onImport={handleImportYoutube}
      />

      <style>{`
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.92;
          }
        }
      `}</style>
    </div>
  );
}
