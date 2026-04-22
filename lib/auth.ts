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
    expiresIn: 60 * 60 * 24 * 365, // 1 ano de duração da sessão
    updateAge: 60 * 60 * 24 * 7, // Atualiza a validade se o usuário usar o app após 7 dias
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
        input: true, // <--- ADICIONE ISSO PARA PERMITIR NO SIGNUP
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
        type: "date",
        required: false,
        defaultValue: new Date(),
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
          // Garante a criação do perfil correto baseado na role
          if (user.role === "user") {
            await prisma.patientProfile.create({
              data: {
                userId: user.id,
              },
            });
          } else if (user.role === "doctor") {
            await prisma.doctorProfile.create({
              data: {
                userId: user.id,
                crm: `PENDING-${user.id.substring(0, 8)}`,
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
        "http://localhost:8080",
        "http://192.168.0.6:3000",
        "http://192.168.0.3:3000",
        "http://192.168.0.6:8081",
        "http://192.168.0.3:8081",
        "vigidocapp://",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://192.168.0.6:3000",
        "http://192.168.0.3:3000",
        "http://192.168.0.6:8081",
        "http://192.168.0.3:8081",
        "vigidocapp://",
      ],
  plugins: [
    expo(), // Suporte ao @better-auth/expo client (mobile)
  ],
  advanced: {
    disableOriginCheck: true, // Adicionado para desenvolvimento: evita erro MISSING_OR_NULL_ORIGIN
    trustedProxyHeaders: true,
    cookiePrefix: "vigidoc",
  },
});
