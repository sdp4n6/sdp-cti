import { Plus, Users, X, Search } from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import { api } from "../../utils/api.js"
import { KNOWN_THREAT_ACTORS } from "../../data/threat-actors.js"

const EMPTY = () => ({ name: "", aliases: "", origin: "", motivation: "", notes: "" })
const MOTIVATIONS = ["Financial", "Espionage", "Hacktivism", "Destruction", "Unknown"]

export default function ThreatActorsSection({ data, onChange }) {
    const [form, setForm] = useState(EMPTY())
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState("pick") // "pick" or "custom"
    const [library, setLibrary] = useState([])
    const [search, setSearch] = useState("")
    const [pickerOpen, setPickerOpen] = useState(false)
    const pickRef = useRef(null)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    // Seed + load library on mount
    useEffect(() => {
        api.threatActors.seed(KNOWN_THREAT_ACTORS).catch(() => {})
        api.threatActors.list().then(setLibrary).catch(() => {})
    }, [])

    // Close picker when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (pickRef.current && !pickRef.current.contains(e.target)) setPickerOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    // Filter library (exclude already added)
    const filteredLib = useMemo(() => {
        const addedNames = new Set(data.map(d => d.name.toLowerCase()))
        let list = library.filter(a => !addedNames.has(a.name.toLowerCase()))
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(a =>
                a.name.toLowerCase().includes(q) ||
                a.aliases.toLowerCase().includes(q) ||
                a.origin.toLowerCase().includes(q)
            )
        }
        return list.slice(0, 30)
    }, [library, data, search])

    function pickFromLibrary(actor) {
        onChange([...data, {
            name: actor.name,
            aliases: actor.aliases,
            origin: actor.origin,
            motivation: actor.motivation,
            notes: actor.description || "",
            id: Date.now(),
        }])
        setSearch("")
        setPickerOpen(false)
    }

    function addCustom() {
        if (!form.name.trim()) return
        // Also add to library
        api.threatActors.create({ ...form, isCustom: true }).then(() => {
            api.threatActors.list().then(setLibrary).catch(() => {})
        }).catch(() => {})
        onChange([...data, { ...form, id: Date.now() }])
        setForm(EMPTY())
        setOpen(false)
    }

    function remove(id) { onChange(data.filter(d => d.id !== id)) }

    return(
        <div className="section-panel">
            {/* Header */}
            <div className="section-header">
                <Users size={14} className="section-icon" />
                <h3 className="section-title">Threat Actors</h3>
                <button className="btn-section-add" onClick={() => setOpen(o => !o)}>
                <Plus size={13} /> Add
                </button>
            </div>

            {open && (
                <div className="inline-form">
                    {/* Mode toggle */}
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className={`btn-ghost ${mode === "pick" ? "btn-ghost--active" : ""}`}
                            style={mode === "pick" ? { borderColor: "var(--border-lit)", color: "var(--accent)", background: "var(--accent-dim)" } : {}}
                            onClick={() => setMode("pick")}>
                            Choose from Library
                        </button>
                        <button className={`btn-ghost ${mode === "custom" ? "btn-ghost--active" : ""}`}
                            style={mode === "custom" ? { borderColor: "var(--border-lit)", color: "var(--accent)", background: "var(--accent-dim)" } : {}}
                            onClick={() => setMode("custom")}>
                            Create Custom
                        </button>
                    </div>

                    {mode === "pick" ? (
                        <div className="field" style={{ position: "relative" }} ref={pickRef}>
                            <label className="field-label">Search Known Threat Actors</label>
                            <div style={{ position: "relative" }}>
                                <Search size={12} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)", pointerEvents: "none" }} />
                                <input
                                    className="field-input"
                                    style={{ paddingLeft: 28 }}
                                    placeholder="Search by name, alias, or origin..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPickerOpen(true) }}
                                    onFocus={() => setPickerOpen(true)}
                                />
                            </div>
                            {pickerOpen && filteredLib.length > 0 && (
                                <div className="picker-dropdown">
                                    {filteredLib.map(a => (
                                        <div key={a.id} className="picker-item" onClick={() => pickFromLibrary(a)}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                                                <span className="picker-item-name">{a.name}</span>
                                                {a.aliases && <span className="picker-item-meta">AKA: {a.aliases.length > 60 ? a.aliases.slice(0, 60) + "..." : a.aliases}</span>}
                                            </div>
                                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                                {a.origin && <span className="lib-badge lib-badge--origin">{a.origin}</span>}
                                                {a.motivation && <span className="lib-badge lib-badge--motivation">{a.motivation}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {pickerOpen && filteredLib.length === 0 && search.trim() && (
                                <div className="picker-dropdown" style={{ padding: "12px", textAlign: "center" }}>
                                    <span style={{ color: "var(--text-dim)", fontSize: 12 }}>No matches. Try "Create Custom" instead.</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="inline-form-row">
                                <div className="field">
                                    <label className="field-label">Actor Name *</label>
                                    <input className="field-input" placeholder="e.g. SCATTERED SPIDER" value={form.name} onChange={set("name")} />
                                </div>
                                <div className="field">
                                    <label className="field-label">Aliases</label>
                                    <input className="field-input" placeholder="Comma-separated" value={form.aliases} onChange={set("aliases")} />
                                </div>
                            </div>
                            <div className="inline-form-row">
                                <div className="field">
                                    <label className="field-label">Origin</label>
                                    <input className="field-input" placeholder="e.g. Russia, North Korea" value={form.origin} onChange={set("origin")} />
                                </div>
                                <div className="field">
                                    <label className="field-label">Motivation</label>
                                    <div className="select-wrap">
                                        <select className="field-select" value={form.motivation} onChange={set("motivation")}>
                                            <option value="">— Select —</option>
                                            {MOTIVATIONS.map(m => <option key={m}>{m}</option>)}
                                        </select>
                                        <span className="select-arrow">▾</span>
                                    </div>
                                </div>
                            </div>
                            <div className="field">
                                <label className="field-label">Notes</label>
                                <input className="field-input" placeholder="Additional context..." value={form.notes} onChange={set("notes")} />
                            </div>
                            <div className="inline-form-actions">
                                <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={addCustom}><Plus size={13} /> Add Actor</button>
                            </div>
                        </>
                    )}

                    {mode === "pick" && (
                        <div className="inline-form-actions">
                            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            {data.length === 0 && !open
                ? <p className="section-empty">No threat actors linked yet.</p>
                : (
                <div className="entry-table">
                    {data.map(d => (
                    <div className="entry-row" key={d.id}>
                        <div className="entry-main">
                        <span className="entry-primary">{d.name}</span>
                        {d.aliases  && <span className="entry-secondary">AKA: {d.aliases}</span>}
                        {d.origin   && <span className="entry-secondary">Origin: {d.origin}</span>}
                        {d.notes    && <span className="entry-note">{d.notes}</span>}
                        </div>
                        <div className="entry-right">
                        {d.motivation && <span className="entry-badge">{d.motivation}</span>}
                        <button className="entry-remove" onClick={() => remove(d.id)}><X size={11} /></button>
                        </div>
                    </div>
                    ))}
                </div>
                )
            }
        </div>
    )
}
