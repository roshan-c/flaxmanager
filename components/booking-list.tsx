"use client"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Trash2, Edit2 } from "lucide-react"
import type { Booking, User as LocalUser } from "@/lib/types"
import type { User as AuthUser } from "@supabase/supabase-js"

interface BookingListProps {
  bookings: Booking[]
  users: LocalUser[]
  currentAuthUser: AuthUser | null
  onDeleteBooking: (id: string) => void
  onEditBooking?: (booking: Booking) => void
}

export default function BookingList({ bookings, users, currentAuthUser, onDeleteBooking, onEditBooking }: BookingListProps) {
  // Sort bookings by start time
  const sortedBookings = [...bookings].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  // Get user display name by booking's userId
  const getUserDisplayName = (bookingUserId: string) => {
    if (currentAuthUser && currentAuthUser.id === bookingUserId) {
      return currentAuthUser.email || "My Booking"
    }
    const localUser = users.find((u) => u.id === bookingUserId)
    if (localUser) {
      return localUser.name
    }
    return "Unknown User"
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
            <div className="font-medium">{getUserDisplayName(booking.userId)}</div>
            <div className="text-sm text-muted-foreground">
              {format(booking.startTime, "h:mm a")} - {format(booking.endTime, "h:mm a")}
            </div>
            <div className="text-sm">{formatPurpose(booking.purpose)}</div>
          </div>
          {onEditBooking && (
            <Button variant="ghost" size="icon" onClick={() => onEditBooking(booking)} aria-label="Edit booking">
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDeleteBooking(booking.id)} aria-label="Delete booking">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
