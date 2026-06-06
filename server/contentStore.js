import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, "data")
const CONTENT_PATH = join(DATA_DIR, "site-content.json")

const initialContent = {
    ar: {
        hero: {},
        servicesSection: {},
        showcaseSection: {},
        showcaseCards: [],
        contactSection: {},
    },
    en: {
        hero: {},
        servicesSection: {},
        showcaseSection: {},
        showcaseCards: [],
        contactSection: {},
    },
}

function ensureContentFile() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    if (!existsSync(CONTENT_PATH)) {
        writeFileSync(CONTENT_PATH, JSON.stringify(initialContent, null, 2), "utf-8")
    }
}

export function readContent() {
    ensureContentFile()
    try {
        return JSON.parse(readFileSync(CONTENT_PATH, "utf-8"))
    } catch {
        return initialContent
    }
}

export function writeContent(content) {
    ensureContentFile()
    const nextContent = {
        ar: { ...initialContent.ar, ...(content?.ar || {}) },
        en: { ...initialContent.en, ...(content?.en || {}) },
    }
    writeFileSync(CONTENT_PATH, JSON.stringify(nextContent, null, 2), "utf-8")
    return nextContent
}
