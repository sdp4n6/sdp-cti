import express from "express"
import helmet from "helmet"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
dotenv.config()

// --- Import Routes ---
import investigationsRouter from "./routes/investigations.js"
import workspaceRouter  from "./routes/workspaces.js"
import { errorHandler, notFound } from "./middleware/errorHandler.js"

const app = express()
const PORT = process.env.PORT || 5001

// --- MIDDLEWARE ---
app.use(helmet())
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(morgan("dev"))
app.use(express.json({ limit: "10mb" }))

// --- HEALTH CHECK API ---
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok", 
        version: "1.0.0",
        time:    new Date().toISOString(),
        message: "API running" })
})

// --- ROUTES ---
app.use("/api/investigations", investigationsRouter)
app.use("/api/investigations/:id/workspace", workspaceRouter)

// --- Error handling ---
app.use(notFound)
app.use(errorHandler)

// --- START --- 
app.listen(PORT, () => {
    console.log(`[+] NODE API  →  http://localhost:${PORT}/api`)
    console.log(`[+] Health    →  http://localhost:${PORT}/api/health\n`)
})

export default app