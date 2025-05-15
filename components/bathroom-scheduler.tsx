"use client"

import { useState, useEffect } from "react"
import type { User as AuthUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isBefore, isAfter } from "date-fns"
import BookingForm from "@/components/booking-form"
import BookingList from "@/components/booking-list"
import type { Booking, User } from "@/lib/types"
import { getUserBookings, createBooking, updateBooking, deleteBooking } from "@/lib/bookingService"
import EditBookingForm from "@/components/edit-booking-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const localUsers: User[] = [
  { id: "1", name: "Roommate 1" },
  { id: "2", name: "Roommate 2" },
  { id: "3", name: "Roommate 3" },
]

export default function BathroomScheduler() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedUserForFilter, setSelectedUserForFilter] = useState<string>(localUsers[0].id)
  const [currentAuthUser, setCurrentAuthUser] = useState<AuthUser | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentAuthUser(user)
    }
    fetchCurrentUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentAuthUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    async function fetchBookings() {
      try {
        const svcBookings = await getUserBookings()
        const uiBookings = svcBookings.map((b) => ({
          id: b.id,
          userId: b.user_id,
          startTime: new Date(b.start_time),
          endTime: new Date(b.end_time),
          purpose: b.purpose,
        }))
        setBookings(uiBookings)
      } catch (err) {
        console.error("Error fetching bookings:", err)
      }
    }
    fetchBookings()
  }, [])

  const handleAddBooking = async (newBooking: Booking): Promise<boolean> => {
    const isOverlapping = bookings.some(
      (booking) =>
        (isAfter(newBooking.startTime, booking.startTime) && isBefore(newBooking.startTime, booking.endTime)) ||
        (isAfter(newBooking.endTime, booking.startTime) && isBefore(newBooking.endTime, booking.endTime)) ||
        (isBefore(newBooking.startTime, booking.startTime) && isAfter(newBooking.endTime, booking.endTime)) ||
        (newBooking.startTime.getTime() === booking.startTime.getTime()) ||
        (newBooking.endTime.getTime() === booking.endTime.getTime())
    )

    if (isOverlapping) {
      alert("This time slot overlaps with an existing booking or is invalid!")
      return false
    }

    try {
      const created = await createBooking(
        newBooking.startTime.toISOString(),
        newBooking.endTime.toISOString(),
        newBooking.purpose
      )
      setBookings([
        ...bookings,
        {
          id: created.id,
          userId: created.user_id,
          startTime: new Date(created.start_time),
          endTime: new Date(created.end_time),
          purpose: created.purpose,
        },
      ])
      return true
    } catch (err) {
      console.error("Error creating booking:", err)
      alert("Error creating booking")
      return false
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId)
      setBookings(bookings.filter((booking) => booking.id !== bookingId))
    } catch (err) {
      console.error("Error deleting booking:", err)
      alert("Error deleting booking")
    }
  }

  const handleOpenEditDialog = (booking: Booking) => {
    setEditingBooking(booking)
    setIsEditDialogOpen(true)
  }

  const handleSaveEditedBooking = async (updatedBookingData: Partial<Booking>): Promise<boolean> => {
    if (!editingBooking || !updatedBookingData.startTime || !updatedBookingData.endTime) {
        alert("Error: Missing booking data for update.")
        return false
    }

    const otherBookings = bookings.filter(b => b.id !== editingBooking.id);
    const isOverlapping = otherBookings.some(
      (booking) =>
        (isAfter(updatedBookingData.startTime!, booking.startTime) && isBefore(updatedBookingData.startTime!, booking.endTime)) ||
        (isAfter(updatedBookingData.endTime!, booking.startTime) && isBefore(updatedBookingData.endTime!, booking.endTime)) ||
        (isBefore(updatedBookingData.startTime!, booking.startTime) && isAfter(updatedBookingData.endTime!, booking.endTime)) ||
        (updatedBookingData.startTime!.getTime() === booking.startTime.getTime()) ||
        (updatedBookingData.endTime!.getTime() === booking.endTime.getTime())
    );

    if (isOverlapping) {
      alert("The new time slot overlaps with an existing booking or is invalid!");
      return false;
    }

    try {
      const updated = await updateBooking(
        editingBooking.id,
        updatedBookingData.startTime.toISOString(),
        updatedBookingData.endTime.toISOString(),
        updatedBookingData.purpose || ""
      )
      setBookings(
        bookings.map((b) =>
          b.id === updated.id
            ? {
                id: updated.id,
                userId: updated.user_id,
                startTime: new Date(updated.start_time),
                endTime: new Date(updated.end_time),
                purpose: updated.purpose,
              }
            : b
        )
      )
      setIsEditDialogOpen(false)
      setEditingBooking(null)
      return true
    } catch (err) {
      console.error("Error updating booking:", err)
      alert("Error updating booking")
      return false
    }
  }

  const userBookings = bookings.filter((booking) => booking.userId === selectedUserForFilter)

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
            <BookingForm users={localUsers} selectedDate={selectedDate} onAddBooking={handleAddBooking} />
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
                <BookingList
                  bookings={dateBookings}
                  users={localUsers}
                  currentAuthUser={currentAuthUser}
                  onDeleteBooking={handleDeleteBooking}
                  onEditBooking={handleOpenEditDialog}
                />
              </TabsContent>
              <TabsContent value="user" className="mt-4">
                <div className="mb-4">
                  <Select value={selectedUserForFilter} onValueChange={setSelectedUserForFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {localUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BookingList
                  bookings={userBookings}
                  users={localUsers}
                  currentAuthUser={currentAuthUser}
                  onDeleteBooking={handleDeleteBooking}
                  onEditBooking={handleOpenEditDialog}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {editingBooking && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
            </DialogHeader>
            <EditBookingForm
              bookingToEdit={editingBooking}
              onSaveBooking={handleSaveEditedBooking}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingBooking(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
