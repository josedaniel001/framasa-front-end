"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiselectOption {
  value: string
  label: string
  description?: string
}

interface MultiselectProps {
  options: MultiselectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  maxDisplay?: number
}

export function Multiselect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  disabled = false,
  loading = false,
  className,
  maxDisplay = 2,
}: MultiselectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOptions = options.filter((option) => value.includes(option.value))

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange(newValue)
  }

  const handleRemove = (optionValue: string) => {
    onValueChange(value.filter((v) => v !== optionValue))
  }

  const displayText = selectedOptions.length === 0
    ? placeholder
    : selectedOptions.length <= maxDisplay
    ? selectedOptions.map((opt) => opt.label).join(", ")
    : `${selectedOptions.slice(0, maxDisplay).map((opt) => opt.label).join(", ")} +${selectedOptions.length - maxDisplay} más`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal min-h-10 h-auto", className)}
          disabled={disabled || loading}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
                selectedOptions.length <= maxDisplay ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 h-6"
                  >
                    {option.label}
                    <span
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 cursor-pointer inline-flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(option.value)
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Remover ${option.label}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleRemove(option.value)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-sm">{displayText}</span>
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
