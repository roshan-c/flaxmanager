"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isBefore, isAfter, parseISO } from "date-fns"
import BookingForm from "@/components/booking-form"
import BookingList from "@/components/booking-list"
import type { Booking, User } from "@/lib/types"

const users: User[] = [
  { id: "1", name: "Roommate 1" },
  { id: "2", name: "Roommate 2" },
  { id: "3", name: "Roommate 3" },
]

export default function BathroomScheduler() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedUser, setSelectedUser] = useState<string>(users[0].id)

  // Load bookings from localStorage on component mount
  useEffect(() => {
    const savedBookings = localStorage.getItem("bathroomBookings")
    if (savedBookings) {
      try {
        // Parse dates from strings back to Date objects
        const parsedBookings = JSON.parse(savedBookings).map((booking: any) => ({
          ...booking,
          startTime: parseISO(booking.startTime),
          endTime: parseISO(booking.endTime),
        }))
        setBookings(parsedBookings)
      } catch (error) {
        console.error("Error loading bookings:", error)
      }
    }
  }, [])

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    // Convert Date objects to ISO strings for storage
    const bookingsToSave = bookings.map((booking) => ({
      ...booking,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    }))
    localStorage.setItem("bathroomBookings", JSON.stringify(bookingsToSave))
  }, [bookings])

  const handleAddBooking = (newBooking: Booking) => {
    // Check for overlapping bookings
    const isOverlapping = bookings.some(
      (booking) =>
        (isAfter(newBooking.startTime, booking.startTime) && isBefore(newBooking.startTime, booking.endTime)) ||
        (isAfter(newBooking.endTime, booking.startTime) && isBefore(newBooking.endTime, booking.endTime)) ||
        (isBefore(newBooking.startTime, booking.startTime) && isAfter(newBooking.endTime, booking.endTime)),
    )

    if (isOverlapping) {
      alert("This time slot overlaps with an existing booking!")
      return false
    }

    setBookings([...bookings, newBooking])
    return true
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(bookings.filter((booking) => booking.id !== bookingId))
  }

  // Filter bookings for the selected user
  const userBookings = bookings.filter((booking) => booking.userId === selectedUser)

  // Filter bookings for the selected date
  const dateBookings = bookings.filter(
    (booking) =>
      booking.startTime.getDate() === selectedDate.getDate() &&
      booking.startTime.getMonth() === selectedDate.getMonth() &&
      booking.startTime.getFullYear() === selectedDate.getFullYear(),
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Select a date to view or add bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Book Bathroom Time</CardTitle>
            <CardDescription>Schedule up to one hour</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm users={users} selectedDate={selectedDate} onAddBooking={handleAddBooking} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Bookings</CardTitle>
            <CardDescription>View and manage bathroom bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="date">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">By Date</TabsTrigger>
                <TabsTrigger value="user">By User</TabsTrigger>
              </TabsList>
              <TabsContent value="date" className="mt-4">
                <div className="mb-4">
                  <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                </div>
                <BookingList bookings={dateBookings} users={users} onDeleteBooking={handleDeleteBooking} />
              </TabsContent>
              <TabsContent value="user" className="mt-4">
                <div className="mb-4">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
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
                <BookingList bookings={userBookings} users={users} onDeleteBooking={handleDeleteBooking} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
