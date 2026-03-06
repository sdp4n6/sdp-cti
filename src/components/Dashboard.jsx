import { useState, useEffect } from "react"
import { api } from "../utils/api.js"
import { SEVERITY_CONFIG, STATUS_CONFIG } from "../data/constants.js"
import {
    Activity, Shield, AlertTriangle, Crosshair, Radio,
    ChevronRight, Clock
} from "lucide-react";

const SEV_COLORS = {
    Critical: "#f87171", High: "#fb923c",
    Medium:   "#facc15", Low:  "#34d399",
    Informational: "#4a5568",
}

export default function DashboardPage({ onOpenInvestigation }) {
    const [investigations, setInvestigations] = useState([])
    const [workspaces,     setWorkspaces]     = useState([])
    const [loading,        setLoading]        = useState(true)

    useEffect(() => {
        setLoading(true);
        api.investigations.list().then(async (invs) => {
        setInvestigations(invs);
        const wsList = await Promise.all(
            invs.map(inv => api.workspaces.get(inv.id).catch(() => ({})))
        );
        setWorkspaces(wsList)
        setLoading(false)
        }).catch(() => setLoading(false))
    }, [])


    const total    = investigations.length
    const active   = investigations.filter(i => i.status === "Active").length
    const inReview = investigations.filter(i => i.status === "In Review" || i.status === "Monitoring").length
    const closed   = investigations.filter(i => i.status === "Closed").length
    const critical = investigations.filter(i => i.severity === "Critical").length
    const high     = investigations.filter(i => i.severity === "High").length

    const allIOCs       = workspaces.flatMap(ws => ws.iocs       || [])
    const allTTPs       = workspaces.flatMap(ws => ws.ttps       || [])
    const allDetections = workspaces.flatMap(ws => ws.detections || [])

    const sevOrder = ["Critical", "High", "Medium", "Low"]
    const sevDist  = sevOrder.map(s => ({
        label: s, count: investigations.filter(i => i.severity === s).length,
    }))
    const maxSev = Math.max(...sevDist.map(s => s.count), 1)

    const iocTypeCounts = allIOCs.reduce((acc, ioc) => {
        const type = typeof ioc === "string" ? "Other" : (ioc.type || "Other")
        acc[type] = (acc[type] || 0) + 1
        return acc
    }, {})
    const iocBreakdown = Object.entries(iocTypeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
    const maxIOC = Math.max(...iocBreakdown.map(b => b.count), 1)

    const MITRE_TACTICS = [
        "Reconnaissance", "Resource Dev", "Initial Access", "Execution",
        "Persistence", "Priv Escalation", "Defense Evasion", "Credential Access",
        "Discovery", "Lateral Movement", "Collection", "C2",
        "Exfiltration", "Impact",
    ]
    const ttpTacticCounts = allTTPs.reduce((acc, t) => {
        const tactic = typeof t === "string" ? "Other" : (t.tactic || "Other")
        acc[tactic] = (acc[tactic] || 0) + 1
        return acc
    }, {})

    const recent = [...investigations]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)

    function formatDate(iso) {
        if (!iso) return "—"
        return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    if (loading) {
        return (
        <main className="main-content" style={{ alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>Loading dashboard...</p>
        </main>
        )
    }

    if (total === 0) {
        return (
        <main className="main-content">
            <div className="page-header">
            <div>
                <p className="page-eyebrow">SDPCTI Platform</p>
                <h1 className="page-title">Dashboard</h1>
            </div>
            </div>
            <div className="empty-state">
            <Activity size={32} className="empty-icon" />
            <p className="empty-title">No investigations yet</p>
            <p className="empty-sub">Create or import investigations to populate the dashboard.</p>
            </div>
        </main>
        )
    }

    return (
        <main className="main-content">
            <div className="page-header">
                <div>
                <p className="page-eyebrow">SDPCTI Platform</p>
                <h1 className="page-title">Dashboard</h1>
                </div>
                <div className="dash-header-meta">
                <span className="dash-last-updated">
                    <Clock size={12} />
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                </div>
            </div>

            {/* Stat grid */}
            <div className="dash-stat-grid">
                {[
                { label: "Total",      value: total,                icon: <Shield size={15} />,        color: "var(--accent)" },
                { label: "Active",     value: active,               icon: <Activity size={15} />,      color: "#34d399" },
                { label: "In Review",  value: inReview,             icon: <Clock size={15} />,         color: "#facc15" },
                { label: "Critical",   value: critical,             icon: <AlertTriangle size={15} />, color: "#f87171" },
                { label: "IOCs",       value: allIOCs.length,       icon: <Crosshair size={15} />,     color: "var(--accent)" },
                { label: "Detections", value: allDetections.length, icon: <Radio size={15} />,         color: "#818cf8" },
                ].map(stat => (
                <div className="dash-stat-card" key={stat.label}>
                    <div className="dash-stat-top">
                    <div className="dash-stat-icon" style={{ background: stat.color + "18", color: stat.color }}>
                        {stat.icon}
                    </div>
                    </div>
                    <p className="dash-stat-value" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="dash-stat-label">{stat.label}</p>
                </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="dash-two-col">
                <div className="dash-panel">
                <div className="dash-panel-header">
                    <AlertTriangle size={13} style={{ color: "var(--accent)" }} />
                    <h3 className="dash-panel-title">Severity Distribution</h3>
                </div>
                <div className="sev-bar-list">
                    {sevDist.map(s => (
                    <div className="sev-bar-row" key={s.label}>
                        <span className="sev-bar-label" style={{ color: SEV_COLORS[s.label] }}>{s.label}</span>
                        <div className="sev-bar-track">
                        <div className="sev-bar-fill" style={{
                            width: `${Math.round((s.count / maxSev) * 100)}%`,
                            background: SEV_COLORS[s.label],
                        }} />
                        </div>
                        <span className="sev-bar-count">{s.count}</span>
                    </div>
                    ))}
                </div>
                </div>

                <div className="dash-panel">
                <div className="dash-panel-header">
                    <Crosshair size={13} style={{ color: "var(--accent)" }} />
                    <h3 className="dash-panel-title">IOC Breakdown</h3>
                </div>
                {iocBreakdown.length > 0 ? (
                    <div className="ioc-breakdown-list">
                    {iocBreakdown.map(({ label, count }) => (
                        <div className="ioc-breakdown-row" key={label}>
                        <span className="ioc-breakdown-dot" style={{ background: "var(--accent)" }} />
                        <span className="ioc-breakdown-type">{label}</span>
                        <div className="sev-bar-track">
                            <div className="sev-bar-fill" style={{
                            width: `${Math.round((count / maxIOC) * 100)}%`,
                            background: "var(--accent)",
                            }} />
                        </div>
                        <span className="sev-bar-count">{count}</span>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="section-empty">No IOCs recorded yet.</p>
                )}
                </div>
            </div>

            {/* TTP Heatmap */}
            <div className="dash-panel">
                <div className="dash-panel-header">
                <Crosshair size={13} style={{ color: "var(--accent)" }} />
                <h3 className="dash-panel-title">TTP Heatmap</h3>
                </div>
                <div className="heatmap-grid">
                {MITRE_TACTICS.map(tactic => {
                    const count = ttpTacticCounts[tactic] || 0;
                    const intensity = count > 0 ? Math.min(count / 5, 1) : 0;
                    return (
                    <div key={tactic} className="heatmap-cell" style={{
                        background: count > 0 ? `rgba(34,211,238,${0.05 + intensity * 0.15})` : "var(--bg-surface)",
                        borderColor: count > 0 ? `rgba(34,211,238,${0.15 + intensity * 0.2})` : "var(--border)",
                    }}>
                        <span className="heatmap-tactic">{tactic}</span>
                        <span className="heatmap-count" style={{ color: count > 0 ? "var(--accent)" : "var(--text-dim)" }}>
                        {count}
                        </span>
                    </div>
                    );
                })}
                </div>
            </div>

            {/* Recent investigations */}
            <div className="dash-panel">
                <div className="dash-panel-header">
                <Clock size={13} style={{ color: "var(--accent)" }} />
                <h3 className="dash-panel-title">Recent Investigations</h3>
                </div>
                <div className="recent-list">
                {recent.map(inv => (
                    <div className="recent-row" key={inv.id} onClick={() => onOpenInvestigation?.(inv)}>
                    <div className="recent-left">
                        <span className="recent-sev-dot" style={{ background: SEV_COLORS[inv.severity] || "#4a5568" }} />
                        <div className="recent-meta">
                        <span className="recent-title">{inv.title}</span>
                        <div className="recent-chips">
                            <span className="entry-badge">{inv.type}</span>
                            <span className="entry-badge" style={{
                            color: SEV_COLORS[inv.severity],
                            background: (SEV_COLORS[inv.severity] || "#4a5568") + "15",
                            borderColor: (SEV_COLORS[inv.severity] || "#4a5568") + "30",
                            }}>{inv.severity}</span>
                        </div>
                        </div>
                    </div>
                    <div className="recent-right">
                        <span className="recent-time">{formatDate(inv.updatedAt)}</span>
                        <ChevronRight size={12} className="recent-arrow" />
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </main>
    )
}
