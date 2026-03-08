import { useState, useEffect, useMemo } from "react"
import { Radio, Search, Plus, Copy, Check, Trash2 } from "lucide-react"
import { api } from "../utils/api.js"
import { DETECTION_PLATFORMS } from "../data/constants.js"

const EMPTY = () => ({ platform: DETECTION_PLATFORMS[0], title: "", rule: "", notes: "" })

export default function DetectionsPage() {
    const [detections, setDetections] = useState([])
    const [search, setSearch] = useState("")
    const [filterPlatform, setFilterPlatform] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY())
    const [copied, setCopied] = useState(null)
    const [expanded, setExpanded] = useState(null)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    useEffect(() => { load() }, [])
    function load() { api.detections.list().then(setDetections).catch(() => {}) }

    const filtered = useMemo(() => {
        let list = detections
        if (filterPlatform) list = list.filter(d => d.platform === filterPlatform)
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(d =>
                d.title.toLowerCase().includes(q) ||
                d.platform.toLowerCase().includes(q) ||
                d.notes.toLowerCase().includes(q)
            )
        }
        return list
    }, [detections, search, filterPlatform])

    const platformCounts = useMemo(() => {
        const c = {}
        detections.forEach(d => { c[d.platform] = (c[d.platform] || 0) + 1 })
        return c
    }, [detections])

    function add() {
        if (!form.title.trim()) return
        api.detections.create(form).then(() => {
            load()
            setForm(EMPTY())
            setShowForm(false)
        }).catch(() => {})
    }

    function remove(id) { api.detections.delete(id).then(load).catch(() => {}) }

    function copy(text, id) {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 1500)
    }

    return (
        <main className="lib-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">Threat Intelligence Library</p>
                    <h1 className="page-title">Detections</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
                    <Plus size={13} /> Add Detection
                </button>
            </div>

            <div className="lib-count-strip">
                <div className="lib-count-chip">
                    <Radio size={12} />
                    <span>{detections.length} detections</span>
                </div>
                {DETECTION_PLATFORMS.filter(p => platformCounts[p]).map(p => (
                    <button key={p} className="lib-count-chip"
                        style={filterPlatform === p ? { borderColor: "var(--border-lit)", color: "var(--accent)" } : { cursor: "pointer" }}
                        onClick={() => setFilterPlatform(filterPlatform === p ? "" : p)}>
                        {p}: {platformCounts[p]}
                    </button>
                ))}
            </div>

            {showForm && (
                <div className="section-panel">
                    <div className="inline-form">
                        <div className="inline-form-row">
                            <div className="field"><label className="field-label">Platform</label>
                                <div className="select-wrap">
                                    <select className="field-select" value={form.platform} onChange={set("platform")}>
                                        {DETECTION_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                    </select><span className="select-arrow">▾</span>
                                </div></div>
                            <div className="field" style={{ flex: 2 }}><label className="field-label">Title *</label>
                                <input className="field-input" placeholder="e.g. Suspicious PowerShell Execution" value={form.title} onChange={set("title")} /></div>
                        </div>
                        <div className="field"><label className="field-label">Rule / Query</label>
                            <textarea className="field-textarea field-code" rows={5}
                                placeholder={`index=* sourcetype=* EventCode=4688\n| where CommandLine LIKE "%powershell%"`}
                                value={form.rule} onChange={set("rule")} /></div>
                        <div className="field"><label className="field-label">Notes</label>
                            <input className="field-input" placeholder="Tuning guidance, false positive considerations..." value={form.notes} onChange={set("notes")} /></div>
                        <div className="inline-form-actions">
                            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn-primary" onClick={add}><Plus size={13} /> Add Detection</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="lib-toolbar">
                <div className="lib-search">
                    <Search size={13} className="search-icon" />
                    <input className="lib-search-input" placeholder="Search detections..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="detection-list">
                    {filtered.map(d => (
                        <div className="detection-card" key={d.id}>
                            <div className="detection-card-header" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                                <div className="detection-meta">
                                    <span className="entry-badge entry-badge--platform">{d.platform}</span>
                                    <span className="detection-title">{d.title}</span>
                                </div>
                                <div className="entry-right">
                                    {d.rule && (
                                        <button className="entry-remove" onClick={e => { e.stopPropagation(); copy(d.rule, d.id); }} title="Copy rule">
                                            {copied === d.id ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} />}
                                        </button>
                                    )}
                                    <button className="entry-remove" onClick={e => { e.stopPropagation(); remove(d.id); }}><Trash2 size={11} /></button>
                                </div>
                            </div>
                            {expanded === d.id && d.rule && (
                                <pre className="detection-rule">{d.rule}</pre>
                            )}
                            {expanded === d.id && d.notes && (
                                <p className="detection-notes">{d.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Radio size={28} className="empty-icon" />
                    <p className="empty-title">No detections in library</p>
                    <p className="empty-sub">Add detection rules to build your global detection database.</p>
                </div>
            )}
        </main>
    )
}
