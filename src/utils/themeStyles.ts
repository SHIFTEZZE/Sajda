/**
 * Victorian Theme Palette and Style Tokens
 * Manages Victorian Green & Burgundy palettes, including dark mode variants.
 */

import { AppTheme } from '../services/settingsStorage.ts';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentMuted: string;
  bgBase: string;
  bgCard: string;
  bgCardElevated: string;
  textMain: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  quranSurface: string;
  quranText: string;
}

export function getThemeTokens(theme: AppTheme, isDark: boolean): ThemeColors {
  if (theme === 'burgundy') {
    if (isDark) {
      return {
        primary: '#85263A',
        primaryLight: '#A3334A',
        primaryDark: '#501421',
        accent: '#D4AF57',
        accentMuted: '#9E7E36',
        bgBase: '#150A0E',
        bgCard: '#241018',
        bgCardElevated: '#321522',
        textMain: '#F8EFE4',
        textMuted: '#C2A79F',
        border: 'rgba(212, 175, 87, 0.3)',
        borderSubtle: 'rgba(212, 175, 87, 0.15)',
        quranSurface: '#200D15',
        quranText: '#FFF8EE',
      };
    }
    return {
      primary: '#6B1E2E',
      primaryLight: '#85263A',
      primaryDark: '#4A131F',
      accent: '#C9A24B',
      accentMuted: '#8C6C26',
      bgBase: '#F6ECE0',
      bgCard: '#FFFFFF',
      bgCardElevated: '#FCF7F0',
      textMain: '#261116',
      textMuted: '#68484E',
      border: 'rgba(201, 162, 75, 0.35)',
      borderSubtle: 'rgba(201, 162, 75, 0.18)',
      quranSurface: '#FFFDF9',
      quranText: '#1A0C10',
    };
  }

  // Victorian Green (Default)
  if (isDark) {
    return {
      primary: '#2A523A',
      primaryLight: '#396F4F',
      primaryDark: '#172F21',
      accent: '#C49F63',
      accentMuted: '#8A6D3E',
      bgBase: '#0F1A12',
      bgCard: '#172B1F',
      bgCardElevated: '#213B2B',
      textMain: '#F2EBDC',
      textMuted: '#9FB5A6',
      border: 'rgba(196, 159, 99, 0.3)',
      borderSubtle: 'rgba(196, 159, 99, 0.15)',
      quranSurface: '#15251B',
      quranText: '#FFFBF3',
    };
  }

  return {
    primary: '#1F3D2B',
    primaryLight: '#2C573E',
    primaryDark: '#14291D',
    accent: '#B08D57',
    accentMuted: '#7D6238',
    bgBase: '#F4EBD9',
    bgCard: '#FFFFFF',
    bgCardElevated: '#FAF5EA',
    textMain: '#1A241C',
    textMuted: '#526256',
    border: 'rgba(176, 141, 87, 0.35)',
    borderSubtle: 'rgba(176, 141, 87, 0.18)',
    quranSurface: '#FFFEFA',
    quranText: '#141F16',
  };
}
