// EPLANI Balance — design system
// Token-based, flat, no glass, no gradients. Light + dark from one variable set.

export const STYLES = `
:root {
  --bg: #fafafa; --surface: #ffffff; --surface-2: #f4f4f5;
  --border: #e4e4e7; --text: #18181b; --muted: #71717a;
  --accent: #2563eb; --accent-hover: #1d4ed8; --accent-soft: rgba(37,99,235,.12);
  --radius: 10px;
}
html.dark {
  --bg: #0b0f14; --surface: #121821; --surface-2: #1a2230;
  --border: #232d3b; --text: #e6edf3; --muted: #94a3b8;
  --accent: #3b82f6; --accent-hover: #60a5fa; --accent-soft: rgba(59,130,246,.18);
}

* { box-sizing: border-box; }
html { color-scheme: light; }
html.dark { color-scheme: dark; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
}
.page { width: 100%; max-width: 1120px; margin: 0 auto; padding: 32px 20px 72px; }

/* ---------- header ---------- */
.app-header { border-bottom: 1px solid var(--border); background: var(--surface); }
.app-header-inner {
  max-width: 1120px; margin: 0 auto; padding: 12px 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.brand { display: inline-flex; align-items: center; text-decoration: none; }
.brand img { height: 26px; width: auto; display: block; }
.header-actions { display: flex; align-items: center; gap: 8px; }

/* ---------- buttons ---------- */
.btn, .btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid transparent;
  font-size: 14px; font-weight: 500; line-height: 1; cursor: pointer; text-decoration: none;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .06s ease;
}
.btn-primary { background: var(--accent); color: #fff; width: 100%; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:active { transform: scale(.995); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
.btn-ghost { background: transparent; color: var(--muted); }
.btn-ghost:hover { background: var(--surface-2); color: var(--text); }
.btn-secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
.btn-secondary:hover { background: var(--surface-2); }

/* ---------- inputs ---------- */
.input-field {
  width: 100%; height: 40px; padding: 0 12px;
  background: var(--surface); color: var(--text);
  border: 1px solid var(--border); border-radius: 8px;
  font-size: 14px; outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.input-field::placeholder { color: var(--muted); }
.input-field:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

/* ---------- cards ---------- */
.card, .glass-card, .glass-card-warm {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none;
}
.glass-card:hover, .glass-card-warm:hover { transform: none; box-shadow: none; }

/* ---------- theme toggle ---------- */
.theme-toggle {
  width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid var(--border); background: var(--surface);
  color: var(--muted); cursor: pointer; transition: background-color .15s, color .15s;
}
.theme-toggle:hover { background: var(--surface-2); color: var(--text); }
.theme-toggle .icon-moon { display: none; }
html.dark .theme-toggle .icon-moon { display: block; }
html.dark .theme-toggle .icon-sun { display: none; }

/* ---------- page head ---------- */
.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 600; letter-spacing: -.01em; margin: 0 0 4px; }
.page-sub { font-size: 14px; color: var(--muted); margin: 0; }

/* ---------- providers ---------- */
.provider-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.provider-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  text-decoration: none; color: var(--text);
  transition: border-color .15s ease, background-color .15s ease;
}
.provider-card:hover { border-color: var(--accent); background: var(--surface-2); }
.provider-icon {
  width: 32px; height: 32px; border-radius: 8px; background: var(--surface-2);
  display: inline-flex; align-items: center; justify-content: center; padding: 5px; flex: 0 0 auto;
}
.provider-icon img { width: 100%; height: 100%; object-fit: contain; }
.provider-name { font-size: 14px; font-weight: 500; flex: 1 1 auto; }
.provider-chevron { width: 16px; height: 16px; color: var(--muted); flex: 0 0 auto; }

/* ---------- auth ---------- */
.auth-wrap { min-height: calc(100vh - 200px); display: flex; align-items: center; justify-content: center; padding: 48px 0; }
.auth-card {
  width: 100%; max-width: 380px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 14px; padding: 32px;
}
.auth-logo { display: flex; justify-content: center; margin-bottom: 28px; }
.auth-logo img { height: 40px; width: auto; }
.field-label { display: block; font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 8px; }
.auth-card form { display: flex; flex-direction: column; gap: 16px; }

/* ---------- legacy neutralisers ---------- */
[class*="bg-gradient-to-"] { background-image: none !important; }
[class*="bg-clip-text"] { -webkit-text-fill-color: currentColor; background-image: none !important; color: var(--text); }
.text-transparent { color: var(--text) !important; }
[class*="backdrop-blur"] { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
[class*="rounded-3xl"] { border-radius: var(--radius) !important; }
[class*="rounded-2xl"] { border-radius: 8px !important; }
[class*="shadow-xl"], [class*="shadow-lg"], [class*="shadow-md"] { box-shadow: none !important; }
.blur-3xl { display: none !important; }
.floating-element, .pulse-glow { animation: none !important; }
.breathing-bg { background: var(--bg) !important; animation: none !important; }

html.dark .text-gray-900 { color: #e6edf3 !important; }
html.dark .text-gray-800 { color: #dbe3ec !important; }
html.dark .text-gray-700 { color: #cbd5e1 !important; }
html.dark .text-gray-600 { color: #94a3b8 !important; }
html.dark .text-gray-500 { color: #94a3b8 !important; }
html.dark .text-slate-700 { color: #cbd5e1 !important; }
html.dark .text-slate-800 { color: #e6edf3 !important; }
html.dark .bg-white { background-color: var(--surface) !important; }
html.dark .bg-gray-50 { background-color: var(--surface-2) !important; }
html.dark .bg-gray-100 { background-color: var(--surface-2) !important; }
html.dark [class*="bg-white/80"],
html.dark [class*="bg-white/60"] { background-color: rgba(18,24,33,.85) !important; }
html.dark [class*="bg-slate-100/40"] { background-color: rgba(26,34,48,.4) !important; }
html.dark [class*="hover:bg-blue-100/60"]:hover { background-color: rgba(59,130,246,.12) !important; }
html.dark .border-gray-200, html.dark .border-gray-100 { border-color: var(--border) !important; }
html.dark [class*="border-gray-300/50"] { border-color: var(--border) !important; }
html.dark .text-blue-600 { color: var(--accent) !important; }

/* ---------- focus + motion ---------- */
a:focus-visible, button:focus-visible, input:focus-visible,
select:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;
