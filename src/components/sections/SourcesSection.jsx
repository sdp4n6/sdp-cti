import { useState } from "react"
import {
  BookOpen, Plus, X, ExternalLink, Copy, Check,
  FileText, Globe, File, Clipboard
} from "lucide-react"

const SOURCE_TYPES = [
    "URL", "Article", "Report", "Paste", "PCAP",
    "Sample", "Sandbox", "Forum Post", "Dark Web", "Other"
]

const TYPE_ICON = {
    "URL": Globe, "Article": FileText, "Report": FileText,
    "Paste": Clipboard, "PCAP": File, "Sample": File,
    "Sandbox": File, "Forum Post": Globe, "Dark Web": Globe, "Other": FileText,
}

const TLP_COLOR = { WHITE: "#e2e8f0", GREEN: "#34d399", AMBER: "#facc15", RED: "#f87171" }
const TLP_OPTS  = ["WHITE", "GREEN", "AMBER", "RED"]
const RELEVANCE = ["High", "Medium", "Low"]
const REL_COLOR = { High: "#f87171", Medium: "#facc15", Low: "#34d399" }
const EMPTY = () => ({ type: SOURCE_TYPES[0], title: "", url: "", tlp: "WHITE", relevance: "Medium", date: "", notes: "", rawContent: "" })


export default function SourcesSection({ data, onChange }){
    const [form,     setForm]     = useState(EMPTY())
    const [open,     setOpen]     = useState(false)
    const [expanded, setExpanded] = useState(null)
    const [copied,   setCopied]   = useState(null)

    const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

    function add() {
        if (!form.title.trim()) return
        onChange([...data, { ...form, id: Date.now() }])
        setForm(EMPTY())
        setOpen(false)
    }

    function remove(id) {
        onChange(data.filter(d => d.id !== id))
        if (expanded === id) setExpanded(null)
    }

    function copy(text, id) {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 1500)
    }

    return(
        <div className="section-panel">
            {/* Header */}
            <div className="section-header">
                <BookOpen size={14} className="section-icon" />
                <h3 className="section-title">Source Material</h3>
                <button className="btn-section-add" onClick={() => setOpen(o => !o)}>
                    <Plus size={13} /> Add Source
                </button>
            </div>
            <p className="section-sub">Log URLs, reports, pastes, samples, and raw intelligence feeding this investigation.</p>

            {open && (
                <div className="inline-form">
                    <div className="inline-form-row">
                        <div className="field">
                        <label className="field-label">Source Type</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.type} onChange={set("type")}>
                            {SOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        </div>
                        <div className="field" style={{ flex: 2 }}>
                        <label className="field-label">Title / Label *</label>
                        <input className="field-input" placeholder="e.g. eSentire EVALUSION Campaign Report" value={form.title} onChange={set("title")} />
                        </div>
                    </div>

                    <div className="inline-form-row">
                        <div className="field" style={{ flex: 2 }}>
                        <label className="field-label">URL <span className="field-optional">(optional)</span></label>
                        <input className="field-input" placeholder="https://..." value={form.url} onChange={set("url")} />
                        </div>
                        <div className="field">
                        <label className="field-label">Date</label>
                        <input className="field-input" type="date" value={form.date} onChange={set("date")} style={{ colorScheme: "dark" }} />
                        </div>
                        <div className="field">
                        <label className="field-label">TLP</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.tlp} onChange={set("tlp")} style={{ color: TLP_COLOR[form.tlp] }}>
                            {TLP_OPTS.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        </div>
                        <div className="field">
                        <label className="field-label">Relevance</label>
                        <div className="select-wrap">
                            <select className="field-select" value={form.relevance} onChange={set("relevance")} style={{ color: REL_COLOR[form.relevance] }}>
                            {RELEVANCE.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <span className="select-arrow">▾</span>
                        </div>
                        </div>
                    </div>

                    <div className="field">
                        <label className="field-label">Notes <span className="field-optional">(key findings, relevance context)</span></label>
                        <textarea className="field-textarea" placeholder="Summarise why this source matters..." value={form.notes} onChange={set("notes")} rows={2} />
                    </div>

                    <div className="field">
                        <label className="field-label">Raw Content <span className="field-optional">(paste, log snippet, sample output)</span></label>
                        <textarea className="field-textarea field-code" placeholder="Paste raw content here..." value={form.rawContent} onChange={set("rawContent")} rows={5} />
                    </div>

                    <div className="inline-form-actions">
                        <button className="btn-ghost" onClick={() => { setForm(EMPTY()); setOpen(false); }}>Cancel</button>
                        <button className="btn-primary" onClick={add}><Plus size={13} /> Add Source</button>
                    </div>
                </div>
            )}

            {data.length === 0 && !open && (
                <p className="section-empty">No source material added yet.</p>
            )}

            {data.length > 0 && (
                <div className="source-list">
                    {data.map(d => {
                        const Icon   = TYPE_ICON[d.type] || FileText;
                        const isOpen = expanded === d.id;
                        return (
                        <div className="source-card" key={d.id}>
                            <div className="source-card-header" onClick={() => setExpanded(isOpen ? null : d.id)}>
                            <div className="source-card-left">
                                <Icon size={13} className="source-type-icon" />
                                <div className="source-card-meta">
                                <span className="source-title">{d.title}</span>
                                <div className="source-chips">
                                    <span className="entry-badge">{d.type}</span>
                                    <span className="entry-badge" style={{ color: TLP_COLOR[d.tlp] }}>TLP:{d.tlp}</span>
                                    <span className="entry-badge" style={{ color: REL_COLOR[d.relevance] }}>{d.relevance} relevance</span>
                                    {d.date && <span className="entry-badge">{d.date}</span>}
                                </div>
                                </div>
                            </div>
                            <div className="entry-right" onClick={e => e.stopPropagation()}>
                                {d.url && (
                                <a className="entry-remove" href={d.url} target="_blank" rel="noreferrer" title="Open URL">
                                    <ExternalLink size={11} />
                                </a>
                                )}
                                {d.rawContent && (
                                <button className="entry-remove" onClick={() => copy(d.rawContent, d.id)} title="Copy raw content">
                                    {copied === d.id ? <Check size={11} style={{ color: "#34d399" }} /> : <Copy size={11} />}
                                </button>
                                )}
                                <button className="entry-remove" onClick={() => remove(d.id)} title="Remove">
                                <X size={11} />
                                </button>
                            </div>
                            </div>

                            {isOpen && (
                            <div className="source-card-body">
                                {d.url && (
                                <div className="source-url">
                                    <Globe size={11} />
                                    <a href={d.url} target="_blank" rel="noreferrer" className="source-url-link">{d.url}</a>
                                </div>
                                )}
                                {d.notes && (
                                <div className="source-notes">
                                    <p className="source-notes-label">NOTES</p>
                                    <p className="source-notes-text">{d.notes}</p>
                                </div>
                                )}
                                {d.rawContent && (
                                <div className="source-raw">
                                    <div className="source-raw-header">
                                    <p className="source-notes-label">RAW CONTENT</p>
                                    <button className="btn-section-add" onClick={() => copy(d.rawContent, `raw-${d.id}`)}>
                                        {copied === `raw-${d.id}` ? <><Check size={11} style={{ color: "#34d399" }} /> Copied</> : <><Copy size={11} /> Copy</>}
                                    </button>
                                    </div>
                                    <pre className="source-raw-content">{d.rawContent}</pre>
                                </div>
                                )}
                            </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}