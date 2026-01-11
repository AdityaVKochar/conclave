import { betterAuth } from "better-auth";

export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, 
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
