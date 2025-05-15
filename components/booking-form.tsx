"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { addHours } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import type { Booking, User } from "@/lib/types"

interface BookingFormProps {
  users: User[]
  selectedDate: Date
  onAddBooking: (booking: Booking) => boolean
}

export default function BookingForm({ users, selectedDate, onAddBooking }: BookingFormProps) {
  const [userId, setUserId] = useState<string>(users[0].id)
  const [hour, setHour] = useState<string>("07")
  const [minute, setMinute] = useState<string>("00")
  const [duration, setDuration] = useState<string>("30")
  const [purpose, setPurpose] = useState<string>("shower")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create start time by setting hours and minutes on the selected date
    const startTime = new Date(selectedDate)
    startTime.setHours(Number.parseInt(hour, 10))
    startTime.setMinutes(Number.parseInt(minute, 10))

    // Calculate end time based on duration
    const endTime = addHours(startTime, Number.parseInt(duration, 10) / 60)

    const newBooking: Booking = {
      id: uuidv4(),
      userId,
      startTime,
      endTime,
      purpose,
    }

    const success = onAddBooking(newBooking)
    if (success) {
      // Reset form
      setHour("07")
      setMinute("00")
      setDuration("30")
      setPurpose("shower")
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
        <Label htmlFor="user">Who are you?</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger id="user">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <input
          type="time"
          id="time"
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
        <Label htmlFor="duration">Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger id="duration">
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
        <Label htmlFor="purpose">Purpose</Label>
        <Select value={purpose} onValueChange={setPurpose}>
          <SelectTrigger id="purpose">
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

      <Button type="submit" className="w-full">
        Book Time Slot
      </Button>
    </form>
  )
}
