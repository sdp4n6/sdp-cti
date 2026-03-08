import { useState, useMemo, useRef, useEffect } from "react"
import { Shield, Plus, X, Search } from "lucide-react"
import { MITRE_TECHNIQUES, TACTIC_ORDER } from "../../data/mitre-attack.js"

export default function TTPsSection({ data, onChange }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedTactic, setSelectedTactic] = useState("")
    const [selectedTechnique, setSelectedTechnique] = useState(null)
    const [note, setNote] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    // Filtered techniques
    const filtered = useMemo(() => {
        let list = MITRE_TECHNIQUES
        if (selectedTactic) list = list.filter(t => t.tactic === selectedTactic)
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(t =>
                t.id.toLowerCase().includes(q) ||
                t.name.toLowerCase().includes(q) ||
                t.tactic.toLowerCase().includes(q)
            )
        }
        // Exclude already added techniques
        const addedIds = new Set(data.map(d => d.techniqueId))
        list = list.filter(t => !addedIds.has(t.id))
        return list
    }, [search, selectedTactic, data])

    // Group filtered by tactic for display
    const grouped = useMemo(() => {
        const map = {}
        for (const t of filtered) {
            if (!map[t.tactic]) map[t.tactic] = []
            map[t.tactic].push(t)
        }
        return TACTIC_ORDER.filter(tac => map[tac]).map(tac => ({ tactic: tac, techniques: map[tac] }))
    }, [filtered])

    function selectTechnique(t) {
        setSelectedTechnique(t)
        setSearch(`${t.id} — ${t.name}`)
        setDropdownOpen(false)
    }

    function add() {
        if (!selectedTechnique) return
        onChange([...data, {
            techniqueId:   selectedTechnique.id,
            techniqueName: selectedTechnique.name,
            tactic:        selectedTechnique.tactic,
            notes:         note,
            id:            Date.now(),
        }])
        setSelectedTechnique(null)
        setSearch("")
        setNote("")
        setOpen(false)
    }

    function remove(id) { onChange(data.filter(d => d.id !== id)) }

    // Group displayed TTPs by tactic
    const displayGrouped = useMemo(() => {
        const map = {}
        for (const d of data) {
            const tac = d.tactic || "Unknown"
            if (!map[tac]) map[tac] = []
            map[tac].push(d)
        }
        return TACTIC_ORDER.filter(tac => map[tac]).map(tac => ({ tactic: tac, items: map[tac] }))
    }, [data])

    return (
        <div className="section-panel">
            {/* Header */}
            <div className="section-header">
                <Shield size={14} className="section-icon" />
                <h3 className="section-title">MITRE ATT&CK TTPs</h3>
                <button className="btn-section-add" onClick={() => setOpen(o => !o)}>
                    <Plus size={13} /> Add TTP
                </button>
            </div>

            {open && (
                <div className="inline-form">
                    {/* Tactic filter + searchable dropdown */}
                    <div className="inline-form-row">
                        <div className="field">
                            <label className="field-label">Filter by Tactic</label>
                            <div className="select-wrap">
                                <select className="field-select" value={selectedTactic}
                                    onChange={e => { setSelectedTactic(e.target.value); setSelectedTechnique(null); setSearch("") }}>
                                    <option value="">All Tactics</option>
                                    {TACTIC_ORDER.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <span className="select-arrow">▾</span>
                            </div>
                        </div>
                        <div className="field" style={{ flex: 2, position: "relative" }} ref={dropRef}>
                            <label className="field-label">Technique *</label>
                            <div style={{ position: "relative" }}>
                                <Search size={12} style={{ position: "absolute", left: 10, top: 11, color: "var(--text-muted)", pointerEvents: "none" }} />
                                <input
                                    className="field-input"
                                    style={{ paddingLeft: 28 }}
                                    placeholder="Search by ID or name (e.g. T1566 or Phishing)..."
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value)
                                        setSelectedTechnique(null)
                                        setDropdownOpen(true)
                                    }}
                                    onFocus={() => setDropdownOpen(true)}
                                />
                            </div>
                            {dropdownOpen && grouped.length > 0 && (
                                <div className="ttp-dropdown">
                                    {grouped.map(g => (
                                        <div key={g.tactic}>
                                            <div className="ttp-dropdown-tactic">{g.tactic}</div>
                                            {g.techniques.slice(0, 15).map(t => (
                                                <div key={t.id} className="ttp-dropdown-item" onClick={() => selectTechnique(t)}>
                                                    <span className="ttp-dropdown-id">{t.id}</span>
                                                    <span className="ttp-dropdown-name">{t.name}</span>
                                                </div>
                                            ))}
                                            {g.techniques.length > 15 && (
                                                <div className="ttp-dropdown-more">+ {g.techniques.length - 15} more — refine search</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedTechnique && (
                        <div className="ttp-selected-banner">
                            <span className="ttp-id">{selectedTechnique.id}</span>
                            <span style={{ fontWeight: 500 }}>{selectedTechnique.name}</span>
                            <span className="entry-badge entry-badge--tactic">{selectedTechnique.tactic}</span>
                        </div>
                    )}

                    <div className="field">
                        <label className="field-label">Observation Notes</label>
                        <textarea
                            className="field-textarea"
                            rows={3}
                            placeholder="Describe the observed activity linked to this TTP... (e.g. 'Actor used spearphishing emails with malicious .docx attachments targeting HR staff')"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <div className="inline-form-actions">
                        <button className="btn-ghost" onClick={() => { setOpen(false); setSelectedTechnique(null); setSearch(""); setNote("") }}>Cancel</button>
                        <button className="btn-primary" onClick={add} disabled={!selectedTechnique}>
                            <Plus size={13} /> Add TTP
                        </button>
                    </div>
                </div>
            )}

            {data.length === 0 && !open
                ? <p className="section-empty">No TTPs mapped yet. Add MITRE ATT&CK techniques observed in this investigation.</p>
                : displayGrouped.map(g => (
                    <div key={g.tactic} className="ttp-tactic-group">
                        <div className="ttp-tactic-header">
                            <span className="entry-badge entry-badge--tactic">{g.tactic}</span>
                            <span className="ttp-tactic-count">{g.items.length}</span>
                        </div>
                        <div className="entry-table">
                            {g.items.map(d => (
                                <div className="entry-row" key={d.id}>
                                    <div className="entry-main">
                                        <span className="entry-primary">
                                            <span className="ttp-id">{d.techniqueId}</span>
                                            {d.techniqueName}
                                        </span>
                                        {d.notes && <span className="entry-note">{d.notes}</span>}
                                    </div>
                                    <div className="entry-right">
                                        <button className="entry-remove" onClick={() => remove(d.id)}><X size={11} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
