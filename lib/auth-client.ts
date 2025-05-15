import { createAuthClient } from "better-auth/react"; // Or your specific framework e.g., better-auth/vue

// If your auth server is on a different domain or path, specify it here.
// Otherwise, if it's on the same domain and default path (/api/auth), you can omit baseURL.
const AUTH_SERVER_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL; // Example: http://localhost:3000 or your production URL

export const authClient = createAuthClient({
  ...(AUTH_SERVER_BASE_URL && { baseURL: AUTH_SERVER_BASE_URL }),
  // You can pass default fetchOptions or plugins here if needed
  // fetchOptions: {
  //   headers: { 'X-Custom-Header': 'value' },
  // },
  // plugins: [
  //   magicLinkClient() // Example if using magic link plugin
  // ]
});

// You can re-export hooks or utilities for easier access in your components
// export const useSession = authClient.useSession;
// export const useUser = authClient.useUser; 