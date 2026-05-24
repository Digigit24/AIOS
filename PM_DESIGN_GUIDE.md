# PM Document Design Guide
HTML files stored in the PM folder of each client workspace.
Rendered inside the AgencyOS client tab via an iframe.

---

## Core Rules
- Self-contained single HTML file — no external JS frameworks
- All CSS inline in `<style>` inside `<head>`
- Fonts via Google Fonts CDN only (`Inter` preferred)
- No images unless base64 embedded
- Mobile-responsive (max-width 900px centered)
- Minimal tokens — avoid verbose markup

---

## Color Palette
```css
:root {
  --bg:       #0f0f12;
  --surface:  #1a1a22;
  --card:     #1e1e28;
  --border:   #2a2a38;
  --text:     #f0f0f5;
  --muted:    #6b6b80;
  --accent:   #7c6ff7;        /* violet */
  --accent2:  #34d399;        /* emerald — positive / done */
  --warn:     #f59e0b;        /* amber — in-progress */
  --danger:   #f87171;        /* red — blocked */
}
```

---

## Base HTML Shell
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{Client}} — {{Document Title}}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#0f0f12;color:#f0f0f5;min-height:100vh;padding:32px 16px}
.wrap{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:24px}
/* tokens */
:root{--bg:#0f0f12;--surface:#1a1a22;--card:#1e1e28;--border:#2a2a38;--text:#f0f0f5;--muted:#6b6b80;--accent:#7c6ff7;--accent2:#34d399;--warn:#f59e0b;--danger:#f87171}
/* card */
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px}
/* label chip */
.chip{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:99px;border:1px solid}
.chip-violet{background:rgba(124,111,247,.1);color:var(--accent);border-color:rgba(124,111,247,.2)}
.chip-green{background:rgba(52,211,153,.1);color:var(--accent2);border-color:rgba(52,211,153,.2)}
.chip-amber{background:rgba(245,158,11,.1);color:var(--warn);border-color:rgba(245,158,11,.2)}
.chip-red{background:rgba(248,113,113,.1);color:var(--danger);border-color:rgba(248,113,113,.2)}
</style>
</head>
<body>
<div class="wrap">
  <!-- PAGE HEADER -->
  <header class="card" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div>
      <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">{{Client Name}}</p>
      <h1 style="font-size:22px;font-weight:800;margin-top:4px">{{Document Title}}</h1>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <span class="chip chip-violet">{{Month Year}}</span>
      <span class="chip chip-amber">In Progress</span>
    </div>
  </header>

  <!-- CONTENT SECTIONS GO HERE -->

</div>
</body>
</html>
```

---

## Components

### 1. Section Header
```html
<div style="margin-bottom:16px">
  <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Section Label</p>
  <h2 style="font-size:16px;font-weight:800;margin-top:4px">Section Title</h2>
</div>
```

### 2. Timeline / Roadmap
```html
<div class="card">
  <div style="margin-bottom:16px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Roadmap</p>
    <h2 style="font-size:16px;font-weight:800;margin-top:4px">Campaign Timeline</h2>
  </div>
  <div style="display:flex;flex-direction:column;gap:0">
    <!-- repeat this block per milestone -->
    <div style="display:flex;gap:16px;padding-bottom:20px;position:relative">
      <div style="display:flex;flex-direction:column;align-items:center;width:28px;flex-shrink:0">
        <div style="width:12px;height:12px;border-radius:50%;background:var(--accent2);border:2px solid var(--accent2);flex-shrink:0;margin-top:3px"></div>
        <div style="width:1px;flex:1;background:var(--border);margin-top:4px"></div>
      </div>
      <div style="flex:1;padding-bottom:4px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <p style="font-size:13px;font-weight:700">Milestone Name</p>
          <span class="chip chip-green">Done</span>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-top:4px">Short description or outcome.</p>
        <p style="font-size:10px;color:var(--muted);margin-top:6px;font-weight:600">May 2025</p>
      </div>
    </div>
    <!-- in-progress node: use warn color -->
    <div style="display:flex;gap:16px;padding-bottom:20px;position:relative">
      <div style="display:flex;flex-direction:column;align-items:center;width:28px;flex-shrink:0">
        <div style="width:12px;height:12px;border-radius:50%;background:var(--warn);border:2px solid var(--warn);flex-shrink:0;margin-top:3px"></div>
        <div style="width:1px;flex:1;background:var(--border);margin-top:4px"></div>
      </div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <p style="font-size:13px;font-weight:700">Current Milestone</p>
          <span class="chip chip-amber">In Progress</span>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-top:4px">What is happening now.</p>
      </div>
    </div>
    <!-- pending node: use border/muted -->
    <div style="display:flex;gap:16px">
      <div style="display:flex;flex-direction:column;align-items:center;width:28px;flex-shrink:0">
        <div style="width:12px;height:12px;border-radius:50%;background:var(--surface);border:2px solid var(--border);flex-shrink:0;margin-top:3px"></div>
      </div>
      <div style="flex:1">
        <p style="font-size:13px;font-weight:700;color:var(--muted)">Upcoming Milestone</p>
        <p style="font-size:12px;color:var(--muted);margin-top:4px">Planned next steps.</p>
      </div>
    </div>
  </div>
</div>
```

### 3. Status Grid (Current State)
```html
<div class="card">
  <div style="margin-bottom:16px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Overview</p>
    <h2 style="font-size:16px;font-weight:800;margin-top:4px">Current State</h2>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
    <!-- stat card -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px">
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">GMB Posts</p>
      <p style="font-size:28px;font-weight:800;margin-top:6px;color:var(--accent)">12</p>
      <p style="font-size:11px;color:var(--muted);margin-top:2px">of 15 promised</p>
    </div>
    <!-- repeat per metric -->
  </div>
</div>
```

### 4. Task List (Recent Done / Planned)
```html
<div class="card">
  <div style="margin-bottom:16px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Tasks</p>
    <h2 style="font-size:16px;font-weight:800;margin-top:4px">Recently Completed</h2>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
    <!-- task row -->
    <div style="display:flex;align-items:flex-start;gap:10px;padding:12px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="width:18px;height:18px;border-radius:50%;background:rgba(52,211,153,.15);border:1.5px solid var(--accent2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#34d399" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div style="flex:1;min-width:0">
        <p style="font-size:13px;font-weight:600">Task description here</p>
        <p style="font-size:11px;color:var(--muted);margin-top:2px">May 20, 2025</p>
      </div>
    </div>
  </div>
</div>
```

### 5. Strategy / Planning Section
```html
<div class="card">
  <div style="margin-bottom:16px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Strategy</p>
    <h2 style="font-size:16px;font-weight:800;margin-top:4px">Next Steps & Planning</h2>
  </div>
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;gap:12px;align-items:flex-start;padding:14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="width:24px;height:24px;border-radius:8px;background:rgba(124,111,247,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:800;color:var(--accent)">1</div>
      <div>
        <p style="font-size:13px;font-weight:700">Action Item Title</p>
        <p style="font-size:12px;color:var(--muted);margin-top:3px">Context, goal, or expected outcome.</p>
      </div>
    </div>
  </div>
</div>
```

### 6. Links Section
```html
<div class="card">
  <div style="margin-bottom:16px">
    <p style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Resources</p>
    <h2 style="font-size:16px;font-weight:800;margin-top:4px">Links</h2>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px">
    <a href="#" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;font-size:12px;font-weight:600;color:var(--text);text-decoration:none;transition:border-color .2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      ↗ Link Label
    </a>
  </div>
</div>
```

---

## Dos and Don'ts
| Do | Don't |
|----|-------|
| Use the token palette above | Use hex colors not in the palette |
| Keep cards flat, no heavy shadows | Use gradients, glassmorphism |
| Inter, 400/600/700/800 only | Load multiple font families |
| Inline all styles — no external CSS | Link external stylesheets |
| Keep markup tight — one tag per job | Nest divs more than 4 levels deep |
| Use chips to convey status | Use emojis as status indicators |
| One clear h1 per document | Multiple competing page titles |

---

## AI Agent Prompt Template
When asking an AI to generate a PM document, include:

```
Generate a self-contained HTML PM document for client "{Client Name}".
Follow the PM_DESIGN_GUIDE exactly: dark background #0f0f12, Inter font,
no external CSS or JS frameworks, all styles inline.

Include these sections:
- Header (client name, document title, month, status chip)
- Current State grid (metrics: {list metrics})
- Roadmap timeline ({list milestones with status: done/in-progress/pending})
- Recently Completed tasks ({list tasks})
- Next Steps ({list planned actions})
- Links ({list URLs with labels})

Return only the complete HTML file. No markdown wrapper.
```
