import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setTheme, useTheme } from './theme';

export default function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span
        key={theme}
        className="theme-toggle-icon inline-flex"
        aria-hidden="true"
      >
        {isDark ? <Sun /> : <Moon />}
      </span>
    </Button>
  );
}
