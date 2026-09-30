"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export const CURRENCY_SYMBOLS: Record<string, string> = {
  COP: "$",
  USD: "US$",
  EUR: "€",
}

function formatDisplay(rawValue: string): string {
  if (!rawValue) return ""
  const [intPart, decPart] = rawValue.split(".")
  const formattedInt = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt
}

function parseInput(displayValue: string): string {
  return displayValue
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "")
}

interface CurrencyInputProps {
  id?: string
  value: string
  onChange: (rawValue: string) => void
  currency: string
  placeholder?: string
  className?: string
}

export function CurrencyInput({ id, value, onChange, currency, placeholder, className }: CurrencyInputProps) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        {symbol}
      </span>
      <Input
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        value={formatDisplay(value)}
        onChange={(event) => onChange(parseInput(event.target.value))}
        className={cn("pl-8", className)}
      />
    </div>
  )
}
