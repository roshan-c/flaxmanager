import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface Booking {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  reminder_sent?: boolean; // Added for checking, though not strictly needed for selection if not selecting it
}

interface User {
  id: string;
  email?: string;
  // Add other user fields if needed, e.g., raw_user_meta_data for names
}

const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");

async function sendReminderAndUpdateDb(supabaseClient: SupabaseClient, booking: Booking) {
  let userIdentifier = `User ID: ${booking.user_id}`; // Fallback identifier

  const { data: userData, error: userError } = await supabaseClient
    .from("users")
    .select("id, email, raw_user_meta_data")
    .eq("id", booking.user_id)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    console.error(`Error fetching user ${booking.user_id}:`, userError);
  } else if (userData) {
    const user = userData as User;
    userIdentifier = user.email || `User ID: ${user.id}`;
    console.log(`User details for ${booking.user_id}: ${JSON.stringify(user)}`);
  } else {
    console.log(`No specific user data found for user ${booking.user_id} in 'users' table. Using User ID.`);
  }

  const startTime = new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const messageText = `🚽 Reminder: Bathroom booking for *${userIdentifier}* from *${startTime}* to *${endTime}* is starting in ~10 minutes.`;
  
  const slackPayload = {
    text: messageText,
  };

  console.log(`Sending Slack notification for booking ${booking.id}: ${messageText}`);

  const slackResponse = await fetch(SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(slackPayload),
  });

  if (!slackResponse.ok) {
    const errorBody = await slackResponse.text();
    console.error(
      `Error sending Slack notification for booking ${booking.id}: ${slackResponse.status} ${slackResponse.statusText}`,
      errorBody
    );
    // Do not update reminder_sent if Slack send failed
    return false;
  } else {
    console.log(`Slack notification sent successfully for booking ${booking.id}`);
    // Update the booking to mark reminder as sent
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ reminder_sent: true })
      .eq("id", booking.id);

    if (updateError) {
      console.error(`Error updating reminder_sent for booking ${booking.id}:`, updateError);
      // Even if update fails, the Slack message was sent. Log error and continue.
      // Depending on desired behavior, you might want to handle this differently.
      return true; // Slack message was sent
    } else {
      console.log(`Successfully marked reminder_sent for booking ${booking.id}`);
      return true;
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SLACK_WEBHOOK_URL) {
    console.error("SLACK_WEBHOOK_URL is not set in environment variables.");
    return new Response("SLACK_WEBHOOK_URL not configured", { status: 500 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("APP_SUPABASE_URL") ?? "",
      Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${Deno.env.get("APP_SUPABASE_SERVICE_ROLE_KEY")}` } } }
    );

    const now = new Date();
    // Send reminder if booking is starting in the next 10 minutes (but hasn't started yet)
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    console.log(`Checking for bookings starting before ${tenMinutesFromNow.toISOString()} and after ${now.toISOString()}, with reminder_sent = false.`);

    const { data: bookings, error: bookingsError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("reminder_sent", false)
      .lte("start_time", tenMinutesFromNow.toISOString()) // Start time is less than or equal to 10 mins from now
      .gt("start_time", now.toISOString()) // Start time is still in the future
      .order("start_time", { ascending: true });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      throw bookingsError;
    }

    if (!bookings || bookings.length === 0) {
      console.log("No upcoming bookings found needing a reminder.");
      return new Response("No upcoming bookings needing a reminder", { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Found ${bookings.length} upcoming bookings needing a reminder.`);
    let remindersSentCount = 0;

    for (const booking of bookings as Booking[]) {
      if (await sendReminderAndUpdateDb(supabaseClient, booking)) {
        remindersSentCount++;
      }
    }

    return new Response(JSON.stringify({ message: "Processed booking reminders.", bookingsFound: bookings.length, remindersSent: remindersSentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 