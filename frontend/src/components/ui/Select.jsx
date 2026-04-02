export default function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <select className="field-input" {...props}>
        {children}
      </select>
    </label>
  )
}
