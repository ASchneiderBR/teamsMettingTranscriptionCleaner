import type { ThemePreference } from "../../app/state";

const THEME_KEY = "tmtc-theme";
const THEME_TRANSITION_CLASS = "theme-transitioning";
const THEME_FADE_MS = 220;

export function loadThemePreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function saveThemePreference(theme: ThemePreference): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function resolveTheme(theme: ThemePreference): "light" | "dark" {
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(
  theme: ThemePreference,
  options: {
    animated?: boolean;
  } = {},
): void {
  const nextTheme = resolveTheme(theme);
  const root = document.documentElement;
  const shouldAnimate = options.animated && !prefersReducedMotion();
  const commit = () => {
    root.dataset.theme = nextTheme;
  };

  if (!shouldAnimate) {
    commit();
    return;
  }

  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(commit);
    return;
  }

  root.classList.add(THEME_TRANSITION_CLASS);
  commit();
  window.setTimeout(() => {
    root.classList.remove(THEME_TRANSITION_CLASS);
  }, THEME_FADE_MS);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
