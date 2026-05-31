# PM Document Design Guide
HTML files stored in the PM folder of each client workspace.
Rendered inside the AgencyOS **Pages** module (and the client tab iframe).

---

## Core Rules
- Self-contained single HTML file — no external JS frameworks
- All CSS in a `<style>` block inside `<head>` — no inline `style=` unless overriding layout per-instance
- Fonts via Google Fonts CDN only (`Inter`, weights 400 500 600 700 800)
- No images unless base64 embedded
- Mobile-responsive — `max-width: 820px` centered, collapses cleanly at 560px
- Light background — documents are meant to feel like a clean client report, not a dashboard

---

## Color Palette

```css
/* Background layers */
--bg:          #f4f5f7;   /* page background */
--card:        #ffffff;   /* card surface */
--card-inner:  #fafafa;   /* inner stat/action card */
--border:      #e8eaed;   /* card borders */
--border-inner:#f0f0f0;   /* inner element borders */

/* Typography */
--text:        #111827;   /* headings, bold labels */
--body:        #374151;   /* body copy */
--secondary:   #6b7280;   /* descriptions, meta */
--muted:       #9ca3af;   /* labels, timestamps, placeholders */

/* Status colors */
--indigo:      #4f46e5;   /* primary accent (links, highlights) */
--indigo-bg:   #eef2ff;
--indigo-border:#c7d2fe;

--green:       #059669;   /* done / success */
--green-bg:    #ecfdf5;
--green-border:#a7f3d0;

--amber:       #d97706;   /* in-progress / next up / warning */
--amber-bg:    #fffbeb;
--amber-border:#fcd34d;

--red:         #dc2626;   /* blocked / danger */
--red-bg:      #fef2f2;
--red-border:  #fca5a5;

--gray:        #6b7280;   /* neutral chip */
--gray-bg:     #f3f4f6;
--gray-border: #e5e7eb;

/* Progress */
--progress-fill: linear-gradient(90deg, #6366f1, #818cf8);
--progress-track:#f0f0f0;
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
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #f4f5f7;
  color: #111827;
  min-height: 100vh;
  padding: 32px 20px 48px;
  -webkit-font-smoothing: antialiased;
}

.wrap {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  padding: 24px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 10px;
  padding-left: 2px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  border: 1.5px solid;
  white-space: nowrap;
}
.chip-indigo { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }
.chip-green  { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
.chip-amber  { background: #fffbeb; color: #d97706; border-color: #fcd34d; }
.chip-red    { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
.chip-gray   { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }
.chip-tag    { background: #f0f0ff; color: #6366f1; border-color: #e0e0ff; font-size: 10px; font-weight: 700; }

hr { border: none; border-top: 1px solid #f0f0f0; }

.progress-track { height: 8px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
.progress-fill  { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #6366f1, #818cf8); }

/* Timeline dots */
.dot-done    { background: #10b981; border: 2px solid #10b981; box-shadow: 0 0 0 3px #d1fae5; }
.dot-next    { background: #f59e0b; border: 2px solid #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }
.dot-blocked { background: #ef4444; border: 2px solid #ef4444; box-shadow: 0 0 0 3px #fee2e2; }
.dot-pending { background: #fff;    border: 2px solid #d1d5db; }

/* Blockers */
.blocker { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 10px; border-left: 3.5px solid; }
.blocker-red   { background: #fff5f5; border-color: #ef4444; }
.blocker-amber { background: #fffdf0; border-color: #f59e0b; }

/* Numbered action items */
.action-item { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; }
.action-num  { width: 24px; height: 24px; border-radius: 8px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* Stat card */
.stat-card  { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 12px; padding: 16px; }
.stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; }
.stat-value { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.1; margin-top: 4px; }
.stat-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }

/* Link button */
.link-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; font-weight: 600; color: #374151; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
.link-btn:hover { border-color: #6366f1; background: #f0f0ff; color: #4f46e5; }

@media (max-width: 560px) {
  body { padding: 16px 12px 32px; }
  .card { padding: 18px; }
  .stat-value { font-size: 22px; }
}
</style>
</head>
<body>
<div class="wrap">

  <!-- HEADER -->
  <!-- SECTIONS -->

</div>
</body>
</html>
```

---

## Components

### 1. Page Header Card
Top of every document. Client name, doctor/contact line, status chip, date.

```html
<div class="card" style="padding: 28px 28px 24px;">
  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:18px;">
    <div>
      <p style="font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:6px;">
        Client Progress Report
      </p>
      <h1 style="font-size:24px; font-weight:800; color:#111827; letter-spacing:-0.02em; line-height:1.2;">
        {{Client Name}}
      </h1>
      <p style="font-size:13px; color:#6b7280; margin-top:4px; font-weight:500;">
        {{Contact / Tagline}}
      </p>
    </div>
    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0;">
      <span class="chip chip-amber">🟡 Setting Up</span>
      <span style="font-size:11px; color:#9ca3af; font-weight:500;">{{Month Year}}</span>
    </div>
  </div>

  <hr style="margin-bottom:18px;">

  <!-- Meta grid: location, website, active-since, etc. -->
  <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:12px 20px; margin-bottom:18px;">
    <div>
      <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:3px;">Location</p>
      <p style="font-size:13px; font-weight:600; color:#374151;">{{City / Area}}</p>
    </div>
    <div>
      <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:3px;">Website</p>
      <a href="{{url}}" target="_blank" style="font-size:13px; font-weight:600; color:#4f46e5; text-decoration:none;">{{domain}} ↗</a>
    </div>
    <!-- repeat per field -->
  </div>

  <!-- Service tags -->
  <div style="display:flex; flex-wrap:wrap; gap:6px;">
    <span class="chip chip-tag">Social Media</span>
    <span class="chip chip-tag">SEO</span>
    <span class="chip chip-tag">GMB</span>
  </div>
</div>
```

Status chip options: `chip-green` (Active), `chip-amber` (Setting Up / In Progress), `chip-red` (Paused), `chip-gray` (Draft).

---

### 2. Foundation / Progress Bar Card
Shows a named chain progress with segmented step pills.

```html
<div class="card">
  <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
    <div>
      <p style="font-size:11px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase; color:#9ca3af; margin-bottom:4px;">Foundation Chain</p>
      <h2 style="font-size:16px; font-weight:800; color:#111827;">{{N}} of {{Total}} steps complete</h2>
    </div>
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:26px; font-weight:800; color:#6366f1;">{{N}}%</span>
      <span style="font-size:12px; color:#9ca3af; font-weight:500;">of foundation</span>
    </div>
  </div>

  <!-- Main bar -->
  <div class="progress-track" style="margin-bottom:20px;">
    <div class="progress-fill" style="width:{{N}}%;"></div>
  </div>

  <!-- Segmented step pills (one per step, colored by state) -->
  <!-- Colors: #10b981 done · #f59e0b in-progress/next · #ef4444 blocked · #e5e7eb pending -->
  <div style="display:flex; gap:4px; margin-bottom:4px;">
    <div style="flex:1; height:4px; border-radius:2px; background:#10b981;"></div>
    <div style="flex:1; height:4px; border-radius:2px; background:#f59e0b;"></div>
    <div style="flex:1; height:4px; border-radius:2px; background:#e5e7eb;"></div>
    <!-- repeat for each step -->
  </div>
  <!-- Step numbers below pills -->
  <div style="display:flex; gap:4px;">
    <p style="flex:1; text-align:center; font-size:9px; font-weight:600; color:#9ca3af;">00</p>
    <p style="flex:1; text-align:center; font-size:9px; font-weight:600; color:#d97706;">01</p>
    <p style="flex:1; text-align:center; font-size:9px; font-weight:600; color:#9ca3af;">02</p>
  </div>
</div>
```

---

### 3. Snapshot / Stats Grid
Numbers at a glance.

```html
<div class="card">
  <p class="section-label">{{Month Year}} Snapshot</p>
  <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:12px;">
    <div class="stat-card">
      <span class="stat-label">{{Metric Name}}</span>
      <span class="stat-value" style="color:#6366f1;">{{Value}}</span>
      <span class="stat-sub">{{Subtext}</span>
    </div>
    <!-- use color:#9ca3af for zero / not started values -->
  </div>
</div>
```

---

### 4. Timeline
Step-by-step vertical timeline with connecting line.

```html
<div class="card">
  <p class="section-label">Step-by-step</p>
  <h2 style="font-size:16px; font-weight:800; color:#111827; margin-bottom:24px;">{{Timeline Title}}</h2>

  <div style="display:flex; flex-direction:column; gap:0;">

    <!-- DONE node -->
    <div style="display:flex; gap:16px; padding-bottom:22px; position:relative;">
      <div style="display:flex; flex-direction:column; align-items:center; width:24px; flex-shrink:0;">
        <div class="dot-done" style="width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:3px;"></div>
        <div style="width:1.5px; flex:1; background:#e5e7eb; margin-top:6px;"></div>
      </div>
      <div style="flex:1; padding-bottom:4px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
          <p style="font-size:13px; font-weight:700; color:#111827;">{{Step Name}}</p>
          <span class="chip chip-green" style="font-size:10px;">Done</span>
        </div>
        <p style="font-size:12px; color:#6b7280; line-height:1.55;">{{Description}}</p>
      </div>
    </div>

    <!-- NEXT UP node — highlighted card inside -->
    <div style="display:flex; gap:16px; padding-bottom:22px;">
      <div style="display:flex; flex-direction:column; align-items:center; width:24px; flex-shrink:0;">
        <div class="dot-next" style="width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:3px;"></div>
        <div style="width:1.5px; flex:1; background:#e5e7eb; margin-top:6px;"></div>
      </div>
      <div style="flex:1; padding:14px; background:#fffdf0; border:1px solid #fcd34d; border-radius:10px; margin-bottom:4px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px;">
          <p style="font-size:13px; font-weight:700; color:#92400e;">{{Step Name}}</p>
          <span class="chip chip-amber" style="font-size:10px;">Next Up →</span>
        </div>
        <p style="font-size:12px; color:#92400e; line-height:1.55;">{{Description}}</p>
      </div>
    </div>

    <!-- BLOCKED node -->
    <div style="display:flex; gap:16px; padding-bottom:22px;">
      <div style="display:flex; flex-direction:column; align-items:center; width:24px; flex-shrink:0;">
        <div class="dot-blocked" style="width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:3px;"></div>
        <div style="width:1.5px; flex:1; background:#e5e7eb; margin-top:6px;"></div>
      </div>
      <div style="flex:1; padding-bottom:4px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
          <p style="font-size:13px; font-weight:700; color:#111827;">{{Step Name}}</p>
          <span class="chip chip-red" style="font-size:10px;">Blocked</span>
        </div>
        <p style="font-size:12px; color:#6b7280; line-height:1.55;">{{Description}}</p>
      </div>
    </div>

    <!-- PENDING node (last item — no connector line) -->
    <div style="display:flex; gap:16px;">
      <div style="display:flex; flex-direction:column; align-items:center; width:24px; flex-shrink:0;">
        <div class="dot-pending" style="width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:3px;"></div>
      </div>
      <div style="flex:1;">
        <p style="font-size:13px; font-weight:700; color:#9ca3af;">{{Step Name}}</p>
        <p style="font-size:12px; color:#9ca3af; line-height:1.55; margin-top:4px;">{{Description}}</p>
      </div>
    </div>

  </div>
</div>
```

---

### 5. Blockers Section
Hard blockers requiring client or team action before work can continue.

```html
<div class="card">
  <p class="section-label">Blockers</p>
  <h2 style="font-size:16px; font-weight:800; color:#111827; margin-bottom:16px;">Items Requiring Action</h2>
  <div style="display:flex; flex-direction:column; gap:10px;">

    <!-- Critical blocker -->
    <div class="blocker blocker-red">
      <span style="font-size:18px; flex-shrink:0;">🔴</span>
      <div>
        <p style="font-size:13px; font-weight:700; color:#991b1b;">{{Blocker Title}}</p>
        <p style="font-size:12px; color:#b91c1c; margin-top:4px; line-height:1.5;">{{What is blocked and why.}}</p>
      </div>
    </div>

    <!-- Soft blocker / advisory -->
    <div class="blocker blocker-amber">
      <span style="font-size:18px; flex-shrink:0;">🟡</span>
      <div>
        <p style="font-size:13px; font-weight:700; color:#92400e;">{{Advisory Title}}</p>
        <p style="font-size:12px; color:#b45309; margin-top:4px; line-height:1.5;">{{Context and recommended action.}}</p>
      </div>
    </div>

  </div>
</div>
```

---

### 6. Action Items / Next Steps
Numbered list of what happens next.

```html
<div class="card">
  <p class="section-label">Next Steps</p>
  <h2 style="font-size:16px; font-weight:800; color:#111827; margin-bottom:16px;">Immediate Actions</h2>
  <div style="display:flex; flex-direction:column; gap:8px;">

    <div class="action-item">
      <div class="action-num">1</div>
      <div>
        <p style="font-size:13px; font-weight:700; color:#111827;">{{Action Title}}</p>
        <p style="font-size:12px; color:#6b7280; margin-top:3px; line-height:1.5;">{{Context or expected outcome.}}</p>
      </div>
    </div>

    <!-- repeat per action -->
  </div>
</div>
```

---

### 7. Links / Resources
Clickable reference links.

```html
<div class="card">
  <p class="section-label">Resources</p>
  <h2 style="font-size:16px; font-weight:800; color:#111827; margin-bottom:14px;">Key Links</h2>
  <div style="display:flex; flex-wrap:wrap; gap:8px;">
    <a href="{{url}}" target="_blank" class="link-btn">↗ {{Label}}</a>
    <!-- repeat -->
  </div>
</div>
```

---

## Status Dot + Chip Reference

| State | Dot class | Chip class | Use for |
|-------|-----------|------------|---------|
| Done | `dot-done` | `chip-green` | Completed steps |
| Next Up | `dot-next` | `chip-amber` | The active/immediate next step (use highlighted card) |
| Blocked | `dot-blocked` | `chip-red` | Waiting on client or external dependency |
| Pending | `dot-pending` | `chip-gray` | Future steps, not started |
| Active client | — | `chip-indigo` | General status on header |
| Service tags | — | `chip-tag` | Service categories in header |

---

## Typography Scale

| Use | Size | Weight | Color |
|-----|------|--------|-------|
| Document title (h1) | 24px | 800 | `#111827` |
| Section heading (h2) | 16px | 800 | `#111827` |
| Body / descriptions | 12–13px | 400–600 | `#6b7280` |
| Section label | 11px | 700 · uppercase | `#9ca3af` |
| Meta label | 10px | 700 · uppercase | `#9ca3af` |
| Step number in pill | 9px | 600 | varies |

Letter-spacing on uppercase labels: `0.08em – 0.10em`.

---

## Dos and Don'ts

| Do | Don't |
|----|-------|
| Light background `#f4f5f7`, white cards | Use dark backgrounds |
| `box-shadow: 0 1px 4px rgba(0,0,0,0.06)` on cards | Heavy shadows or glows |
| Inter 400/500/600/700/800 only | Load multiple font families |
| Segmented step pills for chain progress | Plain text progress lists |
| Highlighted amber card for "Next Up" node | Just a chip on a plain row |
| Left-border blockers (`border-left: 3.5px solid`) | Inline red text warnings |
| Numbered badges (`action-num`) for action items | Plain bullet lists |
| Chip colors only from the defined set | Arbitrary hex status colors |
| `max-width: 820px`, single column below 560px | Fixed-pixel widths |
| One `h1` per document | Multiple competing page titles |

---

## AI Agent Prompt Template

```
Generate a self-contained HTML PM progress report for client "{{Client Name}}".
Follow the PM_DESIGN_GUIDE exactly:
- Light background #f4f5f7, white cards (#ffffff), Inter font
- No external CSS or JS frameworks; all styles in <style> in <head>
- max-width 820px centered, mobile-responsive at 560px

Sections to include:
1. Header card — client name, tagline, status chip (chip-amber "Setting Up" / chip-green "Active"), month, meta grid (location, website, active since), service tag chips
2. Foundation Chain card — progress bar + segmented step pills (green=done, amber=next, red=blocked, gray=pending), step count and %
3. Snapshot grid — 4 stat-cards with key numbers
4. Timeline card — vertical dot timeline with done/next-up/blocked/pending nodes; "Next Up" node uses the amber highlight card variant
5. Blockers card — blocker-red and blocker-amber left-border alert boxes
6. Action Items card — numbered action-num badges
7. Links card — link-btn elements

Data:
- Client: {{client details}}
- Steps: {{step list with statuses}}
- Blockers: {{blocker list}}
- Actions: {{action list}}
- Links: {{link list}}

Return only the complete HTML. No markdown wrapper.
```
