import {
    Plus, Search, Folder, X, ExternalLink, Trash2,
    Clock, Tag, Upload, Download
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { SEVERITIES, SEVERITY_CONFIG, STATUSES, INV_TYPES } from "../data/constants";

const SEV_COLORS = {
    Critical: "#f87171", High: "#fb923c",
    Medium:   "#facc15", Low:  "#34d399",
    Informational: "#4a5568",
}

export default function InvestigationsPage({ onOpen }){
    const [investigations, setInvestigations] = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(null);
    const [showNew,        setShowNew]        = useState(false);
    const [showImport,     setShowImport]     = useState(false);
    const [search,         setSearch]         = useState("");
    const [filterSeverity, setFilterSeverity] = useState("All");
    const [filterStatus,   setFilterStatus]   = useState("All");

    useEffect(() => {
        setLoading(true)
        api.investigations.list()
        .then(data => { setInvestigations(data); setError(null) })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [])

    async function handleDelete(id) {
        try {
        await api.investigations.delete(id)
        setInvestigations(prev => prev.filter(i => i.id !== id))
        } catch (err) { setError(err.message) }
    }

    function handleCreate(inv) {
        setInvestigations(prev => [inv, ...prev])
        setShowNew(false)
    }

    async function handleImport(importedEntries) {
        try {
        const invs = importedEntries.map(e => e.investigation || e)
        await api.investigations.bulk(invs)

        // Save workspaces if provided
        await Promise.all(
            importedEntries
            .filter(e => e.workspace && e.investigation)
            .map(e => api.workspaces.save(e.investigation.id, e.workspace).catch(() => {}))
        )

        const fresh = await api.investigations.list()
        setInvestigations(fresh)
        } catch (err) { setError(err.message); }
    }

    async function handleExportAll() {
        try {
        const workspaces = await Promise.all(
            investigations.map(inv => api.workspaces.get(inv.id).catch(() => ({})))
        );
        exportAllJSON(investigations, workspaces);
        } catch (err) { setError(err.message); }
    }

    const filtered = investigations.filter(inv => {
        const q = search.toLowerCase()
        const matchSearch =
        !q ||
        inv.title.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q) ||
        inv.description?.toLowerCase().includes(q) ||
        inv.tags?.some(t => t.toLowerCase().includes(q))
        return matchSearch &&
        (filterSeverity === "All" || inv.severity === filterSeverity) &&
        (filterStatus   === "All" || inv.status   === filterStatus)
    })

    const sevCounts = {}
    investigations.forEach(inv => { sevCounts[inv.severity] = (sevCounts[inv.severity] || 0) + 1; })

    function formatDate(iso) {
        if (!iso) return "—"
        return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return(
        <main className="main-content">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">SDPCTI Platform</p>
                    <h1 className="page-title">Investigations</h1>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-export" onClick={handleExportAll} disabled={investigations.length === 0}>
                        <Download size={13} /> Export All
                    </button>
                    <button className="btn-ghost" onClick={() => setShowImport(true)}>
                        <Upload size={13} /> Import
                    </button>
                    <button className="btn-primary" onClick={() => setShowNew(true)}>
                        <Plus size={13} /> New Investigation
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="summary-strip">
                {Object.entries(sevCounts).map(([sev, count]) => (
                <span
                    className="summary-chip"
                    key={sev}
                    onClick={() => setFilterSeverity(filterSeverity === sev ? "All" : sev)}
                    style={filterSeverity === sev ? { borderColor: SEV_COLORS[sev], color: "var(--text-primary)" } : undefined}
                >
                    <span className="summary-dot" style={{ background: SEV_COLORS[sev] || "#4a5568" }} />
                    {sev} <span className="summary-count">{count}</span>
                </span>
                ))}
                <span className="summary-total">
                <Folder size={12} /> {investigations.length} total
                </span>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-search">
                <Search size={13} className="search-icon" />
                <input
                    className="search-input"
                    placeholder="Search by title, ID, or tag..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                </div>
                <div className="filter-select-wrap">
                <div className="select-wrap">
                    <select className="field-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                    <option value="All">All Severities</option>
                    {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="select-arrow">▾</span>
                </div>
                </div>
                <div className="filter-select-wrap">
                <div className="select-wrap">
                    <select className="field-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="select-arrow">▾</span>
                </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="import-error-box">
                <p style={{ color: "#f87171", fontSize: 12 }}>{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Loading...</p>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="empty-state">
                <Folder size={32} className="empty-icon" />
                <p className="empty-title">
                    {investigations.length === 0 ? "No investigations yet" : "No results match"}
                </p>
                <p className="empty-sub">
                    {investigations.length === 0
                    ? "Create your first investigation to get started."
                    : "Try adjusting your search or filters."}
                </p>
                </div>
            )}

            {/* Investigation grid */}
            {filtered.length > 0 && (
                <div className="inv-grid">
                {filtered.map(inv => {
                    const sevCfg = SEVERITY_CONFIG[inv.severity] || {};
                    return (
                    <div
                        className={`inv-card ${inv.status === "Closed" ? "inv-card--closed" : ""}`}
                        key={inv.id}
                        onClick={() => onOpen(inv)}
                    >
                        <div className="inv-card-header">
                        <span className="inv-type-badge">{inv.type}</span>
                        <span className="inv-severity-badge" style={{
                            color: sevCfg.color,
                            background: sevCfg.bg,
                            borderColor: sevCfg.border,
                        }}>
                            {inv.severity}
                        </span>
                        </div>
                        <h3 className="inv-title">{inv.title}</h3>
                        {inv.description && <p className="inv-desc">{inv.description}</p>}
                        {inv.tags?.length > 0 && (
                        <div className="inv-tags">
                            {inv.tags.slice(0, 4).map(tag => (
                            <span className="inv-tag" key={tag}><Tag size={9} /> {tag}</span>
                            ))}
                            {inv.tags.length > 4 && (
                            <span className="inv-tag">+{inv.tags.length - 4}</span>
                            )}
                        </div>
                        )}
                        <div className="inv-card-footer">
                        <div className="inv-meta">
                            <span className="inv-id">{inv.id}</span>
                            <span className="inv-date"><Clock size={10} /> {formatDate(inv.updatedAt)}</span>
                        </div>
                        <div className="inv-actions" onClick={e => e.stopPropagation()}>
                            <button className="inv-action-btn inv-action-btn--open" onClick={() => onOpen(inv)}>
                            <ExternalLink size={12} />
                            </button>
                            <button className="inv-action-btn inv-action-btn--delete" onClick={() => handleDelete(inv.id)}>
                            <Trash2 size={12} />
                            </button>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )}

            {/* New investigation modal */}
            {showNew && (
                <NewInvestigationModal
                onCreate={handleCreate}
                onClose={() => setShowNew(false)}
                />
            )}

            {/* Import modal */}
            {showImport && (
                <ImporModal
                existingInvestigations={investigations}
                onImport={handleImport}
                onClose={() => setShowImport(false)}
                />
            )}
        </main>
    )
}

// --- New investigation modal ---

function NewInvestigationModal({ onCreate, onClose }) {
    const [form, setForm] = useState({
        title: "", type: INV_TYPES[0], severity: "Medium",
        status: "Active", description: "", tags: "",
    })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState(null)

    function field(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })) }

    async function submit() {
        if (!form.title.trim()) { setError("Title is required."); return }
        setLoading(true); setError(null)
        try {
        const now = new Date().toISOString();
        const id  = `INV-${Date.now().toString(36).toUpperCase()}`;
        const inv = await api.investigations.create({
            id,
            title:       form.title.trim(),
            type:        form.type,
            severity:    form.severity,
            status:      form.status,
            description: form.description.trim(),
            tags:        form.tags.split(",").map(t => t.trim()).filter(Boolean),
            createdAt:   now,
            updatedAt:   now,
        })
        onCreate(inv);
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                <div>
                    <p className="modal-eyebrow">NEW INVESTIGATION</p>
                    <h2 className="modal-title">Create Investigation</h2>
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
                    <input className="field-input" placeholder="e.g. TAG-124 Malvertising Campaign" value={form.title} onChange={field("title")} />
                </div>
                <div className="field-row">
                    <div className="field">
                    <label className="field-label">Type</label>
                    <div className="select-wrap">
                        <select className="field-select" value={form.type} onChange={field("type")}>
                        {INV_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <span className="select-arrow">▾</span>
                    </div>
                    </div>
                    <div className="field">
                    <label className="field-label">Severity</label>
                    <div className="select-wrap">
                        <select className="field-select" value={form.severity} onChange={field("severity")}>
                        {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <span className="select-arrow">▾</span>
                    </div>
                    </div>
                </div>
                <div className="field">
                    <label className="field-label">Description <span className="field-optional">(optional)</span></label>
                    <textarea className="field-textarea" placeholder="Brief summary of the investigation scope..." value={form.description} onChange={field("description")} />
                </div>
                <div className="field">
                    <label className="field-label">Tags <span className="field-optional">(comma-separated)</span></label>
                    <input className="field-input" placeholder="e.g. ransomware, retail, UNC3944" value={form.tags} onChange={field("tags")} />
                </div>
                </div>
                <div className="modal-footer">
                <button className="btn-ghost" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={submit} disabled={loading}>
                    <Plus size={13} /> {loading ? "Creating..." : "Create"}
                </button>
                </div>
            </div>
        </div>
    )
}
