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

## Phase 3: Push Notifications (with Supabase Edge Functions & FCM)

1.  **Firebase Project Setup (User Task):**
    *   User to create a new project in the [Firebase console](https://console.firebase.google.com/).
    *   Add a Web app to the Firebase project.
    *   Note down the Firebase configuration object (apiKey, authDomain, projectId, etc.) and provide it to the Bot for client-side setup.
    *   Enable Firebase Cloud Messaging (FCM) API.
    *   Generate a private key file (JSON) for the Firebase Admin SDK (for server-side use in Edge Functions). User to securely store this as a Supabase Edge Function secret.

2.  **Install Firebase Client SDK (Bot Task):**
    *   Bot to run `npm install firebase`.

3.  **Frontend Logic for Push Permissions & Token Handling (Bot Task):**
    *   Bot to add client-side code (e.g., in a React component or a dedicated service `lib/notificationService.ts`):
        *   Initialize the Firebase app with credentials from User (Step 1).
        *   Request notification permission from the user.
        *   If permission is granted, retrieve the FCM registration token.
        *   Create a `fcm_tokens` table in Supabase (Bot Task, via migration): `id`, `user_id` (fk to `auth.users`), `token` (text, unique), `created_at`.
        *   Send the FCM token to a Supabase Edge Function or directly insert into the `fcm_tokens` table, associating it with the logged-in user.
    *   Bot to create a service worker file (e.g., `public/firebase-messaging-sw.js`) to handle incoming push messages when the app is in the background/closed.

4.  **Supabase Edge Function for Sending Notifications (Bot Task):**
    *   Bot to create a Supabase Edge Function (e.g., `supabase/functions/send-reminders/index.ts`).
    *   This function will:
        *   Initialize `firebase-admin` SDK using the service account key (stored as a Supabase secret).
        *   Query the `bookings` table for relevant upcoming slots.
        *   Query the `fcm_tokens` table for the tokens of the users to be notified.
        *   Construct and send push messages via FCM.

5.  **Triggering Mechanism for Notifications (Bot Task):**
    *   Bot to set up a cron job using Supabase's dashboard scheduler (or `pg_cron`) to invoke the `send-reminders` Edge Function periodically (e.g., every 5 minutes).
    *   Define logic for two types of reminders:
        *   "Your slot is starting soon."
        *   "Another user's slot is about to begin." (Requires knowing the *current* slot holder if applicable).

6.  **Environment Variables/Secrets for Edge Function (User Task, Bot Guidance):**
    *   User to add Firebase Admin SDK service account JSON as a secret in Supabase project settings for the Edge Function.

7.  **Testing & Refinement (Collaborative):**
    *   Test permission requests and token registration.
    *   Verify notifications are received correctly (foreground, background, app closed).
    *   Test the reminder logic for different scenarios.

---

This plan will be updated as we progress and if requirements change. 