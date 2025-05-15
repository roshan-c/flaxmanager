import { betterAuth } from "better-auth";
import { Pool } from "pg"; // Assuming PostgreSQL, change if using a different DB

// TODO: Replace with your actual database connection string
const DATABASE_URL = process.env.DATABASE_URL || "YOUR_DATABASE_CONNECTION_STRING";

if (DATABASE_URL === "YOUR_DATABASE_CONNECTION_STRING") {
  console.warn(
    "WARNING: Default DATABASE_URL is being used for BetterAuth. Please set your DATABASE_URL environment variable."
  );
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    // You can add more email/password options here if needed
    // e.g., passwordReset: true, emailVerification: true
  },
  // Add other providers or plugins as needed
  // plugins: [
  //   organization(),
  //   twoFactor(),
  // ]
});

// You might want to export types or other utilities from here as well
// export type { Session, User } from "better-auth"; 