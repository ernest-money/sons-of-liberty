import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
  label?: string
  placeholder?: string
  onTimestampChange?: (timestamp: number) => void
}

export function DateTimePicker({
  date,
  setDate,
  className,
  label = "Date and time",
  placeholder = "Pick a date and time",
  onTimestampChange,
}: DateTimePickerProps) {
  const [time, setTime] = React.useState<string>(
    date ? format(date, "HH:mm") : "00:00"
  )

  // Update the date when time changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)

    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setDate(newDate)
    }
  }

  // Update the time when date changes
  React.useEffect(() => {
    if (date) {
      setTime(format(date, "HH:mm"))
    }
  }, [date])

  // Convert date to Unix timestamp (seconds) and notify parent component
  React.useEffect(() => {
    if (date && onTimestampChange) {
      const timestamp = Math.floor(date.getTime() / 1000)
      onTimestampChange(timestamp)
    }
  }, [date, onTimestampChange])

  // Convert date to Unix timestamp (seconds)
  const getUnixTimestamp = (date: Date | undefined): number => {
    if (!date) return 0
    return Math.floor(date.getTime() / 1000)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label htmlFor="date-time-picker">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-time-picker"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            disabled={(date) => date < new Date()}
          />
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time-picker">Time</Label>
            </div>
            <Input
              id="time-picker"
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="mt-2"
            />
          </div>
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        value={getUnixTimestamp(date)}
        readOnly
      />
    </div>
  )
} 