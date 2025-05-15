export interface User {
  id: string
  name: string
}

export interface Booking {
  id: string
  userId: string
  startTime: Date
  endTime: Date
  purpose: string
}
