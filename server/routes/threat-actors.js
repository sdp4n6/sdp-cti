import express from "express"
import { stmts } from "../db.js"

const router = express.Router()

// --- GET /api/threat-actors ---
router.get("/", (req, res) => {
  const rows = stmts.getAllThreatActors.all()
  res.json(rows)
})

// --- GET /api/threat-actors/:id ---
router.get("/:id", (req, res) => {
  const row = stmts.getThreatActorById.get(req.params.id)
  if (!row) return res.status(404).json({ error: "Threat actor not found" })
  res.json(row)
})

// --- POST /api/threat-actors ---
router.post("/", (req, res) => {
  const { name, aliases, origin, motivation, trackedBy, description, isCustom } = req.body
  if (!name) return res.status(400).json({ error: "name is required" })

  const now = new Date().toISOString()
  const result = stmts.insertThreatActor.run({
    name,
    aliases:     aliases    || "",
    origin:      origin     || "",
    motivation:  motivation || "",
    tracked_by:  trackedBy  || "",
    description: description || "",
    is_custom:   isCustom ? 1 : 0,
    created_at:  now,
    updated_at:  now,
  })

  const created = stmts.getThreatActorById.get(result.lastInsertRowid)
  res.status(201).json(created)
})

// --- PUT /api/threat-actors/:id ---
router.put("/:id", (req, res) => {
  const existing = stmts.getThreatActorById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Threat actor not found" })

  const { name, aliases, origin, motivation, trackedBy, description } = req.body
  stmts.updateThreatActor.run({
    id:          req.params.id,
    name:        name        ?? existing.name,
    aliases:     aliases     ?? existing.aliases,
    origin:      origin      ?? existing.origin,
    motivation:  motivation  ?? existing.motivation,
    tracked_by:  trackedBy   ?? existing.tracked_by,
    description: description ?? existing.description,
    updated_at:  new Date().toISOString(),
  })

  const updated = stmts.getThreatActorById.get(req.params.id)
  res.json(updated)
})

// --- DELETE /api/threat-actors/:id ---
router.delete("/:id", (req, res) => {
  const existing = stmts.getThreatActorById.get(req.params.id)
  if (!existing) return res.status(404).json({ error: "Threat actor not found" })
  stmts.deleteThreatActor.run(req.params.id)
  res.status(204).end()
})

// --- POST /api/threat-actors/seed ---
router.post("/seed", (req, res) => {
  const { actors } = req.body
  if (!Array.isArray(actors)) return res.status(400).json({ error: "actors must be an array" })

  const count = stmts.countThreatActors.get()
  if (count.count > 0) return res.json({ message: "Already seeded", count: count.count })

  const now = new Date().toISOString()
  let inserted = 0
  for (const a of actors) {
    try {
      stmts.insertThreatActor.run({
        name:        a.name,
        aliases:     a.aliases     || "",
        origin:      a.origin      || "",
        motivation:  a.motivation  || "",
        tracked_by:  a.trackedBy   || "",
        description: a.description || "",
        is_custom:   0,
        created_at:  now,
        updated_at:  now,
      })
      inserted++
    } catch (err) { /* skip duplicates */ }
  }
  res.status(201).json({ message: "Seeded", inserted })
})

export default router
