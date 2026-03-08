import { useState } from "react"
import { Crosshair, Plus, X, Copy, Check } from "lucide-react"
import { IOC_TYPES } from "../../data/constants.js"

const EMPTY = () => ({ type: IOC_TYPES[0], value: "", context: "", tlp: "WHITE" })
const TLP = ["WHITE","GREEN","AMBER","RED"]
const TLP_COLOR = { WHITE: "#e2e8f0", GREEN: "#34d399", AMBER: "#facc15", RED: "#f87171" }

export default function IOCsSection({ data, onChange }) {
    const [form, setForm]     = useState(EMPTY())
    const [open, setOpen]     = useState(false)
    const [copied, setCopied] = useState(null)
    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    function add() {
        if (!form.value.trim()) return
        onChange([...data, { ...form, id: Date.now() }])
        setForm(EMPTY())
        setOpen(false)
    }

    function remove(id) { onChange(data.filter(d => d.id !== id)) }

    function copy(val, id) {
        navigator.clipboard.writeText(val)
        setCopied(id)
        setTimeout(() => setCopied(null), 1500)
    }
    return(
        <div className="section-panel">
            {/* Header */}
            <div className="section-header">
                <Crosshair size={14} className="section-icon" />
                <h3 className="section-title">Indicators of Compromise</h3>
                <button className="btn-section-add" onClick={() => setOpen(o => !o)}>
                <Plus size={13} /> Add
                </button>
            </div>

            {open && (
                <div className="inline-form">
                    <div className="inline-form-row">
                        <div className="field">
                        <label className="field-label">Type</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.type} onChange={set("type")}>
                            {IOC_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        </div>
                        <div className="field" style={{ flex: 2 }}>
                        <label className="field-label">Value *</label>
                        <input className="field-input" placeholder="e.g. 192.168.1.1 or malware.exe" value={form.value} onChange={set("value")} />
                        </div>
                        <div className="field">
                        <label className="field-label">TLP</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.tlp} onChange={set("tlp")} style={{ color: TLP_COLOR[form.tlp] }}>
                            {TLP.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="field-label">Context</label>
                        <input className="field-input" placeholder="e.g. C2 server observed in phase 2..." value={form.context} onChange={set("context")} />
                    </div>
                    <div className="inline-form-actions">
                        <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                        <button className="btn-primary" onClick={add}><Plus size={13} /> Add IOC</button>
                    </div>
                </div>
            )}

            {data.length === 0 && !open
                ? <p className="section-empty">No IOCs catalogued yet.</p>
                : (
                <div className="ioc-table">
                    <div className="ioc-header-row">
                    <span>Type</span><span>Value</span><span>Context</span><span>TLP</span><span></span>
                    </div>
                    {data.map(d => (
                    <div className="ioc-row" key={d.id}>
                        <span className="ioc-type">{d.type}</span>
                        <span className="ioc-value">{d.value}</span>
                        <span className="ioc-context">{d.context || "—"}</span>
                        <span className="ioc-tlp" style={{ color: TLP_COLOR[d.tlp] }}>TLP:{d.tlp}</span>
                        <div className="entry-right">
                        <button className="entry-remove" onClick={() => copy(d.value, d.id)} title="Copy">
                            {copied === d.id ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} />}
                        </button>
                        <button className="entry-remove" onClick={() => remove(d.id)} title="Remove"><X size={11} /></button>
                        </div>
                    </div>
                    ))}
                </div>
                )
            }
        </div>
    )
}