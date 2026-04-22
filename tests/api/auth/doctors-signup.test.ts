import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/doctor/signup/route";
import { createRequest, readResponseJson } from "@/tests/helpers/api-client";
import { prismaTest } from "@/tests/helpers/prisma-test-client";
import {
  buildDoctorSignupPayload,
  buildPatientSignupPayload,
  invalidEmail,
  tooShortPassword,
  tooShortName,
  generateCpf,
} from "@/tests/helpers/factories";
import { POST as POST_USER } from "@/app/api/users/signup/route";

// =============================================================================
describe("POST /api/doctor/signup — Cadastro de Médico", () => {

  // ───────────────────────────────────────────────────────────
  // CENÁRIO DE SUCESSO
  // ───────────────────────────────────────────────────────────

  describe("✅ Sucesso", () => {
    it("deve criar User com role='doctor' e DoctorProfile associado com status PENDING", async () => {
      const payload = buildDoctorSignupPayload();
      const res = await POST(createRequest(payload));
      const { status, body } = await readResponseJson(res);

      expect(status).toBe(201);
      expect(body).toHaveProperty("user.role", "doctor");
      expect(body).toHaveProperty("user.status", "PENDING");

      // Verifica criação no banco
      const dbUser = await prismaTest.user.findUnique({
        where: { email: payload.email },
        include: { doctorProfile: true },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.role).toBe("doctor");
      expect(dbUser?.status).toBe("PENDING");
      expect(dbUser?.doctorProfile).not.toBeNull();
    });

    it("NÃO deve criar PatientProfile para um médico", async () => {
      const payload = buildDoctorSignupPayload();
      await POST(createRequest(payload));

      const dbUser = await prismaTest.user.findUnique({
        where: { email: payload.email },
        include: { patientProfile: true, doctorProfile: true },
      });

      expect(dbUser?.patientProfile).toBeNull();
      expect(dbUser?.doctorProfile).not.toBeNull();
    });

    it("NÃO deve usar o termo 'medico' na role — deve ser estritamente 'doctor'", async () => {
      const payload = buildDoctorSignupPayload();
      const res = await POST(createRequest(payload));
      const { body } = await readResponseJson(res);

      const bodyString = JSON.stringify(body);
      expect(bodyString).not.toContain("medico");
      expect(body).toHaveProperty("user.role", "doctor");
    });

    it("a resposta NÃO deve vazar campos sensíveis (password)", async () => {
      const payload = buildDoctorSignupPayload();
      const res = await POST(createRequest(payload));
      const { body } = await readResponseJson(res);

      expect(JSON.stringify(body)).not.toContain(payload.password);
      expect(body).not.toHaveProperty("user.password");
    });
  });

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO ZOD — CAMPOS OBRIGATÓRIOS AUSENTES
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Campos Obrigatórios Ausentes", () => {
    it("deve retornar 400 quando 'name' está ausente", async () => {
      const payload = buildDoctorSignupPayload({ name: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });

    it("deve retornar 400 quando 'email' está ausente", async () => {
      const payload = buildDoctorSignupPayload({ email: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });

    it("deve retornar 400 quando 'password' está ausente", async () => {
      const payload = buildDoctorSignupPayload({ password: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });

    it("deve retornar 400 com corpo completamente vazio", async () => {
      const res = await POST(createRequest({}));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });
  });

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO ZOD — REGRAS DE MIN/MAX
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Regras de Tamanho (Zod min/max)", () => {
    it("deve retornar 400 para nome com menos de 2 caracteres", async () => {
      const payload = buildDoctorSignupPayload({ name: tooShortName() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });

    it("deve retornar 400 para senha com menos de 8 caracteres", async () => {
      const payload = buildDoctorSignupPayload({ password: tooShortPassword() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });
  });

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO ZOD — FORMATO DOS CAMPOS
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Formato Inválido dos Campos", () => {
    it("deve retornar 400 para email com formato inválido", async () => {
      const payload = buildDoctorSignupPayload({ email: invalidEmail() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });

    it("deve retornar 400 para email sem arroba", async () => {
      const payload = buildDoctorSignupPayload({ email: "doctordomain.com" });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);
      expect(status).toBe(400);
    });
  });

  // ───────────────────────────────────────────────────────────
  // CONFLITO DE IDENTIDADE
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Conflito de Identidade", () => {
    it("deve retornar 400 ao tentar registrar um email já cadastrado por outro médico", async () => {
      const payload = buildDoctorSignupPayload();

      await POST(createRequest(payload)); // Primeiro cadastro

      const secondRes = await POST(createRequest(payload)); // Mesmo email
      const { status, body } = await readResponseJson(secondRes);

      expect(status).toBe(400);
      expect((body as any).error).toContain("e-mail");
    });

    it("deve retornar 400 ao tentar registrar um email que já pertence a um PACIENTE", async () => {
      const email = `shared-email-${Date.now()}@test.com`;
      const patientPayload = buildPatientSignupPayload({ email, cpf: generateCpf() });
      const doctorPayload = buildDoctorSignupPayload({ email });

      // Paciente se registra primeiro
      await POST_USER(createRequest(patientPayload));

      // Médico tenta usar o mesmo email
      const res = await POST(createRequest(doctorPayload));
      const { status, body } = await readResponseJson(res);

      expect(status).toBe(400);
      expect((body as any).error).toContain("e-mail");
    });
  });
});
