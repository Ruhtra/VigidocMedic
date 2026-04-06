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
      // [NEW] Status de aprovação para o fluxo de Request Access
      status: {
        type: "string",
        defaultValue: "PENDING",
      },
      // [NEW] Token de notificações push para o Expo
      expoPushToken: {
        type: "string",
        required: false,
      },
      // [NEW] Campos de gamificação e atividade
      currentStreak: {
        type: "number",
        defaultValue: 0,
      },
      lastActiveAt: {
        type: "number", // Mapeado para DateTime via timestamp
        required: false,
        defaultValue: Date.now(),
      },
    },
  },
  /**
   * Hooks de Banco de Dados: Executados após operações do Prisma
   */
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Quando um novo usuário é criado com role 'user', 
          // garantimos que ele tenha um PatientProfile inicial.
          // Nota: Campos específicos como CPF devem ser preenchidos no step 2 do registro.
          if (user.role === "user") {
            await prisma.patientProfile.create({
              data: {
                userId: user.id,
                // O CPF e nascimento podem ser nulos inicialmente ou 
                // atualizados via endpoint de perfil logo após o cadastro.
                cpf: "", 
              },
            });
          }
        },
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
