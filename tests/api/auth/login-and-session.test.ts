import { describe, it, expect } from "vitest";
import { auth } from "@/lib/auth";
import { prismaTest } from "@/tests/helpers/prisma-test-client";
import { buildPatientSignupPayload, buildDoctorSignupPayload, generateCpf } from "@/tests/helpers/factories";
import { POST as POST_USER } from "@/app/api/users/signup/route";
import { POST as POST_DOCTOR } from "@/app/api/doctor/signup/route";
import { createRequest } from "@/tests/helpers/api-client";

// =============================================================================
// TESTES DE AUTENTICAÇÃO (LOGIN) E CONTROLE DE ACESSO POR STATUS
// =============================================================================

/**
 * Helper: Cadastra um paciente e retorna os dados de login.
 */
async function registerPatient(overrides = {}) {
  const payload = buildPatientSignupPayload(overrides);
  await POST_USER(createRequest(payload));
  return payload;
}

/**
 * Helper: Cadastra um médico e retorna os dados de login.
 */
async function registerDoctor(overrides = {}) {
  const payload = buildDoctorSignupPayload(overrides);
  await POST_DOCTOR(createRequest(payload));
  return payload;
}

/**
 * Helper: Aprova um usuário diretamente no banco (simula ação admin).
 */
async function approveUser(email: string) {
  await prismaTest.user.update({
    where: { email },
    data: { status: "ACTIVE" },
  });
}

/**
 * Helper: Faz login via Better-Auth API programaticamente.
 */
async function loginWithBetterAuth(email: string, password: string) {
  return auth.api.signInEmail({
    body: { email, password },
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}

// =============================================================================

describe("Autenticação e Controle de Acesso por Status", () => {

  // ───────────────────────────────────────────────────────────
  // LOGIN — USUÁRIO PENDING
  // ───────────────────────────────────────────────────────────

  describe("🔐 Login com status PENDING", () => {
    it("paciente PENDING deve conseguir fazer login (sessão criada)", async () => {
      const { email, password } = await registerPatient();

      const session = await loginWithBetterAuth(email, password);

      // O login deve funcionar — a sessão é criada mesmo com PENDING
      expect(session).toBeDefined();
      expect(session.user.email).toBe(email);
      expect(session.user.status).toBe("PENDING");
    });

    it("médico PENDING deve conseguir fazer login (sessão criada)", async () => {
      const { email, password } = await registerDoctor();

      const session = await loginWithBetterAuth(email, password);

      expect(session).toBeDefined();
      expect(session.user.email).toBe(email);
      expect(session.user.status).toBe("PENDING");
    });

    it("a sessão de um usuário PENDING deve conter o status PENDING para uso no frontend", async () => {
      const { email, password } = await registerPatient();
      const session = await loginWithBetterAuth(email, password);

      // O frontend usa session.user.status para redirecionar à tela de espera
      expect(session.user).toHaveProperty("status", "PENDING");
    });
  });

  // ───────────────────────────────────────────────────────────
  // LOGIN — CREDENCIAIS INVÁLIDAS
  // ───────────────────────────────────────────────────────────

  describe("❌ Login com credenciais inválidas", () => {
    it("deve falhar com senha incorreta para usuário existente", async () => {
      const { email } = await registerPatient();

      await expect(
        loginWithBetterAuth(email, "senha_incorreta_99")
      ).rejects.toThrow();
    });

    it("deve falhar com email não cadastrado", async () => {
      await expect(
        loginWithBetterAuth("nao-existe@test.com", "qualquersenha123")
      ).rejects.toThrow();
    });

    it("deve falhar com email vazio", async () => {
      await expect(
        loginWithBetterAuth("", "qualquersenha123")
      ).rejects.toThrow();
    });

    it("deve falhar com senha vazia", async () => {
      const { email } = await registerPatient();
      await expect(
        loginWithBetterAuth(email, "")
      ).rejects.toThrow();
    });
  });

  // ───────────────────────────────────────────────────────────
  // FLUXO PÓS-APROVAÇÃO
  // ───────────────────────────────────────────────────────────

  describe("✅ Login pós-aprovação (status ACTIVE)", () => {
    it("paciente aprovado deve ter status ACTIVE na sessão após aprovação", async () => {
      const { email, password } = await registerPatient();

      // Admin aprova o usuário
      await approveUser(email);

      const session = await loginWithBetterAuth(email, password);
      expect(session.user.status).toBe("ACTIVE");
    });

    it("médico aprovado deve ter status ACTIVE na sessão após aprovação", async () => {
      const { email, password } = await registerDoctor();

      await approveUser(email);

      const session = await loginWithBetterAuth(email, password);
      expect(session.user.status).toBe("ACTIVE");
    });
  });

  // ───────────────────────────────────────────────────────────
  // SESSÃO E TOKENS
  // ───────────────────────────────────────────────────────────

  describe("🔑 Integridade da Sessão Better-Auth", () => {
    it("o token de sessão deve ser criado e salvo no banco após login", async () => {
      const { email, password } = await registerPatient();

      await loginWithBetterAuth(email, password);

      const dbUser = await prismaTest.user.findUnique({ where: { email } });
      const sessions = await prismaTest.session.findMany({ where: { userId: dbUser!.id } });

      expect(sessions.length).toBeGreaterThan(0);
    });

    it("o token de sessão deve ter uma data de expiração no futuro", async () => {
      const { email, password } = await registerPatient();
      await loginWithBetterAuth(email, password);

      const dbUser = await prismaTest.user.findUnique({ where: { email } });
      const sessions = await prismaTest.session.findMany({ where: { userId: dbUser!.id } });

      const latestSession = sessions[0];
      expect(latestSession.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
