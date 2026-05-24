/**
 * Helper to convert HEX to HSL
 */
function hexToHsl(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return { h: 240, s: 100, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Helper to convert HSL to HEX
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = x => {
    const hex = Math.round((x + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Derives dynamic style variables from hex primary and secondary colors.
 * 
 * @param {string} primary - Hex color code (e.g. '#4F46E5')
 * @param {string} secondary - Hex color code (e.g. '#06B6D4')
 * @returns {object} Derived tokens
 */
export function deriveThemeTokens(primary, secondary) {
  const p = hexToHsl(primary);
  const s = hexToHsl(secondary);

  // Derive slightly darker hover shade (-8% lightness)
  const hoverLightness = Math.max(p.l - 8, 10);
  const primaryHover = hslToHex(p.h, p.s, hoverLightness);

  return {
    accent: primary,
    accentHover: primaryHover,
    accentTint: `rgba(${Math.round(hslToRgb(p.h, p.s, p.l).join(','))}, 0.12)`,
    accentSoft: `rgba(${Math.round(hslToRgb(p.h, p.s, p.l).join(','))}, 0.05)`,
    secondaryAccent: secondary,
    secondaryAccentTint: `rgba(${Math.round(hslToRgb(s.h, s.s, s.l).join(','))}, 0.12)`
  };
}

// Helper to convert HSL to raw RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Writes the active theme configuration onto document.documentElement CSS variables.
 * 
 * @param {object} config - Active configuration { primaryColor, secondaryColor, font }
 */
export function applyThemeConfig(config) {
  if (!config) return;
  const root = document.documentElement;

  // Apply Fonts
  let fontValue = "'Inter', sans-serif";
  if (config.font === 'DM Sans') {
    fontValue = "'DM Sans', sans-serif";
  } else if (config.font === 'Playfair Display') {
    fontValue = "'Playfair Display', serif";
  }
  root.style.setProperty('--font-family', fontValue);

  // Derive dynamic color states
  const tokens = deriveThemeTokens(config.primaryColor, config.secondaryColor);

  // Write values
  root.style.setProperty('--accent', tokens.accent);
  root.style.setProperty('--accent-hover', tokens.accentHover);
  root.style.setProperty('--accent-tint', tokens.accentTint);
  root.style.setProperty('--accent-soft', tokens.accentSoft);
  root.style.setProperty('--scrollbar-thumb', tokens.accent);

  root.style.setProperty('--secondary-accent', tokens.secondaryAccent);
  root.style.setProperty('--secondary-accent-tint', tokens.secondaryAccentTint);
}

/**
 * Retrieves configurations from LocalStorage.
 * Saves defaults if not present.
 */
const STORAGE_KEY = 'agencyos_theme_config';
export const DEFAULT_THEME_CONFIG = {
  primaryColor: '#4f46e5',   // Indigo
  secondaryColor: '#06b6d4', // Cyan
  font: 'Inter'              // Default
};

export function getThemeConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME_CONFIG;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveThemeConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    applyThemeConfig(config);
  } catch (e) {
    console.error('Failed to save theme config', e);
  }
}
