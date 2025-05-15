"use client"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import type { Booking, User } from "@/lib/types"

interface BookingListProps {
  bookings: Booking[]
  users: User[]
  onDeleteBooking: (id: string) => void
}

export default function BookingList({ bookings, users, onDeleteBooking }: BookingListProps) {
  // Sort bookings by start time
  const sortedBookings = [...bookings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : "Unknown"
  }

  // Format purpose with first letter capitalized
  const formatPurpose = (purpose: string) => {
    return purpose.charAt(0).toUpperCase() + purpose.slice(1)
  }

  if (sortedBookings.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No bookings found</p>
  }

  return (
    <div className="space-y-3">
      {sortedBookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="space-y-1">
            <div className="font-medium">{getUserName(booking.userId)}</div>
            <div className="text-sm text-muted-foreground">
              {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
            </div>
            <div className="text-sm">{formatPurpose(booking.purpose)}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDeleteBooking(booking.id)} aria-label="Delete booking">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
