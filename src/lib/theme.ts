// Light/dark theme without a client provider: an inline script in the root
// layout applies the saved choice before first paint, and ThemeToggle flips
// the `.dark` class and saves it. Light is the default (the brand look).

export const THEME_STORAGE_KEY = "ayad-theme";

export type Theme = "light" | "dark";

export const themeInitScript = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;
