import { Search, Bell, User } from "lucide-react";

export default function Topbar({ invTitle }) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={14} className="search-icon" />
        <input className="search-input" placeholder={invTitle ?? "Search investigations, IOCs, actors..."} />
        <span className="search-hint">⌘K</span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn">
          <Bell size={15} />
          <span className="badge" />
        </button>
        <div className="topbar-divider" />
        <div className="avatar"><User size={14} /></div>
      </div>
    </header>
  );
}