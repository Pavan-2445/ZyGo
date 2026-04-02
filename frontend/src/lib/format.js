export function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
  if (amount == null) return 'INR 0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDateTime(value) {
  if (!value) return 'TBD'
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function relativeTime(value) {
  if (!value) return ''
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = new Date(value).getTime() - Date.now()
  const hours = Math.round(diff / (1000 * 60 * 60))
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour')
  return formatter.format(Math.round(hours / 24), 'day')
}

export function formatCountdown(value) {
  if (!value) return 'Schedule pending'

  const diff = new Date(value).getTime() - Date.now()
  if (diff <= 0) return 'Ride time reached'

  const totalMinutes = Math.floor(diff / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

export function isWithinHours(value, hours) {
  if (!value) return false
  const diff = new Date(value).getTime() - Date.now()
  return diff <= hours * 60 * 60 * 1000
}
