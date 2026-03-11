import { ArrowLeft, Edit3, X, Plus, Check, Download } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api.js"

import { SEVERITY_CONFIG, STATUS_CONFIG, STATUSES, SEVERITIES, INV_TYPES } from "../data/constants.js"

import NotesSection from "./sections/NotesSection.jsx";
import SourcesSection from "./sections/SourcesSection.jsx";
import ThreatActorsSection from "./sections/ThreatActorsSection.jsx";
import MalwareSection from "./sections/MalwareSection.jsx";
import IOCsSection from "./sections/IOCsSection.jsx";
import DetectionsSection from "./sections/DetectionsSection.jsx"
import TTPsSection from "./sections/TTPsSection.jsx";
import ReportSection from "./sections/ReportSection.jsx";
 
const EMPTY_WS = {
    notes: "", sources: [], malware: [], actors: [],
    ttps: [], iocs: [], detections: [],
}

export default function InvestigationWorkspace({ investigation, onBack, onUpdateInvestigation }) {
    const [ws,        setWs]        = useState(EMPTY_WS)
    const [loading,   setLoading]   = useState(true)
    const [activeTab, setActiveTab] = useState("notes")
    const [saveState, setSaveState] = useState("idle")
    const [saveError, setSaveError] = useState(null)
    const [showEdit,  setShowEdit]  = useState(false)
    const userMutated = useRef(false)

    const TABS = [
        { key: "notes",      label: "Notes",      count: null },
        { key: "sources",    label: "Sources",     count: ws.sources?.length    || 0 },
        { key: "actors",     label: "Actors",      count: ws.actors?.length     || 0 },
        { key: "malware",    label: "Malware",     count: ws.malware?.length    || 0 },
        { key: "ttps",       label: "TTPs",        count: ws.ttps?.length       || 0 },
        { key: "iocs",       label: "IOCs",        count: ws.iocs?.length       || 0 },
        { key: "detections", label: "Detections",  count: ws.detections?.length || 0 },
        { key: "report",     label: "Report",      count: null },
    ]

    // --- Load workspace ---
    useEffect(() => {
        setLoading(true)
        userMutated.current = false
        api.workspaces.get(investigation.id)
            .then(data => setWs(data || EMPTY_WS))
            .catch(() => setWs(EMPTY_WS))
            .finally(() => setLoading(false))
    }, [investigation.id])

    // -- Autosave on Mutation ---
    useEffect(() => {
        if (loading || !userMutated.current) return
        setSaveState("saving")
        const t = setTimeout(() => {
        api.workspaces.save(investigation.id, ws)
            .then(() => { setSaveState("saved"); setTimeout(() => setSaveState("idle"), 2000); })
            .catch(err => { setSaveState("error"); setSaveError(err.message); })
        }, 800)
        return () => clearTimeout(t)
    }, [ws, investigation.id, loading])

    // --- Section Updater ---
    const updateSection = useCallback((key) => (value) => {
        userMutated.current = true;
        setWs(prev => ({ ...prev, [key]: value }))
    }, [])

    // --- Manual Save ---
    async function handleSave() {
        setSaveState("saving"); setSaveError(null)
        try {
        await api.workspaces.save(investigation.id, ws)
        setSaveState("saved")
        setTimeout(() => setSaveState("idle"), 2000)
        } catch (err) { setSaveState("error"); setSaveError(err.message); }
    }

    // --- Report Data ---
    const reportData = {
        ...investigation,
        notes: ws.notes,
        sources: ws.sources,
        malware: ws.malware,
        actors: ws.actors,
        ttps: ws.ttps,
        iocs: ws.iocs,
        detections: ws.detections,
    }

    const sevCfg    = SEVERITY_CONFIG[investigation.severity] || {}
    const statusCfg = STATUS_CONFIG[investigation.status]     || {}

    const saveLabel = {
        idle:   null,
        saving: "Saving...",
        saved:  "Saved",
        error:  "Save failed",
    }[saveState]

    const saveLabelColor = {
        saving: "var(--text-muted)",
        saved:  "#34d399",
        error:  "#f87171",
    }[saveState]

    async function handleExportInvestigation() {
        try {
            const workspace = await api.workspaces.get(investigation.id).catch(() => ({}))
            const payload = { investigation, workspace }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${investigation.id}-${investigation.title.replace(/\s+/g, "-").toLowerCase()}.json`
            a.click()
            URL.revokeObjectURL(url)
        } catch {}
    }

    async function handleUpdateInvestigation(updates) {
        try {
            const updated = await api.investigations.update(investigation.id, updates)
            if (onUpdateInvestigation) onUpdateInvestigation(updated)
            setShowEdit(false)
        } catch {}
    }

    return(
        <div className="workspace">
            {/* Header */}
            <div className="ws-header">
                <div className="ws-header-left">
                    <button className="ws-back" onClick={onBack}>
                        <ArrowLeft size={12} /> Back
                    </button>
                    <div className="ws-divider" />

                    <div className="ws-meta">
                        <span className="ws-id">{investigation.id}</span>
                        <span className="ws-type">{investigation.type}</span>
                        <span className="inv-severity-badge" style={{
                        color: sevCfg.color,
                        background: sevCfg.bg,
                        borderColor: sevCfg.border,
                        }}>{investigation.severity}</span>
                        <span className="entry-badge" style={{
                        color: statusCfg.color,
                        background: statusCfg.bg,
                        borderColor: statusCfg.border,
                        }}>{investigation.status}</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {saveLabel && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: saveLabelColor }}>
                            {saveLabel}
                        </span>
                    )}
                    <button className="btn-save" onClick={handleSave} title="Save workspace">
                        <Check size={12} /> Save
                    </button>
                    <button className="btn-save" onClick={handleExportInvestigation} title="Export investigation">
                        <Download size={12} /> Export
                    </button>
                    <button className="btn-save" onClick={() => setShowEdit(true)} title="Edit investigation details">
                        <Edit3 size={12} /> Edit
                    </button>
                </div>
            </div>

            {/* Title row */}
            <div className="ws-title-row">
                <h2 className="ws-title">{investigation.title}</h2>
            </div>

            {/* Tabs */}
            <div className="ws-tabs">
                {TABS.map(tab => (
                <button
                    key={tab.key}
                    className={`ws-tab ${activeTab === tab.key ? "ws-tab--active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                    <span className="tab-count">{tab.count}</span>
                    )}
                </button>
                ))}
            </div>

            {/* Content */}
            <div className="ws-content">
                {loading ? (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    Loading workspace...
                </p>
                ) : (
                    <>
                        {activeTab === "notes" && <NotesSection data={ws.notes} onChange={updateSection("notes")}/>}
                        {activeTab === "sources"    && <SourcesSection data={ws.sources} onChange={updateSection("sources")} />}
                        {activeTab === "actors" && <ThreatActorsSection data={ws.actors} onChange={updateSection("actors")}/>} 
                        {activeTab === "malware"    && <MalwareSection data={ws.malware} onChange={updateSection("malware")} />}
                        {activeTab === "iocs"       && <IOCsSection data={ws.iocs} onChange={updateSection("iocs")} />}
                        {activeTab === "detections" && <DetectionsSection data={ws.detections} onChange={updateSection("detections")} />}
                        {activeTab === "ttps" && <TTPsSection data={ws.ttps} onChange={updateSection("ttps")} />}
                        {activeTab === "report"     && <ReportSection inv={reportData} />}
                    </>
                )}
             </div>

            {showEdit && (
                <EditInvestigationModal
                    investigation={investigation}
                    onSave={handleUpdateInvestigation}
                    onClose={() => setShowEdit(false)}
                />
            )}
        </div>
    )
}

// --- Edit Investigation Modal ---

function EditInvestigationModal({ investigation, onSave, onClose }) {
    const [form, setForm] = useState({
        title: investigation.title || "",
        type: investigation.type || INV_TYPES[0],
        severity: investigation.severity || "Medium",
        status: investigation.status || "Active",
        description: investigation.description || "",
        tags: (investigation.tags || []).join(", "),
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function field(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })) }

    async function submit() {
        if (!form.title.trim()) { setError("Title is required."); return }
        setLoading(true); setError(null)
        try {
            await onSave({
                title: form.title.trim(),
                type: form.type,
                severity: form.severity,
                status: form.status,
                description: form.description.trim(),
                tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
            })
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div>
                        <p className="modal-eyebrow">EDIT INVESTIGATION</p>
                        <h2 className="modal-title">Update Details</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <div className="modal-body">
                    {error && (
                        <p className="field-error" style={{ background: "rgba(248,113,113,0.08)", padding: "8px 10px", borderRadius: "var(--radius)" }}>
                            {error}
                        </p>
                    )}
                    <div className="field">
                        <label className="field-label">Title <span className="field-required">*</span></label>
                        <input className="field-input" value={form.title} onChange={field("title")} />
                    </div>
                    <div className="field-row">
                        <div className="field">
                            <label className="field-label">Type</label>
                            <div className="select-wrap">
                                <select className="field-select" value={form.type} onChange={field("type")}>
                                    {INV_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <span className="select-arrow">&#x25BE;</span>
                            </div>
                        </div>
                        <div className="field">
                            <label className="field-label">Severity</label>
                            <div className="select-wrap">
                                <select className="field-select" value={form.severity} onChange={field("severity")}>
                                    {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <span className="select-arrow">&#x25BE;</span>
                            </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="field-label">Status</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.status} onChange={field("status")}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <span className="select-arrow">&#x25BE;</span>
                        </div>
                    </div>
                    <div className="field">
                        <label className="field-label">Description</label>
                        <textarea className="field-textarea" value={form.description} onChange={field("description")} />
                    </div>
                    <div className="field">
                        <label className="field-label">Tags <span className="field-optional">(comma-separated)</span></label>
                        <input className="field-input" value={form.tags} onChange={field("tags")} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={submit} disabled={loading}>
                        <Check size={14} /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    )
}