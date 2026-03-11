import { useState, useEffect } from "react";
import Sidebar                from "./components/Sidebar.jsx";
import Topbar                 from "./components/Topbar.jsx";
import InvestigationsPage     from "./components/InvestigationsPage.jsx";
import InvestigationWorkspace from "./components/InvestigationWorkspace.jsx";
import DashboardPage          from "./components/Dashboard.jsx";
import ThreatActorsPage       from "./components/ThreatActorsPage.jsx";
import MalwarePage            from "./components/MalwarePage.jsx";
import IOCsPage               from "./components/IOCsPage.jsx";
import DetectionsPage         from "./components/DetectionsPage.jsx";
import SettingsPage           from "./components/SettingsPage.jsx";

import { CSS_VARS }           from "./data/constants.js";

const THEME_KEY = "sdpcti-theme";

const WORKSPACE_CSS = `
  .app-shell { display: flex; height: 100vh; width: 100vw; position: relative; z-index: 1; overflow: hidden; }
  .app-body  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  /* Sidebar */
  .sidebar { display: flex; flex-direction: column; height: 100vh; background: var(--bg-surface); border-right: 1px solid var(--border); transition: width var(--transition); flex-shrink: 0; overflow: hidden; position: relative; z-index: 10; }
  .sidebar::after { content: ''; position: absolute; top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, var(--accent), transparent); opacity: 0.15; }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 16px; height: 52px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .logo-icon { color: var(--accent); flex-shrink: 0; }
  .logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.5px; white-space: nowrap; }
  .logo-accent { color: var(--accent); }
  .sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); border: 1px solid transparent; background: transparent; color: var(--text-muted); cursor: pointer; transition: all var(--transition); white-space: nowrap; width: 100%; text-align: left; font-family: var(--font-ui); font-size: 12.5px; font-weight: 500; }
  .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border); }
  .nav-item--active { background: var(--accent-dim); border-color: var(--border-lit); color: var(--accent); }
  .nav-label { flex: 1; }
  .nav-chevron { opacity: 0.5; flex-shrink: 0; }
  .sidebar-bottom { padding: 8px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 2px; }
  .collapse-btn { display: flex; align-items: center; justify-content: center; padding: 7px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; transition: all var(--transition); width: 100%; }
  .collapse-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  /* Topbar */
  .topbar { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--bg-surface); flex-shrink: 0; gap: 16px; }
  .topbar-search { display: flex; align-items: center; gap: 8px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 12px; flex: 1; max-width: 480px; transition: border-color var(--transition); }
  .topbar-search:focus-within { border-color: var(--border-lit); box-shadow: 0 0 0 3px var(--accent-glow); }
  .search-icon { color: var(--text-muted); flex-shrink: 0; }
  .search-input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: var(--font-ui); font-size: 12.5px; padding: 9px 0; }
  .search-input::placeholder { color: var(--text-muted); }
  .search-hint { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); border: 1px solid var(--border); padding: 2px 5px; border-radius: 4px; flex-shrink: 0; }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }
  .topbar-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
  .topbar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .badge { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); border: 1.5px solid var(--bg-surface); }
  .topbar-divider { width: 1px; height: 22px; background: var(--border); }
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--accent-dim); border: 1px solid var(--border-lit); display: flex; align-items: center; justify-content: center; color: var(--accent); cursor: pointer; }

  /* Main content / Investigations page */
  .main-content { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }
  .page-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; opacity: 0.7; }
  .page-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
  .btn-primary { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: var(--radius); border: 1px solid var(--border-lit); background: var(--accent-dim); color: var(--accent); font-family: var(--font-ui); font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all var(--transition); white-space: nowrap; }
  .btn-primary:hover { background: rgba(34,211,238,0.18); box-shadow: 0 0 16px rgba(34,211,238,0.1); }
  .btn-ghost { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-ui); font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all var(--transition); }
  .btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
  .summary-strip { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .summary-chip { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all var(--transition); user-select: none; }
  .summary-chip:hover { border-color: var(--hover-border); color: var(--text-primary); }
  .summary-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .summary-count { font-weight: 500; opacity: 0.8; }
  .summary-total { display: flex; align-items: center; gap: 5px; margin-left: auto; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
  .filter-bar { display: flex; gap: 10px; align-items: center; }
  .filter-search { display: flex; align-items: center; gap: 8px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 12px; flex: 1; transition: border-color var(--transition); }
  .filter-search:focus-within { border-color: var(--border-lit); box-shadow: 0 0 0 3px var(--accent-glow); }
  .filter-select-wrap { flex-shrink: 0; }
  .select-wrap { position: relative; display: flex; align-items: center; }
  .field-select { appearance: none; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-family: var(--font-ui); font-size: 12.5px; padding: 8px 32px 8px 12px; cursor: pointer; outline: none; transition: border-color var(--transition); width: 100%; }
  .field-select:focus { border-color: var(--border-lit); }
  .field-select option { background: var(--bg-panel); color: var(--text-primary); }
  .select-arrow { position: absolute; right: 10px; color: var(--text-muted); pointer-events: none; font-size: 11px; }
  .inv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  .inv-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: all var(--transition); }
  .inv-card:hover { border-color: var(--hover-border); background: var(--bg-hover); transform: translateY(-1px); box-shadow: 0 8px 24px var(--shadow-md); }
  .inv-card-header { display: flex; justify-content: space-between; align-items: center; }
  .inv-type-badge { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .inv-severity-badge { font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 3px; border: 1px solid; letter-spacing: 0.05em; }
  .inv-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.35; }
  .inv-desc { font-size: 12px; color: var(--text-muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .inv-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .inv-tag { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px; padding: 2px 7px; }
  .inv-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--border); }
  .inv-meta { display: flex; align-items: center; gap: 12px; }
  .inv-id { font-family: var(--font-mono); font-size: 10px; color: var(--accent); opacity: 0.6; }
  .inv-date { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .inv-actions { display: flex; gap: 4px; }
  .inv-action-btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 4px; border: 1px solid var(--border); background: transparent; cursor: pointer; transition: all var(--transition); }
  .inv-action-btn--open { color: var(--text-muted); }
  .inv-action-btn--open:hover { color: var(--accent); border-color: var(--border-lit); background: var(--accent-dim); }
  .inv-action-btn--delete { color: var(--text-muted); }
  .inv-action-btn--delete:hover { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); }
  .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: var(--bg-panel); border: 1px dashed var(--border); border-radius: var(--radius); padding: 64px; text-align: center; min-height: 300px; }
  .empty-icon { color: var(--text-dim); }
  .empty-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-top: 4px; }
  .empty-sub { font-size: 12.5px; color: var(--text-muted); max-width: 320px; line-height: 1.6; }
  .modal-overlay { position: fixed; inset: 0; background: var(--shadow-overlay); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .modal { background: var(--bg-panel); border: 1px solid var(--modal-border); border-radius: 8px; width: 100%; max-width: 520px; display: flex; flex-direction: column; box-shadow: 0 24px 64px var(--shadow-lg); }
  .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px 24px 18px; border-bottom: 1px solid var(--border); }
  .modal-eyebrow { font-family: var(--font-mono); font-size: 10px; color: var(--accent); letter-spacing: 0.12em; opacity: 0.7; margin-bottom: 4px; }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
  .modal-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; transition: all var(--transition); flex-shrink: 0; }
  .modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }
  .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .field-required { color: #f87171; }
  .field-optional { color: var(--text-dim); text-transform: none; font-size: 10px; }
  .field-input, .field-textarea { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-family: var(--font-ui); font-size: 12.5px; padding: 9px 12px; outline: none; transition: border-color var(--transition); width: 100%; }
  .field-textarea { resize: vertical; min-height: 88px; line-height: 1.55; }
  .field-input:focus, .field-textarea:focus { border-color: var(--border-lit); box-shadow: 0 0 0 3px var(--accent-glow); }
  .field-input--error { border-color: rgba(248,113,113,0.5); }
  .field-input::placeholder, .field-textarea::placeholder { color: var(--text-muted); }
  .field-error { font-family: var(--font-mono); font-size: 10px; color: #f87171; }

  /* Workspace */
  .workspace { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
  .ws-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 28px; border-bottom: 1px solid var(--border); background: var(--bg-surface); flex-shrink: 0; gap: 16px; }
  .ws-header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .ws-back { display: flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: color var(--transition); white-space: nowrap; padding: 0; }
  .ws-back:hover { color: var(--accent); }
  .ws-divider { width: 1px; height: 18px; background: var(--border); flex-shrink: 0; }
  .ws-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ws-id { font-family: var(--font-mono); font-size: 10px; color: var(--accent); opacity: 0.6; }
  .ws-type { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .btn-save { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all var(--transition); white-space: nowrap; flex-shrink: 0; }
  .btn-save:hover { border-color: var(--border-lit); color: var(--accent); background: var(--accent-dim); }
  .ws-title-row { display: flex; align-items: center; gap: 12px; padding: 20px 28px 0; flex-shrink: 0; }
  .ws-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
  .ws-tabs { display: flex; gap: 2px; padding: 16px 28px 0; border-bottom: 1px solid var(--border); flex-shrink: 0; overflow-x: auto; }
  .ws-tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-family: var(--font-ui); font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all var(--transition); white-space: nowrap; margin-bottom: -1px; }
  .ws-tab:hover { color: var(--text-primary); }
  .ws-tab--active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab-count { font-family: var(--font-mono); font-size: 10px; background: var(--accent-dim); color: var(--accent); border: 1px solid var(--border-lit); border-radius: 10px; padding: 1px 6px; }
  .ws-content { flex: 1; overflow-y: auto; padding: 24px 28px; }

  /* Section panels */
  .section-panel { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
  .section-header { display: flex; align-items: center; gap: 8px; }
  .section-icon { color: var(--accent); flex-shrink: 0; }
  .section-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; }
  .section-sub { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .section-empty { font-size: 12px; color: var(--text-dim); font-family: var(--font-mono); text-align: center; padding: 24px 0; }
  .btn-section-add { display: flex; align-items: center; gap: 5px; margin-left: auto; padding: 5px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all var(--transition); }
  .btn-section-add:hover { border-color: var(--border-lit); color: var(--accent); background: var(--accent-dim); }

  /* Inline forms */
  .inline-form { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .inline-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .inline-form-actions { display: flex; justify-content: flex-end; gap: 8px; }

  /* Entry table */
  .entry-table { display: flex; flex-direction: column; gap: 4px; }
  .entry-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); transition: border-color var(--transition); }
  .entry-row:hover { border-color: var(--modal-border); }
  .entry-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .entry-primary { font-size: 12.5px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .entry-secondary { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .entry-note { font-size: 11.5px; color: var(--text-muted); font-style: italic; }
  .entry-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .entry-badge { font-family: var(--font-mono); font-size: 10px; padding: 2px 7px; border-radius: 3px; border: 1px solid var(--border); background: var(--bg-hover); color: var(--text-muted); white-space: nowrap; }
  .entry-badge--tactic { color: #818cf8; background: rgba(129,140,248,0.1); border-color: rgba(129,140,248,0.25); }
  .entry-badge--platform { color: #34d399; background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); }
  .entry-remove { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 3px; border: 1px solid transparent; background: transparent; color: var(--text-dim); cursor: pointer; transition: all var(--transition); }
  .entry-remove:hover { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); color: #f87171; }
  .ttp-id { font-family: var(--font-mono); font-size: 10px; background: var(--accent-dim); color: var(--accent); border: 1px solid var(--border-lit); border-radius: 3px; padding: 1px 6px; }

  /* IOC table */
  .ioc-table { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .ioc-header-row { display: grid; grid-template-columns: 80px 1fr 1fr 90px 60px; gap: 12px; padding: 8px 12px; background: var(--bg-surface); font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); }
  .ioc-row { display: grid; grid-template-columns: 80px 1fr 1fr 90px 60px; gap: 12px; align-items: center; padding: 9px 12px; border-bottom: 1px solid var(--border); transition: background var(--transition); }
  .ioc-row:last-child { border-bottom: none; }
  .ioc-row:hover { background: var(--bg-hover); }
  .ioc-type { font-family: var(--font-mono); font-size: 10px; color: var(--accent); }
  .ioc-value { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ioc-context { font-size: 11.5px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ioc-tlp { font-family: var(--font-mono); font-size: 10px; font-weight: 500; }

  /* Detections */
  .detection-list { display: flex; flex-direction: column; gap: 6px; }
  .detection-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .detection-card-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; transition: background var(--transition); }
  .detection-card-header:hover { background: var(--bg-hover); }
  .detection-meta { display: flex; align-items: center; gap: 10px; }
  .detection-title { font-size: 12.5px; font-weight: 500; color: var(--text-primary); }
  .detection-rule { font-family: var(--font-mono); font-size: 11px; color: var(--code-text); background: var(--code-bg); padding: 14px 16px; overflow-x: auto; line-height: 1.6; border-top: 1px solid var(--border); white-space: pre; }
  .detection-notes { font-size: 12px; color: var(--text-muted); padding: 10px 14px; border-top: 1px solid var(--border); font-style: italic; }

  /* Notes editor */
  .notes-editor { width: 100%; min-height: 420px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-family: var(--font-mono); font-size: 12.5px; line-height: 1.7; padding: 16px; outline: none; resize: vertical; transition: border-color var(--transition); }
  .notes-editor:focus { border-color: var(--border-lit); box-shadow: 0 0 0 3px var(--accent-glow); }
  .report-editor { min-height: 560px; color: var(--code-text); }
  .field-code { font-family: var(--font-mono); font-size: 11.5px; color: var(--code-text); background: var(--code-bg); }

  /* Sources */
  .source-list { display: flex; flex-direction: column; gap: 6px; }
  .source-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: border-color var(--transition); }
  .source-card:hover { border-color: var(--modal-border); }
  .source-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 11px 14px; cursor: pointer; transition: background var(--transition); }
  .source-card-header:hover { background: var(--bg-hover); }
  .source-card-left { display: flex; align-items: flex-start; gap: 10px; min-width: 0; flex: 1; }
  .source-type-icon { color: var(--accent); flex-shrink: 0; margin-top: 2px; }
  .source-card-meta { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .source-title { font-size: 12.5px; font-weight: 500; color: var(--text-primary); }
  .source-chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .source-card-body { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border); padding-top: 12px; }
  .source-url { display: flex; align-items: center; gap: 7px; }
  .source-url-link { font-family: var(--font-mono); font-size: 11px; color: var(--accent); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .source-url-link:hover { text-decoration: underline; }
  .source-notes-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .source-notes-text { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
  .source-raw { display: flex; flex-direction: column; gap: 6px; }
  .source-raw-header { display: flex; align-items: center; justify-content: space-between; }
  .source-raw-content { font-family: var(--font-mono); font-size: 11px; color: var(--code-text); background: var(--code-bg); padding: 12px 14px; border-radius: var(--radius); overflow-x: auto; line-height: 1.6; white-space: pre; border: 1px solid var(--border); max-height: 280px; overflow-y: auto; }

  /* Dashboard */
  .dash-header-meta { display: flex; align-items: center; gap: 12px; }
  .dash-last-updated { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }

  .dash-stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
  .dash-stat-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; transition: border-color var(--transition); }
  .dash-stat-card:hover { border-color: var(--modal-border); }
  .dash-stat-top { display: flex; align-items: center; justify-content: space-between; }
  .dash-stat-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; }
  .dash-stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 800; line-height: 1; }
  .dash-stat-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; }
  .dash-stat-sub { font-size: 11px; color: var(--text-dim); }

  .dash-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .dash-panel { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
  .dash-panel--full { flex: 1; }
  .dash-panel-header { display: flex; align-items: center; gap: 8px; }
  .dash-panel-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; }

  /* Severity bars */
  .sev-bar-list { display: flex; flex-direction: column; gap: 10px; }
  .sev-bar-row { display: grid; grid-template-columns: 72px 1fr 28px; align-items: center; gap: 10px; }
  .sev-bar-label { font-family: var(--font-mono); font-size: 11px; font-weight: 500; }
  .sev-bar-track { height: 4px; background: var(--bg-hover); border-radius: 2px; overflow: hidden; }
  .sev-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .sev-bar-count { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); text-align: right; }

  /* Type breakdown */
  .type-list { display: flex; flex-direction: column; gap: 8px; }
  .type-row { display: grid; grid-template-columns: 140px 1fr 28px; align-items: center; gap: 10px; }
  .type-label { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* TTP heatmap */
  .heatmap-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
  .heatmap-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 10px 6px; border-radius: var(--radius); border: 1px solid; transition: all var(--transition); cursor: default; }
  .heatmap-cell:hover { transform: translateY(-1px); }
  .heatmap-tactic { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-align: center; line-height: 1.3; letter-spacing: 0.02em; }
  .heatmap-count { font-family: var(--font-display); font-size: 14px; font-weight: 700; }

  /* IOC breakdown */
  .ioc-breakdown-list { display: flex; flex-direction: column; gap: 8px; }
  .ioc-breakdown-row { display: grid; grid-template-columns: 10px 80px 1fr 28px; align-items: center; gap: 10px; }
  .ioc-breakdown-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .ioc-breakdown-type { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }

  /* Recent investigations */
  .recent-list { display: flex; flex-direction: column; gap: 2px; }
  .recent-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: var(--radius); cursor: pointer; transition: background var(--transition); }
  .recent-row:hover { background: var(--bg-hover); }
  .recent-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
  .recent-sev-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .recent-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .recent-title { font-size: 12.5px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .recent-chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .recent-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .recent-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); white-space: nowrap; }
  .recent-arrow { color: var(--text-dim); transition: color var(--transition); }
  .recent-row:hover .recent-arrow { color: var(--accent); }

  /* Export buttons */
  .btn-export { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius); border: 1px solid rgba(129,140,248,0.3); background: rgba(129,140,248,0.08); color: #818cf8; font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all var(--transition); white-space: nowrap; flex-shrink: 0; }
  .btn-export:hover { background: rgba(129,140,248,0.15); box-shadow: 0 0 12px rgba(129,140,248,0.12); }
  .btn-section-add--accent { border-color: rgba(129,140,248,0.3); color: #818cf8; background: rgba(129,140,248,0.08); }
  .btn-section-add--accent:hover { background: rgba(129,140,248,0.15); border-color: rgba(129,140,248,0.5); }

  /* Status */
  .status-pill-group { display: flex; gap: 6px; }
  .status-pill { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-ui); font-size: 12px; font-weight: 500; cursor: pointer; transition: all var(--transition); }
  .status-pill:hover { border-color: var(--hover-border); color: var(--text-primary); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .status-dot-inline { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .status-filter-strip { display: flex; gap: 6px; flex-wrap: wrap; }
  .status-filter-chip { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all var(--transition); }
  .status-filter-chip:hover { border-color: var(--modal-border); color: var(--text-primary); }
  .inv-card--closed { opacity: 0.55; }
  .inv-card--closed:hover { opacity: 0.75; }
  .inv-action-btn--status { color: var(--text-muted); }
  .btn-status { display: flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: var(--radius); border: 1px solid; font-family: var(--font-mono); font-size: 11px; font-weight: 500; cursor: pointer; transition: all var(--transition); white-space: nowrap; flex-shrink: 0; }
  .btn-status:hover { filter: brightness(1.15); }
  .dash-three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* Import modal */
  .modal--wide { max-width: 680px; }
  .dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 40px 24px; border: 1px dashed rgba(34,211,238,0.25); border-radius: var(--radius); background: var(--accent-glow); cursor: pointer; transition: all var(--transition); text-align: center; }
  .dropzone:hover, .dropzone--active { border-color: var(--accent); background: var(--accent-dim); }
  .dropzone-icon { color: var(--accent); opacity: 0.6; }
  .dropzone-label { font-family: var(--font-ui); font-size: 13px; color: var(--text-primary); }
  .dropzone-label code { font-family: var(--font-mono); color: var(--accent); font-size: 12px; }
  .dropzone-sub { font-size: 11.5px; color: var(--text-muted); }
  .import-error-box { display: flex; gap: 10px; padding: 12px 14px; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.25); border-radius: var(--radius); color: #f87171; font-size: 12px; line-height: 1.6; }
  .import-summary { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); }
  .import-summary-text { font-size: 12.5px; color: var(--text-primary); }
  .import-summary-text strong { color: var(--accent); font-family: var(--font-mono); font-size: 11px; }
  .import-conflict-count { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; color: #facc15; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.25); border-radius: 3px; padding: 2px 8px; white-space: nowrap; }
  .import-conflict-info { padding: 12px 14px; background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.15); border-radius: var(--radius); display: flex; flex-direction: column; gap: 10px; }
  .import-conflict-info p { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .import-global-actions { display: flex; gap: 6px; }
  .import-entry-list { display: flex; flex-direction: column; gap: 4px; max-height: 320px; overflow-y: auto; }
  .import-row { border-radius: var(--radius); border: 1px solid; overflow: hidden; }
  .import-row--clean { border-color: rgba(52,211,153,0.2); background: rgba(52,211,153,0.03); }
  .import-row--conflict { border-color: rgba(250,204,21,0.2); background: rgba(250,204,21,0.03); }
  .import-row-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 12px; cursor: pointer; }
  .import-row-header:hover { background: var(--accent-glow); }
  .import-row-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
  .import-chevron { color: var(--text-muted); flex-shrink: 0; }
  .import-inv-title { font-size: 12.5px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .import-inv-id { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); flex-shrink: 0; }
  .import-conflict-badge { font-family: var(--font-mono); font-size: 10px; color: #facc15; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.25); border-radius: 3px; padding: 1px 6px; white-space: nowrap; flex-shrink: 0; }
  .import-clean-badge { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); border-radius: 3px; padding: 1px 6px; white-space: nowrap; flex-shrink: 0; }
  .import-resolution { flex-shrink: 0; }
  .field-select--sm { font-size: 11px; padding: 5px 28px 5px 10px; }
  .import-row-detail { display: flex; gap: 12px; flex-wrap: wrap; padding: 8px 12px 10px 30px; border-top: 1px solid var(--border); }
  .import-detail-item { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .import-skip-warning { font-family: var(--font-mono); font-size: 11px; color: #facc15; text-align: center; padding: 8px; }
  .import-success { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 24px; text-align: center; }
  .import-success-icon { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); color: #34d399; }
  .import-success-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .import-success-sub { font-size: 12.5px; color: var(--text-muted); }

  /* About popover */
  .about-popover { position: absolute; top: calc(100% + 8px); right: 0; width: 280px; background: var(--bg-panel); border: 1px solid var(--border-lit); border-radius: 8px; box-shadow: 0 12px 40px var(--shadow-lg); z-index: 100; overflow: hidden; }
  .about-popover-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .about-popover-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
  .about-popover-version { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .about-popover-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
  .about-popover-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .about-popover-row { display: flex; justify-content: space-between; align-items: center; }
  .about-popover-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .about-popover-value { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); }

  /* Settings page */
  .settings-grid { display: flex; flex-direction: column; gap: 16px; }
  .settings-section { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
  .settings-section-header { display: flex; align-items: center; gap: 8px; }
  .settings-section-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; }
  .settings-section-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .settings-theme-row { display: flex; gap: 10px; }
  .settings-theme-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-muted); font-family: var(--font-ui); font-size: 12.5px; cursor: pointer; transition: all var(--transition); }
  .settings-theme-btn:hover:not(:disabled) { border-color: var(--hover-border); color: var(--text-primary); }
  .settings-theme-btn--active { border-color: var(--border-lit); color: var(--accent); background: var(--accent-dim); }
  .settings-theme-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .settings-coming-soon { font-family: var(--font-mono); font-size: 9px; color: var(--text-dim); background: var(--bg-hover); border: 1px solid var(--border); border-radius: 3px; padding: 1px 5px; margin-left: 4px; }
  .settings-data-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .settings-import-area { display: flex; gap: 10px; align-items: center; }
  .settings-success-box { display: flex; gap: 10px; padding: 12px 14px; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25); border-radius: var(--radius); color: #34d399; font-size: 12px; line-height: 1.6; }
  .settings-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .settings-about-item { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); }
  .settings-about-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .settings-about-value { font-size: 12.5px; color: var(--text-primary); font-weight: 500; }
  .btn-danger { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: var(--radius); border: 1px solid rgba(248,113,113,0.3); background: rgba(248,113,113,0.08); color: #f87171; font-family: var(--font-ui); font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all var(--transition); white-space: nowrap; }
  .btn-danger:hover { background: rgba(248,113,113,0.15); box-shadow: 0 0 12px rgba(248,113,113,0.12); }
  .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  /* TTP dropdown */
  .ttp-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 50; max-height: 340px; overflow-y: auto; background: var(--bg-panel); border: 1px solid var(--border-lit); border-radius: var(--radius); box-shadow: 0 12px 40px var(--shadow-lg); margin-top: 4px; }
  .ttp-dropdown-tactic { font-family: var(--font-mono); font-size: 9px; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; padding: 8px 12px 4px; background: var(--bg-surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1; }
  .ttp-dropdown-item { display: flex; align-items: center; gap: 8px; padding: 7px 12px; cursor: pointer; transition: background var(--transition); }
  .ttp-dropdown-item:hover { background: var(--accent-dim); }
  .ttp-dropdown-id { font-family: var(--font-mono); font-size: 10px; color: var(--accent); min-width: 72px; flex-shrink: 0; }
  .ttp-dropdown-name { font-size: 12px; color: var(--text-primary); }
  .ttp-dropdown-more { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); padding: 6px 12px; text-align: center; }
  .ttp-selected-banner { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--accent-glow); border: 1px solid var(--border-lit); border-radius: var(--radius); font-size: 12.5px; color: var(--text-primary); }
  .ttp-tactic-group { display: flex; flex-direction: column; gap: 6px; }
  .ttp-tactic-header { display: flex; align-items: center; gap: 8px; }
  .ttp-tactic-count { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }

  /* Library pages */
  .lib-page { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }
  .lib-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .lib-search { display: flex; align-items: center; gap: 8px; background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 0 12px; flex: 1; max-width: 400px; transition: border-color var(--transition); }
  .lib-search:focus-within { border-color: var(--border-lit); box-shadow: 0 0 0 3px var(--accent-glow); }
  .lib-search-input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: var(--font-ui); font-size: 12.5px; padding: 9px 0; }
  .lib-search-input::placeholder { color: var(--text-muted); }
  .lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px; }
  .lib-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; transition: all var(--transition); }
  .lib-card:hover { border-color: var(--modal-border); }
  .lib-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .lib-card-name { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .lib-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .lib-card-desc { font-size: 11.5px; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .lib-card-aliases { font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); }
  .lib-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 8px; border-top: 1px solid var(--border); }
  .lib-stat { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .lib-badge { font-family: var(--font-mono); font-size: 10px; padding: 2px 7px; border-radius: 3px; border: 1px solid; white-space: nowrap; }
  .lib-badge--origin { color: #f0abfc; background: rgba(240,171,252,0.1); border-color: rgba(240,171,252,0.25); }
  .lib-badge--motivation { color: #facc15; background: rgba(250,204,21,0.1); border-color: rgba(250,204,21,0.25); }
  .lib-badge--type { color: #fb923c; background: rgba(251,146,60,0.1); border-color: rgba(251,146,60,0.25); }
  .lib-badge--custom { color: #34d399; background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.25); }
  .lib-badge--tracked { color: var(--text-muted); background: var(--bg-hover); border-color: var(--border); }
  .lib-count-strip { display: flex; gap: 8px; flex-wrap: wrap; }
  .lib-count-chip { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; }

  /* Actor/Malware picker in investigation sections */
  .picker-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 50; max-height: 260px; overflow-y: auto; background: var(--bg-panel); border: 1px solid var(--border-lit); border-radius: var(--radius); box-shadow: 0 12px 40px var(--shadow-lg); margin-top: 4px; }
  .picker-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; cursor: pointer; transition: background var(--transition); }
  .picker-item:hover { background: var(--accent-dim); }
  .picker-item-name { font-size: 12.5px; font-weight: 500; color: var(--text-primary); }
  .picker-item-meta { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .picker-divider { font-family: var(--font-mono); font-size: 9px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 12px; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
`;


function App() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [active, setActive] = useState("dashboard");
  const [openedInv,   setOpenedInv]   = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <>
      <style>{CSS_VARS + WORKSPACE_CSS}</style>
      <div className="app-shell">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          active={active}
          setActive={(id) => { setActive(id); setOpenedInv(null); }}
        />
        <div className="app-body">
          <Topbar invTitle={openedInv?.title} />
          {openedInv ? (
            <InvestigationWorkspace
              investigation={openedInv}
              onBack={() => setOpenedInv(null)}
              onUpdateInvestigation={(updated) => setOpenedInv(updated)}
            />
          ) : active === "dashboard" ? (
            <DashboardPage onOpenInvestigation={setOpenedInv} />
          ) : active === "investigations" ? (
            <InvestigationsPage onOpen={setOpenedInv} />
          ) : active === "actors" ? (
            <ThreatActorsPage />
          ) : active === "malware" ? (
            <MalwarePage />
          ) : active === "iocs" ? (
            <IOCsPage />
          ) : active === "detections" ? (
            <DetectionsPage />
          ) : active === "settings" ? (
            <SettingsPage theme={theme} setTheme={setTheme} />
          ) : (
            <main className="main-content">
              <div className="page-header">
                <div>
                  <p className="page-eyebrow">SDPCTI Platform</p>
                  <h1 className="page-title">{active.charAt(0).toUpperCase() + active.slice(1)}</h1>
                </div>
              </div>
              <div className="empty-state">
                <p className="empty-title">Coming soon</p>
                <p className="empty-sub">This section will be built in a future phase.</p>
              </div>
            </main>
          )}
        </div>
      </div>
    </>
  );
}

export default App