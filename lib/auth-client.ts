import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth"; // Verifique se o caminho para o seu arquivo auth.ts está correto

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    // Isso vai ler automaticamente o seu objeto 'user.additionalFields' do servidor
    // e injetar os tipos no signUp, signIn e na sessão.
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
