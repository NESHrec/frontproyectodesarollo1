"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";
const STORAGE_KEY = "clinica-serena-theme";

const choices: { value: ThemeChoice; icon: string; label: string }[] = [
  { value: "system", icon: "◐", label: "Usar tema del sistema" },
  { value: "light", icon: "☀", label: "Tema claro" },
  { value: "dark", icon: "☾", label: "Tema oscuro" },
];

export function ThemeSwitcher() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemeChoice = saved === "dark" || saved === "light" ? saved : "system";
    queueMicrotask(() => setChoice(initial));
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.serenaTheme = choice === "system" ? media.matches ? "dark" : "light" : choice;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [choice]);

  function select(next: ThemeChoice) {
    setChoice(next);
    if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div aria-label="Apariencia" className="serena-theme-switcher" role="group">
      {choices.map((item) => <button
        aria-label={item.label}
        aria-pressed={choice === item.value}
        className="serena-theme-choice"
        key={item.value}
        onClick={() => select(item.value)}
        title={item.label}
        type="button"
      >{item.icon}</button>)}
    </div>
  );
}
