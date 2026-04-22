import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const macronutrientsBadgeVariants = cva('', {
  variants: {
    variant: {
      default: 'flex items-center gap-1.5',
      protein:
        'flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      carbs:
        'flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      fat: 'flex items-baseline gap-0.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
    size: {
      default: 'text-xs font-semibold tabular-nums',
      label: 'text-[10px] uppercase font-bold opacity-70',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export interface MacronutrientsBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof macronutrientsBadgeVariants> {
  value?: number | null
}

export function MacronutrientsBadge({
  value,
  variant,
  size,
  className,
  ...props
}: MacronutrientsBadgeProps) {
  if (value == null || value === 0) return null

  // Define os dados adicionais com base na variant
  let macroLabel = ''
  let title = ''

  if (variant === 'protein') {
    macroLabel = 'P'
    title = 'Proteínas'
  } else if (variant === 'carbs') {
    macroLabel = 'C'
    title = 'Carboidratos'
  } else if (variant === 'fat') {
    macroLabel = 'G'
    title = 'Gorduras'
  }

  return (
    <div
      className={cn(macronutrientsBadgeVariants({ variant, size, className }))}
      title={title}
      {...props}
    >
      <span>{value}g</span>
      {macroLabel && (
        <span
          // Mantém a distinção visual da letra quando o size é 'default'
          className={
            size === 'default'
              ? 'text-[10px] uppercase font-bold opacity-70'
              : ''
          }
        >
          {macroLabel}
        </span>
      )}
    </div>
  )
}
