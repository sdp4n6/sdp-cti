import express from "express"
import { stmts } from "../db.js"

const router = express.Router()

// --- GET /api/iocs ---
router.get("/", (req, res) => {
  const rows = stmts.getAllIOCs.all()
  res.json(rows)
})

// --- GET /api/iocs/:id ---
router.get("/:id", (req, res) => {
  const row = stmts.getIOCById.get(req.params.id)
  if (!row) return res.status(404).json({ error: "IOC not found" })
  res.json(row)
})

// --- POST /api/iocs ---
router.post("/", (req, res) => {
  const { type, value, context, tlp, source } = req.body
  if (!type || !value) return res.status(400).json({ error: "type and value are required" })

  const now = new Date().toISOString()
  const result = stmts.insertIOC.run({
    type,
    value,
    context: context || "",
    tlp:     tlp     || "WHITE",
    source:  source  || "",
    created_at: now,
    updated_at: now,
  })

  const created = stmts.getIOCById.get(result.lastInsertRowid)
  res.status(201).json(created)
})

// --- PUT /api/iocs/:id ---
router.put("/:id", (req, res) => {
  const existing = stmts.getIOCById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "IOC not found" })

  const { type, value, context, tlp, source } = req.body
  stmts.updateIOC.run({
    id:         req.params.id,
    type:       type    ?? existing.type,
    value:      value   ?? existing.value,
    context:    context ?? existing.context,
    tlp:        tlp     ?? existing.tlp,
    source:     source  ?? existing.source,
    updated_at: new Date().toISOString(),
  })

  const updated = stmts.getIOCById.get(req.params.id)
  res.json(updated)
})

// --- DELETE /api/iocs/:id ---
router.delete("/:id", (req, res) => {
  const existing = stmts.getIOCById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "IOC not found" })
  stmts.deleteIOC.run(req.params.id)
  res.status(204).end()
})

export default router
