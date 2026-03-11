import { useState } from "react";
import {
    Settings, Sun, Moon, Monitor, Database, Download, Upload,
    Trash2, AlertTriangle, Check, X, Shield, FileUp
} from "lucide-react";
import { api } from "../utils/api";
import { SEVERITIES, STATUSES } from "../data/constants";

const TLP_LEVELS = ["TLP:WHITE", "TLP:GREEN", "TLP:AMBER", "TLP:RED"]
const DEFAULTS_KEY = "sdpcti-defaults"
const THEME_KEY = "sdpcti-theme"

function loadDefaults() {
    try {
        return JSON.parse(localStorage.getItem(DEFAULTS_KEY)) || {}
    } catch { return {} }
}

function loadTheme() {
    return localStorage.getItem(THEME_KEY) || "dark"
}

export default function SettingsPage({ theme, setTheme }) {
    const [defaults, setDefaults] = useState(() => ({
        severity: "Medium",
        tlp: "TLP:GREEN",
        ...loadDefaults(),
    }))
    const [saved, setSaved] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [clearResult, setClearResult] = useState(null)
    const [exportingAll, setExportingAll] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [importFile, setImportFile] = useState(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)

    function saveDefaults() {
        localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    async function handleExportAllData() {
        setExportingAll(true)
        try {
            const [investigations, actors, malware, iocs, detections] = await Promise.all([
                api.investigations.list(),
                api.threatActors.list(),
                api.malware.list(),
                api.iocs.list(),
                api.detections.list(),
            ])
            const workspaces = await Promise.all(
                investigations.map(inv => api.workspaces.get(inv.id).catch(() => ({})))
            )
            const payload = {
                exportDate: new Date().toISOString(),
                version: "2.3",
                data: {
                    investigations: investigations.map((inv, i) => ({
                        investigation: inv,
                        workspace: workspaces[i] || {},
                    })),
                    threatActors: actors,
                    malware,
                    iocs,
                    detections,
                }
            }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `sdpcti-full-backup-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            alert("Export failed: " + err.message)
        } finally {
            setExportingAll(false)
        }
    }

    async function handleClearDatabase() {
        setClearing(true)
        setClearResult(null)
        try {
            // Delete all investigations (cascades to workspaces)
            const investigations = await api.investigations.list()
            await Promise.all(investigations.map(inv => api.investigations.delete(inv.id)))
            // Delete all library items
            const [actors, malware, iocs, detections] = await Promise.all([
                api.threatActors.list(),
                api.malware.list(),
                api.iocs.list(),
                api.detections.list(),
            ])
            await Promise.all([
                ...actors.map(a => api.threatActors.delete(a.id)),
                ...malware.map(m => api.malware.delete(m.id)),
                ...iocs.map(i => api.iocs.delete(i.id)),
                ...detections.map(d => api.detections.delete(d.id)),
            ])
            setClearResult({ success: true, message: "All data cleared successfully." })
        } catch (err) {
            setClearResult({ success: false, message: err.message })
        } finally {
            setClearing(false)
            setShowClearConfirm(false)
        }
    }

    async function handleImportFullBackup() {
        if (!importFile) return
        setImporting(true)
        setImportResult(null)
        try {
            const text = await importFile.text()
            const backup = JSON.parse(text)
            const data = backup.data || backup
            let counts = { investigations: 0, actors: 0, malware: 0, iocs: 0, detections: 0 }

            // Import investigations + workspaces
            if (data.investigations?.length) {
                const invs = data.investigations.map(e => e.investigation || e)
                await api.investigations.bulk(invs)
                counts.investigations = invs.length
                // Save workspaces
                await Promise.all(
                    data.investigations
                        .filter(e => e.workspace && e.investigation)
                        .map(e => api.workspaces.save(e.investigation.id, e.workspace).catch(() => {}))
                )
            }
            // Import library items
            if (data.threatActors?.length) {
                for (const actor of data.threatActors) {
                    try { await api.threatActors.create(actor); counts.actors++ } catch {}
                }
            }
            if (data.malware?.length) {
                for (const m of data.malware) {
                    try { await api.malware.create(m); counts.malware++ } catch {}
                }
            }
            if (data.iocs?.length) {
                for (const ioc of data.iocs) {
                    try { await api.iocs.create(ioc); counts.iocs++ } catch {}
                }
            }
            if (data.detections?.length) {
                for (const det of data.detections) {
                    try { await api.detections.create(det); counts.detections++ } catch {}
                }
            }

            setImportResult({
                success: true,
                message: `Imported ${counts.investigations} investigations, ${counts.actors} actors, ${counts.malware} malware, ${counts.iocs} IOCs, ${counts.detections} detections.`
            })
            setShowImport(false)
            setImportFile(null)
        } catch (err) {
            setImportResult({ success: false, message: "Import failed: " + err.message })
        } finally {
            setImporting(false)
        }
    }

    return (
        <main className="main-content">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">SDPCTI Platform</p>
                    <h1 className="page-title">Settings</h1>
                </div>
            </div>

            <div className="settings-grid">
                {/* Theme */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Monitor size={16} className="section-icon" />
                        <h3 className="settings-section-title">Appearance</h3>
                    </div>
                    <p className="settings-section-desc">Choose your preferred theme. Changes apply instantly.</p>
                    <div className="settings-theme-row">
                        {[
                            { id: "dark", label: "Dark", icon: Moon },
                            { id: "light", label: "Light", icon: Sun },
                        ].map(opt => {
                            const Icon = opt.icon
                            return (
                                <button
                                    key={opt.id}
                                    className={`settings-theme-btn ${theme === opt.id ? "settings-theme-btn--active" : ""}`}
                                    onClick={() => setTheme(opt.id)}
                                >
                                    <Icon size={16} />
                                    <span>{opt.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Default Values */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Settings size={16} className="section-icon" />
                        <h3 className="settings-section-title">Default Values</h3>
                    </div>
                    <p className="settings-section-desc">Set default severity and TLP level for new investigations and IOCs.</p>
                    <div className="field-row">
                        <div className="field">
                            <label className="field-label">Default Severity</label>
                            <div className="select-wrap">
                                <select
                                    className="field-select"
                                    value={defaults.severity}
                                    onChange={e => setDefaults(d => ({ ...d, severity: e.target.value }))}
                                >
                                    {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <span className="select-arrow">▾</span>
                            </div>
                        </div>
                        <div className="field">
                            <label className="field-label">Default TLP</label>
                            <div className="select-wrap">
                                <select
                                    className="field-select"
                                    value={defaults.tlp}
                                    onChange={e => setDefaults(d => ({ ...d, tlp: e.target.value }))}
                                >
                                    {TLP_LEVELS.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <span className="select-arrow">▾</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className="btn-primary" onClick={saveDefaults}>
                            {saved ? <><Check size={14} /> Saved</> : "Save Defaults"}
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Database size={16} className="section-icon" />
                        <h3 className="settings-section-title">Data Management</h3>
                    </div>
                    <p className="settings-section-desc">Export a full backup of all data, import from a backup, or clear all data.</p>

                    {clearResult && (
                        <div className={clearResult.success ? "settings-success-box" : "import-error-box"}>
                            {clearResult.success
                                ? <Check size={14} style={{ flexShrink: 0, color: "#34d399" }} />
                                : <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            }
                            <p>{clearResult.message}</p>
                        </div>
                    )}
                    {importResult && (
                        <div className={importResult.success ? "settings-success-box" : "import-error-box"}>
                            {importResult.success
                                ? <Check size={14} style={{ flexShrink: 0, color: "#34d399" }} />
                                : <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                            }
                            <p>{importResult.message}</p>
                        </div>
                    )}

                    <div className="settings-data-actions">
                        <button className="btn-export" onClick={handleExportAllData} disabled={exportingAll}>
                            <Download size={14} /> {exportingAll ? "Exporting..." : "Export Full Backup"}
                        </button>
                        <button className="btn-ghost" onClick={() => setShowImport(!showImport)}>
                            <Upload size={14} /> Import Backup
                        </button>
                        <button
                            className="btn-danger"
                            onClick={() => setShowClearConfirm(true)}
                            disabled={clearing}
                        >
                            <Trash2 size={14} /> {clearing ? "Clearing..." : "Clear All Data"}
                        </button>
                    </div>

                    {showImport && (
                        <div className="settings-import-area">
                            <input
                                type="file"
                                accept=".json"
                                onChange={e => setImportFile(e.target.files?.[0] || null)}
                                style={{
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "8px 12px",
                                    color: "var(--text-primary)",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "12px",
                                    flex: 1,
                                }}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleImportFullBackup}
                                disabled={!importFile || importing}
                            >
                                <FileUp size={14} /> {importing ? "Importing..." : "Import"}
                            </button>
                        </div>
                    )}

                    {/* Clear confirmation modal */}
                    {showClearConfirm && (
                        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowClearConfirm(false)}>
                            <div className="modal" style={{ maxWidth: 420 }}>
                                <div className="modal-header">
                                    <div>
                                        <p className="modal-eyebrow" style={{ color: "#f87171" }}>DANGER ZONE</p>
                                        <h2 className="modal-title">Clear All Data</h2>
                                    </div>
                                    <button className="modal-close" onClick={() => setShowClearConfirm(false)}><X size={14} /></button>
                                </div>
                                <div className="modal-body">
                                    <div className="import-error-box">
                                        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                        <p>This will permanently delete all investigations, workspaces, and library items. This action cannot be undone.</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn-ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                                    <button className="btn-danger" onClick={handleClearDatabase} disabled={clearing}>
                                        <Trash2 size={14} /> {clearing ? "Clearing..." : "Yes, Clear Everything"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* About / Version */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Shield size={16} className="section-icon" />
                        <h3 className="settings-section-title">About SDPCTI</h3>
                    </div>
                    <div className="settings-about-grid">
                        <div className="settings-about-item">
                            <span className="settings-about-label">Version</span>
                            <span className="settings-about-value">2.3</span>
                        </div>
                        <div className="settings-about-item">
                            <span className="settings-about-label">Platform</span>
                            <span className="settings-about-value">Security Data Processing & CTI</span>
                        </div>
                        <div className="settings-about-item">
                            <span className="settings-about-label">Backend</span>
                            <span className="settings-about-value">Express + SQLite</span>
                        </div>
                        <div className="settings-about-item">
                            <span className="settings-about-label">Frontend</span>
                            <span className="settings-about-value">React 19 + Vite</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
