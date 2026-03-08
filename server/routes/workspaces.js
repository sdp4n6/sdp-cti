import express from "express"
import { db, stmts, deserializeWorkspace } from "../db.js"
const router = express.Router({ mergeParams: true })
// ---- // 

// --- GET /api/investigations/:id/workspace ---
router.get("/", (req, res) => {
    const inv = stmts.getInvestigationById.get(req.params.id)
    if (!inv) return res.status(404).json({ error: "Investigation not found" })

    const ws = stmts.getWorkspace.get(req.params.id)

    if (!ws) {
        return res.json({
        notes:      "",
        sources:    [],
        malware:    [],
        actors:     [],
        ttps:       [],
        iocs:       [],
        detections: [],
        updatedAt:  null,
        })
    }

    res.json(deserializeWorkspace(ws))
})

// --- PUT /api/investigations/:id/workspace ---
router.put("/", (req, res) => {
    const inv = stmts.getInvestigationById.get(req.params.id)
    if (!inv) return res.status(404).json({ error: "Investigation not found" })

    const body = req.body
    const now  = new Date().toISOString()

    const payload = {
        investigation_id: req.params.id,
        notes:      typeof body.notes === "string" ? body.notes : "",
        sources:    JSON.stringify(Array.isArray(body.sources)    ? body.sources    : []),
        malware:    JSON.stringify(Array.isArray(body.malware)    ? body.malware    : []),
        actors:     JSON.stringify(Array.isArray(body.actors)     ? body.actors     : []),
        ttps:       JSON.stringify(Array.isArray(body.ttps)       ? body.ttps       : []),
        iocs:       JSON.stringify(Array.isArray(body.iocs)       ? body.iocs       : []),
        detections: JSON.stringify(Array.isArray(body.detections) ? body.detections : []),
        updated_at: now,
    }

    stmts.upsertWorkspace.run(payload)

    stmts.updateInvestigation.run({
        id:          req.params.id,
        title:       inv.title,
        type:        inv.type,
        severity:    inv.severity,
        status:      inv.status,
        description: inv.description,
        tags:        inv.tags,   // raw string from DB row — safe to pass as-is
        updated_at:  now,
    })

    const saved = stmts.getWorkspace.get(req.params.id)
    res.json(deserializeWorkspace(saved))
})

// --- PATCH /api/investigations/:id/workspace ---
router.patch("/", (req, res) => {
    const inv = stmts.getInvestigationById.get(req.params.id)
    if (!inv) return res.status(404).json({ error: "Investigation not found" })

    const existing = stmts.getWorkspace.get(req.params.id)
    const body     = req.body
    const now      = new Date().toISOString()

    const base = existing
    ? {
        notes:      existing.notes,
        sources:    existing.sources,
        malware:    existing.malware,
        actors:     existing.actors,
        ttps:       existing.ttps,
        iocs:       existing.iocs,
        detections: existing.detections,
      }
    : {
        notes: "", sources: "[]", malware: "[]",
        actors: "[]", ttps: "[]", iocs: "[]", detections: "[]",
    }

    const payload = {
        investigation_id: req.params.id,
        notes:      typeof body.notes === "string"   ? body.notes                      : base.notes,
        sources:    Array.isArray(body.sources)       ? JSON.stringify(body.sources)    : base.sources,
        malware:    Array.isArray(body.malware)       ? JSON.stringify(body.malware)    : base.malware,
        actors:     Array.isArray(body.actors)        ? JSON.stringify(body.actors)     : base.actors,
        ttps:       Array.isArray(body.ttps)          ? JSON.stringify(body.ttps)       : base.ttps,
        iocs:       Array.isArray(body.iocs)          ? JSON.stringify(body.iocs)       : base.iocs,
        detections: Array.isArray(body.detections)    ? JSON.stringify(body.detections) : base.detections,
        updated_at: now,
    }

    stmts.upsertWorkspace.run(payload)

    stmts.updateInvestigation.run({
        id:          req.params.id,
        title:       inv.title,
        type:        inv.type,
        severity:    inv.severity,
        status:      inv.status,
        description: inv.description,
        tags:        inv.tags,   // raw string from DB row
        updated_at:  now,
    })

    const saved = stmts.getWorkspace.get(req.params.id)
    res.json(deserializeWorkspace(saved))
})

// ---- // 
export default router