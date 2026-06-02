import initSqlJs from "sql.js"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "data")
const DB_PATH = join(DATA_DIR, "requests.db")

let db = null

export async function initDB() {
    const SQL = await initSqlJs()
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    if (existsSync(DB_PATH)) {
        const buffer = readFileSync(DB_PATH)
        db = new SQL.Database(buffer)
    } else {
        db = new SQL.Database()
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            project TEXT,
            source TEXT DEFAULT 'website',
            status TEXT DEFAULT 'new'
        )
    `)

    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            project_type TEXT,
            budget TEXT,
            timeline TEXT,
            goals TEXT,
            source TEXT DEFAULT 'website',
            status TEXT DEFAULT 'new'
        )
    `)

    ensureColumn("contacts", "phone", "TEXT")
    ensureColumn("projects", "phone", "TEXT")

    saveDB()
    console.log(`✅ SQLite database ready at: ${DB_PATH}`)
    return db
}

function saveDB() {
    if (db) {
        const data = db.export()
        writeFileSync(DB_PATH, Buffer.from(data))
    }
}

export function createContact({ name, email, phone, project, source = "website" }) {
    const stmt = db.prepare("INSERT INTO contacts (name, email, phone, project, source) VALUES (?, ?, ?, ?, ?)")
    stmt.run([name, email, phone || null, project || null, source])
    stmt.free()
    saveDB()
    return getLastInsertId("contacts")
}

export function createProject({ name, email, phone, projectType, budget, timeline, goals, source = "website" }) {
    const stmt = db.prepare(
        "INSERT INTO projects (name, email, phone, project_type, budget, timeline, goals, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    stmt.run([name, email, phone || null, projectType, budget || null, timeline || null, goals, source])
    stmt.free()
    saveDB()
    return getLastInsertId("projects")
}

export function listContacts() {
    return listRows("contacts", `
        SELECT id, created_at, name, email, phone, project, source, status
        FROM contacts
        ORDER BY id DESC
    `)
}

export function listProjects() {
    return listRows("projects", `
        SELECT id, created_at, name, email, phone, project_type, budget, timeline, goals, source, status
        FROM projects
        ORDER BY id DESC
    `)
}

export function updateRequestStatus(type, id, status) {
    const table = type === "project" ? "projects" : "contacts"
    const stmt = db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`)
    stmt.run([status, Number(id)])
    stmt.free()
    saveDB()
    return true
}

function listRows(label, query) {
    const stmt = db.prepare(query)
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows.map((row) => {
        const type = label === "projects" ? "project" : "contact"
        return {
            ...row,
            type,
            createdAt: row.created_at,
            title: type === "project" ? (row.project_type || "Project request") : "Contact request",
            details: type === "project" ? row.goals : row.project,
        }
    })
}

function ensureColumn(table, column, definition) {
    try {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    } catch (error) {
        if (!String(error?.message || "").includes("duplicate column name")) {
            throw error
        }
    }
}

function getLastInsertId(table) {
    const stmt = db.prepare(`SELECT MAX(id) as id FROM ${table}`)
    stmt.step()
    const row = stmt.getAsObject()
    stmt.free()
    return row.id
}
