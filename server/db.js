import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, "data")
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, "sdpcti.db"))

db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

// --- SCHEMA ---

db.exec(`
  CREATE TABLE IF NOT EXISTS investigations (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'Other',
    severity    TEXT NOT NULL DEFAULT 'Medium',
    status      TEXT NOT NULL DEFAULT 'Active',
    description TEXT NOT NULL DEFAULT '',
    tags        TEXT NOT NULL DEFAULT '[]',   -- JSON array string
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    investigation_id TEXT PRIMARY KEY REFERENCES investigations(id) ON DELETE CASCADE,
    notes            TEXT NOT NULL DEFAULT '',
    sources          TEXT NOT NULL DEFAULT '[]',
    malware          TEXT NOT NULL DEFAULT '[]',
    actors           TEXT NOT NULL DEFAULT '[]',
    ttps             TEXT NOT NULL DEFAULT '[]',
    iocs             TEXT NOT NULL DEFAULT '[]',
    detections       TEXT NOT NULL DEFAULT '[]',
    updated_at       TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_investigations_updated ON investigations(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_investigations_severity ON investigations(severity);
  CREATE INDEX IF NOT EXISTS idx_investigations_status   ON investigations(status);
  CREATE INDEX IF NOT EXISTS idx_investigations_type     ON investigations(type);
`)

// -- Prepared Statements --

const stmts = {
  // Investigations
  getAllInvestigations: db.prepare(`
    SELECT * FROM investigations ORDER BY updated_at DESC
  `),

  getInvestigationById: db.prepare(`
    SELECT * FROM investigations WHERE id = ?
  `),

  insertInvestigation: db.prepare(`
    INSERT INTO investigations (id, title, type, severity, status, description, tags, created_at, updated_at)
    VALUES (@id, @title, @type, @severity, @status, @description, @tags, @created_at, @updated_at)
  `),

  updateInvestigation: db.prepare(`
    UPDATE investigations
    SET title=@title, type=@type, severity=@severity, status=@status,
        description=@description, tags=@tags, updated_at=@updated_at
    WHERE id=@id
  `),

  deleteInvestigation: db.prepare(`
    DELETE FROM investigations WHERE id = ?
  `),

  // Workspaces
  getWorkspace: db.prepare(`
    SELECT * FROM workspaces WHERE investigation_id = ?
  `),

  upsertWorkspace: db.prepare(`
    INSERT INTO workspaces (investigation_id, notes, sources, malware, actors, ttps, iocs, detections, updated_at)
    VALUES (@investigation_id, @notes, @sources, @malware, @actors, @ttps, @iocs, @detections, @updated_at)
    ON CONFLICT(investigation_id) DO UPDATE SET
      notes=excluded.notes,
      sources=excluded.sources,
      malware=excluded.malware,
      actors=excluded.actors,
      ttps=excluded.ttps,
      iocs=excluded.iocs,
      detections=excluded.detections,
      updated_at=excluded.updated_at
  `),
}

// -- Serialisation helpers --

function deserializeInvestigation(row) {
  if (!row) return null;
  return {
    id:          row.id,
    title:       row.title,
    type:        row.type,
    severity:    row.severity,
    status:      row.status,
    description: row.description,
    tags:        JSON.parse(row.tags || "[]"),
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function deserializeWorkspace(row) {
  if (!row) return null;
  return {
    notes:      row.notes      || "",
    sources:    JSON.parse(row.sources    || "[]"),
    malware:    JSON.parse(row.malware    || "[]"),
    actors:     JSON.parse(row.actors     || "[]"),
    ttps:       JSON.parse(row.ttps       || "[]"),
    iocs:       JSON.parse(row.iocs       || "[]"),
    detections: JSON.parse(row.detections || "[]"),
    updatedAt:  row.updated_at,
  };
}

export { db, stmts, deserializeInvestigation, deserializeWorkspace };