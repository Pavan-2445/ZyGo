const statusMap = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-cyan-100 text-cyan-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELLED: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-slate-200 text-slate-700',
}

export default function StatusBadge({ status }) {
  return <span className={`status-pill ${statusMap[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}
