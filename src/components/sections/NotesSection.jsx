import { FileText } from "lucide-react";

export default function NotesSection({ data, onChange }){
    return (
        <div className="section-panel">
            <div className="section-header">
                <FileText size={14} className="section-icon" />
                <h3 className="section-title">Investigation Notes</h3>
            </div>
            <p className="section-sub">Document findings, analysis, and contextual observations.</p>
            <textarea
                className="notes-editor"
                placeholder={`## Summary\n\nDocument your findings here...\n\n## Analysis\n\n## Key Observations`}
                value={data}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}