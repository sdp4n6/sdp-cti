import { ArrowLeft } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../utils/api.js"

import { SEVERITY_CONFIG, STATUS_CONFIG, STATUSES } from "../data/constants.js"

import NotesSection from "./sections/NotesSection.jsx";
import SourcesSection from "./sections/SourcesSection.jsx";
 
const EMPTY_WS = {
    notes: "", sources: [], malware: [], actors: [],
    ttps: [], iocs: [], detections: [],
}

export default function InvestigationWorkspace({ investigation, onBack }) {
    const [ws,        setWs]        = useState(EMPTY_WS)
    const [loading,   setLoading]   = useState(true)
    const [activeTab, setActiveTab] = useState("notes")
    const [saveState, setSaveState] = useState("idle")
    const [saveError, setSaveError] = useState(null)
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
                    {/* FIll out export part */}
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
                    </>
                )}
             </div>
        </div>
    )
}