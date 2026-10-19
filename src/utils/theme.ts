import { AccentColor, AppSettings } from '../types';

export interface ColorPaletteConfig {
  id: AccentColor;
  name: string;
  primary: string;
  hover: string;
  light: string; // Fundo suave / badge
  border: string;
  ring: string;
  text: string;
}

export const COLOR_PALETTES: Record<AccentColor, ColorPaletteConfig> = {
  blue: {
    id: 'blue',
    name: 'Azul Clínico',
    primary: '#0284c7', // sky-600
    hover: '#0369a1', // sky-700
    light: 'rgba(2, 132, 199, 0.1)',
    border: 'rgba(2, 132, 199, 0.3)',
    ring: 'rgba(2, 132, 199, 0.25)',
    text: '#0284c7',
  },
  teal: {
    id: 'teal',
    name: 'Verde Esmeralda',
    primary: '#0d9488', // teal-600
    hover: '#0f766e', // teal-700
    light: 'rgba(13, 148, 136, 0.1)',
    border: 'rgba(13, 148, 136, 0.3)',
    ring: 'rgba(13, 148, 136, 0.25)',
    text: '#0d9488',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Saúde',
    primary: '#059669', // emerald-600
    hover: '#047857', // emerald-700
    light: 'rgba(5, 150, 105, 0.1)',
    border: 'rgba(5, 150, 105, 0.3)',
    ring: 'rgba(5, 150, 105, 0.25)',
    text: '#059669',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Moderno',
    primary: '#4f46e5', // indigo-600
    hover: '#4338ca', // indigo-700
    light: 'rgba(79, 70, 229, 0.1)',
    border: 'rgba(79, 70, 229, 0.3)',
    ring: 'rgba(79, 70, 229, 0.25)',
    text: '#4f46e5',
  },
  amber: {
    id: 'amber',
    name: 'Âmbar Solar',
    primary: '#d97706', // amber-600
    hover: '#b45309', // amber-700
    light: 'rgba(217, 119, 6, 0.1)',
    border: 'rgba(217, 119, 6, 0.3)',
    ring: 'rgba(217, 119, 6, 0.25)',
    text: '#d97706',
  },
  rose: {
    id: 'rose',
    name: 'Rubi Cuidado',
    primary: '#e11d48', // rose-600
    hover: '#be123c', // rose-700
    light: 'rgba(225, 29, 72, 0.1)',
    border: 'rgba(225, 29, 72, 0.3)',
    ring: 'rgba(225, 29, 72, 0.25)',
    text: '#e11d48',
  },
};

export function applyTheme(settings: AppSettings): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  const palette = COLOR_PALETTES[settings.accentColor] || COLOR_PALETTES.blue;

  // Injeta variáveis CSS no root
  root.style.setProperty('--brand-primary', palette.primary);
  root.style.setProperty('--brand-hover', palette.hover);
  root.style.setProperty('--brand-light', palette.light);
  root.style.setProperty('--brand-border', palette.border);
  root.style.setProperty('--brand-ring', palette.ring);
  root.style.setProperty('--brand-text', palette.text);

  // Atualiza meta theme-color para a barra do navegador/celular
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#0f172a' : palette.primary);
  }
}
