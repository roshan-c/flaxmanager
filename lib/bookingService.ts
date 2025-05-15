import { supabase } from './supabaseClient';

export type Booking = {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  purpose: string;
};

export async function getUserBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }
  return (data || []) as Booking[];
}

export async function createBooking(start_time: string, end_time: string, purpose: string): Promise<Booking> {
  const { data, error } = await supabase.rpc('create_booking_with_overlap_check', {
    new_start_time: start_time,
    new_end_time: end_time,
    new_purpose: purpose,
  });

  if (error) {
    console.error("Error calling create_booking_with_overlap_check:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to create booking: No data returned from function.");
  }
  
  return data[0] as Booking;
}

export async function updateBooking(
  bookingId: string,
  start_time: string,
  end_time: string,
  purpose: string
): Promise<Booking> {
  const { data, error } = await supabase.rpc('update_booking_with_overlap_check', {
    booking_id_to_update: bookingId,
    new_start_time: start_time,
    new_end_time: end_time,
    new_purpose: purpose,
  });

  if (error) {
    console.error("Error calling update_booking_with_overlap_check:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to update booking: No data returned from function.");
  }
  
  return data[0] as Booking;
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    throw error;
  }
} 