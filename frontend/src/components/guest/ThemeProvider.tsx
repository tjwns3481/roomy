// @TASK T3.4 - 테마 프로바이더
// @SPEC docs/planning/02-trd.md

'use client';

import { Theme } from '@/contracts';
import { useEffect } from 'react';

export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

/**
 * 게스트 페이지 테마 프로바이더
 * Guide의 theme 정보를 CSS 변수로 적용
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // CSS 변수 적용
    root.style.setProperty('--theme-primary-color', theme.primaryColor);
    root.style.setProperty('--theme-background-color', theme.backgroundColor);
    root.style.setProperty('--theme-font-family', theme.fontFamily);

    // Border radius 매핑
    const radiusMap = {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
    };
    root.style.setProperty('--theme-border-radius', radiusMap[theme.borderRadius]);

    return () => {
      // Cleanup
      root.style.removeProperty('--theme-primary-color');
      root.style.removeProperty('--theme-background-color');
      root.style.removeProperty('--theme-font-family');
      root.style.removeProperty('--theme-border-radius');
    };
  }, [theme]);

  return <>{children}</>;
}
