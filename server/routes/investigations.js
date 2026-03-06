import express from "express"
import { db, stmts, deserializeInvestigation } from "../db.js"

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

export default router