export function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

    const status  = err.status || 500
    const message = err.expose ? err.message : "Internal server error"

    res.status(status).json({ error: message })
}

export function notFound(req, res) {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.path}`
    })
}