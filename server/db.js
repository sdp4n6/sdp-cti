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

  CREATE TABLE IF NOT EXISTS investigation_counters (
    year     TEXT PRIMARY KEY,
    last_seq INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_investigations_updated ON investigations(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_investigations_severity ON investigations(severity);
  CREATE INDEX IF NOT EXISTS idx_investigations_status   ON investigations(status);
  CREATE INDEX IF NOT EXISTS idx_investigations_type     ON investigations(type);

  -- Library tables (global catalogs)
  CREATE TABLE IF NOT EXISTS threat_actors_library (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    aliases     TEXT NOT NULL DEFAULT '',
    origin      TEXT NOT NULL DEFAULT '',
    motivation  TEXT NOT NULL DEFAULT '',
    tracked_by  TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_custom   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS malware_library (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    family      TEXT NOT NULL DEFAULT '',
    type        TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_custom   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS iocs_library (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL,
    value       TEXT NOT NULL,
    context     TEXT NOT NULL DEFAULT '',
    tlp         TEXT NOT NULL DEFAULT 'WHITE',
    source      TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS detections_library (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    platform    TEXT NOT NULL,
    title       TEXT NOT NULL,
    rule        TEXT NOT NULL DEFAULT '',
    notes       TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_threat_actors_name ON threat_actors_library(name);
  CREATE INDEX IF NOT EXISTS idx_malware_name ON malware_library(name);
  CREATE INDEX IF NOT EXISTS idx_iocs_value ON iocs_library(value);
  CREATE INDEX IF NOT EXISTS idx_detections_title ON detections_library(title);
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

  // Counters
  getCounter: db.prepare(`
    SELECT last_seq FROM investigation_counters WHERE year = ?
  `),

  upsertCounter: db.prepare(`
    INSERT INTO investigation_counters (year, last_seq) VALUES (?, 1)
    ON CONFLICT(year) DO UPDATE SET last_seq = last_seq + 1
    RETURNING last_seq
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
  // Threat Actors Library
  getAllThreatActors: db.prepare(`SELECT * FROM threat_actors_library ORDER BY name`),
  getThreatActorById: db.prepare(`SELECT * FROM threat_actors_library WHERE id = ?`),
  insertThreatActor: db.prepare(`
    INSERT INTO threat_actors_library (name, aliases, origin, motivation, tracked_by, description, is_custom, created_at, updated_at)
    VALUES (@name, @aliases, @origin, @motivation, @tracked_by, @description, @is_custom, @created_at, @updated_at)
  `),
  updateThreatActor: db.prepare(`
    UPDATE threat_actors_library SET name=@name, aliases=@aliases, origin=@origin, motivation=@motivation,
    tracked_by=@tracked_by, description=@description, updated_at=@updated_at WHERE id=@id
  `),
  deleteThreatActor: db.prepare(`DELETE FROM threat_actors_library WHERE id = ?`),
  countThreatActors: db.prepare(`SELECT COUNT(*) as count FROM threat_actors_library`),

  // Malware Library
  getAllMalware: db.prepare(`SELECT * FROM malware_library ORDER BY name`),
  getMalwareById: db.prepare(`SELECT * FROM malware_library WHERE id = ?`),
  insertMalware: db.prepare(`
    INSERT INTO malware_library (name, family, type, description, is_custom, created_at, updated_at)
    VALUES (@name, @family, @type, @description, @is_custom, @created_at, @updated_at)
  `),
  updateMalware: db.prepare(`
    UPDATE malware_library SET name=@name, family=@family, type=@type,
    description=@description, updated_at=@updated_at WHERE id=@id
  `),
  deleteMalware: db.prepare(`DELETE FROM malware_library WHERE id = ?`),
  countMalware: db.prepare(`SELECT COUNT(*) as count FROM malware_library`),

  // IOCs Library
  getAllIOCs: db.prepare(`SELECT * FROM iocs_library ORDER BY created_at DESC`),
  getIOCById: db.prepare(`SELECT * FROM iocs_library WHERE id = ?`),
  insertIOC: db.prepare(`
    INSERT INTO iocs_library (type, value, context, tlp, source, created_at, updated_at)
    VALUES (@type, @value, @context, @tlp, @source, @created_at, @updated_at)
  `),
  updateIOC: db.prepare(`
    UPDATE iocs_library SET type=@type, value=@value, context=@context,
    tlp=@tlp, source=@source, updated_at=@updated_at WHERE id=@id
  `),
  deleteIOC: db.prepare(`DELETE FROM iocs_library WHERE id = ?`),
  countIOCs: db.prepare(`SELECT COUNT(*) as count FROM iocs_library`),

  // Detections Library
  getAllDetections: db.prepare(`SELECT * FROM detections_library ORDER BY created_at DESC`),
  getDetectionById: db.prepare(`SELECT * FROM detections_library WHERE id = ?`),
  insertDetection: db.prepare(`
    INSERT INTO detections_library (platform, title, rule, notes, created_at, updated_at)
    VALUES (@platform, @title, @rule, @notes, @created_at, @updated_at)
  `),
  updateDetection: db.prepare(`
    UPDATE detections_library SET platform=@platform, title=@title, rule=@rule,
    notes=@notes, updated_at=@updated_at WHERE id=@id
  `),
  deleteDetection: db.prepare(`DELETE FROM detections_library WHERE id = ?`),
  countDetections: db.prepare(`SELECT COUNT(*) as count FROM detections_library`),
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

// -- ID generation --

function generateInvestigationId() {
  const year = new String(new Date().getFullYear()).toString()
  const row  = stmts.upsertCounter.get(year)
  const seq  = String(row.last_seq).padStart(4, "0")
  return `TRI-${year}-${seq}`
}

export { db, stmts, deserializeInvestigation, deserializeWorkspace, generateInvestigationId };