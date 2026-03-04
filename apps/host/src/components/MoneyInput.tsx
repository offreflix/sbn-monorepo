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

/**
 * MoneyInput — campo monetário estilo Nubank.
 * Cada dígito digitado é inserido na casa dos centavos (da direita para a esquerda).
 * Ex: digitar "5" → "0,05" → "0" → "0,50" → "0" → "5,00"
 */
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
  // Estado interno em centavos (inteiro)
  const [centavos, setCentavos] = useState<number>(() => {
    if (defaultValue !== undefined && defaultValue > 0) {
      return Math.round(defaultValue * 100)
    }
    return 0
  })

  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza defaultValue quando ele muda externamente
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
      // Limita a 999.999.999,99 (evita overflow)
      if (next > 99999999999) return
      setCentavos(next)
      onChange?.(next / 100)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      const next = Math.floor(centavos / 10)
      setCentavos(next)
      onChange?.(next / 100)
    }
    // Ignora qualquer outra tecla
  }

  // Previne que o usuário cole texto diretamente
  const handleChange = () => {
    // Controlado pelo keyDown — não precisa de lógica aqui
  }

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
