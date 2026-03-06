import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "API running" })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`[+] SERVER ACTIVE ON PORT ${PORT}`)
})