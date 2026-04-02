import { classNames } from '../../lib/format'

export default function Card({ className, children }) {
  return <div className={classNames('glass-panel p-6', className)}>{children}</div>
}
