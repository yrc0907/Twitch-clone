"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

// Re-export client-safe functions
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut; 