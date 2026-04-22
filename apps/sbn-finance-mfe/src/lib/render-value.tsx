import { formatCurrency } from './utils'

export function renderValue(
  val: number | undefined,
  loading: boolean,
  type: 'currency' | 'text' = 'currency',
  skeletonWidth = 'w-24',
) {
  if (loading || val === undefined) {
    return (
      <div className={`h-6 ${skeletonWidth} bg-muted animate-pulse rounded`} />
    )
  }
  return (
    <span className={type === 'currency' ? 'tabular-nums' : ''}>
      {type === 'currency' ? formatCurrency(val) : val}
    </span>
  )
}
