import { useEffect, useRef, useState } from 'react'
import { Input } from '@repo/ui'

interface MoneyInputProps {
  id?: string
  name?: string
  disabled?: boolean
  'aria-label'?: string
  placeholder?: string
  defaultValue?: number
  onChange?: (value: number) => void
  className?: string
}

export function MoneyInput({
  id,
  name,
  disabled,
  'aria-label': ariaLabel,
  placeholder,
  defaultValue,
  onChange,
  className,
}: MoneyInputProps) {
  const [centavos, setCentavos] = useState<number>(() => {
    if (defaultValue !== undefined && defaultValue > 0) {
      return Math.round(defaultValue * 100)
    }
    return 0
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultValue !== undefined) {
      setCentavos(Math.round(defaultValue * 100))
    }
  }, [defaultValue])

  const formatDisplay = (cents: number): string => {
    if (cents === 0) return ''
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const digit = parseInt(e.key, 10)
      const next = centavos * 10 + digit
      if (next > 99999999999) return
      setCentavos(next)
      onChange?.(next / 100)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      const next = Math.floor(centavos / 10)
      setCentavos(next)
      onChange?.(next / 100)
    }
  }

  const handleChange = () => {}

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      disabled={disabled}
      aria-label={ariaLabel}
      placeholder={centavos === 0 ? (placeholder ?? '0,00') : undefined}
      value={formatDisplay(centavos)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputMode="numeric"
      autoComplete="off"
      className={className}
    />
  )
}

