"use client"

import { useQuery } from "@tanstack/react-query"

import { listCitiesForCountry, listCountries } from "@/lib/api/geo"
import { FormField } from "@/components/form-field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CountryCityFieldsProps {
  country: string
  city: string
  onCountryChange: (value: string) => void
  onCityChange: (value: string) => void
  inputClassName?: string
  triggerClassName?: string
}

export function CountryCityFields({
  country,
  city,
  onCountryChange,
  onCityChange,
  inputClassName,
  triggerClassName,
}: CountryCityFieldsProps) {
  const countriesQuery = useQuery({
    queryKey: ["geo-countries"],
    queryFn: listCountries,
    staleTime: Infinity,
    retry: 1,
  })

  const citiesQuery = useQuery({
    queryKey: ["geo-cities", country],
    queryFn: () => listCitiesForCountry(country),
    enabled: Boolean(country) && !countriesQuery.isError,
    staleTime: Infinity,
    retry: 1,
  })

  // Graceful fallback to free text if the public geo API is unreachable.
  if (countriesQuery.isError) {
    return (
      <>
        <FormField label="País" htmlFor="country">
          <Input
            id="country"
            value={country}
            onChange={(event) => onCountryChange(event.target.value)}
            className={inputClassName}
          />
        </FormField>
        <FormField label="Ciudad" htmlFor="city">
          <Input
            id="city"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className={inputClassName}
          />
        </FormField>
      </>
    )
  }

  return (
    <>
      <FormField label="País" htmlFor="country">
        <Select
          value={country}
          onValueChange={(value) => {
            onCountryChange(value)
            onCityChange("")
          }}
        >
          <SelectTrigger id="country" className={cn(triggerClassName)}>
            <SelectValue placeholder={countriesQuery.isLoading ? "Cargando..." : "Selecciona un país"} />
          </SelectTrigger>
          <SelectContent>
            {countriesQuery.data?.map((item) => (
              <SelectItem key={item.iso2} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Ciudad" htmlFor="city">
        {citiesQuery.isError ? (
          <Input
            id="city"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className={inputClassName}
          />
        ) : (
          <Select value={city} onValueChange={onCityChange} disabled={!country}>
            <SelectTrigger id="city" className={cn(triggerClassName)}>
              <SelectValue
                placeholder={
                  !country
                    ? "Selecciona un país primero"
                    : citiesQuery.isLoading
                      ? "Cargando..."
                      : "Selecciona una ciudad"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {citiesQuery.data?.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>
    </>
  )
}
