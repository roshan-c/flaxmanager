# Bathroom Booking App: Implementation Plan (Supabase)

This document outlines the steps to integrate user accounts and push notifications into the bathroom booking app using Supabase.

## Phase 1: Supabase Setup & Core Authentication

1.  **Identify/Create Supabase Project (User Task):**
    *   User to provide an existing Supabase Project ID or create a new one via [app.supabase.com](https://app.supabase.com/).
    *   Once created/identified, user to provide the **Project ID**.

2.  **Obtain Supabase Credentials (Bot Task with User Input):**
    *   Bot to use the Project ID to fetch the API URL and `anon` key using MCP tools.

3.  **Install Supabase Client Library (Bot Task):**
    *   Bot to run `npm install @supabase/supabase-js`.

4.  **Initialize Supabase Client (Bot Task):**
    *   Bot to create `lib/supabaseClient.ts`.
    *   This file will initialize and export the Supabase client instance.
    *   It will use environment variables for Supabase URL and anon key.

5.  **Environment Variables Setup (User Task, Bot Guidance):**
    *   User to create/update `.env.local` in the project root.
    *   User to add:
        *   `NEXT_PUBLIC_SUPABASE_URL="[URL from Step 2]"`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY="[Anon Key from Step 2]"`
    *   Bot to guide the user on the exact values once retrieved.

6.  **Basic Authentication UI (Bot Task):**
    *   Bot to create basic React components for:
        *   Sign-up page/form (email/password).
        *   Sign-in page/form (email/password).
        *   Sign-out button.
        *   A component to display the current user's session status (e.g., in the navbar or a profile dropdown).

7.  **Client-Side Auth Logic (Bot Task):**
    *   Bot to integrate the Supabase client from `lib/supabaseClient.ts` with the UI components to handle:
        *   `supabase.auth.signUp()`
        *   `supabase.auth.signInWithPassword()`
        *   `supabase.auth.signOut()`
        *   Listening to authentication state changes with `supabase.auth.onAuthStateChange()` to update the UI dynamically.

8.  **Route Protection (Bot Task):**
    *   Bot to implement a mechanism to protect certain routes (e.g., the booking page, user profile page) so they are only accessible by authenticated users.
    *   This might involve a Higher-Order Component (HOC), context API, or middleware checking `supabase.auth.getSession()`.

9.  **Testing & Refinement (Collaborative):**
    *   Test sign-up, sign-in (valid/invalid credentials), sign-out.
    *   Verify session persistence (e.g., after page refresh).
    *   Confirm protected routes are inaccessible when logged out and accessible when logged in.

## Phase 2: Booking Functionality with Supabase Database

1.  **Define Database Schema (Collaborative Design, Bot Execution):**
    *   Design the `bookings` table. Suggested columns:
        *   `id` (uuid, primary key, auto-generated)
        *   `user_id` (uuid, foreign key referencing `auth.users(id)`)
        *   `start_time` (timestamp with time zone)
        *   `end_time` (timestamp with time zone)
        *   `created_at` (timestamp with time zone, default now())
    *   Bot to create this table using a Supabase migration (SQL DDL) via MCP tools, once the Project ID is available.

2.  **Row Level Security (RLS) Policies (Bot Task):**
    *   Bot to define and apply RLS policies for the `bookings` table:
        *   Users can see their own bookings.
        *   Users can create bookings for themselves.
        *   (Optional) Rules for viewing all bookings if an admin role is implemented.

3.  **Implement Booking CRUD Operations (Bot Task):**
    *   Bot to create functions (likely in a `lib/bookingService.ts` or similar) for:
        *   Creating new bookings (`supabase.from('bookings').insert(...)`).
        *   Reading bookings (listing available slots, fetching a user's own bookings).
        *   (Optional) Updating or deleting bookings.
    *   Integrate these functions into the application's UI.

4.  **UI for Booking Management (Bot Task):**
    *   Develop UI components to display time slots, allow users to select and book a slot, and view their existing bookings.

5.  **Testing & Refinement (Collaborative):**
    *   Test creating, viewing, and managing bookings.
    *   Verify RLS policies are correctly enforced (users can only see/manage their own data).

## Phase 3: Slack Notifications for Bookings (via Supabase Edge Functions)

1.  **Slack App & Incoming Webhook Setup (User Task):**
    *   User to create a Slack App in their workspace.
    *   User to enable "Incoming Webhooks" for the app.
    *   User to generate an Incoming Webhook URL for a specific channel (e.g., `#bathroom-status` or `#general`).
    *   User to provide this Webhook URL to the Bot.
        *   Webhook URL Provided: `https://hooks.slack.com/services/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`

2.  **Supabase Edge Function for Sending Slack Notifications (Bot Task):**
    *   Bot to create a Supabase Edge Function (e.g., `supabase/functions/slack-booking-notifier/index.ts`).
    *   This function will:
        *   Query the `bookings` table for upcoming slots (e.g., starting in the next 5-10 minutes).
        *   For each booking, retrieve the `user_id`. To identify the user, the function will query `auth.users` table using the `user_id` to get user's email or other identifiable information.
        *   Format a message (e.g., "Reminder: Bathroom booking for [User Email/Identifier] from [Start Time] to [End Time] is starting soon!").
        *   Make an HTTP POST request to the Slack Incoming Webhook URL (from Step 1) to send the message.

3.  **Triggering Mechanism for Notifications (Bot Task):**
    *   Bot to guide User on setting up a cron job using Supabase's dashboard scheduler (or `pg_cron`) to invoke the `slack-booking-notifier` Edge Function periodically (e.g., every 1 or 5 minutes).

4.  **Environment Variables/Secrets for Edge Function (User Task, Bot Guidance):**
    *   User to add the Slack Webhook URL as a secret in Supabase project settings (e.g., `SLACK_WEBHOOK_URL`). The Edge Function will use this secret.

5.  **Testing & Refinement (Collaborative):**
    *   Test that the Edge Function is triggered correctly by the cron job.
    *   Verify that booking queries are accurate.
    *   Confirm that Slack messages are formatted correctly and posted to the designated channel for relevant upcoming bookings.
    *   Ensure user information is displayed appropriately and respectfully in notifications.

---

This plan will be updated as we progress and if requirements change. 