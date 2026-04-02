export default function Input({ label, ...props }) {
  return (
    <label className="block">
      {label && <span className="field-label">{label}</span>}
      <input className="field-input" {...props} />
    </label>
  )
}
