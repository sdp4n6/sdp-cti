import { Plus, Users, X } from "lucide-react"
import { useState } from "react"

const EMPTY = () => ({ name: "", aliases: "", origin: "", motivation: "", notes: "" })
const MOTIVATIONS = ["Financial", "Espionage", "Hacktivism", "Destruction", "Unknown"]

export default function ThreatActorsSection({ data, onChange }) {
    const [form, setForm] = useState(EMPTY())
    const [open, setOpen] = useState(false)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    function add() {
        if (!form.name.trim()) return
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
                    <button className="btn-primary" onClick={add}><Plus size={13} /> Add Actor</button>
                </div>
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