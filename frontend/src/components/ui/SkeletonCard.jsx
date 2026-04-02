export default function SkeletonCard() {
  return (
    <div className="glass-panel animate-pulse space-y-4 p-6">
      <div className="h-4 w-24 rounded-full bg-slate-200" />
      <div className="h-6 w-2/3 rounded-full bg-slate-200" />
      <div className="h-20 rounded-3xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 rounded-full bg-slate-200" />
        <div className="h-4 rounded-full bg-slate-200" />
      </div>
    </div>
  )
}
