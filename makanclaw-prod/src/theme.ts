export interface ThemeConfig {
  name: string;
  isLight: boolean;
  css: {
    bg: string;
    bgAlt: string;
    neonOrange: string;
    neonGold: string;
    neonPink: string;
    neonYellow: string;
    glass: string;
    text: string;
    textDim: string;
    machineFrame: string;
    machineEdge: string;
  };
  claw: {
    face: string;
    light: string;
    mid: string;
    dark: string;
    deep: string;
    rivet: string;
    accent: string;
    led: string;
  };
  canvas: {
    floorTop: string;
    floorBottom: string;
    chainLight: string;
    chainDark: string;
    chainMount: string;
  };
  capsuleColors: string[];
  confettiColors: string[];
  ambientColors: string[];
  ambientAlpha: number;
  displayFont: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  name: 'warm-arcade',
  isLight: false,
  css: {
    bg: '#1a0a10',
    bgAlt: '#120810',
    neonOrange: '#FF6B35',
    neonGold: '#FFD23F',
    neonPink: '#EF476F',
    neonYellow: '#FFD600',
    glass: 'rgba(255,200,150,0.06)',
    text: '#FFF5EB',
    textDim: '#B89878',
    machineFrame: '#1e1018',
    machineEdge: '#302020',
  },
  claw: {
    face: '#8a7e72',
    light: '#a89e90',
    mid: '#7a6e62',
    dark: '#4e4440',
    deep: '#352e2a',
    rivet: '#6a605a',
    accent: '#FF6B35',
    led: '#FFD23F',
  },
  canvas: {
    floorTop: '#1e1018',
    floorBottom: '#150a10',
    chainLight: 'rgba(200,170,140,0.7)',
    chainDark: 'rgba(160,130,100,0.6)',
    chainMount: '#4a3838',
  },
  capsuleColors: [
    '#EF476F', '#FF6B35', '#FFD23F', '#06D6A0',
    '#A855F7', '#38BDF8', '#F472B6', '#34D399',
    '#FB923C', '#E879F9', '#22D3EE', '#FACC15',
  ],
  confettiColors: ['#EF476F', '#FFD23F', '#FF6B35', '#06D6A0', '#A855F7', '#F472B6'],
  ambientColors: ['#FF6B35', '#FFD23F', '#EF476F', '#FFD600', '#A855F7'],
  ambientAlpha: 0.3,
  displayFont: "'Orbitron', system-ui, sans-serif",
};

export const SUNWAY_PYRAMID_THEME: ThemeConfig = {
  name: 'sunway-pyramid',
  isLight: true,
  css: {
    bg: '#FBF8F2',
    bgAlt: '#F5F0E8',
    neonOrange: '#EB1C24',
    neonGold: '#D4A520',
    neonPink: '#E8456B',
    neonYellow: '#D4A520',
    glass: 'rgba(0,0,0,0)',
    text: '#2C2C2C',
    textDim: '#7A7068',
    machineFrame: '#F0ECE4',
    machineEdge: '#E0D8CC',
  },
  claw: {
    face: '#B8A48E',
    light: '#D0BCA6',
    mid: '#A08E78',
    dark: '#6E5E4E',
    deep: '#4A3E32',
    rivet: '#8A7A68',
    accent: '#D4503A',
    led: '#E8C85A',
  },
  canvas: {
    floorTop: '#EDE6DA',
    floorBottom: '#E4DCCE',
    chainLight: 'rgba(176,156,132,0.8)',
    chainDark: 'rgba(140,122,100,0.7)',
    chainMount: '#907A62',
  },
  capsuleColors: [
    '#EB1C24', '#EB1C24', '#EB1C24', '#EB1C24',
    '#EB1C24', '#EB1C24', '#EB1C24', '#EB1C24',
    '#EB1C24', '#EB1C24', '#EB1C24', '#EB1C24',
  ],
  confettiColors: ['#E8917A', '#E8C85A', '#7BA68A', '#F0B4B0', '#D4503A', '#F0C090'],
  ambientColors: [],
  ambientAlpha: 0,
  displayFont: "Bradley, Futura, arial, sans-serif",
};

const CSS_VAR_MAP: Record<string, string> = {
  bg: '--bg',
  bgAlt: '--bg-alt',
  neonOrange: '--neon-orange',
  neonGold: '--neon-gold',
  neonPink: '--neon-pink',
  neonYellow: '--neon-yellow',
  glass: '--glass',
  text: '--text',
  textDim: '--text-dim',
  machineFrame: '--machine-frame',
  machineEdge: '--machine-edge',
};

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.css)) {
    const varName = CSS_VAR_MAP[key];
    if (varName) root.style.setProperty(varName, value);
  }
  root.style.setProperty('--display-font', theme.displayFont);
  root.style.setProperty('--is-light', theme.isLight ? '1' : '0');
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
