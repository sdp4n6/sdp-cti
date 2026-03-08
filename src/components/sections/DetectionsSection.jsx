import { useState } from "react"
import { Radio, Plus, X, Copy, Check } from "lucide-react"
import { DETECTION_PLATFORMS } from "../../data/constants.js"

const EMPTY = () => ({ platform: DETECTION_PLATFORMS[0], title: "", rule: "", notes: "" })

export default function DetectionsSection({ data, onChange }) {
    const [form, setForm]     = useState(EMPTY())
    const [open, setOpen]     = useState(false)
    const [copied, setCopied] = useState(null)
    const [expanded, setExpanded] = useState(null)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    function add() {
        if (!form.title.trim()) return
        onChange([...data, { ...form, id: Date.now() }])
        setForm(EMPTY())
        setOpen(false)
    }

    function remove(id) { onChange(data.filter(d => d.id !== id)) }

    function copy(text, id) {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 1500)
    }

    return(
        <div className="section-panel">
            {/* Header */}
            <div className="section-header">
                <Radio size={14} className="section-icon" />
                <h3 className="section-title">Detections</h3>
                <button className="btn-section-add" onClick={() => setOpen(o => !o)}>
                <Plus size={13} /> Add
                </button>
            </div>

            {open && (
                <div className="inline-form">
                <div className="inline-form-row">
                    <div className="field">
                    <label className="field-label">Platform</label>
                    <div className="select-wrap">
                        <select className="field-select" value={form.platform} onChange={set("platform")}>
                        {DETECTION_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                        </select>
                        <span className="select-arrow">▾</span>
                    </div>
                    </div>
                    <div className="field" style={{ flex: 2 }}>
                    <label className="field-label">Detection Title *</label>
                    <input className="field-input" placeholder="e.g. Suspicious PowerShell Execution" value={form.title} onChange={set("title")} />
                    </div>
                </div>
                <div className="field">
                    <label className="field-label">Rule / Query</label>
                    <textarea className="field-textarea field-code" rows={5}
                    placeholder={`index=* sourcetype=* EventCode=4688\n| where CommandLine LIKE "%powershell%"`}
                    value={form.rule} onChange={set("rule")} />
                </div>
                <div className="field">
                    <label className="field-label">Notes</label>
                    <input className="field-input" placeholder="Tuning guidance, false positive considerations..." value={form.notes} onChange={set("notes")} />
                </div>
                <div className="inline-form-actions">
                    <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={add}><Plus size={13} /> Add Detection</button>
                </div>
                </div>
            )}

            {data.length === 0 && !open
                ? <p className="section-empty">No detections created yet.</p>
                : (
                <div className="detection-list">
                    {data.map(d => (
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
                            <button className="entry-remove" onClick={e => { e.stopPropagation(); remove(d.id); }}><X size={11} /></button>
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
                )
            }
        </div>
    )
}