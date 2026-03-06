import express from "express"
// import database

const router = express.Router()

// --- GET /api/investigations ---
router.get("/", (req, res) => {
    res.json({
        message: "Investigation Route Working"
    })
})

export default router