import { describe, it, expect } from "vitest";
import { prismaTest } from "@/tests/helpers/prisma-test-client";
import { buildPatientSignupPayload, buildDoctorSignupPayload, generateCpf } from "@/tests/helpers/factories";
import { POST as POST_USER } from "@/app/api/users/signup/route";
import { POST as POST_DOCTOR } from "@/app/api/doctor/signup/route";
import { createRequest } from "@/tests/helpers/api-client";
import { auth } from "@/lib/auth";

// =============================================================================
// TESTES DO FLUXO ADMINISTRATIVO DE APROVAÇÃO
// POST /api/users/signup -> Admin aprova -> Login funcional
// =============================================================================

/**
 * Helper: Aprova um usuário pelo email diretamente no banco (simula ação admin).
 */
async function approveUser(email: string): Promise<void> {
  await prismaTest.user.update({
    where: { email },
    data: { status: "ACTIVE" },
  });
}

/**
 * Helper: Bloqueia um usuário diretamente no banco.
 */
async function blockUser(email: string): Promise<void> {
  await prismaTest.user.update({
    where: { email },
    data: { status: "BLOCKED" },
  });
}

/**
 * Helper: Faz login via Better-Auth e retorna a sessão.
 */
async function doLogin(email: string, password: string) {
  return auth.api.signInEmail({
    body: { email, password },
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}

// =============================================================================

describe("Fluxo Administrativo de Aprovação de Contas", () => {

  // ───────────────────────────────────────────────────────────
  // ESTADO INICIAL PÓS-CADASTRO
  // ───────────────────────────────────────────────────────────

  describe("📋 Estado Inicial — Usuário Recém-Cadastrado", () => {
    it("paciente recém-cadastrado deve existir no banco com status PENDING", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));

      const dbUser = await prismaTest.user.findUnique({ where: { email: payload.email } });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.status).toBe("PENDING");
    });

    it("médico recém-cadastrado deve existir no banco com status PENDING", async () => {
      const payload = buildDoctorSignupPayload();
      await POST_DOCTOR(createRequest(payload));

      const dbUser = await prismaTest.user.findUnique({ where: { email: payload.email } });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.status).toBe("PENDING");
    });
  });

  // ───────────────────────────────────────────────────────────
  // APROVAÇÃO DE CONTA
  // ───────────────────────────────────────────────────────────

  describe("✅ Aprovação de Conta", () => {
    it("admin deve conseguir atualizar o status do paciente para ACTIVE", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));

      // Simula a ação do admin
      await approveUser(payload.email);

      const dbUser = await prismaTest.user.findUnique({ where: { email: payload.email } });
      expect(dbUser?.status).toBe("ACTIVE");
    });

    it("paciente com status ACTIVE deve ter status ACTIVE na sessão pós-login", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));
      await approveUser(payload.email);

      const session = await doLogin(payload.email, payload.password as string);
      expect(session.user.status).toBe("ACTIVE");
    });

    it("médico aprovado deve ter status ACTIVE na sessão e role='doctor'", async () => {
      const payload = buildDoctorSignupPayload();
      await POST_DOCTOR(createRequest(payload));
      await approveUser(payload.email);

      const session = await doLogin(payload.email, payload.password as string);
      expect(session.user.status).toBe("ACTIVE");
      expect(session.user.role).toBe("doctor");
    });
  });

  // ───────────────────────────────────────────────────────────
  // FLUXO PONTA A PONTA
  // ───────────────────────────────────────────────────────────

  describe("🔄 Fluxo Completo Ponta-a-Ponta", () => {
    it("Paciente: Cadastro -> PENDING -> Login com PENDING -> Aprovação -> Login com ACTIVE", async () => {
      const payload = buildPatientSignupPayload();

      // 1. Cadastro
      const signupRes = await POST_USER(createRequest(payload));
      expect(signupRes.status).toBe(201);

      // 2. Login antes da aprovação — deve funcionar mas com status PENDING
      const pendingSession = await doLogin(payload.email, payload.password as string);
      expect(pendingSession.user.status).toBe("PENDING");

      // 3. Admin aprova
      await approveUser(payload.email);

      // 4. Login após aprovação — deve ter status ACTIVE
      const activeSession = await doLogin(payload.email, payload.password as string);
      expect(activeSession.user.status).toBe("ACTIVE");
    });

    it("Médico: Cadastro -> PENDING -> Login com PENDING -> Aprovação -> Login com ACTIVE", async () => {
      const payload = buildDoctorSignupPayload();

      await POST_DOCTOR(createRequest(payload));

      const pendingSession = await doLogin(payload.email, payload.password as string);
      expect(pendingSession.user.status).toBe("PENDING");
      expect(pendingSession.user.role).toBe("doctor");

      await approveUser(payload.email);

      const activeSession = await doLogin(payload.email, payload.password as string);
      expect(activeSession.user.status).toBe("ACTIVE");
      expect(activeSession.user.role).toBe("doctor");
    });
  });

  // ───────────────────────────────────────────────────────────
  // BLOQUEIO DE CONTA
  // ───────────────────────────────────────────────────────────

  describe("🚫 Bloqueio de Conta", () => {
    it("deve registrar status BLOCKED no banco ao bloquear um usuário", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));
      await approveUser(payload.email);
      await blockUser(payload.email);

      const dbUser = await prismaTest.user.findUnique({ where: { email: payload.email } });
      expect(dbUser?.status).toBe("BLOCKED");
    });

    it("usuário bloqueado deve ter status BLOCKED na sessão após login", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));
      await blockUser(payload.email);

      const session = await doLogin(payload.email, payload.password as string);
      // O Better-Auth ainda permite login, mas o status indica bloqueio para o frontend
      expect(session.user.status).toBe("BLOCKED");
    });
  });

  // ───────────────────────────────────────────────────────────
  // INTEGRIDADE DOS PERFIS
  // ───────────────────────────────────────────────────────────

  describe("🗄️ Integridade dos Perfis pós-aprovação", () => {
    it("PatientProfile deve ser preservado após a aprovação do usuário", async () => {
      const payload = buildPatientSignupPayload();
      await POST_USER(createRequest(payload));
      await approveUser(payload.email);

      const dbUser = await prismaTest.user.findUnique({
        where: { email: payload.email },
        include: { patientProfile: true },
      });

      expect(dbUser?.patientProfile).not.toBeNull();
      expect(dbUser?.patientProfile?.cpf).toBe(payload.cpf);
    });

    it("DoctorProfile deve ser preservado após a aprovação do médico", async () => {
      const payload = buildDoctorSignupPayload();
      await POST_DOCTOR(createRequest(payload));
      await approveUser(payload.email);

      const dbUser = await prismaTest.user.findUnique({
        where: { email: payload.email },
        include: { doctorProfile: true },
      });

      expect(dbUser?.doctorProfile).not.toBeNull();
      expect(dbUser?.doctorProfile?.crm).toContain("PENDING-");
    });
  });
});
