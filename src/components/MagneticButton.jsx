import useMagnetic from "../hooks/useMagnetic"

export default function MagneticButton({ children, className, onClick, type = "button", disabled = false, style = {} }) {
    const magRef = useMagnetic()
    return (
        <button ref={magRef} type={type} className={className} onClick={onClick} disabled={disabled} style={style}>
            {children}
        </button>
    )
}
