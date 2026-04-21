"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "contrast";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("theme") as Theme) ?? "light";
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light", "dark", "contrast");
  html.classList.add(theme);
  localStorage.setItem("theme", theme);
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function cycle() {
    const next: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "contrast" : "light";
    setTheme(next);
    applyTheme(next);
  }

  const labels: Record<Theme, string> = {
    light: "Light",
    dark: "Dark",
    contrast: "High contrast",
  };

  const icons: Record<Theme, string> = {
    light: "☀️",
    dark: "🌙",
    contrast: "◑",
  };

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${labels[theme]}. Click to change.`}
      title={`Theme: ${labels[theme]}`}
      className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors focus-visible:outline-blue-700 dark:focus-visible:outline-blue-400"
    >
      <span aria-hidden="true">{icons[theme]}</span>
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
}
