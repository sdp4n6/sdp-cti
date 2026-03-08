import express from "express"
import { stmts } from "../db.js"

const router = express.Router()

// --- GET /api/detections ---
router.get("/", (req, res) => {
  const rows = stmts.getAllDetections.all()
  res.json(rows)
})

// --- GET /api/detections/:id ---
router.get("/:id", (req, res) => {
  const row = stmts.getDetectionById.get(req.params.id)
  if (!row) return res.status(404).json({ error: "Detection not found" })
  res.json(row)
})

// --- POST /api/detections ---
router.post("/", (req, res) => {
  const { platform, title, rule, notes } = req.body
  if (!title) return res.status(400).json({ error: "title is required" })

  const now = new Date().toISOString()
  const result = stmts.insertDetection.run({
    platform: platform || "Other",
    title,
    rule:  rule  || "",
    notes: notes || "",
    created_at: now,
    updated_at: now,
  })

  const created = stmts.getDetectionById.get(result.lastInsertRowid)
  res.status(201).json(created)
})

// --- PUT /api/detections/:id ---
router.put("/:id", (req, res) => {
  const existing = stmts.getDetectionById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Detection not found" })

  const { platform, title, rule, notes } = req.body
  stmts.updateDetection.run({
    id:         req.params.id,
    platform:   platform ?? existing.platform,
    title:      title    ?? existing.title,
    rule:       rule     ?? existing.rule,
    notes:      notes    ?? existing.notes,
    updated_at: new Date().toISOString(),
  })

  const updated = stmts.getDetectionById.get(req.params.id)
  res.json(updated)
})

// --- DELETE /api/detections/:id ---
router.delete("/:id", (req, res) => {
  const existing = stmts.getDetectionById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Detection not found" })
  stmts.deleteDetection.run(req.params.id)
  res.status(204).end()
})

export default router
