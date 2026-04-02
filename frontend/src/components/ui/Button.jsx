import { classNames } from '../../lib/format'

export default function Button({ className, variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-slate-950 text-white hover:-translate-y-0.5 hover:shadow-soft',
    secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-slate-50',
    accent: 'bg-gradient-to-r from-coral to-orange-500 text-white hover:-translate-y-0.5 hover:shadow-soft',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:-translate-y-0.5 hover:shadow-soft',
  }

  return (
    <button
      className={classNames('inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60', styles[variant], className)}
      {...props}
    />
  )
}
