export default function Skeleton({ width, height = "20px", borderRadius = "12px", style = {} }) {
    return (
        <div
            className="skeleton"
            style={{
                width: width ?? "100%",
                height,
                borderRadius,
                ...style,
            }}
            aria-hidden="true"
        />
    )
}
