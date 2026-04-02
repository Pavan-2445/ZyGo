export default function EmptyState({ title, description }) {
  return (
    <div className="glass-panel border-dashed p-10 text-center">
      <h3 className="font-display text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}
