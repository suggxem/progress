export function mergeContent(base, override) {
    if (Array.isArray(base)) {
        if (!Array.isArray(override) || override.length === 0) return base
        return base.map((item, index) => mergeContent(item, override[index] || {}))
    }

    if (!isPlainObject(base)) {
        return override === undefined || override === null || override === "" ? base : override
    }

    const merged = { ...base }
    if (!isPlainObject(override)) return merged

    for (const [key, value] of Object.entries(override)) {
        if (value === undefined || value === null || value === "") continue
        merged[key] = mergeContent(base[key], value)
    }
    return merged
}

function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
}
