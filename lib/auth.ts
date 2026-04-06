import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { expo } from "@better-auth/expo";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  /**
   * Trusted origins inclui:
   * - localhost (desenvolvimento web)
   * - vigidocapp:// (scheme do app mobile Expo)
   */
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? [
        ...process.env.TRUSTED_ORIGINS.split(","),
        "http://localhost:3000",
        "http://192.168.0.6:3000",
        "http://192.168.0.6:8081",
        "vigidocapp://",
      ]
    : [
        "http://localhost:3000",
        "http://192.168.0.6:3000",
        "http://192.168.0.6:8081",
        "vigidocapp://",
      ],
  plugins: [
    expo(), // Suporte ao @better-auth/expo client (mobile)
  ],
  advanced: {
    trustedProxyHeaders: true,
    cookiePrefix: "vigidoc",
  },
});
