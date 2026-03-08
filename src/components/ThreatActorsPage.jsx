import { useState, useEffect, useMemo } from "react"
import { AlertTriangle, Search, Plus, X, Trash2 } from "lucide-react"
import { api } from "../utils/api.js"
import { KNOWN_THREAT_ACTORS } from "../data/threat-actors.js"

const MOTIVATIONS = ["Financial", "Espionage", "Hacktivism", "Destruction", "Unknown"]
const EMPTY = () => ({ name: "", aliases: "", origin: "", motivation: "", trackedBy: "", description: "" })

export default function ThreatActorsPage() {
    const [actors, setActors] = useState([])
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY())
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    useEffect(() => {
        api.threatActors.seed(KNOWN_THREAT_ACTORS).catch(() => {})
        load()
    }, [])

    function load() { api.threatActors.list().then(setActors).catch(() => {}) }

    const filtered = useMemo(() => {
        let list = actors
        if (filter) list = list.filter(a => a.motivation === filter)
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.aliases.toLowerCase().includes(q) ||
                a.origin.toLowerCase().includes(q) ||
                a.tracked_by.toLowerCase().includes(q)
            )
        }
        return list
    }, [actors, search, filter])

    const motivationCounts = useMemo(() => {
        const c = {}
        actors.forEach(a => { c[a.motivation] = (c[a.motivation] || 0) + 1 })
        return c
    }, [actors])

    function addCustom() {
        if (!form.name.trim()) return
        api.threatActors.create({ ...form, isCustom: true }).then(() => {
            load()
            setForm(EMPTY())
            setShowForm(false)
        }).catch(() => {})
    }

    function remove(id) {
        api.threatActors.delete(id).then(load).catch(() => {})
    }

    return (
        <main className="lib-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">Threat Intelligence Library</p>
                    <h1 className="page-title">Threat Actors</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
                    <Plus size={13} /> Add Custom Actor
                </button>
            </div>

            {/* Stats strip */}
            <div className="lib-count-strip">
                <div className="lib-count-chip">
                    <AlertTriangle size={12} />
                    <span>{actors.length} actors</span>
                </div>
                {MOTIVATIONS.filter(m => motivationCounts[m]).map(m => (
                    <button key={m} className="lib-count-chip" style={filter === m ? { borderColor: "var(--border-lit)", color: "var(--accent)" } : { cursor: "pointer" }}
                        onClick={() => setFilter(filter === m ? "" : m)}>
                        {m}: {motivationCounts[m]}
                    </button>
                ))}
            </div>

            {showForm && (
                <div className="section-panel">
                    <div className="inline-form">
                        <div className="inline-form-row">
                            <div className="field"><label className="field-label">Actor Name *</label>
                                <input className="field-input" placeholder="e.g. SCATTERED SPIDER" value={form.name} onChange={set("name")} /></div>
                            <div className="field"><label className="field-label">Aliases</label>
                                <input className="field-input" placeholder="Comma-separated" value={form.aliases} onChange={set("aliases")} /></div>
                        </div>
                        <div className="inline-form-row">
                            <div className="field"><label className="field-label">Origin</label>
                                <input className="field-input" placeholder="e.g. Russia" value={form.origin} onChange={set("origin")} /></div>
                            <div className="field"><label className="field-label">Motivation</label>
                                <div className="select-wrap">
                                    <select className="field-select" value={form.motivation} onChange={set("motivation")}>
                                        <option value="">— Select —</option>
                                        {MOTIVATIONS.map(m => <option key={m}>{m}</option>)}
                                    </select><span className="select-arrow">▾</span>
                                </div></div>
                            <div className="field"><label className="field-label">Tracked By</label>
                                <input className="field-input" placeholder="e.g. CrowdStrike, Mandiant" value={form.trackedBy} onChange={set("trackedBy")} /></div>
                        </div>
                        <div className="field"><label className="field-label">Description</label>
                            <textarea className="field-textarea" rows={2} placeholder="Brief description..." value={form.description} onChange={set("description")} /></div>
                        <div className="inline-form-actions">
                            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn-primary" onClick={addCustom}><Plus size={13} /> Add to Library</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="lib-toolbar">
                <div className="lib-search">
                    <Search size={13} className="search-icon" />
                    <input className="lib-search-input" placeholder="Search actors by name, alias, origin..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Grid */}
            <div className="lib-grid">
                {filtered.map(a => (
                    <div className="lib-card" key={a.id}>
                        <div className="lib-card-header">
                            <span className="lib-card-name">{a.name}</span>
                            <div className="lib-card-meta">
                                {a.origin && <span className="lib-badge lib-badge--origin">{a.origin}</span>}
                                {a.motivation && <span className="lib-badge lib-badge--motivation">{a.motivation}</span>}
                                {a.is_custom === 1 && <span className="lib-badge lib-badge--custom">Custom</span>}
                            </div>
                        </div>
                        {a.aliases && <div className="lib-card-aliases">AKA: {a.aliases}</div>}
                        {a.description && <div className="lib-card-desc">{a.description}</div>}
                        <div className="lib-card-footer">
                            {a.tracked_by ? <span className="lib-stat">Tracked by: {a.tracked_by}</span> : <span />}
                            {a.is_custom === 1 && (
                                <button className="entry-remove" onClick={() => remove(a.id)} title="Remove"><Trash2 size={11} /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <p className="empty-title">No actors found</p>
                    <p className="empty-sub">Try adjusting your search or filters.</p>
                </div>
            )}
        </main>
    )
}
