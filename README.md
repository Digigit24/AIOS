# AgencyOS Starter Template

A modern, highly premium developer template containing a **Node.js (Express)** backend and a responsive **React (Vite + Tailwind CSS v4)** frontend.

## Key Features

1. **Flexible Theme Customization**: Interactive settings sidebar allows users to dynamically select fonts (Inter, DM Sans, Playfair Display), custom primary accents, and secondary text hues at runtime.
2. **True Responsive Architecture**: Fluid layouts matching desktop setups perfectly, featuring offscreen mobile menus and responsive components that shift from slide-out drawers (on desktop) to interactive bottom-sheets (on mobile).
3. **Advanced CSS Variables Setup**: Pure HSL/CSS custom property system allowing instant dark/light shifting with real-time browser reflection.

## Project Structure

```
/
├── package.json         # Root orchestrator scripts
├── backend/             # Express server
│   ├── package.json
│   └── index.js         # Core backend middleware
└── frontend/            # Vite + React app
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── index.css    # Typography, global components & variables
        ├── main.jsx     # Root renderer
        ├── App.jsx      # Router & provider setup
        ├── components/  # Shared layouts, drawers, menus
        └── api/         # Service layer
```

## Quick Start

### 1. Install all dependencies
From the project root:
```bash
npm run install:all
```

### 2. Start servers concurrently
Starts both the frontend and backend servers at once:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend will run on `http://localhost:5000`.
