'use strict'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from './lib/utils'

// Format: { [key: string]: { label: string, color: string } }
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a ChartContainer.')
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children']
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'Chart'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme || item.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, item]) => {
            const themeColor = item.theme
              ? item.theme[Object.keys(item.theme)[0] ?? '']
              : undefined
            const color = themeColor || item.color
            return color
              ? `[data-chart=${id}] { --color-${key}: ${color}; }`
              : null
          })
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipValue = number | string | ReadonlyArray<number | string>
type TooltipItem = {
  name?: string | number
  dataKey?: string | number
  value?: TooltipValue
  color?: string
  payload?: Record<string, unknown> | undefined
}
type ChartTooltipContentBaseProps = {
  payload?: ReadonlyArray<TooltipItem>
  active?: boolean
  label?: unknown
  labelFormatter?: (
    label: unknown,
    payload: ReadonlyArray<TooltipItem>,
  ) => React.ReactNode
  labelClassName?: string
  formatter?: (
    value: TooltipValue | undefined,
    name: TooltipItem['name'] | undefined,
    item: TooltipItem,
    index: number,
    payload: ReadonlyArray<TooltipItem>,
  ) => React.ReactNode
  color?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentBaseProps &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: 'line' | 'dot' | 'dashed'
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      const safe = payload ?? []
      if (hideLabel || safe.length === 0) {
        return null
      }

      const item = safe[0]
      if (!item) {
        return null
      }
      const key = `${labelKey || item.dataKey || item.name || 'value'}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, safe)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    const safePayload = payload ?? []

    if (!active || !safePayload.length) {
      return null
    }

    const nestLabel = safePayload.length === 1 && indicator !== 'dot'

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {safePayload.map((item, index) => {
            // Get the name from payload if available, otherwise use item.name or dataKey
            const payloadObj = item.payload
            const payloadName =
              payloadObj &&
              typeof payloadObj === 'object' &&
              'name' in payloadObj
                ? (payloadObj as Record<string, unknown>).name
                : undefined
            const key = `${nameKey || payloadName || item.name || item.dataKey || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            // Use the CSS variable generated by ChartStyle, or fallback to config color or payload fill
            const indicatorColor =
              color ||
              (key ? `var(--color-${key})` : undefined) ||
              itemConfig?.color ||
              item.payload?.fill ||
              item.color

            return (
              <div
                key={String(item.dataKey ?? item.name ?? index)}
                className={cn(
                  'flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center',
                )}
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  !hideIndicator && (
                    <div
                      className={cn(
                        'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                        {
                          'h-2.5 w-2.5': indicator === 'dot',
                          'w-1': indicator === 'line',
                          'w-0 border-[1.5px] border-dashed bg-transparent':
                            indicator === 'dashed',
                          'my-0.5': nestLabel && indicator === 'dashed',
                        },
                      )}
                      style={
                        {
                          '--color-bg': indicatorColor,
                          '--color-border': indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )
                )}
                <div
                  className={cn(
                    'flex flex-1 justify-between leading-none',
                    nestLabel ? 'items-end' : 'items-center',
                  )}
                >
                  <div className="grid gap-1.5">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-muted-foreground">
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                  {item.value && (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {formatter
                        ? formatter(
                            item.value,
                            item.name,
                            item,
                            index,
                            safePayload,
                          )
                        : item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltip'

const ChartLegend = RechartsPrimitive.Legend

type LegendItem = {
  dataKey?: string | number
  color?: string
  value?: string
}

type ChartLegendContentBaseProps = Omit<
  RechartsPrimitive.LegendProps,
  'payload'
> & {
  payload?: ReadonlyArray<LegendItem>
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    ChartLegendContentBaseProps & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign, nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegend'

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadRecord = payload as Record<string, unknown>
  const payloadPayload =
    'payload' in payload &&
    typeof payloadRecord.payload === 'object' &&
    payloadRecord.payload !== null
      ? (payloadRecord.payload as Record<string, unknown>)
      : undefined

  let configLabelKey: string = key

  if (key in payloadRecord && typeof payloadRecord[key] === 'string') {
    configLabelKey = payloadRecord[key] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

// Re-export commonly used recharts components
export {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
