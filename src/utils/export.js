// ─── Helpers ──────────────────────────────────────────────────────────────────

function download(filename, content, mime = "text/plain") {
    const blob = new Blob([content], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60)
}

// ─── Single investigation export ──────────────────────────────────────────────

export function exportMarkdown(title, markdown) {
    const filename = `${slugify(title)}.md`
    download(filename, markdown, "text/markdown")
}

export function exportInvestigationJSON(investigation, workspace) {
    const payload = {
        exportedAt: new Date().toISOString(),
        version:    "1.0",
        investigation,
        workspace:  workspace || {},
    }
    const filename = `${investigation.id}-${slugify(investigation.title)}.json`
    download(filename, JSON.stringify(payload, null, 2), "application/json")
}

// ─── Bulk export ──────────────────────────────────────────────────────────────
// workspaces must be pre-fetched from the API by the caller and passed in as
// an array ordered to match investigations[]. No localStorage access here.

export function exportAllJSON(investigations, workspaces = []) {
    const payload = {
        exportedAt:     new Date().toISOString(),
        version:        "1.0",
        count:          investigations.length,
        investigations: investigations.map((inv, i) => ({
        investigation: inv,
        workspace:     workspaces[i] || {},
        })),
    }
    const date     = new Date().toISOString().slice(0, 10)
    const filename = `sdpcti-export-${date}.json`
    download(filename, JSON.stringify(payload, null, 2), "application/json")
}