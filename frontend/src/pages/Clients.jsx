import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useUiStore } from '../store/uiStore';
import { exportToCsv } from '../lib/exportUtils';
import ImportDrawer from '../components/shared/ImportDrawer';

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

import {
  Users,
  Plus,
  Settings,
  CheckCircle,
  Send,
  Globe,
  Instagram,
  ChevronRight,
  X,
  Sliders,
  Sparkles,
  Play,
  Upload,
  Bookmark,
  Trash2,
  ExternalLink,
  FileText,
  LayoutTemplate,
  Maximize2
} from 'lucide-react';

const DEFAULT_PAYLOADS = {
  gmb: JSON.stringify({ event: "{{event}}", clientId: "{{clientId}}", clientName: "{{clientName}}", postId: "{{postId}}", title: "{{title}}", summary: "{{summary}}", mediaurl: "{{mediaurl}}", media_items: "{{media_items}}" }, null, 2),
  ig: JSON.stringify({ event: "{{event}}", clientId: "{{clientId}}", clientName: "{{clientName}}", postId: "{{postId}}", caption: "{{caption}}", mediaurl: "{{mediaurl}}", media_items: "{{media_items}}" }, null, 2),
  linkedin: JSON.stringify({ event: "{{event}}", clientId: "{{clientId}}", clientName: "{{clientName}}", postId: "{{postId}}", title: "{{title}}", summary: "{{summary}}", mediaurl: "{{mediaurl}}", media_items: "{{media_items}}" }, null, 2),
  twitter: JSON.stringify({ event: "{{event}}", clientId: "{{clientId}}", clientName: "{{clientName}}", postId: "{{postId}}", tweet_text: "{{tweet_text}}", mediaurl: "{{mediaurl}}", media_items: "{{media_items}}" }, null, 2),
  youtube: JSON.stringify({ event: "{{event}}", clientId: "{{clientId}}", clientName: "{{clientName}}", postId: "{{postId}}", video_title: "{{video_title}}", description: "{{description}}", mediaurl: "{{mediaurl}}", media_items: "{{media_items}}" }, null, 2),
};

const PLATFORM_VARS = {
  gmb:      ['event', 'clientId', 'clientName', 'postId', 'title', 'summary', 'mediaurl', 'media_items'],
  ig:       ['event', 'clientId', 'clientName', 'postId', 'caption', 'mediaurl', 'media_items'],
  linkedin: ['event', 'clientId', 'clientName', 'postId', 'title', 'summary', 'mediaurl', 'media_items'],
  twitter:  ['event', 'clientId', 'clientName', 'postId', 'tweet_text', 'mediaurl', 'media_items'],
  youtube:  ['event', 'clientId', 'clientName', 'postId', 'video_title', 'description', 'mediaurl', 'media_items'],
};

function WebhookPayloadEditor({ platform, savedTemplate, onSave }) {
  const hasCustom = !!savedTemplate;
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState(hasCustom ? 'custom' : 'default');
  const [draft, setDraft] = React.useState(savedTemplate || DEFAULT_PAYLOADS[platform] || '{}');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setMode(savedTemplate ? 'custom' : 'default');
    setDraft(savedTemplate || DEFAULT_PAYLOADS[platform] || '{}');
  }, [savedTemplate, platform]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(platform, draft);
    setSaving(false);
  };

  const handleReset = async () => {
    setDraft(DEFAULT_PAYLOADS[platform]);
    setMode('default');
    await onSave(platform, null);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          background: hasCustom ? 'rgba(124,111,247,0.07)' : 'var(--surface)',
          border: hasCustom ? '1px solid rgba(124,111,247,0.3)' : '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: hasCustom ? 'var(--accent)' : 'var(--secondary)' }}>
          Payload Configuration{hasCustom ? ' · Custom' : ' · Default'}
        </span>
        <ChevronRight size={13} style={{ color: 'var(--muted)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {isOpen && (
        <div style={{ marginTop: 6, padding: '12px 14px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 10, background: 'var(--card)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
            {['default', 'custom'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  if (m === 'custom' && !draft) setDraft(DEFAULT_PAYLOADS[platform]);
                }}
                style={{
                  flex: 1, padding: '4px 0', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--secondary)', border: 'none',
                }}
              >
                {m === 'default' ? 'Default' : 'Custom Template'}
              </button>
            ))}
          </div>

          {mode === 'default' ? (
            <pre style={{
              fontSize: 10, lineHeight: 1.6, color: 'var(--secondary)', fontFamily: 'monospace',
              overflow: 'auto', maxHeight: 200, margin: 0, padding: '8px 10px',
              background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', whiteSpace: 'pre-wrap',
            }}>
              {DEFAULT_PAYLOADS[platform]}
            </pre>
          ) : (
            <>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                style={{
                  width: '100%', height: 160, fontFamily: 'monospace', fontSize: 10, lineHeight: 1.6,
                  background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 10px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
                placeholder='{ "event": "{{event}}", "data": "{{mediaurl}}" }'
                spellCheck={false}
              />
              <details style={{ marginTop: 6 }}>
                <summary style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none' }}>
                  Available variables →
                </summary>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {(PLATFORM_VARS[platform] || []).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDraft(d => d + `"{{${v}}}"` )}
                      title={`Insert {{${v}}}`}
                      style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                        background: 'var(--surface-strong)', color: 'var(--accent)',
                        border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'monospace',
                      }}
                    >
                      {'{{' + v + '}}'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                  {'Note: wrap array/object vars in quotes in your JSON — e.g. "{{media_items}}" becomes the actual array.'}
                </p>
              </details>
            </>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {mode === 'custom' && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: 'var(--accent)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save Template'}
              </button>
            )}
            {hasCustom && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  flex: mode === 'default' ? 1 : 0,
                  padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer',
                }}
              >
                Reset to Default
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { cn } from '../lib/utils';
import { useScrollLock } from '../hooks/useScrollLock';
import { authFetch, BACKEND_URL } from '../lib/api';

const MediaPreview = ({ url, className = "w-full h-full object-cover rounded-lg" }) => {
  const [isVideo, setIsVideo] = useState(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url || '') || url?.includes('/video'));

  if (!url) return null;

  if (isVideo) {
    return (
      <video src={url} className={className} autoPlay muted loop playsInline controls={false} />
    );
  }

  return (
    <img 
      src={url} 
      alt="Media Preview" 
      className={className} 
      onError={() => {
        setIsVideo(true);
      }}
    />
  );
};

export default function Clients() {
  const addToast = useUiStore((s) => s.addToast);
  
  // Core App States
  const [clients, setClients] = useState([]);
  const [activeClientId, setActiveClientId] = useState(null);
  const [activeClient, setActiveClient] = useState(null);
  
  const [subtab, setSubtab] = useState('gmb'); 
  const [loading, setLoading] = useState(true);
  
  // Platform Posts Lists
  const [gmbPosts, setGmbPosts] = useState([]);
  const [igPosts, setIgPosts] = useState([]);
  const [linkedinPosts, setLinkedinPosts] = useState([]);
  const [twitterPosts, setTwitterPosts] = useState([]);
  const [youtubePosts, setYoutubePosts] = useState([]);
  
  // New Client Drawer States
  const [isNewClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPlatforms, setNewClientPlatforms] = useState(['gmb', 'instagram']);
  const [newClientGmbPromised, setNewClientGmbPromised] = useState(10);
  const [newClientIgPromised, setNewClientIgPromised] = useState(15);
  const [newClientLinkedinPromised, setNewClientLinkedinPromised] = useState(10);
  const [newClientTwitterPromised, setNewClientTwitterPromised] = useState(15);
  const [newClientYoutubePromised, setNewClientYoutubePromised] = useState(5);
  
  // Client Settings Sidedrawer States
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('deliverables'); 
  const [activePlatforms, setActivePlatforms] = useState(['gmb', 'instagram']);
  
  const [editGmbPromised, setEditGmbPromised] = useState(10);
  const [editIgPromised, setEditIgPromised] = useState(15);
  const [editLinkedinPromised, setEditLinkedinPromised] = useState(10);
  const [editTwitterPromised, setEditTwitterPromised] = useState(15);
  const [editYoutubePromised, setEditYoutubePromised] = useState(5);
  const [editClientNotes, setEditClientNotes] = useState('');
  const [editClientActive, setEditClientActive] = useState(true);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [bookmarkPopupOpen, setBookmarkPopupOpen] = useState(false);
  const bookmarkPopupRef = React.useRef(null);

  // PM Folder
  const [pmFiles, setPmFiles] = useState([]);
  const [pmFrameFile, setPmFrameFile] = useState(null); // { name, url }
  
  // Webhook states
  const [gmbWebhookUrl, setGmbWebhookUrl] = useState('');
  const [gmbWebhookHeaders, setGmbWebhookHeaders] = useState('');
  const [gmbWebhookActive, setGmbWebhookActive] = useState(false);
  const [gmbPayloadTemplate, setGmbPayloadTemplate] = useState('');

  const [igWebhookUrl, setIgWebhookUrl] = useState('');
  const [igWebhookHeaders, setIgWebhookHeaders] = useState('');
  const [igWebhookActive, setIgWebhookActive] = useState(false);
  const [igPayloadTemplate, setIgPayloadTemplate] = useState('');

  const [linkedinWebhookUrl, setLinkedinWebhookUrl] = useState('');
  const [linkedinWebhookHeaders, setLinkedinWebhookHeaders] = useState('');
  const [linkedinWebhookActive, setLinkedinWebhookActive] = useState(false);
  const [linkedinPayloadTemplate, setLinkedinPayloadTemplate] = useState('');

  const [twitterWebhookUrl, setTwitterWebhookUrl] = useState('');
  const [twitterWebhookHeaders, setTwitterWebhookHeaders] = useState('');
  const [twitterWebhookActive, setTwitterWebhookActive] = useState(false);
  const [twitterPayloadTemplate, setTwitterPayloadTemplate] = useState('');

  const [youtubeWebhookUrl, setYoutubeWebhookUrl] = useState('');
  const [youtubeWebhookHeaders, setYoutubeWebhookHeaders] = useState('');
  const [youtubeWebhookActive, setYoutubeWebhookActive] = useState(false);
  const [youtubePayloadTemplate, setYoutubePayloadTemplate] = useState('');

  // New Post Insertion Form States
  const [newGmbTitle, setNewGmbTitle] = useState('');
  const [newGmbSummary, setNewGmbSummary] = useState('');
  const [newGmbMedia, setNewGmbMedia] = useState('');

  const [newIgCaption, setNewIgCaption] = useState('');
  const [newIgMedia, setNewIgMedia] = useState('');

  const [newLinkedinTitle, setNewLinkedinTitle] = useState('');
  const [newLinkedinSummary, setNewLinkedinSummary] = useState('');
  const [newLinkedinMedia, setNewLinkedinMedia] = useState('');

  const [newTwitterText, setNewTwitterText] = useState('');
  const [newTwitterMedia, setNewTwitterMedia] = useState('');

  const [newYoutubeTitle, setNewYoutubeTitle] = useState('');
  const [newYoutubeDesc, setNewYoutubeDesc] = useState('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');

  // Inline Row Editing States
  const [editingPostId, setEditingPostId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isEditDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editPlatform, setEditPlatform] = useState('');
  const [mediaHover, setMediaHover] = useState(null); // { url, x, y }

  useScrollLock(isSettingsOpen || isNewClientOpen || isEditDrawerOpen);

  // Import/Export drawer open states
  const [isGmbImportOpen, setGmbImportOpen] = useState(false);
  const [isIgImportOpen, setIgImportOpen] = useState(false);
  const [isLinkedinImportOpen, setLinkedinImportOpen] = useState(false);
  const [isTwitterImportOpen, setTwitterImportOpen] = useState(false);
  const [isYoutubeImportOpen, setYoutubeImportOpen] = useState(false);

  // Export handlers
  const handleExportData = () => {
    if (!activeClient) return;
    const clientSlug = activeClient.name.toLowerCase().replace(/\s+/g, '_');
    if (subtab === 'gmb') {
      exportToCsv(`${clientSlug}_gmb_schedule.csv`, GMB_COLUMNS, gmbPosts);
      addToast({ type: 'info', title: 'Export Complete', message: 'Downloaded GMB campaigns CSV.' });
    } else if (subtab === 'instagram') {
      exportToCsv(`${clientSlug}_instagram_feed.csv`, INSTAGRAM_COLUMNS, igPosts);
      addToast({ type: 'info', title: 'Export Complete', message: 'Downloaded Instagram feed CSV.' });
    } else if (subtab === 'linkedin') {
      exportToCsv(`${clientSlug}_linkedin_posts.csv`, LINKEDIN_COLUMNS, linkedinPosts);
      addToast({ type: 'info', title: 'Export Complete', message: 'Downloaded LinkedIn posts CSV.' });
    } else if (subtab === 'twitter') {
      exportToCsv(`${clientSlug}_twitter_tweets.csv`, TWITTER_COLUMNS, twitterPosts);
      addToast({ type: 'info', title: 'Export Complete', message: 'Downloaded Twitter posts CSV.' });
    } else if (subtab === 'youtube') {
      exportToCsv(`${clientSlug}_youtube_videos.csv`, YOUTUBE_COLUMNS, youtubePosts);
      addToast({ type: 'info', title: 'Export Complete', message: 'Downloaded YouTube videos CSV.' });
    }
  };

  const handleTriggerImport = () => {
    if (subtab === 'gmb') {
      setGmbImportOpen(true);
    } else if (subtab === 'instagram') {
      setIgImportOpen(true);
    } else if (subtab === 'linkedin') {
      setLinkedinImportOpen(true);
    } else if (subtab === 'twitter') {
      setTwitterImportOpen(true);
    } else if (subtab === 'youtube') {
      setYoutubeImportOpen(true);
    }
  };

  // Batch CSV mapped importers
  const handleImportGmb = async (mappedRows) => {
    if (mappedRows.length === 0) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.title || !row.title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/clients/${activeClientId}/gmb`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: row.title,
            summary: row.summary,
            mediaurl: row.mediaurl
          })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Successfully loaded ${count} rows to GMB.` });
      fetchPosts(activeClientId);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportIg = async (mappedRows) => {
    if (mappedRows.length === 0) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.caption || !row.caption.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/clients/${activeClientId}/instagram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption: row.caption,
            mediaurl: row.mediaurl
          })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Successfully loaded ${count} rows to Instagram.` });
      fetchPosts(activeClientId);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportLinkedin = async (mappedRows) => {
    if (mappedRows.length === 0) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.title || !row.title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/clients/${activeClientId}/linkedin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: row.title,
            summary: row.summary,
            mediaurl: row.mediaurl
          })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Successfully loaded ${count} rows to LinkedIn.` });
      fetchPosts(activeClientId);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportTwitter = async (mappedRows) => {
    if (mappedRows.length === 0) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.tweet_text || !row.tweet_text.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/clients/${activeClientId}/twitter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tweet_text: row.tweet_text,
            mediaurl: row.mediaurl
          })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Successfully loaded ${count} rows to Twitter.` });
      fetchPosts(activeClientId);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  const handleImportYoutube = async (mappedRows) => {
    if (mappedRows.length === 0) return;
    try {
      let count = 0;
      for (const row of mappedRows) {
        if (!row.video_title || !row.video_title.trim()) continue;
        const res = await authFetch(`${BACKEND_URL}/clients/${activeClientId}/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_title: row.video_title,
            description: row.description,
            video_url: row.video_url
          })
        });
        if (res.ok) count++;
      }
      addToast({ type: 'success', title: 'Import Complete', message: `Successfully loaded ${count} videos to YouTube.` });
      fetchPosts(activeClientId);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Import Failure', message: 'Failed to process CSV rows.' });
    }
  };

  // 1. Fetch Client headers on load
  const fetchClients = async (selectNewId = null) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`, {
        headers: {}
      });
      if (!res.ok) throw new Error("Failed to load clients.");
      const data = await res.json();
      const workspacesList = (data.workspaces || []).map(ws => ({
        id: ws.id,
        name: ws.client_name,
        client_name: ws.client_name,
        bucket: ws.bucket,
        active_platforms: ws.active_platforms,
        gmb_promised: ws.gmb_promised,
        instagram_promised: ws.instagram_promised,
        linkedin_promised: ws.linkedin_promised,
        twitter_promised: ws.twitter_promised,
        youtube_promised: ws.youtube_promised,
        gmb_webhook_url: ws.gmb_webhook_url,
        gmb_webhook_headers: ws.gmb_webhook_headers,
        gmb_webhook_active: ws.gmb_webhook_active,
        ig_webhook_url: ws.ig_webhook_url,
        ig_webhook_headers: ws.ig_webhook_headers,
        ig_webhook_active: ws.ig_webhook_active,
        linkedin_webhook_url: ws.linkedin_webhook_url,
        linkedin_webhook_headers: ws.linkedin_webhook_headers,
        linkedin_webhook_active: ws.linkedin_webhook_active,
        twitter_webhook_url: ws.twitter_webhook_url,
        twitter_webhook_headers: ws.twitter_webhook_headers,
        twitter_webhook_active: ws.twitter_webhook_active,
        youtube_webhook_url: ws.youtube_webhook_url,
        youtube_webhook_headers: ws.youtube_webhook_headers,
        youtube_webhook_active: ws.youtube_webhook_active,
        gmb_payload_template: ws.gmb_payload_template || '',
        ig_payload_template: ws.ig_payload_template || '',
        linkedin_payload_template: ws.linkedin_payload_template || '',
        twitter_payload_template: ws.twitter_payload_template || '',
        youtube_payload_template: ws.youtube_payload_template || '',
        client_notes: ws.client_notes,
        client_active: ws.client_active !== false
      }));
      setClients(workspacesList);
      
      if (workspacesList.length > 0) {
        const targetId = selectNewId || activeClientId || workspacesList[0].id;
        setActiveClientId(targetId);
        const match = workspacesList.find(c => c.id === targetId) || workspacesList[0];
        setActiveClient(match);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Database Fetch Error', message: 'Could not connect to Zata backend.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // 2. Refresh active client information & states
  useEffect(() => {
    if (activeClientId && clients.length > 0) {
      const match = clients.find(c => c.id === activeClientId);
      if (match) {
        setActiveClient(match);
        setEditGmbPromised(match.gmb_promised);
        setEditIgPromised(match.instagram_promised);
        setEditLinkedinPromised(match.linkedin_promised !== undefined ? match.linkedin_promised : 10);
        setEditTwitterPromised(match.twitter_promised !== undefined ? match.twitter_promised : 15);
        setEditYoutubePromised(match.youtube_promised !== undefined ? match.youtube_promised : 5);

        // Hydrate active platforms
        const platformsList = match.active_platforms ? match.active_platforms.split(',') : ['gmb', 'instagram'];
        setActivePlatforms(platformsList);
        if (!platformsList.includes(subtab)) {
          setSubtab(platformsList[0] || 'gmb');
        }

        setGmbWebhookUrl(match.gmb_webhook_url || '');
        setGmbWebhookHeaders(match.gmb_webhook_headers || '');
        setGmbWebhookActive(!!match.gmb_webhook_active);

        setIgWebhookUrl(match.ig_webhook_url || '');
        setIgWebhookHeaders(match.ig_webhook_headers || '');
        setIgWebhookActive(!!match.ig_webhook_active);

        setLinkedinWebhookUrl(match.linkedin_webhook_url || '');
        setLinkedinWebhookHeaders(match.linkedin_webhook_headers || '');
        setLinkedinWebhookActive(!!match.linkedin_webhook_active);

        setTwitterWebhookUrl(match.twitter_webhook_url || '');
        setTwitterWebhookHeaders(match.twitter_webhook_headers || '');
        setTwitterWebhookActive(!!match.twitter_webhook_active);

        setYoutubeWebhookUrl(match.youtube_webhook_url || '');
        setYoutubeWebhookHeaders(match.youtube_webhook_headers || '');
        setYoutubeWebhookActive(!!match.youtube_webhook_active);

        setGmbPayloadTemplate(match.gmb_payload_template || '');
        setIgPayloadTemplate(match.ig_payload_template || '');
        setLinkedinPayloadTemplate(match.linkedin_payload_template || '');
        setTwitterPayloadTemplate(match.twitter_payload_template || '');
        setYoutubePayloadTemplate(match.youtube_payload_template || '');

        setEditClientNotes(match.client_notes || '');
        setEditClientActive(match.client_active !== false);

        fetchPosts(activeClientId);
        fetchBookmarks(activeClientId);
        fetchPmFiles(activeClientId);
      }
    }
  }, [activeClientId, clients]);

  // 3. Fetch Posts for active client
  const fetchPosts = async (clientId) => {
    try {
      const [gmbRes, igRes, liRes, twRes, ytRes] = await Promise.all([
        authFetch(`${BACKEND_URL}/workspace/${clientId}/gmb`, { headers: {} }),
        authFetch(`${BACKEND_URL}/workspace/${clientId}/instagram`, { headers: {} }),
        authFetch(`${BACKEND_URL}/workspace/${clientId}/linkedin`, { headers: {} }),
        authFetch(`${BACKEND_URL}/workspace/${clientId}/twitter`, { headers: {} }),
        authFetch(`${BACKEND_URL}/workspace/${clientId}/youtube`, { headers: {} })
      ]);
      
      if (gmbRes.ok) setGmbPosts(await gmbRes.json());
      if (igRes.ok) setIgPosts(await igRes.json());
      if (liRes.ok) setLinkedinPosts(await liRes.json());
      if (twRes.ok) setTwitterPosts(await twRes.json());
      if (ytRes.ok) setYoutubePosts(await ytRes.json());
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const fetchBookmarks = async (clientId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${clientId}/bookmarks`, {
        headers: {}
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const handleAddBookmark = async () => {
    if (!newBookmarkName.trim() || !newBookmarkUrl.trim()) {
      addToast({ type: 'warning', title: 'Input Required', message: 'Both name and URL are required.' });
      return;
    }
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBookmarkName.trim(), url: newBookmarkUrl.trim() })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookmarks(prev => [...prev, data.bookmark]);
      setNewBookmarkName('');
      setNewBookmarkUrl('');
      setBookmarkPopupOpen(false);
      addToast({ type: 'success', title: 'Bookmark Added', message: `"${data.bookmark.name}" saved.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed', message: 'Could not save bookmark.' });
    }
  };

  const fetchPmFiles = async (clientId) => {
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${clientId}/pm-files`, {
        headers: {}
      });
      if (res.ok) {
        const data = await res.json();
        setPmFiles(data.files || []);
      }
    } catch (err) {
      console.error("Error fetching PM files:", err);
    }
  };

  const handleDeleteBookmark = async (id) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    try {
      const res = await authFetch(`${BACKEND_URL}/bookmark/${id}`, {
        method: 'DELETE',
        headers: {}
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      console.error(err);
      fetchBookmarks(activeClientId);
      addToast({ type: 'error', title: 'Failed', message: 'Could not delete bookmark.' });
    }
  };

  // 4. Create new client tab
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    
    try {
      // Step 1: Create workspace in Zata
      const createRes = await authFetch(`${BACKEND_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newClientName.trim()
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        addToast({ type: 'error', title: 'Submission Denied', message: createData.error || 'Failed to add client.' });
        return;
      }

      const createdWs = createData.workspace;

      // Step 2: Configure deliverables on the new workspace
      const patchRes = await authFetch(`${BACKEND_URL}/workspace/${createdWs.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_platforms: newClientPlatforms.join(','),
          gmb_promised: newClientGmbPromised,
          instagram_promised: newClientIgPromised,
          linkedin_promised: newClientLinkedinPromised,
          twitter_promised: newClientTwitterPromised,
          youtube_promised: newClientYoutubePromised
        })
      });

      const data = await patchRes.json();
      const updatedWs = data.workspace || createdWs;
      const finalName = newClientName.trim();

      addToast({ type: 'success', title: 'Client Created', message: `Workspace for "${finalName}" is ready.` });
      setNewClientName('');
      setNewClientOpen(false);
      fetchClients(updatedWs?.id || createdWs?.id);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'System Failure', message: 'Could not connect to database.' });
    }
  };

  // 5. Update Promised Deliverables in Database
  const handleUpdateDeliverables = async (e) => {
    e.preventDefault();
    if (!activeClient) return;

    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_platforms: activePlatforms.join(','),
          gmb_promised: editGmbPromised,
          instagram_promised: editIgPromised,
          linkedin_promised: editLinkedinPromised,
          twitter_promised: editTwitterPromised,
          youtube_promised: editYoutubePromised,
          gmb_webhook_url: gmbWebhookUrl,
          gmb_webhook_headers: gmbWebhookHeaders,
          gmb_webhook_active: gmbWebhookActive,
          ig_webhook_url: igWebhookUrl,
          ig_webhook_headers: igWebhookHeaders,
          ig_webhook_active: igWebhookActive,
          linkedin_webhook_url: linkedinWebhookUrl,
          linkedin_webhook_headers: linkedinWebhookHeaders,
          linkedin_webhook_active: linkedinWebhookActive,
          twitter_webhook_url: twitterWebhookUrl,
          twitter_webhook_headers: twitterWebhookHeaders,
          twitter_webhook_active: twitterWebhookActive,
          youtube_webhook_url: youtubeWebhookUrl,
          youtube_webhook_headers: youtubeWebhookHeaders,
          youtube_webhook_active: youtubeWebhookActive,
          client_notes: editClientNotes,
          client_active: editClientActive
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      addToast({ type: 'success', title: 'Config Saved', message: `Updated configuration settings for "${data.workspace.client_name}"` });
      setSettingsOpen(false);
      fetchClients(activeClient.id);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Failed to Save', message: 'Could not update workspace configuration.' });
    }
  };

  // 5b. Test Webhook Connection Ping (server-proxied so headers + JSON are sent correctly)
  const handleTestConnection = async (platform) => {
    const urlMap = { gmb: gmbWebhookUrl, ig: igWebhookUrl, linkedin: linkedinWebhookUrl, twitter: twitterWebhookUrl, youtube: youtubeWebhookUrl };
    const headersMap = { gmb: gmbWebhookHeaders, ig: igWebhookHeaders, linkedin: linkedinWebhookHeaders, twitter: twitterWebhookHeaders, youtube: youtubeWebhookHeaders };
    const url = urlMap[platform] || '';
    const headersStr = headersMap[platform] || '';

    if (!url.trim()) {
      addToast({ type: 'warning', title: 'URL Required', message: `Enter a ${platform.toUpperCase()} Webhook URL first.` });
      return;
    }

    addToast({ type: 'info', title: 'Pinging…', message: `Sending test payload to ${platform.toUpperCase()} webhook via server.` });

    try {
      const res = await authFetch(`${BACKEND_URL}/webhook-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          customHeaders: headersStr.trim() || null,
          platform,
          workspace_id: activeClient?.id || null,
        })
      });

      const data = await res.json().catch(() => ({}));

      if (data.success) {
        addToast({ type: 'success', title: `Ping OK — HTTP ${data.status}`, message: 'Your automation platform should have received the test event.' });
      } else if (res.ok) {
        addToast({ type: 'warning', title: `HTTP ${data.status}`, message: data.response ? data.response.slice(0, 120) : 'Webhook returned a non-2xx status.' });
      } else {
        addToast({ type: 'error', title: 'Ping Failed', message: data.error || 'Server could not reach the webhook URL.' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Test Failed', message: 'Could not reach backend.' });
    }
  };

  // 5c. Save payload template for a platform
  const handleSavePayloadTemplate = async (platform, template) => {
    if (!activeClient) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClient.id}/webhook-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, payload_template: template || null })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        addToast({ type: 'error', title: 'Save Failed', message: data.error || 'Could not save payload template.' });
        return;
      }
      const setters = { gmb: setGmbPayloadTemplate, ig: setIgPayloadTemplate, linkedin: setLinkedinPayloadTemplate, twitter: setTwitterPayloadTemplate, youtube: setYoutubePayloadTemplate };
      if (setters[platform]) setters[platform](template || '');
      addToast({ type: 'success', title: 'Template Saved', message: `${platform.toUpperCase()} payload template ${template ? 'updated' : 'reset to default'}.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Save Failed', message: 'Could not connect to server.' });
    }
  };

  // ─── Optimistic helper ──────────────────────────────────────────────────────
  const updatePlatformPost = (platform, postId, patch) => {
    const setter = { gmb: setGmbPosts, instagram: setIgPosts, linkedin: setLinkedinPosts, twitter: setTwitterPosts, youtube: setYoutubePosts }[platform];
    if (setter) setter(prev => prev.map(p => p.id === postId ? { ...p, ...patch } : p));
  };

  // Inline post row adders — optimistic: temp row shown immediately, replaced on success
  const handleAddGmbRow = async (e) => {
    e.preventDefault();
    if (!newGmbTitle.trim()) return;
    const tempId = `__temp__${Date.now()}`;
    const tempPost = { id: tempId, title: newGmbTitle.trim(), summary: newGmbSummary.trim(), mediaurl: newGmbMedia.trim(), status: 'ready', __saving: true };
    setGmbPosts(prev => [tempPost, ...prev]);
    setNewGmbTitle(''); setNewGmbSummary(''); setNewGmbMedia('');
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/gmb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tempPost.title, summary: tempPost.summary, mediaurl: tempPost.mediaurl })
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setGmbPosts(prev => prev.map(p => p.id === tempId ? newPost : p));
      addToast({ type: 'success', title: 'Row Scheduled', message: 'Added new GMB campaign row.' });
    } catch (err) {
      console.error(err);
      setGmbPosts(prev => prev.filter(p => p.id !== tempId));
      addToast({ type: 'error', title: 'Error', message: 'Could not save GMB row.' });
    }
  };

  const handleAddIgRow = async (e) => {
    e.preventDefault();
    if (!newIgCaption.trim()) return;
    const tempId = `__temp__${Date.now()}`;
    const tempPost = { id: tempId, caption: newIgCaption.trim(), mediaurl: newIgMedia.trim(), status: 'ready', __saving: true };
    setIgPosts(prev => [tempPost, ...prev]);
    setNewIgCaption(''); setNewIgMedia('');
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/instagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: tempPost.caption, mediaurl: tempPost.mediaurl })
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setIgPosts(prev => prev.map(p => p.id === tempId ? newPost : p));
      addToast({ type: 'success', title: 'Row Scheduled', message: 'Added new Instagram post row.' });
    } catch (err) {
      console.error(err);
      setIgPosts(prev => prev.filter(p => p.id !== tempId));
      addToast({ type: 'error', title: 'Error', message: 'Could not save Instagram row.' });
    }
  };

  const handleAddLinkedinRow = async (e) => {
    e.preventDefault();
    if (!newLinkedinTitle.trim()) return;
    const tempId = `__temp__${Date.now()}`;
    const tempPost = { id: tempId, title: newLinkedinTitle.trim(), summary: newLinkedinSummary.trim(), mediaurl: newLinkedinMedia.trim(), status: 'ready', __saving: true };
    setLinkedinPosts(prev => [tempPost, ...prev]);
    setNewLinkedinTitle(''); setNewLinkedinSummary(''); setNewLinkedinMedia('');
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tempPost.title, summary: tempPost.summary, mediaurl: tempPost.mediaurl })
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setLinkedinPosts(prev => prev.map(p => p.id === tempId ? newPost : p));
      addToast({ type: 'success', title: 'Row Scheduled', message: 'Added new LinkedIn post row successfully.' });
    } catch (err) {
      console.error(err);
      setLinkedinPosts(prev => prev.filter(p => p.id !== tempId));
      addToast({ type: 'error', title: 'Error', message: 'Could not save LinkedIn row.' });
    }
  };

  const handleAddTwitterRow = async (e) => {
    e.preventDefault();
    if (!newTwitterText.trim()) return;
    const tempId = `__temp__${Date.now()}`;
    const tempPost = { id: tempId, tweet_text: newTwitterText.trim(), mediaurl: newTwitterMedia.trim(), status: 'ready', __saving: true };
    setTwitterPosts(prev => [tempPost, ...prev]);
    setNewTwitterText(''); setNewTwitterMedia('');
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/twitter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet_text: tempPost.tweet_text, mediaurl: tempPost.mediaurl })
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setTwitterPosts(prev => prev.map(p => p.id === tempId ? newPost : p));
      addToast({ type: 'success', title: 'Row Scheduled', message: 'Added new Twitter post row successfully.' });
    } catch (err) {
      console.error(err);
      setTwitterPosts(prev => prev.filter(p => p.id !== tempId));
      addToast({ type: 'error', title: 'Error', message: 'Could not save Twitter row.' });
    }
  };

  const handleAddYoutubeRow = async (e) => {
    e.preventDefault();
    if (!newYoutubeTitle.trim()) return;
    const tempId = `__temp__${Date.now()}`;
    const tempPost = { id: tempId, video_title: newYoutubeTitle.trim(), description: newYoutubeDesc.trim(), video_url: newYoutubeUrl.trim(), status: 'ready', __saving: true };
    setYoutubePosts(prev => [tempPost, ...prev]);
    setNewYoutubeTitle(''); setNewYoutubeDesc(''); setNewYoutubeUrl('');
    try {
      const res = await authFetch(`${BACKEND_URL}/workspace/${activeClientId}/youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_title: tempPost.video_title, description: tempPost.description, video_url: tempPost.video_url })
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setYoutubePosts(prev => prev.map(p => p.id === tempId ? newPost : p));
      addToast({ type: 'success', title: 'Row Scheduled', message: 'Added new YouTube video row successfully.' });
    } catch (err) {
      console.error(err);
      setYoutubePosts(prev => prev.filter(p => p.id !== tempId));
      addToast({ type: 'error', title: 'Error', message: 'Could not save YouTube row.' });
    }
  };

  // ─── Status publisher pings — optimistic: flip to posted instantly, rollback on error ───
  const handlePublishGmb = async (postId) => {
    const prev = gmbPosts.find(p => p.id === postId);
    updatePlatformPost('gmb', postId, { status: 'posted' });
    try {
      const res = await authFetch(`${BACKEND_URL}/gmb/${postId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost('gmb', postId, updated);
      addToast({ type: 'success', title: 'Campaign Published', message: 'GMB campaign status flipped to posted.' });
    } catch (err) {
      console.error(err);
      if (prev) updatePlatformPost('gmb', postId, { status: prev.status });
      addToast({ type: 'error', title: 'Publish Error', message: 'Could not post GMB item.' });
    }
  };

  const handlePublishIg = async (postId) => {
    const prev = igPosts.find(p => p.id === postId);
    updatePlatformPost('instagram', postId, { status: 'posted' });
    try {
      const res = await authFetch(`${BACKEND_URL}/instagram/${postId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost('instagram', postId, updated);
      addToast({ type: 'success', title: 'Campaign Published', message: 'Instagram post status flipped to posted.' });
    } catch (err) {
      console.error(err);
      if (prev) updatePlatformPost('instagram', postId, { status: prev.status });
      addToast({ type: 'error', title: 'Publish Error', message: 'Could not post Instagram item.' });
    }
  };

  const handlePublishLinkedin = async (postId) => {
    const prev = linkedinPosts.find(p => p.id === postId);
    updatePlatformPost('linkedin', postId, { status: 'posted' });
    try {
      const res = await authFetch(`${BACKEND_URL}/linkedin/${postId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost('linkedin', postId, updated);
      addToast({ type: 'success', title: 'Post Published', message: 'LinkedIn post status flipped to posted.' });
    } catch (err) {
      console.error(err);
      if (prev) updatePlatformPost('linkedin', postId, { status: prev.status });
      addToast({ type: 'error', title: 'Publish Error', message: 'Could not post LinkedIn item.' });
    }
  };

  const handlePublishTwitter = async (postId) => {
    const prev = twitterPosts.find(p => p.id === postId);
    updatePlatformPost('twitter', postId, { status: 'posted' });
    try {
      const res = await authFetch(`${BACKEND_URL}/twitter/${postId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost('twitter', postId, updated);
      addToast({ type: 'success', title: 'Tweet Published', message: 'Twitter status flipped to posted.' });
    } catch (err) {
      console.error(err);
      if (prev) updatePlatformPost('twitter', postId, { status: prev.status });
      addToast({ type: 'error', title: 'Publish Error', message: 'Could not post Tweet.' });
    }
  };

  const handlePublishYoutube = async (postId) => {
    const prev = youtubePosts.find(p => p.id === postId);
    updatePlatformPost('youtube', postId, { status: 'posted' });
    try {
      const res = await authFetch(`${BACKEND_URL}/youtube/${postId}/status`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost('youtube', postId, updated);
      addToast({ type: 'success', title: 'Video Published', message: 'YouTube video flipped to posted.' });
    } catch (err) {
      console.error(err);
      if (prev) updatePlatformPost('youtube', postId, { status: prev.status });
      addToast({ type: 'error', title: 'Publish Error', message: 'Could not post YouTube video.' });
    }
  };

  const handleStatusChange = async (platform, postId, newStatus) => {
    // Validation for Approved status
    if (newStatus === 'approved') {
      let isValid = false;
      let msg = '';
      const posts = { gmb: gmbPosts, instagram: igPosts, linkedin: linkedinPosts, twitter: twitterPosts, youtube: youtubePosts }[platform] || [];
      const post = posts.find(p => p.id === postId);
      if (platform === 'gmb' || platform === 'linkedin') {
        isValid = !!(post && post.title?.trim() && post.summary?.trim() && post.mediaurl?.trim());
        msg = 'Title, Summary, and Media URL must all be filled.';
      } else if (platform === 'instagram') {
        isValid = !!(post && post.caption?.trim() && post.mediaurl?.trim());
        msg = 'Caption and Media URL must be filled.';
      } else if (platform === 'twitter') {
        isValid = !!(post && post.tweet_text?.trim() && post.mediaurl?.trim());
        msg = 'Tweet Text and Media URL must be filled.';
      } else if (platform === 'youtube') {
        isValid = !!(post && post.video_title?.trim() && post.description?.trim() && post.video_url?.trim());
        msg = 'Video Title, Description, and Video URL must all be filled.';
      }
      if (!isValid) {
        addToast({ type: 'warning', title: 'Cannot Approve', message: msg });
        return;
      }
    }

    if (newStatus === 'posted') {
      if (platform === 'gmb') handlePublishGmb(postId);
      else if (platform === 'instagram') handlePublishIg(postId);
      else if (platform === 'linkedin') handlePublishLinkedin(postId);
      else if (platform === 'twitter') handlePublishTwitter(postId);
      else if (platform === 'youtube') handlePublishYoutube(postId);
      return;
    }

    // ── Optimistic status update ──────────────────────────────────────────────
    const posts = { gmb: gmbPosts, instagram: igPosts, linkedin: linkedinPosts, twitter: twitterPosts, youtube: youtubePosts }[platform] || [];
    const prevPost = posts.find(p => p.id === postId);
    updatePlatformPost(platform, postId, { status: newStatus });

    try {
      const res = await authFetch(`${BACKEND_URL}/${platform}/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost(platform, postId, updated);
    } catch (err) {
      console.error(err);
      if (prevPost) updatePlatformPost(platform, postId, { status: prevPost.status });
      addToast({ type: 'error', title: 'Update Error', message: 'Could not change status.' });
    }
  };

  const handleSaveEdit = async (platform, postId) => {
    let body = {};
    if (platform === 'gmb' || platform === 'linkedin') {
      if (!editForm.title?.trim()) {
        addToast({ type: 'warning', title: 'Input Required', message: 'Title is required.' });
        return;
      }
      body = {
        title: editForm.title.trim(),
        summary: editForm.summary?.trim() || '',
        mediaurl: editForm.mediaurl?.trim() || ''
      };
    } else if (platform === 'instagram') {
      if (!editForm.caption?.trim()) {
        addToast({ type: 'warning', title: 'Input Required', message: 'Caption is required.' });
        return;
      }
      body = {
        caption: editForm.caption.trim(),
        mediaurl: editForm.mediaurl?.trim() || ''
      };
    } else if (platform === 'twitter') {
      if (!editForm.tweet_text?.trim()) {
        addToast({ type: 'warning', title: 'Input Required', message: 'Tweet Text is required.' });
        return;
      }
      body = {
        tweet_text: editForm.tweet_text.trim(),
        mediaurl: editForm.mediaurl?.trim() || ''
      };
    } else if (platform === 'youtube') {
      if (!editForm.video_title?.trim()) {
        addToast({ type: 'warning', title: 'Input Required', message: 'Video Title is required.' });
        return;
      }
      body = {
        video_title: editForm.video_title.trim(),
        description: editForm.description?.trim() || '',
        video_url: editForm.video_url?.trim() || ''
      };
    }

    let originalPost = null;
    if (platform === 'gmb') originalPost = gmbPosts.find(p => p.id === postId);
    else if (platform === 'instagram') originalPost = igPosts.find(p => p.id === postId);
    else if (platform === 'linkedin') originalPost = linkedinPosts.find(p => p.id === postId);
    else if (platform === 'twitter') originalPost = twitterPosts.find(p => p.id === postId);
    else if (platform === 'youtube') originalPost = youtubePosts.find(p => p.id === postId);

    const statusChanged = originalPost && editForm.status && editForm.status !== originalPost.status;

    // ── Optimistic edit update — close drawer & apply immediately ────────────
    updatePlatformPost(platform, postId, { ...body, ...(editForm.status ? { status: editForm.status } : {}) });
    setEditingPostId(null);
    setEditDrawerOpen(false);

    try {
      const res = await authFetch(`${BACKEND_URL}/${platform}/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      updatePlatformPost(platform, postId, updated);

      addToast({ type: 'success', title: 'Row Saved', message: 'Changes successfully committed to database.' });

      if (statusChanged) {
        await handleStatusChange(platform, postId, editForm.status);
      }
    } catch (err) {
      console.error(err);
      if (originalPost) updatePlatformPost(platform, postId, originalPost);
      addToast({ type: 'error', title: 'Save Error', message: 'Could not update record.' });
    }
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

  // Pre-calculations for targets widgets
  const gmbTotal = gmbPosts.length;
  const gmbPromised = activeClient ? activeClient.gmb_promised : 10;
  const gmbPercent = Math.min(Math.round((gmbTotal / gmbPromised) * 100), 100);

  const igTotal = igPosts.length;
  const igPromised = activeClient ? activeClient.instagram_promised : 15;
  const igPercent = Math.min(Math.round((igTotal / igPromised) * 100), 100);

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      
      {/* Header with tabs */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold text-[var(--text)] font-nav tracking-tight leading-tight">
              Clients Module
            </h1>
            <p className="mt-1 text-sm text-[var(--secondary)]">
              Real-time campaign status pipelines securely integrated with Supabase PostgreSQL.
            </p>
          </div>
        </div>

        {/* Dynamic Client Header Tabs (Browser Style) */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-0 select-none shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {clients
              .filter(c => c.client_active !== false)
              .map((client) => (
                <button
                  key={client.id}
                  onClick={() => setActiveClientId(client.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-xs font-bold font-nav rounded-t-2xl border-t border-x transition-all duration-200 shrink-0 cursor-pointer",
                    activeClientId === client.id
                      ? "bg-[var(--card)] border-[var(--border)] text-[var(--accent)] relative -mb-[1px] shadow-sm"
                      : "bg-transparent border-transparent text-[var(--secondary)] hover:text-[var(--text)]"
                  )}
                >
                  <Users size={13} />
                  <span>{client.name}</span>
                </button>
              ))}

            {/* New Tab Button */}
            <button
              onClick={() => setNewClientOpen(true)}
              className="flex items-center justify-center p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-strong)] transition-all cursor-pointer shadow-sm ml-2 mb-1.5"
              title="Create Client Workspace"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Settings Button on the right side of the tabs bar! */}
          {activeClient && (
            <button
              onClick={() => {
                setSettingsOpen(true);
                setActiveTab('deliverables');
              }}
              className="flex items-center justify-center p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-strong)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-sm mb-1.5 mr-1"
              title={`Configure promised tools & Webhooks for ${activeClient.name}`}
            >
              <Settings size={15} />
            </button>
          )}
        </div>
      </div>

      {activeClient ? (
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Deliverables statistics progress cards row */}
          <div className="responsive-cards shrink-0">
            
            {/* GMB Delivery Card */}
            {activePlatforms.includes('gmb') && (
              <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      GMB Promised Deliveries
                    </span>
                    <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">
                      {gmbTotal} / <span className="text-[var(--muted)]">{gmbPromised}</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10">
                    <Globe size={18} />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--secondary)]">Campaigns Ready</span>
                    <span className="font-bold text-[var(--accent)]">{gmbPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
                      style={{ width: `${gmbPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Instagram Delivery Card */}
            {activePlatforms.includes('instagram') && (
              <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Instagram Promised Deliveries
                    </span>
                    <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">
                      {igTotal} / <span className="text-[var(--muted)]">{igPromised}</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[var(--secondary-accent-tint)] flex items-center justify-center text-[var(--secondary-accent)] border border-[var(--secondary-accent)]/10">
                    <Instagram size={18} />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--secondary)]">Feed Posts Scheduled</span>
                    <span className="font-bold text-[var(--secondary-accent)]">{igPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[var(--secondary-accent)] transition-all duration-500 ease-out"
                      style={{ width: `${igPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn Delivery Card */}
            {activePlatforms.includes('linkedin') && (
              <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      LinkedIn Promised Deliveries
                    </span>
                    <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">
                      {linkedinPosts.length} / <span className="text-[var(--muted)]">{activeClient.linkedin_promised || 10}</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <Globe size={18} className="text-blue-500" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--secondary)]">Posts Ready</span>
                    <span className="font-bold text-blue-500">
                      {Math.min(Math.round((linkedinPosts.length / (activeClient.linkedin_promised || 10)) * 100), 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(Math.round((linkedinPosts.length / (activeClient.linkedin_promised || 10)) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Twitter Delivery Card */}
            {activePlatforms.includes('twitter') && (
              <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Twitter Promised Deliveries
                    </span>
                    <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">
                      {twitterPosts.length} / <span className="text-[var(--muted)]">{activeClient.twitter_promised || 15}</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gray-500/10 flex items-center justify-center text-[var(--text)] border border-[var(--border)]">
                    <Sparkles size={18} className="text-gray-400" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--secondary)]">Tweets Queued</span>
                    <span className="font-bold text-[var(--text)]">
                      {Math.min(Math.round((twitterPosts.length / (activeClient.twitter_promised || 15)) * 100), 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[var(--text)] transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(Math.round((twitterPosts.length / (activeClient.twitter_promised || 15)) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Delivery Card */}
            {activePlatforms.includes('youtube') && (
              <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      YouTube Promised Deliveries
                    </span>
                    <h3 className="text-2xl font-black text-[var(--text)] leading-none font-nav">
                      {youtubePosts.length} / <span className="text-[var(--muted)]">{activeClient.youtube_promised || 5}</span>
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
                    <Play size={18} className="text-red-500" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--secondary)]">Videos Mapped</span>
                    <span className="font-bold text-red-500">
                      {Math.min(Math.round((youtubePosts.length / (activeClient.youtube_promised || 5)) * 100), 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-red-500 transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(Math.round((youtubePosts.length / (activeClient.youtube_promised || 5)) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}



            {/* API Integrations Status Card */}
            <div className="card p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                    API Webhook Status
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text)] font-nav leading-snug mt-1">
                    API Integrations
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/10">
                  <Sliders size={18} />
                </div>
              </div>

              {/* Status indicators */}
              <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {activePlatforms.map((plat) => {
                  let isActive = false;
                  if (plat === 'gmb') isActive = gmbWebhookActive;
                  else if (plat === 'instagram') isActive = igWebhookActive;
                  else if (plat === 'linkedin') isActive = linkedinWebhookActive;
                  else if (plat === 'twitter') isActive = twitterWebhookActive;
                  else if (plat === 'youtube') isActive = youtubeWebhookActive;

                  return (
                    <div key={plat} className="flex items-center justify-between text-xs border-b border-[var(--border)] pb-1.5 last:border-b-0">
                      <span className="font-semibold text-[var(--text)] uppercase text-[10px]">{plat} Webhook</span>
                      {isActive ? (
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Active</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">Inactive</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSettingsOpen(true);
                  setActiveTab('webhooks');
                }}
                className="btn-primary w-full text-xs h-10 rounded-xl mt-4 shrink-0 shadow-sm"
              >
                <Settings size={14} />
                <span>Configure Webhooks</span>
              </button>
            </div>
          </div>

          {/* PM Folder Viewer */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-3 px-1">
              <LayoutTemplate size={13} className="text-violet-500" />
              <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">PM Documents</span>
              {pmFiles.length > 0 && (
                <span className="text-[10px] font-bold bg-violet-500/10 text-violet-500 px-1.5 py-0.5 rounded-full leading-none">{pmFiles.length}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {pmFiles.length === 0 ? (
                <span className="text-[11px] text-[var(--muted)] italic px-1">No documents yet — upload HTML files to the PM folder in this workspace.</span>
              ) : (
                pmFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setPmFrameFile(file)}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer text-left"
                  >
                    <FileText size={13} className="text-violet-400 shrink-0" />
                    <span className="text-xs font-semibold text-[var(--text)] group-hover:text-violet-600 max-w-[180px] truncate">
                      {file.name}
                    </span>
                    <Maximize2 size={10} className="text-[var(--muted)] group-hover:text-violet-400 ml-auto shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* PM HTML Iframe Viewer Drawer */}
          {pmFrameFile && (
            <div className="fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="flex-1 bg-black/40 backdrop-blur-sm"
                onClick={() => setPmFrameFile(null)}
              />
              {/* Drawer panel */}
              <div className="w-[72vw] max-w-5xl h-full bg-[var(--card)] border-l border-[var(--border)] flex flex-col shadow-2xl">
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      <FileText size={13} className="text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-[var(--text)] truncate">{pmFrameFile.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">PM Document · {activeClient?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={pmFrameFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                    >
                      <ExternalLink size={12} />
                      <span>Open</span>
                    </a>
                    <button
                      onClick={() => setPmFrameFile(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
                {/* Iframe */}
                <div className="flex-1 overflow-hidden">
                  <iframe
                    key={pmFrameFile.id}
                    src={pmFrameFile.url}
                    className="w-full h-full border-0"
                    title={pmFrameFile.name}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bookmarks Section */}
          <div className="flex items-center gap-3 px-1 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <Bookmark size={13} className="text-[var(--accent)]" />
              <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded-full leading-none">
                  {bookmarks.length}
                </span>
              )}
            </div>

            {bookmarks.length === 0 && (
              <span className="text-[11px] text-[var(--muted)] italic">No bookmarks yet.</span>
            )}

            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] transition-all"
              >
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                >
                  <ExternalLink size={10} className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)]" />
                  <span>{bm.name}</span>
                </a>
                <button
                  onClick={() => handleDeleteBookmark(bm.id)}
                  className="ml-0.5 opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-500 transition-all cursor-pointer"
                  title="Remove"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Add bookmark "+" button + popup */}
            <div className="relative" ref={bookmarkPopupRef}>
              <button
                onClick={() => setBookmarkPopupOpen(v => !v)}
                className="flex items-center justify-center w-7 h-7 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)] transition-all cursor-pointer"
                title="Add bookmark"
              >
                <Plus size={13} />
              </button>

              {bookmarkPopupOpen && (
                <>
                  {/* Click-outside overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setBookmarkPopupOpen(false);
                      setNewBookmarkName('');
                      setNewBookmarkUrl('');
                    }}
                  />
                  <div className="absolute left-0 top-9 z-50 w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-4 flex flex-col gap-3">
                    <p className="text-xs font-extrabold text-[var(--text)] tracking-wide">Add Bookmark</p>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Name (e.g. Google Ads)"
                      value={newBookmarkName}
                      onChange={(e) => setNewBookmarkName(e.target.value)}
                      className="input w-full text-xs h-8 px-3"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
                    />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newBookmarkUrl}
                      onChange={(e) => setNewBookmarkUrl(e.target.value)}
                      className="input w-full text-xs h-8 px-3"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddBookmark}
                        className="btn-primary flex-1 h-8 text-xs rounded-xl"
                      >
                        <Bookmark size={12} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setBookmarkPopupOpen(false);
                          setNewBookmarkName('');
                          setNewBookmarkUrl('');
                        }}
                        className="h-8 px-3 text-xs rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subtab Selectors (GMB vs Instagram vs LinkedIn etc. views) */}
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 gap-4 shrink-0 select-none">
            <div className="flex gap-2 overflow-x-auto scrollbar-none max-w-[70%]">
              {activePlatforms.includes('gmb') && (
                <button
                  onClick={() => setSubtab('gmb')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                    subtab === 'gmb'
                      ? "bg-[var(--accent-tint)] text-[var(--accent)]"
                      : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )}
                >
                  <Globe size={14} />
                  <span>GMB Schedule</span>
                </button>
              )}
              {activePlatforms.includes('instagram') && (
                <button
                  onClick={() => setSubtab('instagram')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                    subtab === 'instagram'
                      ? "bg-[var(--secondary-accent-tint)] text-[var(--secondary-accent)]"
                      : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )}
                >
                  <Instagram size={14} />
                  <span>Instagram Feed</span>
                </button>
              )}
              {activePlatforms.includes('linkedin') && (
                <button
                  onClick={() => setSubtab('linkedin')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                    subtab === 'linkedin'
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )}
                >
                  <Globe size={14} className="text-blue-500" />
                  <span>LinkedIn Posts</span>
                </button>
              )}
              {activePlatforms.includes('twitter') && (
                <button
                  onClick={() => setSubtab('twitter')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                    subtab === 'twitter'
                      ? "bg-[var(--surface-strong)] text-[var(--text)]"
                      : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )}
                >
                  <Sparkles size={14} className="text-gray-400" />
                  <span>Twitter (X)</span>
                </button>
              )}
              {activePlatforms.includes('youtube') && (
                <button
                  onClick={() => setSubtab('youtube')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
                    subtab === 'youtube'
                      ? "bg-red-500/10 text-red-500"
                      : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  )}
                >
                  <Play size={14} className="text-red-500" />
                  <span>YouTube Videos</span>
                </button>
              )}
            </div>
            
            {/* Export and Import Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-1.5 text-[10px] font-extrabold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer shadow-sm"
              >
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleTriggerImport}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3.5 py-1.5 text-[10px] font-extrabold text-white transition-all cursor-pointer shadow-sm"
              >
                <span>Import CSV</span>
              </button>
            </div>
          </div>

          {/* Excel spreadsheet layouts */}
          <div className="flex-1 flex flex-col">
            {subtab === 'gmb' && (
              <div className="card border-[var(--border)] overflow-hidden flex flex-col flex-1 shadow-md bg-[var(--card)]">
                <div className="overflow-x-auto flex-1 scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[var(--surface)] border-b border-[var(--border)] font-nav text-[var(--secondary)] select-none">
                        <th className="p-3 border-r border-[var(--border)] font-bold min-w-[180px]">Title</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Summary</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Media URL</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold w-32">Status</th>
                        <th className="p-3 font-bold w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                       {gmbPosts.map((post) => {
                        return (
                          <tr key={post.id} className="table-row">
                            <td className="p-3 border-r border-[var(--border)] font-semibold text-[var(--text)]">
                              <span className="block">
                                {post.title}
                              </span>
                            </td>
                            <td className="p-3 border-r border-[var(--border)] max-w-xs">
                              <div className="flex flex-col gap-1.5">
                                <span className="truncate block" title={post.summary}>
                                  {post.summary || '—'}
                                </span>
                                {post.summary && (
                                  <span className={cn(
                                    "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded w-fit border uppercase tracking-wider",
                                    post.summary.length > 1500
                                      ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                                      : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                  )}>
                                    {post.summary.length > 1500 ? (
                                      <>⚠️ {post.summary.length} / 1500 chars (Too Long!)</>
                                    ) : (
                                      <>{post.summary.length} / 1500 chars</>
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className="p-3 border-r border-[var(--border)] text-[var(--accent)] font-medium underline truncate max-w-xs cursor-pointer"
                              title={post.mediaurl}
                              onMouseEnter={(e) => post.mediaurl && setMediaHover({ url: post.mediaurl, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => post.mediaurl && setMediaHover(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setMediaHover(null)}
                            >
                              {post.mediaurl ? (
                                <a href={post.mediaurl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{post.mediaurl}</a>
                              ) : '—'}
                            </td>
                            <td className="p-3 border-r border-[var(--border)]">
                              <select
                                value={post.status}
                                onChange={(e) => handleStatusChange('gmb', post.id, e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--accent)]"
                              >
                                <option value="ready">Ready</option>
                                <option value="approved">Approved</option>
                                <option value="posted">Posted</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditPlatform('gmb');
                                    setEditForm({ ...post });
                                    setEditDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-strong)] text-[var(--secondary)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  title="Edit Campaign Post"
                                >
                                  <Sparkles size={13} className="text-amber-500" />
                                </button>
                                {post.status === 'posted' ? (
                                  <span className="text-[10px] font-bold text-[var(--muted)] flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePublishGmb(post.id)}
                                    disabled={
                                      !post.title?.trim() || 
                                      !post.summary?.trim() || 
                                      !post.mediaurl?.trim() ||
                                      !activeClient?.gmb_webhook_url?.trim() ||
                                      !activeClient?.gmb_webhook_active
                                    }
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={
                                      (!activeClient?.gmb_webhook_url?.trim() || !activeClient?.gmb_webhook_active)
                                        ? "GMB Webhook is not configured or active in Settings"
                                        : (!post.title?.trim() || !post.summary?.trim() || !post.mediaurl?.trim())
                                          ? "Fill Title, Summary, and Media URL to publish"
                                          : "Publish to GMB via Webhook"
                                    }
                                  >
                                    <Send size={10} />
                                    <span>Publish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Spreadsheet Inline insertion row */}
                      <tr className="bg-[var(--surface)]/30 border-t-2 border-[var(--border)]">
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Type Title + press Enter..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--text)] font-semibold p-1 placeholder-[var(--muted)]"
                            value={newGmbTitle}
                            onChange={(e) => setNewGmbTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGmbRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Optional Summary..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newGmbSummary}
                            onChange={(e) => setNewGmbSummary(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGmbRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Media URL..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newGmbMedia}
                            onChange={(e) => setNewGmbMedia(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGmbRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)] text-[var(--muted)] font-bold italic select-none">
                          Auto: ready
                        </td>
                        <td className="p-2 text-center select-none">
                          <button
                            onClick={handleAddGmbRow}
                            disabled={!newGmbTitle.trim()}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                            <span>Add Row</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subtab === 'instagram' && (
              <div className="card border-[var(--border)] overflow-hidden flex flex-col flex-1 shadow-md bg-[var(--card)]">
                <div className="overflow-x-auto flex-1 scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[var(--surface)] border-b border-[var(--border)] font-nav text-[var(--secondary)] select-none">
                        <th className="p-3 border-r border-[var(--border)] font-bold min-w-[180px]">Caption</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Media URL</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold w-32">Status</th>
                        <th className="p-3 font-bold w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {igPosts.map((post) => {
                        return (
                          <tr key={post.id} className="table-row">
                            <td className="p-3 border-r border-[var(--border)] font-semibold text-[var(--text)] max-w-sm">
                              <span className="block truncate" title={post.caption}>
                                {post.caption}
                              </span>
                            </td>
                            <td
                              className="p-3 border-r border-[var(--border)] text-[var(--secondary-accent)] font-medium underline truncate max-w-sm cursor-pointer"
                              title={post.mediaurl}
                              onMouseEnter={(e) => post.mediaurl && setMediaHover({ url: post.mediaurl, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => post.mediaurl && setMediaHover(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setMediaHover(null)}
                            >
                              {post.mediaurl ? (
                                <a href={post.mediaurl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{post.mediaurl}</a>
                              ) : '—'}
                            </td>
                            <td className="p-3 border-r border-[var(--border)]">
                              <select
                                value={post.status}
                                onChange={(e) => handleStatusChange('instagram', post.id, e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--accent)]"
                              >
                                <option value="ready">Ready</option>
                                <option value="approved">Approved</option>
                                <option value="posted">Posted</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditPlatform('instagram');
                                    setEditForm({ ...post });
                                    setEditDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-strong)] text-[var(--secondary)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  title="Edit Campaign Post"
                                >
                                  <Sparkles size={13} className="text-amber-500" />
                                </button>
                                {post.status === 'posted' ? (
                                  <span className="text-[10px] font-bold text-[var(--muted)] flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePublishIg(post.id)}
                                    disabled={
                                      !post.caption?.trim() || 
                                      !post.mediaurl?.trim() ||
                                      !activeClient?.ig_webhook_url?.trim() ||
                                      !activeClient?.ig_webhook_active
                                    }
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={
                                      (!activeClient?.ig_webhook_url?.trim() || !activeClient?.ig_webhook_active)
                                        ? "Instagram Webhook is not configured or active in Settings"
                                        : (!post.caption?.trim() || !post.mediaurl?.trim())
                                          ? "Fill Caption and Media URL to publish"
                                          : "Publish to Instagram via Webhook"
                                    }
                                  >
                                    <Send size={10} />
                                    <span>Publish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Spreadsheet Inline insertion row */}
                      <tr className="bg-[var(--surface)]/30 border-t-2 border-[var(--border)]">
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Type Caption + press Enter..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--text)] font-semibold p-1 placeholder-[var(--muted)]"
                            value={newIgCaption}
                            onChange={(e) => setNewIgCaption(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIgRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Media URL..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newIgMedia}
                            onChange={(e) => setNewIgMedia(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIgRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)] text-[var(--muted)] font-bold italic select-none">
                          Auto: ready
                        </td>
                        <td className="p-2 text-center select-none">
                          <button
                            onClick={handleAddIgRow}
                            disabled={!newIgCaption.trim()}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                            <span>Add Row</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subtab === 'linkedin' && (
              <div className="card border-[var(--border)] overflow-hidden flex flex-col flex-1 shadow-md bg-[var(--card)]">
                <div className="overflow-x-auto flex-1 scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[var(--surface)] border-b border-[var(--border)] font-nav text-[var(--secondary)] select-none">
                        <th className="p-3 border-r border-[var(--border)] font-bold min-w-[180px]">Title</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Summary</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Media URL</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold w-32">Status</th>
                        <th className="p-3 font-bold w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                       {linkedinPosts.map((post) => {
                        return (
                          <tr key={post.id} className="table-row">
                            <td className="p-3 border-r border-[var(--border)] font-semibold text-[var(--text)]">
                              <span className="block">
                                {post.title}
                              </span>
                            </td>
                            <td className="p-3 border-r border-[var(--border)] max-w-xs">
                              <div className="flex flex-col gap-1.5">
                                <span className="truncate block" title={post.summary}>
                                  {post.summary || '—'}
                                </span>
                              </div>
                            </td>
                            <td
                              className="p-3 border-r border-[var(--border)] text-blue-500 font-medium underline truncate max-w-xs cursor-pointer"
                              title={post.mediaurl}
                              onMouseEnter={(e) => post.mediaurl && setMediaHover({ url: post.mediaurl, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => post.mediaurl && setMediaHover(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setMediaHover(null)}
                            >
                              {post.mediaurl ? (
                                <a href={post.mediaurl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{post.mediaurl}</a>
                              ) : '—'}
                            </td>
                            <td className="p-3 border-r border-[var(--border)]">
                              <select
                                value={post.status}
                                onChange={(e) => handleStatusChange('linkedin', post.id, e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--accent)]"
                              >
                                <option value="ready">Ready</option>
                                <option value="approved">Approved</option>
                                <option value="posted">Posted</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditPlatform('linkedin');
                                    setEditForm({ ...post });
                                    setEditDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-strong)] text-[var(--secondary)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  title="Edit Campaign Post"
                                >
                                  <Sparkles size={13} className="text-amber-500" />
                                </button>
                                {post.status === 'posted' ? (
                                  <span className="text-[10px] font-bold text-[var(--muted)] flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePublishLinkedin(post.id)}
                                    disabled={
                                      !post.title?.trim() || 
                                      !post.summary?.trim() || 
                                      !post.mediaurl?.trim() ||
                                      !activeClient?.linkedin_webhook_url?.trim() ||
                                      !activeClient?.linkedin_webhook_active
                                    }
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={
                                      (!activeClient?.linkedin_webhook_url?.trim() || !activeClient?.linkedin_webhook_active)
                                        ? "LinkedIn Webhook is not configured or active in Settings"
                                        : (!post.title?.trim() || !post.summary?.trim() || !post.mediaurl?.trim())
                                          ? "Fill Title, Summary, and Media URL to publish"
                                          : "Publish to LinkedIn via Webhook"
                                    }
                                  >
                                    <Send size={10} />
                                    <span>Publish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Spreadsheet Inline insertion row */}
                      <tr className="bg-[var(--surface)]/30 border-t-2 border-[var(--border)]">
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Type Title + press Enter..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--text)] font-semibold p-1 placeholder-[var(--muted)]"
                            value={newLinkedinTitle}
                            onChange={(e) => setNewLinkedinTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLinkedinRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Optional Summary..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newLinkedinSummary}
                            onChange={(e) => setNewLinkedinSummary(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLinkedinRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Media URL..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newLinkedinMedia}
                            onChange={(e) => setNewLinkedinMedia(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLinkedinRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)] text-[var(--muted)] font-bold italic select-none">
                          Auto: ready
                        </td>
                        <td className="p-2 text-center select-none">
                          <button
                            onClick={handleAddLinkedinRow}
                            disabled={!newLinkedinTitle.trim()}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                            <span>Add Row</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subtab === 'twitter' && (
              <div className="card border-[var(--border)] overflow-hidden flex flex-col flex-1 shadow-md bg-[var(--card)]">
                <div className="overflow-x-auto flex-1 scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[var(--surface)] border-b border-[var(--border)] font-nav text-[var(--secondary)] select-none">
                        <th className="p-3 border-r border-[var(--border)] font-bold min-w-[180px]">Tweet Text</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Media URL</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold w-32">Status</th>
                        <th className="p-3 font-bold w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {twitterPosts.map((post) => {
                        return (
                          <tr key={post.id} className="table-row">
                            <td className="p-3 border-r border-[var(--border)] font-semibold text-[var(--text)] max-w-sm">
                              <span className="truncate block" title={post.tweet_text}>{post.tweet_text}</span>
                            </td>
                            <td
                              className="p-3 border-r border-[var(--border)] text-[var(--secondary)] font-medium underline truncate max-w-sm cursor-pointer"
                              title={post.mediaurl}
                              onMouseEnter={(e) => post.mediaurl && setMediaHover({ url: post.mediaurl, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => post.mediaurl && setMediaHover(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setMediaHover(null)}
                            >
                              {post.mediaurl ? (
                                <a href={post.mediaurl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{post.mediaurl}</a>
                              ) : '—'}
                            </td>
                            <td className="p-3 border-r border-[var(--border)]">
                              <select
                                value={post.status}
                                onChange={(e) => handleStatusChange('twitter', post.id, e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--accent)]"
                              >
                                <option value="ready">Ready</option>
                                <option value="approved">Approved</option>
                                <option value="posted">Posted</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditPlatform('twitter');
                                    setEditForm({ ...post });
                                    setEditDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-strong)] text-[var(--secondary)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  title="Edit Campaign Post"
                                >
                                  <Sparkles size={13} className="text-amber-500" />
                                </button>
                                {post.status === 'posted' ? (
                                  <span className="text-[10px] font-bold text-[var(--muted)] flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePublishTwitter(post.id)}
                                    disabled={
                                      !post.tweet_text?.trim() || 
                                      !post.mediaurl?.trim() ||
                                      !activeClient?.twitter_webhook_url?.trim() ||
                                      !activeClient?.twitter_webhook_active
                                    }
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={
                                      (!activeClient?.twitter_webhook_url?.trim() || !activeClient?.twitter_webhook_active)
                                        ? "Twitter Webhook is not configured or active in Settings"
                                        : (!post.tweet_text?.trim() || !post.mediaurl?.trim())
                                          ? "Fill Tweet Text and Media URL to publish"
                                          : "Publish to Twitter via Webhook"
                                    }
                                  >
                                    <Send size={10} />
                                    <span>Publish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Spreadsheet Inline insertion row */}
                      <tr className="bg-[var(--surface)]/30 border-t-2 border-[var(--border)]">
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Type Tweet Text + press Enter..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--text)] font-semibold p-1 placeholder-[var(--muted)]"
                            value={newTwitterText}
                            onChange={(e) => setNewTwitterText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTwitterRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Media URL..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newTwitterMedia}
                            onChange={(e) => setNewTwitterMedia(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTwitterRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)] text-[var(--muted)] font-bold italic select-none">
                          Auto: ready
                        </td>
                        <td className="p-2 text-center select-none">
                          <button
                            onClick={handleAddTwitterRow}
                            disabled={!newTwitterText.trim()}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                            <span>Add Row</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subtab === 'youtube' && (
              <div className="card border-[var(--border)] overflow-hidden flex flex-col flex-1 shadow-md bg-[var(--card)]">
                <div className="overflow-x-auto flex-1 scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-[var(--surface)] border-b border-[var(--border)] font-nav text-[var(--secondary)] select-none">
                        <th className="p-3 border-r border-[var(--border)] font-bold min-w-[180px]">Video Title</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Description</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold">Video URL</th>
                        <th className="p-3 border-r border-[var(--border)] font-bold w-32">Status</th>
                        <th className="p-3 font-bold w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {youtubePosts.map((post) => {
                        return (
                          <tr key={post.id} className="table-row">
                            <td className="p-3 border-r border-[var(--border)] font-semibold text-[var(--text)]">
                              {post.video_title}
                            </td>
                            <td className="p-3 border-r border-[var(--border)] max-w-xs">
                              <span className="truncate block" title={post.description}>{post.description || '—'}</span>
                            </td>
                            <td
                              className="p-3 border-r border-[var(--border)] text-red-500 font-medium underline truncate max-w-xs cursor-pointer"
                              title={post.video_url}
                              onMouseEnter={(e) => post.video_url && setMediaHover({ url: post.video_url, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => post.video_url && setMediaHover(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => setMediaHover(null)}
                            >
                              {post.video_url ? (
                                <a href={post.video_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{post.video_url}</a>
                              ) : '—'}
                            </td>
                            <td className="p-3 border-r border-[var(--border)]">
                              <select
                                value={post.status}
                                onChange={(e) => handleStatusChange('youtube', post.id, e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-[var(--accent)]"
                              >
                                <option value="ready">Ready</option>
                                <option value="approved">Approved</option>
                                <option value="posted">Posted</option>
                              </select>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingPostId(post.id);
                                    setEditPlatform('youtube');
                                    setEditForm({ ...post });
                                    setEditDrawerOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-strong)] text-[var(--secondary)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  title="Edit Campaign Post"
                                >
                                  <Sparkles size={13} className="text-amber-500" />
                                </button>
                                {post.status === 'posted' ? (
                                  <span className="text-[10px] font-bold text-[var(--muted)] flex items-center justify-center gap-1">
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePublishYoutube(post.id)}
                                    disabled={
                                      !post.video_title?.trim() || 
                                      !post.description?.trim() || 
                                      !post.video_url?.trim() ||
                                      !activeClient?.youtube_webhook_url?.trim() ||
                                      !activeClient?.youtube_webhook_active
                                    }
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={
                                      (!activeClient?.youtube_webhook_url?.trim() || !activeClient?.youtube_webhook_active)
                                        ? "YouTube Webhook is not configured or active in Settings"
                                        : (!post.video_title?.trim() || !post.description?.trim() || !post.video_url?.trim())
                                          ? "Fill Video Title, Description, and Video URL to publish"
                                          : "Publish to YouTube via Webhook"
                                    }
                                  >
                                    <Send size={10} />
                                    <span>Publish</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Spreadsheet Inline insertion row */}
                      <tr className="bg-[var(--surface)]/30 border-t-2 border-[var(--border)]">
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Type Video Title + press Enter..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--text)] font-semibold p-1 placeholder-[var(--muted)]"
                            value={newYoutubeTitle}
                            onChange={(e) => setNewYoutubeTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddYoutubeRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Optional Description..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newYoutubeDesc}
                            onChange={(e) => setNewYoutubeDesc(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddYoutubeRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)]">
                          <input
                            type="text"
                            placeholder="Video URL..."
                            className="bg-transparent border-none outline-none w-full text-xs text-[var(--secondary)] p-1 placeholder-[var(--muted)]"
                            value={newYoutubeUrl}
                            onChange={(e) => setNewYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddYoutubeRow(e)}
                          />
                        </td>
                        <td className="p-2 border-r border-[var(--border)] text-[var(--muted)] font-bold italic select-none">
                          Auto: ready
                        </td>
                        <td className="p-2 text-center select-none">
                          <button
                            onClick={handleAddYoutubeRow}
                            disabled={!newYoutubeTitle.trim()}
                            className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-3 py-1.5 text-[10px] font-extrabold text-white cursor-pointer shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} />
                            <span>Add Row</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-[var(--border)] border-2 flex-grow bg-gradient-to-br from-[var(--card)] to-[var(--surface)]">
          <Users className="text-[var(--muted)]" size={44} />
          <h3 className="text-lg font-bold text-[var(--text)] font-nav mt-4">No Client Workspace Available</h3>
          <p className="text-sm text-[var(--secondary)] mt-1.5 max-w-sm">
            Add your first client account using the browser tab `+` button in the headers above.
          </p>
        </div>
      )}

      {/* DRAW PANEL: Add Client Sidedrawer */}
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

                  {/* Platforms Multiselect badgess */}
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

      {/* CLIENT SPECIFIC SETTINGS SIDEDRAWER */}
      {isSettingsOpen && activeClient && (
        <>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="drawer-overlay cursor-pointer"
            aria-label="Close settings drawer"
            style={{ animation: 'drawer-overlay-fade 0.3s forwards' }}
          />
          <div 
            className="drawer-panel"
            style={{ animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />
            
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <Sliders className="text-[var(--accent)]" size={18} />
                <h3 className="text-base font-bold text-[var(--text)] font-nav">Client Configuration</h3>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Horizontal Segmented Pill Tabs Selector */}
            <div className="px-7 pt-4 bg-[var(--card)] shrink-0 select-none">
              <div className="flex p-1 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('deliverables')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold font-nav rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider",
                    activeTab === 'deliverables'
                      ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                      : "text-[var(--secondary)] hover:text-[var(--text)]"
                  )}
                >
                  Deliverables
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('webhooks')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold font-nav rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider",
                    activeTab === 'webhooks'
                      ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                      : "text-[var(--secondary)] hover:text-[var(--text)]"
                  )}
                >
                  Webhooks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold font-nav rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider",
                    activeTab === 'notes'
                      ? "bg-[var(--card)] text-[var(--accent)] shadow-sm"
                      : "text-[var(--secondary)] hover:text-[var(--text)]"
                  )}
                >
                  Notes
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateDeliverables} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="drawer-body">
                <div className="flex items-center justify-between p-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Client
                    </span>
                    <div className="text-sm font-bold text-[var(--text)]">
                      {activeClient.name}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none gap-2.5">
                    <span className="text-xs font-bold text-[var(--secondary)]">
                      {editClientActive ? 'Active' : 'Inactive'}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={editClientActive}
                      onChange={(e) => setEditClientActive(e.target.checked)}
                    />
                    <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                  </label>
                </div>

                {activeTab === 'webhooks' && (
                  <div className="space-y-6">
                    {/* GMB WEBHOOK SECTION */}
                    {activePlatforms.includes('gmb') && (
                      <div className="space-y-4 border-b border-[var(--border)] pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe size={16} className="text-[var(--accent)]" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text)] font-nav">
                              GMB Webhook Settings
                            </h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={gmbWebhookActive}
                              onChange={(e) => setGmbWebhookActive(e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                            <span className="ml-2.5 text-xs font-bold text-[var(--secondary)]">
                              {gmbWebhookActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            GMB Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://hook.us1.make.com/gmb-scenario-id"
                            className="input text-sm"
                            value={gmbWebhookUrl}
                            onChange={(e) => setGmbWebhookUrl(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                              Custom Webhook Headers (JSON)
                            </label>
                            <span className="text-[9px] text-[var(--muted)] font-bold">Optional</span>
                          </div>
                          <textarea
                            placeholder='{&#10;  "Authorization": "Bearer YOUR_TOKEN",&#10;  "X-Custom-Header": "Value"&#10;}'
                            className="textarea text-xs font-mono h-24"
                            value={gmbWebhookHeaders}
                            onChange={(e) => setGmbWebhookHeaders(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestConnection('gmb')}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] py-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer"
                        >
                          <span>Test GMB Connection</span>
                        </button>

                        <WebhookPayloadEditor
                          platform="gmb"
                          savedTemplate={gmbPayloadTemplate}
                          onSave={handleSavePayloadTemplate}
                        />
                      </div>
                    )}

                    {/* INSTAGRAM WEBHOOK SECTION */}
                    {activePlatforms.includes('instagram') && (
                      <div className="space-y-4 border-b border-[var(--border)] pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Instagram size={16} className="text-[var(--secondary-accent)]" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text)] font-nav">
                              Instagram Webhook Settings
                            </h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={igWebhookActive}
                              onChange={(e) => setIgWebhookActive(e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--secondary-accent)]"></div>
                            <span className="ml-2.5 text-xs font-bold text-[var(--secondary)]">
                              {igWebhookActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Instagram Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://hook.us1.make.com/ig-scenario-id"
                            className="input text-sm"
                            value={igWebhookUrl}
                            onChange={(e) => setIgWebhookUrl(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                              Custom Webhook Headers (JSON)
                            </label>
                            <span className="text-[9px] text-[var(--muted)] font-bold">Optional</span>
                          </div>
                          <textarea
                            placeholder='{&#10;  "Authorization": "Bearer YOUR_TOKEN",&#10;  "X-Custom-Header": "Value"&#10;}'
                            className="textarea text-xs font-mono h-24"
                            value={igWebhookHeaders}
                            onChange={(e) => setIgWebhookHeaders(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestConnection('ig')}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] py-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer"
                        >
                          <span>Test Instagram Connection</span>
                        </button>

                        <WebhookPayloadEditor
                          platform="ig"
                          savedTemplate={igPayloadTemplate}
                          onSave={handleSavePayloadTemplate}
                        />
                      </div>
                    )}

                    {/* LINKEDIN WEBHOOK SECTION */}
                    {activePlatforms.includes('linkedin') && (
                      <div className="space-y-4 border-b border-[var(--border)] pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe size={16} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text)] font-nav">
                              LinkedIn Webhook Settings
                            </h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={linkedinWebhookActive}
                              onChange={(e) => setLinkedinWebhookActive(e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            <span className="ml-2.5 text-xs font-bold text-[var(--secondary)]">
                              {linkedinWebhookActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            LinkedIn Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://hook.us1.make.com/linkedin-scenario-id"
                            className="input text-sm"
                            value={linkedinWebhookUrl}
                            onChange={(e) => setLinkedinWebhookUrl(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                              Custom Webhook Headers (JSON)
                            </label>
                            <span className="text-[9px] text-[var(--muted)] font-bold">Optional</span>
                          </div>
                          <textarea
                            placeholder='{&#10;  "Authorization": "Bearer YOUR_TOKEN",&#10;  "X-Custom-Header": "Value"&#10;}'
                            className="textarea text-xs font-mono h-24"
                            value={linkedinWebhookHeaders}
                            onChange={(e) => setLinkedinWebhookHeaders(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestConnection('linkedin')}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] py-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer"
                        >
                          <span>Test LinkedIn Connection</span>
                        </button>

                        <WebhookPayloadEditor
                          platform="linkedin"
                          savedTemplate={linkedinPayloadTemplate}
                          onSave={handleSavePayloadTemplate}
                        />
                      </div>
                    )}

                    {/* TWITTER WEBHOOK SECTION */}
                    {activePlatforms.includes('twitter') && (
                      <div className="space-y-4 border-b border-[var(--border)] pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-gray-400" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text)] font-nav">
                              Twitter Webhook Settings
                            </h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={twitterWebhookActive}
                              onChange={(e) => setTwitterWebhookActive(e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-700"></div>
                            <span className="ml-2.5 text-xs font-bold text-[var(--secondary)]">
                              {twitterWebhookActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Twitter Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://hook.us1.make.com/twitter-scenario-id"
                            className="input text-sm"
                            value={twitterWebhookUrl}
                            onChange={(e) => setTwitterWebhookUrl(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                              Custom Webhook Headers (JSON)
                            </label>
                            <span className="text-[9px] text-[var(--muted)] font-bold">Optional</span>
                          </div>
                          <textarea
                            placeholder='{&#10;  "Authorization": "Bearer YOUR_TOKEN",&#10;  "X-Custom-Header": "Value"&#10;}'
                            className="textarea text-xs font-mono h-24"
                            value={twitterWebhookHeaders}
                            onChange={(e) => setTwitterWebhookHeaders(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestConnection('twitter')}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] py-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer"
                        >
                          <span>Test Twitter Connection</span>
                        </button>

                        <WebhookPayloadEditor
                          platform="twitter"
                          savedTemplate={twitterPayloadTemplate}
                          onSave={handleSavePayloadTemplate}
                        />
                      </div>
                    )}

                    {/* YOUTUBE WEBHOOK SECTION */}
                    {activePlatforms.includes('youtube') && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play size={16} className="text-red-500" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text)] font-nav">
                              YouTube Webhook Settings
                            </h4>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={youtubeWebhookActive}
                              onChange={(e) => setYoutubeWebhookActive(e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-[var(--surface-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            <span className="ml-2.5 text-xs font-bold text-[var(--secondary)]">
                              {youtubeWebhookActive ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            YouTube Webhook URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://hook.us1.make.com/youtube-scenario-id"
                            className="input text-sm"
                            value={youtubeWebhookUrl}
                            onChange={(e) => setYoutubeWebhookUrl(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                              Custom Webhook Headers (JSON)
                            </label>
                            <span className="text-[9px] text-[var(--muted)] font-bold">Optional</span>
                          </div>
                          <textarea
                            placeholder='{&#10;  "Authorization": "Bearer YOUR_TOKEN",&#10;  "X-Custom-Header": "Value"&#10;}'
                            className="textarea text-xs font-mono h-24"
                            value={youtubeWebhookHeaders}
                            onChange={(e) => setYoutubeWebhookHeaders(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTestConnection('youtube')}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] py-2 text-xs font-bold text-[var(--secondary)] hover:text-[var(--text)] transition-all cursor-pointer"
                        >
                          <span>Test YouTube Connection</span>
                        </button>

                        <WebhookPayloadEditor
                          platform="youtube"
                          savedTemplate={youtubePayloadTemplate}
                          onSave={handleSavePayloadTemplate}
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'deliverables' && (
                  <div className="space-y-5">
                    {/* Platform active checkboxes */}
                    <div className="space-y-2 border-b border-[var(--border)] pb-4">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Client Active Platforms
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['gmb', 'instagram', 'linkedin', 'twitter', 'youtube'].map((plat) => (
                          <label 
                            key={plat}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all",
                              activePlatforms.includes(plat)
                                ? "bg-[var(--accent-tint)] border-[var(--accent)] text-[var(--accent)]"
                                : "bg-[var(--card)] border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)]"
                            )}
                          >
                            <input 
                              type="checkbox"
                              className="sr-only"
                              checked={activePlatforms.includes(plat)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setActivePlatforms([...activePlatforms, plat]);
                                } else {
                                  if (activePlatforms.length > 1) {
                                    setActivePlatforms(activePlatforms.filter(p => p !== plat));
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

                    <div className="space-y-4">
                      {activePlatforms.includes('gmb') && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Promised Google My Business (GMB) Total
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input text-sm"
                            required
                            value={editGmbPromised}
                            onChange={(e) => setEditGmbPromised(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {activePlatforms.includes('instagram') && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Promised Instagram Feed Posts Total
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input text-sm"
                            required
                            value={editIgPromised}
                            onChange={(e) => setEditIgPromised(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {activePlatforms.includes('linkedin') && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Promised LinkedIn Posts Total
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input text-sm"
                            required
                            value={editLinkedinPromised}
                            onChange={(e) => setEditLinkedinPromised(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {activePlatforms.includes('twitter') && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Promised Twitter Tweets Total
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input text-sm"
                            required
                            value={editTwitterPromised}
                            onChange={(e) => setEditTwitterPromised(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}

                      {activePlatforms.includes('youtube') && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                            Promised YouTube Videos Total
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input text-sm"
                            required
                            value={editYoutubePromised}
                            onChange={(e) => setEditYoutubePromised(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Client Credentials & Reference Notes
                      </label>
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide">
                        Write clear notes, credentials references, and automations accounts used for this client for all Platforms.
                      </p>
                      <textarea
                        placeholder="Write dynamic strategy plans, customer onboarding items, or notes..."
                        className="textarea text-xs h-[320px] mt-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 text-white leading-relaxed focus:border-[var(--accent)] outline-none"
                        value={editClientNotes}
                        onChange={(e) => setEditClientNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="flex-1 h-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] text-xs font-bold text-[var(--secondary)] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary h-12 text-xs rounded-2xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* EDIT CAMPAIGN POST SIDEDRAWER */}
      {isEditDrawerOpen && editingPostId && (
        <>
          <button 
            onClick={() => setEditDrawerOpen(false)}
            className="drawer-overlay cursor-pointer"
            aria-label="Close edit drawer"
            style={{ animation: 'drawer-overlay-fade 0.3s forwards' }}
          />
          <div 
            className="drawer-panel"
            style={{ animation: 'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
          >
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden" />
            
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[var(--accent)]" size={18} />
                <h3 className="text-base font-bold text-[var(--text)] font-nav">
                  Edit Campaign Post ({editPlatform.toUpperCase()})
                </h3>
              </div>
              <button 
                onClick={() => setEditDrawerOpen(false)}
                className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(editPlatform, editingPostId);
              }} 
              className="flex-1 flex flex-col justify-between overflow-hidden"
            >
              <div className="drawer-body space-y-6">
                
                <div className="space-y-1.5 p-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">
                    Configure Post
                  </span>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Modify the post contents and status. Saved changes are securely committed to Neon.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Status selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                      Post Status
                    </label>
                    <select
                      value={editForm.status || 'ready'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="input text-sm font-semibold bg-[var(--surface)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--accent)]"
                    >
                      <option value="ready">Ready</option>
                      <option value="approved">Approved</option>
                      <option value="posted">Posted</option>
                    </select>
                  </div>

                  {/* GMB & LinkedIn fields */}
                  {(editPlatform === 'gmb' || editPlatform === 'linkedin') && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          className="input text-sm"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Summary / Content
                        </label>
                        <textarea
                          className="textarea text-xs h-32"
                          value={editForm.summary || ''}
                          onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Media URL
                        </label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="https://video.celiyo.com/api/public/media/..."
                          value={editForm.mediaurl || ''}
                          onChange={(e) => setEditForm({ ...editForm, mediaurl: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Instagram fields */}
                  {editPlatform === 'instagram' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Caption
                        </label>
                        <textarea
                          required
                          className="textarea text-xs h-32"
                          value={editForm.caption || ''}
                          onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Media URL
                        </label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="https://video.celiyo.com/api/public/media/..."
                          value={editForm.mediaurl || ''}
                          onChange={(e) => setEditForm({ ...editForm, mediaurl: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Twitter fields */}
                  {editPlatform === 'twitter' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Tweet Text
                        </label>
                        <textarea
                          required
                          className="textarea text-xs h-32"
                          value={editForm.tweet_text || ''}
                          onChange={(e) => setEditForm({ ...editForm, tweet_text: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Media URL
                        </label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="https://video.celiyo.com/api/public/media/..."
                          value={editForm.mediaurl || ''}
                          onChange={(e) => setEditForm({ ...editForm, mediaurl: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* YouTube fields */}
                  {editPlatform === 'youtube' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Video Title
                        </label>
                        <input
                          type="text"
                          required
                          className="input text-sm"
                          value={editForm.video_title || ''}
                          onChange={(e) => setEditForm({ ...editForm, video_title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Description
                        </label>
                        <textarea
                          className="textarea text-xs h-32"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                          Video URL
                        </label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="https://video.celiyo.com/api/public/media/..."
                          value={editForm.video_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Media Preview inside the Edit drawer */}
                  {((editPlatform === 'youtube' && editForm.video_url) || (editPlatform !== 'youtube' && editForm.mediaurl)) && (
                    <div className="space-y-1.5 pt-2 select-none">
                      <label className="text-[9px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                        Media Preview
                      </label>
                      <div className="h-44 rounded-2xl bg-[var(--surface-strong)] border border-[var(--border)] overflow-hidden flex items-center justify-center relative shadow-inner">
                        <MediaPreview url={editPlatform === 'youtube' ? editForm.video_url : editForm.mediaurl} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  onClick={() => setEditDrawerOpen(false)}
                  className="flex-1 h-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-strong)] text-xs font-bold text-[var(--secondary)] transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary h-12 text-xs rounded-2xl"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* GMB REUSABLE IMPORT DRAWER */}
      <ImportDrawer
        isOpen={isGmbImportOpen}
        onClose={() => setGmbImportOpen(false)}
        columns={GMB_COLUMNS}
        onImport={handleImportGmb}
      />

      {/* INSTAGRAM REUSABLE IMPORT DRAWER */}
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
        @keyframes modal-pop {
          from {
            opacity: 0;
            transform: translate(-50%, -45%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .media-global-preview-popup {
          position: fixed;
          width: 260px;
          height: 146px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
          z-index: 2147483647;
          overflow: hidden;
          pointer-events: none;
          animation: mediaPopupIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes mediaPopupIn {
          from { opacity: 0; transform: scale(0.92) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* GLOBAL MEDIA HOVER PREVIEW PORTAL - renders outside overflow containers */}
      {mediaHover && ReactDOM.createPortal(
        <div
          className="media-global-preview-popup"
          style={{
            left: Math.min(mediaHover.x + 16, window.innerWidth - 276),
            top: Math.max(mediaHover.y - 162, 8),
          }}
        >
          <MediaPreview url={mediaHover.url} className="w-full h-full object-cover" />
        </div>,
        document.body
      )}
    </div>
  );
}
