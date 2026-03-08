import express from "express"
import { db, stmts, deserializeInvestigation, generateInvestigationId } from "../db.js"

const router = express.Router()

// --- GET /api/investigations ---
router.get("/", (req, res) => {
    const rows = stmts.getAllInvestigations.all()
    res.json(rows.map(deserializeInvestigation))
})

// --- GET /api/investigations/:id ---
router.get("/:id", (req, res) => {
    const rows = stmts.getInvestigationById.get(req.params.id)
    if (!rows) return res.status(404).json({ error: "Investigation not found" })
    res.json(deserializeInvestigation(row))
})

// --- POST /api/investigations ---
router.post("/", (req, res) => {
    const { title, type, severity, status, description, tags, createdAt, updatedAt } = req.body
    if (!title) {
        return res.status(400).json({ error: "title is required" })
    }

    const id  = generateInvestigationId()
    const now = new Date().toISOString()
    stmts.insertInvestigation.run({
        id,
        title,
        type:        type        || "Other",
        severity:    severity    || "Medium",
        status:      status      || "Active",
        description: description || "",
        tags:        JSON.stringify(Array.isArray(tags) ? tags : []),
        created_at:  createdAt   || now,
        updated_at:  updatedAt   || now,
    })
    const created = stmts.getInvestigationById.get(id)

    res.status(201).json(deserializeInvestigation(created))
})

// --- PUT /api/investigations/:id ---
router.put("/:id", (req, res) => {
    const existing = stmts.getInvestigationById.get(req.params.id)
    if (!existing) return res.status(404).json({ error: "Investigation not found" });

    const { title, type, severity, status, description, tags } = req.body

    stmts.updateInvestigation.run({
        id:          req.params.id,
        title:       title       ?? existing.title,
        type:        type        ?? existing.type,
        severity:    severity    ?? existing.severity,
        status:      status      ?? existing.status,
        description: description ?? existing.description,
        tags:        JSON.stringify(Array.isArray(tags) ? tags : JSON.parse(existing.tags || "[]")),
        updated_at:  new Date().toISOString(),
    });

    const updated = stmts.getInvestigationById.get(req.params.id)
    res.json(deserializeInvestigation(updated))
})

// --- DELETE /api/investigations/:id ---
router.delete("/:id", (req, res) => {
    const existing = stmts.getInvestigationById.get(req.params.id)
    if (!existing) return res.status(404).json({ error: "Investigation not found" })

    stmts.deleteInvestigation.run(req.params.id)
    res.status(204).end()
})

// --- POST /api/investigations/bulk ---
router.post("/bulk", (req, res) => {
  const { investigations } = req.body

  if (!Array.isArray(investigations)) {
    return res.status(400).json({ error: "investigations must be an array" })
  }

  const now     = new Date().toISOString()
  const results = { created: 0, updated: 0, errors: [] }

  const runBulk = db.transaction((items) => {
    for (const inv of items) {
      if (!inv.id || !inv.title) {
        results.errors.push("Skipped entry — missing id or title")
        continue
      }
      try {
        const existing = stmts.getInvestigationById.get(inv.id)
        if (existing) {
          stmts.updateInvestigation.run({
            id:          inv.id,
            title:       inv.title,
            type:        inv.type        || existing.type,
            severity:    inv.severity    || existing.severity,
            status:      inv.status      || existing.status,
            description: inv.description ?? existing.description,
            tags:        JSON.stringify(Array.isArray(inv.tags) ? inv.tags : JSON.parse(existing.tags || "[]")),
            updated_at:  now,
          })
          results.updated++;
        } else {
          stmts.insertInvestigation.run({
            id:          inv.id,
            title:       inv.title,
            type:        inv.type        || "Other",
            severity:    inv.severity    || "Medium",
            status:      inv.status      || "Active",
            description: inv.description || "",
            tags:        JSON.stringify(Array.isArray(inv.tags) ? inv.tags : []),
            created_at:  inv.createdAt   || now,
            updated_at:  inv.updatedAt   || now,
          })
          results.created++
        }
      } catch (err) {
        results.errors.push(`${inv.id}: ${err.message}`)
      }
    }
  });

  runBulk(investigations)
  res.status(207).json(results)
})


export default router