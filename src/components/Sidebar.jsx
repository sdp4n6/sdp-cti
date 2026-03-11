import { Shield, ChevronRight, Settings, Menu, X,
         Activity, Folder, AlertTriangle, Database, Crosshair, Radio } from "lucide-react"

const ICON_MAP = { Activity, Folder, AlertTriangle, Database, Crosshair, Radio }

const NAV_ITEMS = [
  { icon: "Activity",      label: "Dashboard",     id: "dashboard" },
  { icon: "Folder",        label: "Investigations", id: "investigations" },
  { icon: "AlertTriangle", label: "Threat Actors",  id: "actors" },
  { icon: "Database",      label: "Malware",        id: "malware" },
  { icon: "Crosshair",     label: "IOCs",           id: "iocs" },
  { icon: "Radio",         label: "Detections",     id: "detections" },
]

export default function Sidebar({ collapsed, setCollapsed, active, setActive }) {
  return (
    <aside className="sidebar" style={{ width: collapsed ? "64px" : "220px" }}>
      <div className="sidebar-logo">
        <Shield size={20} className="logo-icon" />
        {!collapsed && <span className="logo-text">sdp<span className="logo-accent">cti</span></span>}
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ icon, label, id }) => {
          const Icon = ICON_MAP[icon];
          return (
            <button
              key={id}
              className={`nav-item ${active === id ? "nav-item--active" : ""}`}
              onClick={() => setActive(id)}
              title={collapsed ? label : undefined}
            >
              <Icon size={16} />
              {!collapsed && <span className="nav-label">{label}</span>}
              {!collapsed && active === id && <ChevronRight size={12} className="nav-chevron" />}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <button
          className={`nav-item ${active === "settings" ? "nav-item--active" : ""}`}
          onClick={() => setActive("settings")}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={16} />
          {!collapsed && <span className="nav-label">Settings</span>}
          {!collapsed && active === "settings" && <ChevronRight size={12} className="nav-chevron" />}
        </button>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={14} /> : <X size={14} />}
        </button>
      </div>
    </aside>
  );
}