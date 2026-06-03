import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import ImportDrawer from '../components/shared/ImportDrawer';
import {
  Sparkles,
  Users,
  Plus,
  X,
  Upload,
  ChevronRight,
  Activity,
  Camera,
  CalendarCheck,
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
  ChevronDown,
  Clock,
  Globe,
  Image,
  Link,
  FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useScrollLock } from '../hooks/useScrollLock';
import { authFetch, BACKEND_URL } from '../lib/api';

// ─── CSV Column definitions ───────────────────────────────────────────────────
const GMB_COLUMNS      = [{ key:'title',label:'Title',required:true},{key:'summary',label:'Summary',required:false},{key:'mediaurl',label:'Media URL',required:false}];
const INSTAGRAM_COLUMNS= [{ key:'caption',label:'Caption',required:true},{key:'mediaurl',label:'Media URL',required:false}];
const LINKEDIN_COLUMNS = [{ key:'title',label:'Title',required:true},{key:'summary',label:'Summary',required:false},{key:'mediaurl',label:'Media URL',required:false}];
const TWITTER_COLUMNS  = [{ key:'tweet_text',label:'Tweet Text',required:true},{key:'mediaurl',label:'Media URL',required:false}];
const YOUTUBE_COLUMNS  = [{ key:'video_title',label:'Video Title',required:true},{key:'description',label:'Description',required:false},{key:'video_url',label:'Video URL',required:false}];

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORM_COLOR = {
  gmb:       '#4285f4',
  instagram: '#e1306c',
  linkedin:  '#0a66c2',
  twitter:   '#1da1f2',
  youtube:   '#ff0000',
};

const PLATFORM_CONFIG = {
  gmb:       { label: 'Google My Business', fields: [{ key:'title',label:'Post Title',required:true,type:'text' },{ key:'summary',label:'Summary',required:false,type:'textarea' },{ key:'mediaurl',label:'Media URL',required:false,type:'url' }] },
  instagram: { label: 'Instagram',          fields: [{ key:'caption',label:'Caption',required:true,type:'textarea' },{ key:'mediaurl',label:'Media URL',required:false,type:'url' }] },
  linkedin:  { label: 'LinkedIn',           fields: [{ key:'title',label:'Post Title',required:true,type:'text' },{ key:'summary',label:'Summary',required:false,type:'textarea' },{ key:'mediaurl',label:'Media URL',required:false,type:'url' }] },
  twitter:   { label: 'Twitter (X)',        fields: [{ key:'tweet_text',label:'Tweet Text',required:true,type:'textarea' },{ key:'mediaurl',label:'Media URL',required:false,type:'url' }] },
  youtube:   { label: 'YouTube',            fields: [{ key:'video_title',label:'Video Title',required:true,type:'text' },{ key:'description',label:'Description',required:false,type:'textarea' },{ key:'video_url',label:'Video URL',required:false,type:'url' }] },
};

// ─── IST helpers ──────────────────────────────────────────────────────────────
function istDateStr(d) {
  if (!d) return null;
  const utc = new Date(d);
  const ist = new Date(utc.getTime() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth()+1).padStart(2,'0')}-${String(ist.getUTCDate()).padStart(2,'0')}`;
}

// ─── Custom Dropdown ─────────────────────────────────────────────────────────
// Fully styled, no browser native select. Closes on outside click.
function StyledDropdown({ options, value, onChange, placeholder = 'Select…', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50 text-sm font-bold text-[var(--text)] cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected?.icon && <span>{selected.icon}</span>}
          {selected ? <span className="truncate">{selected.label}</span> : <span className="text-[var(--muted)] font-normal">{placeholder}</span>}
        </div>
        <ChevronDown size={14} className={cn('text-[var(--secondary)] shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[60] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all text-left',
                  opt.value === value
                    ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                    : 'text-[var(--text)] hover:bg-[var(--surface)]'
                )}
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check size={12} className="ml-auto shrink-0 text-[var(--accent)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Inline Date Picker ───────────────────────────────────────────────────────
// A compact calendar that opens inline in a drawer. No browser native date input.
function InlineDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parsed = value ? value.split('-').map(Number) : null;
  const [viewYear, setViewYear] = useState(parsed ? parsed[0] : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] : new Date().getMonth() + 1);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    setViewMonth(m); setViewYear(y);
  };

  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const weeks = [];
  let day = 1 - firstDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1 || day > daysInMonth) week.push(null);
      else {
        const key = `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        week.push({ day, key });
      }
    }
    weeks.push(week);
  }

  const monthName = new Date(viewYear, viewMonth - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  const displayDate = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50 text-sm font-bold text-[var(--text)] cursor-pointer transition-all"
      >
        <span className={value ? 'text-[var(--text)]' : 'text-[var(--muted)] font-normal'}>
          {displayDate || 'Pick a date…'}
        </span>
        <ChevronDown size={14} className={cn('text-[var(--secondary)] shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[60] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-3 space-y-2">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--secondary)] cursor-pointer"><ChevronLeft size={13} /></button>
            <span className="text-xs font-extrabold text-[var(--text)] tracking-wide">{monthName}</span>
            <button type="button" onClick={() => changeMonth(1)}  className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--secondary)] cursor-pointer"><ChevronRight size={13} /></button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 text-center">
            {['S','M','T','W','T','F','S'].map((d,i) => (
              <div key={i} className="text-[9px] font-extrabold text-[var(--muted)] uppercase py-1">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((cell, di) => {
                  if (!cell) return <div key={di} />;
                  const isSelected = cell.key === value;
                  const isToday    = cell.key === todayStr;
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => { onChange(cell.key); setOpen(false); }}
                      className={cn(
                        'flex items-center justify-center rounded-lg h-7 text-xs font-bold cursor-pointer transition-all',
                        isSelected ? 'bg-[var(--accent)] text-white' :
                        isToday    ? 'border border-[var(--accent)] text-[var(--accent)]' :
                                     'hover:bg-[var(--surface)] text-[var(--text)]'
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styled Time Picker ───────────────────────────────────────────────────────
// Hour + Minute dropdowns, fully themed.
function StyledTimePicker({ value, onChange }) {
  const [hOpen, setHOpen] = useState(false);
  const [mOpen, setMOpen] = useState(false);
  const hRef = useRef(null);
  const mRef = useRef(null);

  const [hour, minute] = value ? value.split(':') : ['09', '00'];

  useEffect(() => {
    const h = (e) => { if (hRef.current && !hRef.current.contains(e.target)) setHOpen(false); };
    const m = (e) => { if (mRef.current && !mRef.current.contains(e.target)) setMOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('mousedown', m);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('mousedown', m); };
  }, []);

  const setHour   = (h) => onChange(`${h}:${minute}`);
  const setMinute = (m) => onChange(`${hour}:${m}`);

  const hours   = Array.from({length:24}, (_,i) => String(i).padStart(2,'0'));
  const minutes = ['00','15','30','45'];

  const DropBtn = ({ val, open, setOpen, options, onSelect, refProp }) => (
    <div ref={refProp} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--text)] cursor-pointer hover:border-[var(--accent)]/50 min-w-[56px] justify-between">
        {val}
        <ChevronDown size={11} className={cn('text-[var(--secondary)] transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-[70] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
          <div className="max-h-44 overflow-y-auto p-1 space-y-0.5 min-w-[64px]">
            {options.map(opt => (
              <button key={opt} type="button" onClick={() => { onSelect(opt); setOpen(false); }}
                className={cn('w-full text-center px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer', opt === val ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface)] text-[var(--text)]')}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <DropBtn val={hour}   open={hOpen} setOpen={setHOpen} options={hours}   onSelect={setHour}   refProp={hRef} />
      <span className="text-sm font-extrabold text-[var(--muted)]">:</span>
      <DropBtn val={minute} open={mOpen} setOpen={setMOpen} options={minutes} onSelect={setMinute} refProp={mRef} />
      <span className="text-[10px] font-bold text-[var(--muted)]">IST</span>
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 160, thickness = 28 }) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, sg) => s + sg.value, 0);

  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-strong)" strokeWidth={thickness} />
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)">0</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="var(--secondary)">total</text>
    </svg>
  );

  let offset = 0;
  const slices = segments.map(seg => {
    if (seg.value === 0) return null;
    const fraction = seg.value / total;
    const dashLen = fraction * circumference;
    const el = (
      <circle key={seg.label} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={thickness}
        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
        strokeDashoffset={-offset * circumference}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    );
    offset += fraction;
    return el;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-strong)" strokeWidth={thickness} />
      {slices}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={size > 100 ? '22':'16'} fontWeight="800" fill="var(--text)">{total}</text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="var(--secondary)">total</text>
    </svg>
  );
}

// ─── Stacked progress bar ─────────────────────────────────────────────────────
function StackedBar({ posted, scheduled, planned, promised }) {
  const total = Math.max(promised, 1);
  const pPct  = Math.min((posted / total) * 100, 100);
  const sPct  = Math.min((scheduled / total) * 100, 100 - pPct);
  const plPct = Math.min((planned / total) * 100, 100 - pPct - sPct);
  return (
    <div className="w-full h-2 rounded-full bg-[var(--surface-strong)] overflow-hidden flex">
      <div className="h-full bg-emerald-500 transition-all" style={{ width:`${pPct}%` }} />
      <div className="h-full bg-cyan-500 transition-all"   style={{ width:`${sPct}%` }} />
      <div className="h-full bg-violet-400 transition-all" style={{ width:`${plPct}%` }} />
    </div>
  );
}

// ─── Monthly Calendar Grid ────────────────────────────────────────────────────
function MonthCalendar({ year, month, cells, onDayClick, onMonthChange }) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = [];
  let day = 1 - firstDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day < 1 || day > daysInMonth) week.push(null);
      else {
        const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        week.push({ day, key, items: cells[key] || [] });
      }
    }
    weeks.push(week);
  }
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-IN', { month:'long', year:'numeric' });
  const today = new Date();

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text)] font-nav">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={() => onMonthChange(-1)} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--secondary)] cursor-pointer"><ChevronLeft size={14}/></button>
          <button onClick={() => onMonthChange(1)}  className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--secondary)] cursor-pointer"><ChevronRight size={14}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-[9px] font-extrabold text-[var(--muted)] uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, di) => {
              if (!cell) return <div key={di}/>;
              const isToday = cell.day === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear();
              return (
                <button key={cell.key} onClick={() => onDayClick && onDayClick(cell)}
                  className={cn('relative flex flex-col items-center rounded-xl p-1 min-h-[44px] cursor-pointer transition-colors',
                    isToday ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--surface)]',
                    cell.items.length > 0 && !isToday ? 'bg-[var(--surface)]' : ''
                  )}>
                  <span className={cn('text-[11px] font-bold', isToday ? 'text-white' : 'text-[var(--text)]')}>{cell.day}</span>
                  {cell.items.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                      {cell.items.slice(0,3).map((item,idx) => <span key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }}/>)}
                      {cell.items.length > 3 && <span className="text-[8px] text-[var(--muted)] font-bold">+{cell.items.length-3}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState('overview');
  const [clientsData, setClientsData] = useState([]);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calendarData, setCalendarData] = useState({ shoots: [], scheduled_posts: {} });
  const [calLoading, setCalLoading] = useState(false);

  // Shoot drawer
  const [shootDrawerOpen, setShootDrawerOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState(null);
  const [shootTitle, setShootTitle] = useState('');
  const [shootDesc, setShootDesc] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [shootStatus, setShootStatus] = useState('planned');
  const [shootWorkspaceId, setShootWorkspaceId] = useState('');
  const [shootSaving, setShootSaving] = useState(false);

  // Edit post schedule drawer
  const [postDrawerOpen, setPostDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postScheduledAt, setPostScheduledAt] = useState('');
  const [postSaving, setPostSaving] = useState(false);

  // ── Add Post drawer ────────────────────────────────────────────────────────
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [addPostWorkspaceId, setAddPostWorkspaceId] = useState('');
  const [addPostPlatform, setAddPostPlatform] = useState('instagram');
  const [addPostDate, setAddPostDate] = useState('');
  const [addPostTime, setAddPostTime] = useState('09:00');
  const [addPostFields, setAddPostFields] = useState({});  // { title:'', summary:'', mediaurl:'' } etc.
  const [addPostSaving, setAddPostSaving] = useState(false);

  // Add Client drawer
  const [isNewClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPlatforms, setNewClientPlatforms] = useState(['gmb','instagram']);
  const [newClientGmbPromised, setNewClientGmbPromised] = useState(10);
  const [newClientIgPromised,  setNewClientIgPromised]  = useState(15);
  const [newClientLinkedinPromised, setNewClientLinkedinPromised] = useState(10);
  const [newClientTwitterPromised,  setNewClientTwitterPromised]  = useState(15);
  const [newClientYoutubePromised,  setNewClientYoutubePromised]  = useState(5);
  const [newClientShootsPromised, setNewClientShootsPromised] = useState(2);

  // Import drawers
  const [importTargetClientId, setImportTargetClientId] = useState(null);
  const [isGmbImportOpen,      setGmbImportOpen]      = useState(false);
  const [isIgImportOpen,       setIgImportOpen]       = useState(false);
  const [isLinkedinImportOpen, setLinkedinImportOpen] = useState(false);
  const [isTwitterImportOpen,  setTwitterImportOpen]  = useState(false);
  const [isYoutubeImportOpen,  setYoutubeImportOpen]  = useState(false);

  const anyDrawerOpen = isNewClientOpen || shootDrawerOpen || postDrawerOpen || addPostOpen;
  useScrollLock(anyDrawerOpen);

  // ── Workspace dropdown options ─────────────────────────────────────────────
  const workspaceOptions = allWorkspaces.map(ws => ({ value: ws.id, label: ws.client_name }));

  const platformOptions = Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => ({
    value: key,
    label: cfg.label,
    icon: <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PLATFORM_COLOR[key] }} />,
  }));

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadDashboardData = async () => {
    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allWs = data.workspaces || [];
      setAllWorkspaces(allWs);

      const clientsList = allWs.filter(ws => ws.client_active !== false).map(ws => ({ ...ws, name: ws.client_name }));

      const fullyHydrated = await Promise.all(clientsList.map(async (client) => {
        try {
          const [gmbRes,igRes,liRes,twRes,ytRes] = await Promise.all([
            authFetch(`${BACKEND_URL}/workspace/${client.id}/gmb`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/instagram`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/linkedin`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/twitter`),
            authFetch(`${BACKEND_URL}/workspace/${client.id}/youtube`),
          ]);
          const gmbPosts = gmbRes.ok ? await gmbRes.json() : [];
          const igPosts  = igRes.ok  ? await igRes.json()  : [];
          const liPosts  = liRes.ok  ? await liRes.json()  : [];
          const twPosts  = twRes.ok  ? await twRes.json()  : [];
          const ytPosts  = ytRes.ok  ? await ytRes.json()  : [];

          const classify = (p) => p.status==='posted' ? 'posted' : p.scheduled_at ? 'scheduled' : 'planned';
          const cnt = (posts, type) => posts.filter(p => classify(p)===type).length;
          const pv  = (key, def) => client[key] || def;

          return {
            ...client,
            gmbPosted:cnt(gmbPosts,'posted'), gmbScheduled:cnt(gmbPosts,'scheduled'), gmbPlanned:cnt(gmbPosts,'planned'), gmbTotal:gmbPosts.length, gmbPromised:pv('gmb_promised',10),
            igPosted: cnt(igPosts,'posted'),  igScheduled: cnt(igPosts,'scheduled'),  igPlanned: cnt(igPosts,'planned'),  igTotal:igPosts.length,   igPromised: pv('instagram_promised',15),
            liPosted: cnt(liPosts,'posted'),  liScheduled: cnt(liPosts,'scheduled'),  liPlanned: cnt(liPosts,'planned'),  liTotal:liPosts.length,   liPromised: pv('linkedin_promised',10),
            twPosted: cnt(twPosts,'posted'),  twScheduled: cnt(twPosts,'scheduled'),  twPlanned: cnt(twPosts,'planned'),  twTotal:twPosts.length,   twPromised: pv('twitter_promised',15),
            ytPosted: cnt(ytPosts,'posted'),  ytScheduled: cnt(ytPosts,'scheduled'),  ytPlanned: cnt(ytPosts,'planned'),  ytTotal:ytPosts.length,   ytPromised: pv('youtube_promised',5),
          };
        } catch {
          return { ...client, gmbPosted:0,igPosted:0,liPosted:0,twPosted:0,ytPosted:0, gmbScheduled:0,igScheduled:0,liScheduled:0,twScheduled:0,ytScheduled:0, gmbPlanned:0,igPlanned:0,liPlanned:0,twPlanned:0,ytPlanned:0, gmbTotal:0,igTotal:0,liTotal:0,twTotal:0,ytTotal:0, gmbPromised:10,igPromised:15,liPromised:10,twPromised:15,ytPromised:5 };
        }
      }));
      setClientsData(fullyHydrated);
    } catch {
      addToast({ type:'error', title:'Data Fetch Error', message:'Could not sync dashboard metrics.' });
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = useCallback(async (yr, mo) => {
    setCalLoading(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/dashboard/calendar-data?year=${yr}&month=${mo}`);
      if (!res.ok) throw new Error();
      setCalendarData(await res.json());
    } catch {
      addToast({ type:'error', title:'Calendar Error', message:'Could not load calendar data.' });
    } finally {
      setCalLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, []);
  useEffect(() => {
    if (activeTab==='shoots_calendar' || activeTab==='posting_calendar') loadCalendarData(calYear, calMonth);
  }, [activeTab, calYear, calMonth]);

  const handleMonthChange = (delta) => {
    let m = calMonth + delta, y = calYear;
    if (m>12){m=1;y++;} if (m<1){m=12;y--;}
    setCalMonth(m); setCalYear(y);
  };

  // ── Calendar cell builders ─────────────────────────────────────────────────
  const buildShootCells = () => {
    const cells = {};
    for (const shoot of calendarData.shoots||[]) {
      if (!shoot.shoot_date) continue;
      const key = shoot.shoot_date.slice(0,10);
      if (!cells[key]) cells[key] = [];
      cells[key].push({ ...shoot, color:'#f59e0b', type:'shoot' });
    }
    return cells;
  };

  const buildPostCells = () => {
    const cells = {};
    for (const [plat, posts] of Object.entries(calendarData.scheduled_posts||{})) {
      for (const post of posts) {
        const key = istDateStr(post.scheduled_at);
        if (!key) continue;
        if (!cells[key]) cells[key] = [];
        cells[key].push({ ...post, color:PLATFORM_COLOR[plat], type:'post', platform:plat });
      }
    }
    return cells;
  };

  // ── Shoot CRUD ─────────────────────────────────────────────────────────────
  const openNewShoot = (date='') => {
    setEditingShoot(null); setShootTitle(''); setShootDesc('');
    setShootDate(date); setShootStatus('planned');
    setShootWorkspaceId(allWorkspaces[0]?.id||'');
    setShootDrawerOpen(true);
  };
  const openEditShoot = (shoot) => {
    setEditingShoot(shoot); setShootTitle(shoot.title||''); setShootDesc(shoot.description||'');
    setShootDate(shoot.shoot_date ? shoot.shoot_date.slice(0,10) : '');
    setShootStatus(shoot.status||'planned'); setShootWorkspaceId(shoot.workspace_id||'');
    setShootDrawerOpen(true);
  };
  const handleSaveShoot = async () => {
    if (!shootTitle.trim()) return;
    setShootSaving(true);
    try {
      const body = { title:shootTitle, description:shootDesc, shoot_date:shootDate||null, status:shootStatus, workspace_id:shootWorkspaceId };
      const res = editingShoot
        ? await authFetch(`${BACKEND_URL}/shoots/${editingShoot.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
        : await authFetch(`${BACKEND_URL}/workspace/${shootWorkspaceId}/shoots`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      if (!res.ok) throw new Error();
      addToast({ type:'success', title:editingShoot?'Shoot Updated':'Shoot Added', message:`"${shootTitle}" saved.` });
      setShootDrawerOpen(false); loadCalendarData(calYear, calMonth);
    } catch { addToast({ type:'error', title:'Save Failed', message:'Could not save shoot.' }); }
    finally { setShootSaving(false); }
  };
  const handleDeleteShoot = async (id) => {
    try {
      await authFetch(`${BACKEND_URL}/shoots/${id}`, { method:'DELETE' });
      addToast({ type:'success', title:'Shoot Deleted', message:'Removed from calendar.' });
      setShootDrawerOpen(false); loadCalendarData(calYear, calMonth);
    } catch { addToast({ type:'error', title:'Delete Failed', message:'Could not delete shoot.' }); }
  };

  // ── Edit post schedule ─────────────────────────────────────────────────────
  const openPostDetail = (post) => {
    setSelectedPost(post);
    setPostScheduledAt(post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0,16) : '');
    setPostDrawerOpen(true);
  };
  const handleUpdatePostSchedule = async () => {
    if (!selectedPost) return;
    setPostSaving(true);
    try {
      const res = await authFetch(`${BACKEND_URL}/${selectedPost.platform}/${selectedPost.id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ scheduled_at: postScheduledAt||null })
      });
      if (!res.ok) throw new Error();
      addToast({ type:'success', title:'Schedule Saved', message:'Post schedule updated.' });
      setPostDrawerOpen(false); loadCalendarData(calYear, calMonth);
    } catch { addToast({ type:'error', title:'Save Failed', message:'Could not update schedule.' }); }
    finally { setPostSaving(false); }
  };

  // ── Add Post ───────────────────────────────────────────────────────────────
  const openAddPost = (date='') => {
    setAddPostDate(date || '');
    setAddPostTime('09:00');
    setAddPostPlatform('instagram');
    setAddPostWorkspaceId(allWorkspaces[0]?.id||'');
    setAddPostFields({});
    setAddPostOpen(true);
  };

  // Reset fields whenever platform changes so stale keys don't linger
  const handleAddPostPlatform = (p) => {
    setAddPostPlatform(p);
    setAddPostFields({});
  };

  const handleSaveAddPost = async () => {
    const cfg = PLATFORM_CONFIG[addPostPlatform];
    const requiredField = cfg.fields.find(f => f.required);
    if (!requiredField || !addPostFields[requiredField.key]?.trim()) {
      addToast({ type:'warning', title:'Required Field', message:`${requiredField?.label} is required.` });
      return;
    }
    if (!addPostWorkspaceId) {
      addToast({ type:'warning', title:'Select Client', message:'Please select a client workspace.' });
      return;
    }

    setAddPostSaving(true);
    try {
      // Build scheduled_at from date + time (IST → UTC)
      let scheduled_at = null;
      if (addPostDate && addPostTime) {
        // Parse as IST by appending offset
        const istStr = `${addPostDate}T${addPostTime}:00+05:30`;
        scheduled_at = new Date(istStr).toISOString();
      }

      const body = { ...addPostFields, scheduled_at };

      const endpointMap = { gmb:'gmb', instagram:'instagram', linkedin:'linkedin', twitter:'twitter', youtube:'youtube' };
      const res = await authFetch(`${BACKEND_URL}/workspace/${addPostWorkspaceId}/${endpointMap[addPostPlatform]}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      addToast({ type:'success', title:'Post Created', message:'Post added and scheduled.' });
      setAddPostOpen(false);
      loadCalendarData(calYear, calMonth);
      loadDashboardData();
    } catch { addToast({ type:'error', title:'Failed', message:'Could not create post.' }); }
    finally { setAddPostSaving(false); }
  };

  // ── Create client ──────────────────────────────────────────────────────────
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    try {
      const res = await authFetch(`${BACKEND_URL}/workspaces`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ clientName:newClientName.trim() }) });
      const data = await res.json();
      if (!res.ok) { addToast({ type:'error', title:'Failed', message:data.error||'Could not add client.' }); return; }
      addToast({ type:'success', title:'Client Added', message:`"${data.name}" created.` });
      setNewClientName(''); setNewClientOpen(false); loadDashboardData();
    } catch { addToast({ type:'error', title:'Error', message:'Connection failed.' }); }
  };

  // ── Import helpers ─────────────────────────────────────────────────────────
  const makeImporter = (platform, getRow) => async (mappedRows) => {
    if (!mappedRows.length || !importTargetClientId) return;
    let count = 0;
    for (const row of mappedRows) {
      const body = getRow(row);
      if (!body) continue;
      const res = await authFetch(`${BACKEND_URL}/workspace/${importTargetClientId}/${platform}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      if (res.ok) count++;
    }
    addToast({ type:'success', title:'Import Complete', message:`${count} rows imported.` });
    loadDashboardData();
  };
  const handleImportGmb      = makeImporter('gmb',      r=>r.title?.trim()?{title:r.title,summary:r.summary,mediaurl:r.mediaurl}:null);
  const handleImportIg       = makeImporter('instagram', r=>r.caption?.trim()?{caption:r.caption,mediaurl:r.mediaurl}:null);
  const handleImportLinkedin = makeImporter('linkedin',  r=>r.title?.trim()?{title:r.title,summary:r.summary,mediaurl:r.mediaurl}:null);
  const handleImportTwitter  = makeImporter('twitter',   r=>r.tweet_text?.trim()?{tweet_text:r.tweet_text,mediaurl:r.mediaurl}:null);
  const handleImportYoutube  = makeImporter('youtube',   r=>r.video_title?.trim()?{video_title:r.video_title,description:r.description,video_url:r.video_url}:null);

  const triggerImport = (platform, clientId) => {
    setImportTargetClientId(clientId);
    ({gmb:setGmbImportOpen,instagram:setIgImportOpen,linkedin:setLinkedinImportOpen,twitter:setTwitterImportOpen,youtube:setYoutubeImportOpen})[platform](true);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const sum = (key) => clientsData.reduce((a,c) => a+(c[key]||0), 0);
  const totalClients   = clientsData.length;
  const grandPosted    = sum('gmbPosted')   +sum('igPosted')   +sum('liPosted')   +sum('twPosted')   +sum('ytPosted');
  const grandScheduled = sum('gmbScheduled')+sum('igScheduled')+sum('liScheduled')+sum('twScheduled')+sum('ytScheduled');
  const grandPlanned   = sum('gmbPlanned')  +sum('igPlanned')  +sum('liPlanned')  +sum('twPlanned')  +sum('ytPlanned');
  const grandTotal     = grandPosted + grandScheduled + grandPlanned;
  const grandPromised  = clientsData.reduce((a,c) => a+(c.gmb_promised||0)+(c.instagram_promised||0)+(c.linkedin_promised||0)+(c.twitter_promised||0)+(c.youtube_promised||0), 0);
  const grandUnfulfilled = Math.max(grandPromised - grandTotal, 0);

  const donutSegments = [
    { label:'Posted',    value:grandPosted,      color:'#10b981' },
    { label:'Scheduled', value:grandScheduled,   color:'#06b6d4' },
    { label:'Planned',   value:grandPlanned,     color:'#8b5cf6' },
    { label:'Unfilled',  value:grandUnfulfilled, color:'var(--surface-strong)' },
  ];

  if (loading) return (
    <div className="card p-6 space-y-6 shimmer flex-grow">
      <div className="h-8 bg-[var(--surface-strong)] rounded-lg w-[30%]"/>
      <div className="h-32 bg-[var(--surface-strong)] rounded-2xl w-full"/>
      <div className="h-64 bg-[var(--surface-strong)] rounded-2xl w-full"/>
    </div>
  );

  // ── Current platform config for Add Post ───────────────────────────────────
  const currentPlatformCfg = PLATFORM_CONFIG[addPostPlatform] || PLATFORM_CONFIG.instagram;

  return (
    <div className="space-y-6 flex-grow flex flex-col select-none">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text)] font-nav leading-tight">Agency Overview</h1>
          <p className="mt-1 text-sm text-[var(--secondary)]">Real-time delivery metrics for all managed clients.</p>
        </div>
        <button onClick={() => setNewClientOpen(true)} className="btn-primary shrink-0 text-xs px-5 py-2.5 rounded-xl shadow-sm">
          <Plus size={14}/><span>Add Client</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-sm shrink-0">
        {[
          { key:'overview',         label:'Overview', Icon:Activity },
          { key:'shoots_calendar',  label:'Shoots',   Icon:Camera },
          { key:'posting_calendar', label:'Posting',  Icon:CalendarCheck },
        ].map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold font-nav rounded-xl transition-all cursor-pointer uppercase tracking-wider',
              activeTab===key ? 'bg-[var(--card)] text-[var(--accent)] shadow-sm' : 'text-[var(--secondary)] hover:text-[var(--text)]')}>
            <Icon size={12}/><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab==='overview' && (
        <>
          <div className="responsive-kpis shrink-0">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div><span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Total Clients</span><h3 className="text-2xl font-black text-[var(--text)] font-nav mt-1">{totalClients}</h3></div>
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"><Users size={16}/></div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div><span className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Total Deliverables</span><h3 className="text-2xl font-black text-[var(--text)] font-nav mt-1">{grandTotal}</h3><span className="text-[10px] font-bold text-emerald-500">{grandPosted} posted live</span></div>
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"><Activity size={16}/></div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-4">
                <DonutChart segments={donutSegments} size={72} thickness={14}/>
                <div className="space-y-1 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500"/>Posted: {grandPosted}</div>
                  <div className="flex items-center gap-1.5 text-cyan-500"><span className="w-2 h-2 rounded-full bg-cyan-500"/>Sched: {grandScheduled}</div>
                  <div className="flex items-center gap-1.5 text-violet-500"><span className="w-2 h-2 rounded-full bg-violet-400"/>Planned: {grandPlanned}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col md:flex-row items-center gap-8 shrink-0">
            <DonutChart segments={donutSegments} size={180} thickness={32}/>
            <div className="flex-1 space-y-3 w-full">
              {donutSegments.map(seg => (
                <div key={seg.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color.startsWith('var') ? undefined : seg.color, backgroundColor: seg.color.startsWith('var') ? 'var(--surface-strong)' : undefined }}/>
                      <span className="text-[var(--text)]">{seg.label}</span>
                    </div>
                    <span className="text-[var(--secondary)] font-nav">{seg.value}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ background: seg.color.startsWith('var') ? 'var(--surface-strong)' : seg.color, width:`${(grandTotal+grandUnfulfilled)>0?(seg.value/(grandTotal+grandUnfulfilled))*100:0}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {clientsData.length > 0 ? (
            <div className="responsive-cards shrink-0">
              {clientsData.map((client) => {
                const activePlats = client.active_platforms ? client.active_platforms.split(',') : ['gmb','instagram'];
                const platformRows = [
                  { key:'gmb',       label:'GMB',      color:'#4285f4', posted:client.gmbPosted, scheduled:client.gmbScheduled, planned:client.gmbPlanned, promised:client.gmbPromised },
                  { key:'instagram', label:'Instagram', color:'#e1306c', posted:client.igPosted,  scheduled:client.igScheduled,  planned:client.igPlanned,  promised:client.igPromised  },
                  { key:'linkedin',  label:'LinkedIn',  color:'#0a66c2', posted:client.liPosted,  scheduled:client.liScheduled,  planned:client.liPlanned,  promised:client.liPromised  },
                  { key:'twitter',   label:'Twitter',   color:'#1da1f2', posted:client.twPosted,  scheduled:client.twScheduled,  planned:client.twPlanned,  promised:client.twPromised  },
                  { key:'youtube',   label:'YouTube',   color:'#ff0000', posted:client.ytPosted,  scheduled:client.ytScheduled,  planned:client.ytPlanned,  promised:client.ytPromised  },
                ].filter(p => activePlats.includes(p.key));
                return (
                  <div key={client.id} className="card card-hover p-6 flex flex-col gap-4 border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div><h3 className="text-base font-bold text-[var(--text)] font-nav truncate max-w-[200px]">{client.name}</h3><span className="text-[9px] font-extrabold text-[var(--muted)] tracking-wider uppercase">{activePlats.length} platforms</span></div>
                      <button onClick={() => navigate('/clients')} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--secondary)] hover:text-[var(--accent)] cursor-pointer"><ChevronRight size={15}/></button>
                    </div>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                      {platformRows.map(({ key,label,color,posted,scheduled,planned,promised }) => (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ background:color }}/><span className="text-[var(--secondary)]">{label}</span></div>
                            <div className="flex gap-2 text-[var(--muted)] font-nav">
                              <span className="text-emerald-500">{posted}✓</span>
                              {scheduled>0 && <span className="text-cyan-500">{scheduled}⏰</span>}
                              <span>{posted+scheduled+planned}/{promised}</span>
                            </div>
                          </div>
                          <StackedBar posted={posted} scheduled={scheduled} planned={planned} promised={promised}/>
                          <button onClick={() => triggerImport(key, client.id)} className="inline-flex items-center gap-1 text-[9px] font-extrabold hover:underline cursor-pointer" style={{ color }}>
                            <Upload size={9}/><span>Upload CSV</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[var(--border)] flex items-center gap-1 text-[10px] text-[var(--muted)] font-medium">
                      <Activity size={10} className="text-emerald-500"/><span>Connected</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-[var(--border)] flex-1 min-h-[300px]">
              <Sparkles size={36} className="text-[var(--accent)] mb-4"/>
              <h3 className="text-xl font-bold text-[var(--text)] font-nav mb-2">No Clients Yet</h3>
              <p className="text-sm text-[var(--secondary)] mb-6">Add your first client workspace to start tracking.</p>
              <button onClick={() => setNewClientOpen(true)} className="btn-primary text-xs px-5 py-3 rounded-2xl"><Plus size={14}/> Add Client</button>
            </div>
          )}
        </>
      )}

      {/* ═══════════ SHOOTS CALENDAR TAB ═══════════ */}
      {activeTab==='shoots_calendar' && (
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div><h2 className="text-sm font-bold text-[var(--text)] font-nav">Shoot Sessions</h2><p className="text-[11px] text-[var(--secondary)] mt-0.5">Track planned client photo/video shoots.</p></div>
            <button onClick={() => openNewShoot()} className="btn-primary text-xs px-4 py-2 rounded-xl"><Plus size={13}/> Add Shoot</button>
          </div>
          {calLoading ? <div className="card p-8 shimmer h-64"/> : (
            <MonthCalendar year={calYear} month={calMonth} cells={buildShootCells()} onMonthChange={handleMonthChange}
              onDayClick={(cell) => cell.items.length>0 ? openEditShoot(cell.items[0]) : openNewShoot(cell.key)}/>
          )}
          {(calendarData.shoots||[]).length>0 && (
            <div className="card p-4 space-y-2">
              <p className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">All Shoots This Month</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {calendarData.shoots.map(shoot => (
                  <div key={shoot.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card)] transition-colors">
                    <div className="min-w-0"><p className="text-sm font-bold text-[var(--text)] truncate">{shoot.title}</p><p className="text-[10px] text-[var(--muted)]">{shoot.client_name} · {shoot.shoot_date?shoot.shoot_date.slice(0,10):'TBD'} · <span className="capitalize">{shoot.status}</span></p></div>
                    <button onClick={() => openEditShoot(shoot)} className="p-1.5 rounded-lg hover:bg-[var(--surface-strong)] text-[var(--secondary)] cursor-pointer"><Pencil size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ POSTING CALENDAR TAB ═══════════ */}
      {activeTab==='posting_calendar' && (
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div><h2 className="text-sm font-bold text-[var(--text)] font-nav">Posting Schedule</h2><p className="text-[11px] text-[var(--secondary)] mt-0.5">Scheduled posts (IST). Click any date to add — click a post to edit its schedule.</p></div>
            <button onClick={() => openAddPost()} className="btn-primary text-xs px-4 py-2 rounded-xl"><Plus size={13}/> Add Post</button>
          </div>

          {/* Platform legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(PLATFORM_COLOR).map(([plat,color]) => (
              <div key={plat} className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--secondary)]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background:color }}/><span className="capitalize">{plat}</span>
              </div>
            ))}
          </div>

          {calLoading ? <div className="card p-8 shimmer h-64"/> : (
            <MonthCalendar year={calYear} month={calMonth} cells={buildPostCells()} onMonthChange={handleMonthChange}
              onDayClick={(cell) => {
                // Clicking a date always opens Add Post with that date pre-filled
                openAddPost(cell.key);
              }}/>
          )}

          {/* Scheduled posts list */}
          {Object.values(calendarData.scheduled_posts||{}).flat().length>0 && (
            <div className="card p-4 space-y-2">
              <p className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase">Scheduled Posts</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(calendarData.scheduled_posts||{})
                  .flatMap(([plat,posts]) => posts.map(p => ({ ...p, platform:plat })))
                  .sort((a,b) => new Date(a.scheduled_at)-new Date(b.scheduled_at))
                  .map(post => (
                    <div key={`${post.platform}-${post.id}`} onClick={() => openPostDetail(post)}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--card)] cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:PLATFORM_COLOR[post.platform] }}/>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--text)] truncate">{post.label}</p>
                          <p className="text-[10px] text-[var(--muted)] capitalize">{post.platform} · {new Date(post.scheduled_at).toLocaleString('en-IN',{ timeZone:'Asia/Kolkata', dateStyle:'short', timeStyle:'short' })}</p>
                        </div>
                      </div>
                      <Pencil size={12} className="text-[var(--secondary)] shrink-0"/>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ ADD CLIENT DRAWER ═══════════ */}
      {isNewClientOpen && (
        <>
          <button onClick={() => setNewClientOpen(false)} className="drawer-overlay cursor-pointer" style={{ animation:'drawer-overlay-fade 0.3s forwards' }}/>
          <div className="drawer-panel" style={{ animation:'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden"/>
            <div className="drawer-header">
              <div className="flex items-center gap-2"><Users className="text-[var(--accent)]" size={18}/><h3 className="text-base font-bold text-[var(--text)] font-nav">Add New Client</h3></div>
              <button onClick={() => setNewClientOpen(false)} className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] cursor-pointer"><X size={15}/></button>
            </div>
            <form onSubmit={handleCreateClient} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="drawer-body space-y-4">
                <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Client / Org Name</label><input type="text" placeholder="e.g. Adidas Soccer" required className="input text-sm" value={newClientName} onChange={e => setNewClientName(e.target.value)}/></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Enable Platforms</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['gmb','instagram','linkedin','twitter','youtube'].map(plat => (
                      <label key={plat} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all', newClientPlatforms.includes(plat)?'bg-[var(--accent-tint)] border-[var(--accent)] text-[var(--accent)]':'bg-[var(--card)] border-[var(--border)] text-[var(--secondary)]')}>
                        <input type="checkbox" className="sr-only" checked={newClientPlatforms.includes(plat)} onChange={e => { if(e.target.checked) setNewClientPlatforms([...newClientPlatforms,plat]); else if(newClientPlatforms.length>1) setNewClientPlatforms(newClientPlatforms.filter(p=>p!==plat)); else addToast({type:'warning',title:'Action Denied',message:'At least one platform required.'}); }}/>
                        <span className="uppercase text-[9px]">{plat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {newClientPlatforms.includes('gmb')       && <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised GMB Posts</label><input type="number" min="1" className="input text-sm" value={newClientGmbPromised} onChange={e=>setNewClientGmbPromised(parseInt(e.target.value)||0)}/></div>}
                {newClientPlatforms.includes('instagram') && <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised Instagram Posts</label><input type="number" min="1" className="input text-sm" value={newClientIgPromised} onChange={e=>setNewClientIgPromised(parseInt(e.target.value)||0)}/></div>}
                {newClientPlatforms.includes('linkedin')  && <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised LinkedIn Posts</label><input type="number" min="1" className="input text-sm" value={newClientLinkedinPromised} onChange={e=>setNewClientLinkedinPromised(parseInt(e.target.value)||0)}/></div>}
                {newClientPlatforms.includes('twitter')   && <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised Twitter Tweets</label><input type="number" min="1" className="input text-sm" value={newClientTwitterPromised} onChange={e=>setNewClientTwitterPromised(parseInt(e.target.value)||0)}/></div>}
                {newClientPlatforms.includes('youtube')   && <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised YouTube Videos</label><input type="number" min="1" className="input text-sm" value={newClientYoutubePromised} onChange={e=>setNewClientYoutubePromised(parseInt(e.target.value)||0)}/></div>}
                <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Promised Shoot Sessions</label><input type="number" min="0" className="input text-sm" value={newClientShootsPromised} onChange={e=>setNewClientShootsPromised(parseInt(e.target.value)||0)}/></div>
              </div>
              <div className="drawer-footer">
                <button type="button" onClick={() => setNewClientOpen(false)} className="flex-1 h-12 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--secondary)] cursor-pointer">Discard</button>
                <button type="submit" className="flex-1 btn-primary h-12 text-xs rounded-2xl">Create Client</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ═══════════ SHOOT DRAWER ═══════════ */}
      {shootDrawerOpen && (
        <>
          <button onClick={() => setShootDrawerOpen(false)} className="drawer-overlay cursor-pointer" style={{ animation:'drawer-overlay-fade 0.3s forwards' }}/>
          <div className="drawer-panel" style={{ animation:'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden"/>
            <div className="drawer-header">
              <div className="flex items-center gap-2"><Camera className="text-amber-500" size={18}/><h3 className="text-base font-bold text-[var(--text)] font-nav">{editingShoot?'Edit Shoot':'Add Shoot'}</h3></div>
              <button onClick={() => setShootDrawerOpen(false)} className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] cursor-pointer"><X size={15}/></button>
            </div>
            <div className="drawer-body space-y-4">
              <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Title</label><input type="text" placeholder="e.g. Product Launch Shoot" className="input text-sm" value={shootTitle} onChange={e=>setShootTitle(e.target.value)}/></div>
              <div className="space-y-1.5"><label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Description / Notes</label><textarea rows={3} className="input text-sm resize-none" placeholder="Location, brief, etc." value={shootDesc} onChange={e=>setShootDesc(e.target.value)}/></div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Shoot Date</label>
                <InlineDatePicker value={shootDate} onChange={setShootDate}/>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Status</label>
                <StyledDropdown
                  value={shootStatus}
                  onChange={setShootStatus}
                  options={[
                    { value:'planned',   label:'Planned' },
                    { value:'confirmed', label:'Confirmed' },
                    { value:'completed', label:'Completed' },
                    { value:'cancelled', label:'Cancelled' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Client Workspace</label>
                <StyledDropdown value={shootWorkspaceId} onChange={setShootWorkspaceId} options={workspaceOptions} placeholder="Select client…"/>
              </div>
            </div>
            <div className="drawer-footer">
              {editingShoot && <button type="button" onClick={() => handleDeleteShoot(editingShoot.id)} className="h-12 px-4 rounded-2xl border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-50/10 cursor-pointer"><Trash2 size={14}/></button>}
              <button type="button" onClick={() => setShootDrawerOpen(false)} className="flex-1 h-12 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--secondary)] cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSaveShoot} disabled={shootSaving||!shootTitle.trim()} className="flex-1 btn-primary h-12 text-xs rounded-2xl disabled:opacity-60">{shootSaving?'Saving…':'Save Shoot'}</button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ ADD POST DRAWER ═══════════ */}
      {addPostOpen && (
        <>
          <button onClick={() => setAddPostOpen(false)} className="drawer-overlay cursor-pointer" style={{ animation:'drawer-overlay-fade 0.3s forwards' }}/>
          <div className="drawer-panel" style={{ animation:'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden"/>
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background:PLATFORM_COLOR[addPostPlatform] }}/>
                <h3 className="text-base font-bold text-[var(--text)] font-nav">Add Post</h3>
              </div>
              <button onClick={() => setAddPostOpen(false)} className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] cursor-pointer"><X size={15}/></button>
            </div>

            <div className="drawer-body space-y-4">

              {/* Client */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Client Workspace</label>
                <StyledDropdown value={addPostWorkspaceId} onChange={setAddPostWorkspaceId} options={workspaceOptions} placeholder="Select client…"/>
              </div>

              {/* Platform */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Platform</label>
                <StyledDropdown value={addPostPlatform} onChange={handleAddPostPlatform} options={platformOptions}/>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]"/>

              {/* Platform-specific content fields */}
              {currentPlatformCfg.fields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">
                    {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      className="input text-sm resize-none"
                      placeholder={`Enter ${field.label.toLowerCase()}…`}
                      value={addPostFields[field.key]||''}
                      onChange={e => setAddPostFields(prev => ({ ...prev, [field.key]:e.target.value }))}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="input text-sm"
                      placeholder={field.type==='url' ? 'https://…' : `Enter ${field.label.toLowerCase()}…`}
                      value={addPostFields[field.key]||''}
                      onChange={e => setAddPostFields(prev => ({ ...prev, [field.key]:e.target.value }))}
                    />
                  )}
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-[var(--border)]"/>

              {/* Schedule */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Scheduled Date</label>
                  <InlineDatePicker value={addPostDate} onChange={setAddPostDate}/>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Scheduled Time (IST)</label>
                  <StyledTimePicker value={addPostTime} onChange={setAddPostTime}/>
                </div>

                <p className="text-[10px] text-[var(--muted)]">Leave date empty to save as Planned (no schedule).</p>
              </div>

            </div>

            <div className="drawer-footer">
              <button type="button" onClick={() => setAddPostOpen(false)} className="flex-1 h-12 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--secondary)] cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSaveAddPost} disabled={addPostSaving} className="flex-1 btn-primary h-12 text-xs rounded-2xl disabled:opacity-60">
                {addPostSaving ? 'Saving…' : 'Create Post'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ EDIT POST SCHEDULE DRAWER ═══════════ */}
      {postDrawerOpen && selectedPost && (
        <>
          <button onClick={() => setPostDrawerOpen(false)} className="drawer-overlay cursor-pointer" style={{ animation:'drawer-overlay-fade 0.3s forwards' }}/>
          <div className="drawer-panel" style={{ animation:'drawer-panel-slide 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards' }}>
            <div className="w-12 h-1 bg-[var(--surface-strong)] rounded-full mx-auto mt-3 mb-1 shrink-0 md:hidden"/>
            <div className="drawer-header">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background:PLATFORM_COLOR[selectedPost.platform] }}/><h3 className="text-base font-bold text-[var(--text)] font-nav capitalize">{selectedPost.platform} Post</h3></div>
              <button onClick={() => setPostDrawerOpen(false)} className="p-1.5 rounded-xl border border-[var(--border)] text-[var(--secondary)] cursor-pointer"><X size={15}/></button>
            </div>
            <div className="drawer-body space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs font-bold text-[var(--text)] leading-relaxed">{selectedPost.label}</p></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-[var(--secondary)] uppercase block">Scheduled Date & Time (IST)</label>
                <input type="datetime-local" className="input text-sm" value={postScheduledAt} onChange={e=>setPostScheduledAt(e.target.value)}/>
                <p className="text-[10px] text-[var(--muted)]">Leave empty to mark as Planned (unscheduled).</p>
              </div>
            </div>
            <div className="drawer-footer">
              <button type="button" onClick={() => setPostDrawerOpen(false)} className="flex-1 h-12 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--secondary)] cursor-pointer">Cancel</button>
              <button type="button" onClick={handleUpdatePostSchedule} disabled={postSaving} className="flex-1 btn-primary h-12 text-xs rounded-2xl disabled:opacity-60">{postSaving?'Saving…':'Save Schedule'}</button>
            </div>
          </div>
        </>
      )}

      {/* Import drawers */}
      <ImportDrawer isOpen={isGmbImportOpen}      onClose={() => setGmbImportOpen(false)}      columns={GMB_COLUMNS}       onImport={handleImportGmb}/>
      <ImportDrawer isOpen={isIgImportOpen}       onClose={() => setIgImportOpen(false)}       columns={INSTAGRAM_COLUMNS}  onImport={handleImportIg}/>
      <ImportDrawer isOpen={isLinkedinImportOpen} onClose={() => setLinkedinImportOpen(false)} columns={LINKEDIN_COLUMNS}   onImport={handleImportLinkedin}/>
      <ImportDrawer isOpen={isTwitterImportOpen}  onClose={() => setTwitterImportOpen(false)}  columns={TWITTER_COLUMNS}    onImport={handleImportTwitter}/>
      <ImportDrawer isOpen={isYoutubeImportOpen}  onClose={() => setYoutubeImportOpen(false)}  columns={YOUTUBE_COLUMNS}    onImport={handleImportYoutube}/>
    </div>
  );
}
