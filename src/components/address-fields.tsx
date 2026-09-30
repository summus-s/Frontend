"use client"

import { useEffect, useState } from "react"

import { FormField } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STREET_TYPES = [
  "Calle",
  "Carrera",
  "Avenida",
  "Avenida Calle",
  "Avenida Carrera",
  "Diagonal",
  "Transversal",
  "Circular",
  "Kilómetro",
  "Manzana",
  "Vereda",
] as const

const STREET_TYPE_PATTERN = new RegExp(
  `^(${STREET_TYPES.join("|")})\\s+([^,]+?)\\s*,?\\s*(.*)$`,
  "i",
)

function parseExistingAddress(address: string) {
  const match = address.trim().match(STREET_TYPE_PATTERN)

  if (!match) {
    return { streetType: STREET_TYPES[0], streetNumber: "", complement: address };
  }

  const streetType =
    STREET_TYPES.find((type) => type.toLowerCase() === match[1].toLowerCase()) ??
    STREET_TYPES[0]

  return { streetType, streetNumber: match[2] ?? "", complement: match[3] ?? "" };
}

function composeAddress(streetType: string, streetNumber: string, complement: string) {
  if (!streetNumber.trim()) return complement.trim()
  const base = `${streetType} ${streetNumber.trim()}`
  return complement.trim() ? `${base}, ${complement.trim()}` : base
}

interface AddressFieldsProps {
  value: string
  onChange: (composedAddress: string) => void
  inputClassName?: string
  triggerClassName?: string
}

export function AddressFields({ value, onChange, inputClassName, triggerClassName }: AddressFieldsProps) {
  const [streetType, setStreetType] = useState<string>(() => parseExistingAddress(value).streetType)
  const [streetNumber, setStreetNumber] = useState(() => parseExistingAddress(value).streetNumber)
  const [complement, setComplement] = useState(() => parseExistingAddress(value).complement)

  useEffect(() => {
    onChange(composeAddress(streetType, streetNumber, complement))
    // Only recompose when the structured pieces change, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetType, streetNumber, complement])

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
      <FormField label="Tipo de vía" htmlFor="streetType">
        <Select value={streetType} onValueChange={setStreetType}>
          <SelectTrigger id="streetType" className={triggerClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STREET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Número" htmlFor="streetNumber">
        <Input
          id="streetNumber"
          placeholder="10 # 20-30"
          value={streetNumber}
          onChange={(event) => setStreetNumber(event.target.value)}
          className={inputClassName}
        />
      </FormField>

      <FormField label="Complemento (opcional)" htmlFor="complement" className="col-span-2 sm:col-span-1">
        <Input
          id="complement"
          placeholder="Oficina, torre, barrio..."
          value={complement}
          onChange={(event) => setComplement(event.target.value)}
          className={inputClassName}
        />
      </FormField>
    </div>
  )
}
