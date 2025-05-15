"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { addMinutes, format, differenceInMinutes } from "date-fns"
import type { Booking } from "@/lib/types"

interface EditBookingFormProps {
  bookingToEdit: Booking
  onSaveBooking: (updatedBooking: Partial<Booking>) => Promise<boolean>
  onCancel: () => void
}

export default function EditBookingForm({ bookingToEdit, onSaveBooking, onCancel }: EditBookingFormProps) {
  const [hour, setHour] = useState<string>("00")
  const [minute, setMinute] = useState<string>("00")
  const [duration, setDuration] = useState<string>("30") // duration in minutes
  const [purpose, setPurpose] = useState<string>("")

  useEffect(() => {
    if (bookingToEdit) {
      const startDate = new Date(bookingToEdit.startTime)
      const endDate = new Date(bookingToEdit.endTime)

      setHour(format(startDate, "HH"))
      setMinute(format(startDate, "mm"))
      
      const diffMins = differenceInMinutes(endDate, startDate)
      setDuration(String(diffMins))
      
      setPurpose(bookingToEdit.purpose || "")
    }
  }, [bookingToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const originalStartDate = new Date(bookingToEdit.startTime)
    
    // Create new start time, preserving the original date, only updating hour and minute
    const newStartTime = new Date(originalStartDate)
    newStartTime.setHours(Number.parseInt(hour, 10))
    newStartTime.setMinutes(Number.parseInt(minute, 10))
    newStartTime.setSeconds(0)
    newStartTime.setMilliseconds(0)

    // Calculate new end time based on new start time and duration
    const newEndTime = addMinutes(newStartTime, Number.parseInt(duration, 10))

    const updatedBookingData: Partial<Booking> = {
      id: bookingToEdit.id,
      startTime: newStartTime,
      endTime: newEndTime,
      purpose,
    }

    const success = await onSaveBooking(updatedBookingData)
    if (success) {
      // Form will be closed by parent component
    }
  }

  const durations = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
  ]

  const purposes = [
    { value: "shower", label: "Shower" },
    { value: "bath", label: "Bath" },
    { value: "toilet", label: "Toilet" },
    { value: "other", label: "Other" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-time">Time</Label>
        <input
          type="time"
          id="edit-time"
          value={`${hour}:${minute}`}
          onChange={(e) => {
            const [newHour, newMinute] = e.target.value.split(":")
            setHour(newHour)
            setMinute(newMinute)
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-duration">Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger id="edit-duration">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {durations.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-purpose">Purpose</Label>
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger id="edit-purpose">
            <SelectValue placeholder="Select purpose" />
          </SelectTrigger>
          <SelectContent>
            {purposes.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  )
} 