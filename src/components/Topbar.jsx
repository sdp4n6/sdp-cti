import { Search, Bell, Shield, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Topbar({ invTitle }) {
  const [showAbout, setShowAbout] = useState(false);
  const aboutRef = useRef(null);

  useEffect(() => {
    if (!showAbout) return;
    function handleClick(e) {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setShowAbout(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAbout]);

  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={14} className="search-icon" />
        <input className="search-input" placeholder={invTitle ?? "Search investigations, IOCs, actors..."} />
        <span className="search-hint">&#x2318;K</span>
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn">
          <Bell size={15} />
          <span className="badge" />
        </button>
        <div className="topbar-divider" />
        <div style={{ position: "relative" }} ref={aboutRef}>
          <div
            className="avatar"
            onClick={() => setShowAbout(!showAbout)}
            title="About SDPCTI"
          >
            <Shield size={14} />
          </div>
          {showAbout && (
            <div className="about-popover">
              <div className="about-popover-header">
                <Shield size={18} style={{ color: "var(--accent)" }} />
                <div>
                  <p className="about-popover-name">sdp<span style={{ color: "var(--accent)" }}>cti</span></p>
                  <p className="about-popover-version">v2.3</p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setShowAbout(false)}
                  style={{ marginLeft: "auto" }}
                >
                  <X size={12} />
                </button>
              </div>
              <div className="about-popover-body">
                <p className="about-popover-desc">Security Data Processing & Cyber Threat Intelligence Platform</p>
                <div className="about-popover-row">
                  <span className="about-popover-label">Stack</span>
                  <span className="about-popover-value">React 19 + Express + SQLite</span>
                </div>
                <div className="about-popover-row">
                  <span className="about-popover-label">Backend</span>
                  <span className="about-popover-value">localhost:5001</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
