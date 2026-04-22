export function SimpleProgress({
  value,
  colorClass,
}: {
  value: number
  colorClass: string
}) {
  const safeValue = isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100)
  return (
    <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
