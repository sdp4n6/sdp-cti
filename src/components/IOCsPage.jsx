import { useState, useEffect, useMemo } from "react"
import { Crosshair, Search, Plus, X, Copy, Check, Trash2 } from "lucide-react"
import { api } from "../utils/api.js"
import { IOC_TYPES } from "../data/constants.js"

const TLP = ["WHITE", "GREEN", "AMBER", "RED"]
const TLP_COLOR = { WHITE: "#e2e8f0", GREEN: "#34d399", AMBER: "#facc15", RED: "#f87171" }
const EMPTY = () => ({ type: IOC_TYPES[0], value: "", context: "", tlp: "WHITE", source: "" })

export default function IOCsPage() {
    const [iocs, setIocs] = useState([])
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY())
    const [copied, setCopied] = useState(null)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    useEffect(() => { load() }, [])
    function load() { api.iocs.list().then(setIocs).catch(() => {}) }

    const filtered = useMemo(() => {
        let list = iocs
        if (filterType) list = list.filter(i => i.type === filterType)
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(i =>
                i.value.toLowerCase().includes(q) ||
                i.context.toLowerCase().includes(q) ||
                i.source.toLowerCase().includes(q)
            )
        }
        return list
    }, [iocs, search, filterType])

    const typeCounts = useMemo(() => {
        const c = {}
        iocs.forEach(i => { c[i.type] = (c[i.type] || 0) + 1 })
        return c
    }, [iocs])

    function add() {
        if (!form.value.trim()) return
        api.iocs.create(form).then(() => {
            load()
            setForm(EMPTY())
            setShowForm(false)
        }).catch(() => {})
    }

    function remove(id) { api.iocs.delete(id).then(load).catch(() => {}) }

    function copy(val, id) {
        navigator.clipboard.writeText(val)
        setCopied(id)
        setTimeout(() => setCopied(null), 1500)
    }

    return (
        <main className="lib-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">Threat Intelligence Library</p>
                    <h1 className="page-title">Indicators of Compromise</h1>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
                    <Plus size={13} /> Add IOC
                </button>
            </div>

            <div className="lib-count-strip">
                <div className="lib-count-chip">
                    <Crosshair size={12} />
                    <span>{iocs.length} IOCs</span>
                </div>
                {IOC_TYPES.filter(t => typeCounts[t]).map(t => (
                    <button key={t} className="lib-count-chip"
                        style={filterType === t ? { borderColor: "var(--border-lit)", color: "var(--accent)" } : { cursor: "pointer" }}
                        onClick={() => setFilterType(filterType === t ? "" : t)}>
                        {t}: {typeCounts[t]}
                    </button>
                ))}
            </div>

            {showForm && (
                <div className="section-panel">
                    <div className="inline-form">
                        <div className="inline-form-row">
                            <div className="field"><label className="field-label">Type</label>
                                <div className="select-wrap">
                                    <select className="field-select" value={form.type} onChange={set("type")}>
                                        {IOC_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select><span className="select-arrow">▾</span>
                                </div></div>
                            <div className="field" style={{ flex: 2 }}><label className="field-label">Value *</label>
                                <input className="field-input" placeholder="e.g. 192.168.1.1 or evil.exe" value={form.value} onChange={set("value")} /></div>
                            <div className="field"><label className="field-label">TLP</label>
                                <div className="select-wrap">
                                    <select className="field-select" value={form.tlp} onChange={set("tlp")} style={{ color: TLP_COLOR[form.tlp] }}>
                                        {TLP.map(t => <option key={t}>{t}</option>)}
                                    </select><span className="select-arrow">▾</span>
                                </div></div>
                        </div>
                        <div className="inline-form-row">
                            <div className="field" style={{ flex: 2 }}><label className="field-label">Context</label>
                                <input className="field-input" placeholder="Context about this indicator..." value={form.context} onChange={set("context")} /></div>
                            <div className="field"><label className="field-label">Source</label>
                                <input className="field-input" placeholder="e.g. VirusTotal, internal scan" value={form.source} onChange={set("source")} /></div>
                        </div>
                        <div className="inline-form-actions">
                            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn-primary" onClick={add}><Plus size={13} /> Add IOC</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="lib-toolbar">
                <div className="lib-search">
                    <Search size={13} className="search-icon" />
                    <input className="lib-search-input" placeholder="Search by value, context, source..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="section-panel" style={{ padding: 0 }}>
                    <div className="ioc-table">
                        <div className="ioc-header-row" style={{ gridTemplateColumns: "80px 1fr 1fr 120px 90px 60px" }}>
                            <span>Type</span><span>Value</span><span>Context</span><span>Source</span><span>TLP</span><span></span>
                        </div>
                        {filtered.map(d => (
                            <div className="ioc-row" key={d.id} style={{ gridTemplateColumns: "80px 1fr 1fr 120px 90px 60px" }}>
                                <span className="ioc-type">{d.type}</span>
                                <span className="ioc-value">{d.value}</span>
                                <span className="ioc-context">{d.context || "—"}</span>
                                <span className="ioc-context">{d.source || "—"}</span>
                                <span className="ioc-tlp" style={{ color: TLP_COLOR[d.tlp] }}>TLP:{d.tlp}</span>
                                <div className="entry-right">
                                    <button className="entry-remove" onClick={() => copy(d.value, d.id)} title="Copy">
                                        {copied === d.id ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} />}
                                    </button>
                                    <button className="entry-remove" onClick={() => remove(d.id)} title="Remove"><Trash2 size={11} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <Crosshair size={28} className="empty-icon" />
                    <p className="empty-title">No IOCs in library</p>
                    <p className="empty-sub">Add indicators of compromise to build your global IOC database.</p>
                </div>
            )}
        </main>
    )
}
