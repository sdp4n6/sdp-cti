export const CSS_VARS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-base:      #080b10;
    --bg-surface:   #0d1117;
    --bg-panel:     #111820;
    --bg-hover:     #161f2c;
    --border:       rgba(255,255,255,0.06);
    --border-lit:   rgba(34,211,238,0.25);
    --accent:       #0891b2;
    --accent-dim:   rgba(34,211,238,0.10);
    --accent-glow:  rgba(34,211,238,0.06);
    --text-primary: #e2e8f0;
    --text-muted:   #b4c9bb;
    --text-dim:     #2d3748;
    --code-bg:      #0a0d14;
    --code-text:    #a5b4fc;
    --shadow-overlay: rgba(0,0,0,0.7);
    --shadow-lg:    rgba(0,0,0,0.5);
    --shadow-md:    rgba(0,0,0,0.3);
    --modal-border: rgba(255,255,255,0.1);
    --hover-border: rgba(255,255,255,0.12);
    --font-ui:      'DM Sans', sans-serif;
    --font-display: 'Syne', sans-serif;
    --font-mono:    'IBM Plex Mono', monospace;
    --radius:       6px;
    --transition:   0.18s ease;
  }
  [data-theme="light"] {
    --bg-base:      #f5f7fa;
    --bg-surface:   #ffffff;
    --bg-panel:     #f0f2f5;
    --bg-hover:     #e8eaed;
    --border:       rgba(0,0,0,0.10);
    --border-lit:   rgba(8,145,178,0.35);
    --accent:       #0891b2;
    --accent-dim:   rgba(8,145,178,0.10);
    --accent-glow:  rgba(8,145,178,0.06);
    --text-primary: #1a202c;
    --text-muted:   #5a6b73;
    --text-dim:     #cbd5e0;
    --code-bg:      #f1f3f5;
    --code-text:    #4338ca;
    --shadow-overlay: rgba(0,0,0,0.35);
    --shadow-lg:    rgba(0,0,0,0.15);
    --shadow-md:    rgba(0,0,0,0.08);
    --modal-border: rgba(0,0,0,0.12);
    --hover-border: rgba(0,0,0,0.15);
  }
  body { background: var(--bg-base); color: var(--text-primary); font-family: var(--font-ui); font-size: 13px; -webkit-font-smoothing: antialiased; }
  body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; opacity: 0.35; }
  [data-theme="light"] body::before { opacity: 0.08; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; } ::-webkit-scrollbar-thumb:hover { background: var(--text-dim); }
`

export const STATUS_CONFIG = {
  "Active":    { color: "#97CC04", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  "In Review": { color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.25)"  },
  "Closed":    { color: "#4a5568", bg: "rgba(74,85,104,0.1)",   border: "rgba(74,85,104,0.25)"   },
}

export const STATUSES = ["Active", "In Review", "Closed"]

export const IOC_TYPES        = ["IP", "Domain", "URL", "MD5", "SHA1", "SHA256", "Email", "Filename", "Registry", "Other"]
export const DETECTION_PLATFORMS = ["Splunk", "Sigma", "XSIAM/XQL", "CrowdStrike NG-SIEM", "Suricata", "YARA", "KQL", "Other"]
export const MITRE_TACTICS    = [
  "Reconnaissance", "Resource Development", "Initial Access", "Execution",
  "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access",
  "Discovery", "Lateral Movement", "Collection", "Command and Control",
  "Exfiltration", "Impact",
]

export const INV_TYPES  = ["Malware Analysis", "Threat Actor", "Campaign", "Vulnerability", "Incident Response", "Other"]
export const SEVERITIES = ["Critical", "High", "Medium", "Low"]

export const SEVERITY_CONFIG = {
  Critical: { color: "#ff0000", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)" },
  High:     { color: "#de5625", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.25)"  },
  Medium:   { color: "#facc15", bg: "rgba(250,204,21,0.1)",   border: "rgba(250,204,21,0.25)"  },
  Low:      { color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)"  },
}

export const NAV_ITEMS = [
  { icon: "Activity",      label: "Dashboard",     id: "dashboard" },
  { icon: "Folder",        label: "Investigations", id: "investigations" },
  { icon: "AlertTriangle", label: "Threat Actors",  id: "actors" },
  { icon: "Database",      label: "Malware",        id: "malware" },
  { icon: "Crosshair",     label: "IOCs",           id: "iocs" },
  { icon: "Radio",         label: "Detections",     id: "detections" },
]