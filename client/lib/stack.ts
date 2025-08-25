import { StackServerApp, StackClientApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // works for client-side apps too
});

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || "c5c34c95-0b87-4abf-9d33-b6fc31fca7f3",
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_wt4bpbqw8ra8nvfere80xg7r0re024eg2kemhkmv8mqx0",
});
