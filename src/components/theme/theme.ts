import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';
const storageKey = 'divvy.theme';
const listeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(storageKey);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    /* Keep the light default when storage is unavailable. */
  }
  return 'light';
}

let theme = readTheme();
function applyTheme() {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

let transition: ViewTransition | undefined;
let transitionTimer: ReturnType<typeof setTimeout> | undefined;

function animateThemeChange(update: () => void) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }

  transition?.skipTransition();
  if (document.startViewTransition) {
    transition = document.startViewTransition(update);
    // A hidden document can skip the animation; the update still applies.
    void transition.finished.catch(() => {});
    return;
  }

  // Color interpolation for browsers without the View Transition API.
  clearTimeout(transitionTimer);
  document.documentElement.classList.add('theme-transition');
  update();
  transitionTimer = setTimeout(() => {
    document.documentElement.classList.remove('theme-transition');
  }, 320);
}

export function setTheme(value: string) {
  if (value !== 'light' && value !== 'dark') return;
  if (value === theme) return;
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    /* Theme changes still work for this tab without storage. */
  }
  animateThemeChange(() => {
    theme = value;
    applyTheme();
    listeners.forEach((listener) => listener());
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) {
    theme = readTheme();
    applyTheme();
    listeners.forEach((listener) => listener());
  }
});
applyTheme();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTheme() {
  return useSyncExternalStore(subscribe, () => theme);
}
