# Bathroom Booking App

A Next.js application that allows users to book a shared bathroom and receive Slack notifications for upcoming bookings.

## Features

*   User Authentication (Sign-up, Sign-in, Sign-out)
*   Bathroom Slot Booking
*   Automated Slack Reminders for upcoming bookings (approx. 10 minutes before start time)
*   Protected Routes for authenticated users

## Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Edge Functions)
*   **Notifications:** Slack (via Incoming Webhooks)
*   **Styling:** shadcn/ui (potentially, or Tailwind CSS directly)

## Getting Started

### Prerequisites

*   Node.js (version recommended by Next.js, e.g., v18 or later)
*   npm, yarn, or pnpm
*   Supabase Account
*   Slack Workspace and permissions to create an app with Incoming Webhooks
*   Supabase CLI (for managing Edge Functions and local development if needed)

### 1. Clone the Repository

```bash
git clone https://github.com/roshan-c/flaxmanager
cd flaxmanager
```

### 2. Install Dependencies

```bash
npm install --legacy-use-deps
# or
yarn install
# or
pnpm install
```

### 3. Supabase Setup

1.  **Create a Supabase Project:** Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Database Schema:**
    *   The application requires a `bookings` table. Key columns include:
        *   `id` (uuid, primary key)
        *   `user_id` (uuid, foreign key to `auth.users(id)`)
        *   `start_time` (timestamptz)
        *   `end_time` (timestamptz)
        *   `created_at` (timestamptz, default now())
        *   `reminder_sent` (boolean, default false)
    *   Ensure appropriate Row Level Security (RLS) policies are set up for this table (e.g., users can only manage their own bookings, authenticated users can create bookings).
3.  **Slack Notification Edge Function:**
    *   Create an Edge Function in your Supabase project named `slack-booking-notifier`. The code for this function is in `supabase/functions/slack-booking-notifier/index.ts`.
    *   **Environment Variables/Secrets for the Edge Function:**
        *   `APP_SUPABASE_URL`: Your Supabase project URL.
        *   `APP_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase project's service role key.
        *   `SLACK_WEBHOOK_URL`: The Incoming Webhook URL from your Slack app.
    *   Deploy the function using the Supabase CLI:
        ```bash
        supabase functions deploy slack-booking-notifier --no-verify-jwt
        ```
        (You might need to run `supabase login` and `supabase link --project-ref YOUR_PROJECT_REF` first).
4.  **Cron Job for Notifications:**
    *   Enable the `pg_cron` and `pg_net` extensions in your Supabase project (Database > Extensions).
    *   Schedule a cron job to invoke the `slack-booking-notifier` function. Example for every 5 minutes:
        ```sql
        SELECT cron.schedule(
            'invoke-slack-notifier-v2',
            '*/5 * * * *', 
            $$
            SELECT net.http_post(
                url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/slack-booking-notifier',
                headers:='{"Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
                body:='{}'::jsonb
            );
            $$
        );
        ```
        Replace `YOUR_PROJECT_REF` and `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual values.

### 4. Environment Variables (Client-side)

Create a `.env.local` file in the root of your project and add your Supabase client credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in your Supabase project settings under "API".

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is ready to be deployed to platforms like Vercel, Netlify, or any other Next.js hosting provider.
Ensure your production environment variables (for Supabase client and any other production-specific settings) are configured on your hosting platform.

## Learn More (Next.js Default Info)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!