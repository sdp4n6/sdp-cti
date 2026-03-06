import { Activity, AlertTriangle, Clock, Crosshair, Radio, Shield } from "lucide-react";

export default function DashboardPage(){
    return(
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

            {/* Recent investigations */}
            <div className="dash-panel">
                <div className="dash-panel-header">
                    <Clock size={13} style={{ color: "var(--accent)" }} />
                    <h3 className="dash-panel-title">Recent Investigations</h3>
                </div>
                
            </div>
        </main>
    )
}