import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import multer from "multer"
import { google } from "googleapis"
import { readFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname, extname } from "path"
import { fileURLToPath } from "url"
import { initDB, createContact, createProject, listContacts, listProjects, updateRequestStatus } from "./db.js"
import { readContent, writeContent } from "./contentStore.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Configuration
const PORT = process.env.PORT || 3008
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1_280ckhww2q9clZ5qp3Lh_E7MJXLPZliliWMFLMbtPQ"
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || join(__dirname, "toto-447418-6bc10d31cb53.json")

// Google Sheets (optional — fallback only)
let sheets = null

if (existsSync(CREDENTIALS_PATH)) {
    try {
        const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf-8"))
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        })
        sheets = google.sheets({ version: "v4", auth })
        console.log("✅ Google Sheets client ready")
    } catch (err) {
        console.warn("⚠️ Google Sheets auth failed, using SQLite only:", err.message)
    }
} else {
    console.warn("⚠️ No credentials file found at:", CREDENTIALS_PATH)
    console.warn("   Using SQLite only. Google Sheets fallback disabled.")
}

const app = express()
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : true }))
app.use(express.json({ limit: "1mb" }))
app.use("/uploads", express.static(join(__dirname, "uploads")))

const uploadDir = join(__dirname, "uploads")
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const safeName = file.originalname.replace(/[^a-z0-9.-]/gi, "-").toLowerCase()
            cb(null, `${Date.now()}-${safeName}`)
        },
    }),
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images are allowed"))
        cb(null, true)
    },
    limits: { fileSize: 6 * 1024 * 1024 },
})

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, error: "طلبات كثيرة جداً. حاول بعد 15 دقيقة." },
})

// Helper to append a row to a sheet (only if sheets is available)
async function appendRow(range, values) {
    if (!sheets) throw new Error("Google Sheets not configured")
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [values] },
        })
        return { success: true, data: response.data }
    } catch (error) {
        console.error("❌ Google Sheets error:", error.message)
        throw error
    }
}

// Helper to ensure sheet tab exists (only if sheets is available)
async function ensureSheetTab(sheetName, headers) {
    if (!sheets) return
    try {
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        })
        const sheetExists = spreadsheet.data.sheets.some(
            (sheet) => sheet.properties.title === sheetName
        )

        if (!sheetExists) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: { title: sheetName },
                            },
                        },
                    ],
                },
            })

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetName}!A1`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [headers] },
            })

            console.log(`✅ Created sheet tab: ${sheetName}`)
        }
    } catch (error) {
        console.error(`❌ Error ensuring sheet tab ${sheetName}:`, error.message)
    }
}

// ========== API Routes ==========

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.get("/api/content", (req, res) => {
    res.json({ success: true, content: readContent() })
})

app.put("/api/content", requireAdmin, (req, res) => {
    res.json({ success: true, content: writeContent(req.body?.content || req.body) })
})

app.post("/api/upload", requireAdmin, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No image uploaded" })
    res.json({
        success: true,
        file: {
            name: req.file.filename,
            url: `/uploads/${req.file.filename}`,
            absoluteUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
            extension: extname(req.file.filename),
        },
    })
})

app.get("/api/requests", requireAdmin, (req, res) => {
    const contacts = listContacts()
    const projects = listProjects()
    const requests = [...contacts, ...projects].sort((a, b) => Number(b.id) - Number(a.id))
    res.json({ success: true, requests, contacts, projects })
})

app.patch("/api/requests/:type/:id/status", requireAdmin, (req, res) => {
    const { type, id } = req.params
    const status = req.body?.status || "new"
    if (!["contact", "project"].includes(type)) {
        return res.status(400).json({ success: false, error: "Invalid request type" })
    }
    updateRequestStatus(type, id, status)
    res.json({ success: true })
})

// Contact form submission (from the contact section)
app.post("/api/contact", apiLimiter, async (req, res) => {
    try {
        const { name, email, phone, project } = req.body

        // Validate
        if (!name || !email || !project) {
            return res.status(400).json({
                success: false,
                error: "جميع الحقول مطلوبة",
            })
        }

        // Save to SQLite (primary)
        try {
            createContact({ name, email, phone, project })
            console.log(`✅ SQLite: contact saved: ${name} (${email})`)
        } catch (dbError) {
            console.error("❌ SQLite error:", dbError.message)
        }

        // Also save to Google Sheets (secondary / fallback)
        try {
            const timestamp = new Date().toLocaleString("ar-SA", {
                timeZone: "Asia/Riyadh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            const headers = ["Timestamp", "Name", "Email", "Phone", "Project Idea", "Source"]
            await ensureSheetTab("Contact", headers)
            await appendRow("Contact", [timestamp, name, email, phone || "-", project, "Website"])
            console.log(`✅ Google Sheets: contact saved: ${name} (${email})`)
        } catch (gsError) {
            console.error("⚠️ Google Sheets fallback error:", gsError.message)
        }

        res.json({
            success: true,
            message: "تم استلام طلبك. سنتواصل معك قريباً.",
        })
    } catch (error) {
        console.error("❌ /api/contact error:", error)
        res.status(500).json({
            success: false,
            error: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة لاحقاً.",
        })
    }
})

// Project form submission (from the project dialog)
app.post("/api/project", apiLimiter, async (req, res) => {
    try {
        const { name, email, phone, projectType, budget, timeline, goals } = req.body

        // Validate required fields
        if (!name || !email || !projectType || !goals) {
            return res.status(400).json({
                success: false,
                error: "يرجى ملء الحقول المطلوبة",
            })
        }

        // Save to SQLite (primary)
        try {
            createProject({ name, email, phone, projectType, budget, timeline, goals })
            console.log(`✅ SQLite: project saved: ${name} - ${projectType}`)
        } catch (dbError) {
            console.error("❌ SQLite error:", dbError.message)
        }

        // Also save to Google Sheets (secondary / fallback)
        try {
            const timestamp = new Date().toLocaleString("ar-SA", {
                timeZone: "Asia/Riyadh",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            const headers = [
                "Timestamp",
                "Name",
                "Email",
                "Phone",
                "Project Type",
                "Budget",
                "Timeline",
                "Goals",
                "Source",
            ]
            await ensureSheetTab("Projects", headers)
            await appendRow("Projects", [
                timestamp,
                name,
                email,
                phone || "-",
                projectType,
                budget || "-",
                timeline || "-",
                goals,
                "Website",
            ])
            console.log(`✅ Google Sheets: project saved: ${name} - ${projectType}`)
        } catch (gsError) {
            console.error("⚠️ Google Sheets fallback error:", gsError.message)
        }

        res.json({
            success: true,
            message: "تم حفظ المعلومات الأولية للمشروع.",
        })
    } catch (error) {
        console.error("❌ /api/project error:", error)
        res.status(500).json({
            success: false,
            error: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة لاحقاً.",
        })
    }
})

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════╗
║         SQLite + Google Sheets Server        ║
║──────────────────────────────────────────────║
║  Port:     http://localhost:${PORT}           ║
║  Health:   /api/health                       ║
║  Contact:  POST /api/contact                 ║
║  Project:  POST /api/project                 ║
║  Storage:  SQLite (primary) + Google Sheets  ║
╚══════════════════════════════════════════════╝
        `)
    })
}).catch((err) => {
    console.error("❌ Failed to initialize database:", err)
    process.exit(1)
})

function requireAdmin(req, res, next) {
    const token = process.env.ADMIN_TOKEN
    if (!token) return next()
    if (req.headers.authorization === `Bearer ${token}`) return next()
    return res.status(401).json({ success: false, error: "Unauthorized" })
}
