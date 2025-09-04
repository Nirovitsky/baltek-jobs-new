"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxDate?: Date
  minDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  maxDate,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(() => {
    if (value) {
      // Handle both YYYY-MM-DD and DD.MM.YYYY formats
      if (value.includes('.')) {
        const [day, monthStr, year] = value.split('.')
        return new Date(parseInt(year), parseInt(monthStr) - 1, parseInt(day))
      } else if (value.includes('-')) {
        return new Date(value)
      }
    }
    return new Date()
  })

  // Parse the current value
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    
    try {
      // Handle DD.MM.YYYY format from API
      if (value.includes('.')) {
        const [day, monthStr, year] = value.split('.')
        return new Date(parseInt(year), parseInt(monthStr) - 1, parseInt(day))
      }
      // Handle YYYY-MM-DD format
      if (value.includes('-')) {
        return new Date(value)
      }
    } catch (error) {
      console.warn('Error parsing date:', value, error)
    }
    
    return undefined
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Convert to YYYY-MM-DD format for consistency
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
    setOpen(false)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(month)
    newDate.setFullYear(parseInt(year))
    setMonth(newDate)
  }

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(month)
    newDate.setMonth(parseInt(monthIndex))
    setMonth(newDate)
  }

  // Generate year options - for date of birth, we want a wide range
  const currentYear = new Date().getFullYear()
  const minYear = minDate ? minDate.getFullYear() : 1900
  const maxYear = maxDate ? maxDate.getFullYear() : currentYear
  
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  )

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-4 p-3">
          {/* Year and Month Selectors */}
          <div className="flex gap-2">
            <Select
              value={month.getMonth().toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={monthName} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={month.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            disabled={(date) =>
              (maxDate && date > maxDate) ||
              (minDate && date < minDate) ||
              disabled
            }
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}