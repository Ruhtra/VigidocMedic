import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/users/signup/route";
import { createRequest, readResponseJson } from "@/tests/helpers/api-client";
import { prismaTest } from "@/tests/helpers/prisma-test-client";
import {
  buildPatientSignupPayload,
  invalidEmail,
  tooShortPassword,
  tooShortName,
  invalidCpf,
  generateCpf,
} from "@/tests/helpers/factories";

// =============================================================================
// TESTES DE CADASTRO DE PACIENTE — POST /api/users/signup
// =============================================================================

describe("POST /api/users/signup — Cadastro de Paciente", () => {

  // ───────────────────────────────────────────────────────────
  // CENÁRIO DE SUCESSO
  // ───────────────────────────────────────────────────────────

  describe("✅ Sucesso", () => {
    it("deve criar User e PatientProfile com status PENDING para dados válidos", async () => {
      const payload = buildPatientSignupPayload();
      const res = await POST(createRequest(payload));
      const { status, body } = await readResponseJson(res);

      expect(status).toBe(201);
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("user.id");
      expect(body).toHaveProperty("user.email", payload.email);
      expect(body).toHaveProperty("user.status", "PENDING");
      expect(body).toHaveProperty("user.role", "user");

      // Verifica criação no banco de dados
      const dbUser = await prismaTest.user.findUnique({
        where: { email: payload.email },
        include: { patientProfile: true },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.status).toBe("PENDING");
      expect(dbUser?.patientProfile).not.toBeNull();
      expect(dbUser?.patientProfile?.cpf).toBe(payload.cpf);
    });

    it("deve salvar a data de nascimento corretamente no formato DD/MM/YYYY", async () => {
      const payload = buildPatientSignupPayload({ birthDate: "15/03/1985" });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(201);

      const profile = await prismaTest.patientProfile.findFirst({
        where: { user: { email: payload.email } },
      });
      expect(profile?.birthDate).not.toBeNull();
      // Verifica que o mês 3 (março) está correto
      expect(profile?.birthDate?.getMonth()).toBe(2); // 0-indexed
    });

    it("deve aceitar cadastro sem campos opcionais (phone, birthDate)", async () => {
      const payload = buildPatientSignupPayload({ phone: undefined, birthDate: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(201);
    });

    it("a resposta NÃO deve vazar campos sensíveis (password)", async () => {
      const payload = buildPatientSignupPayload();
      const res = await POST(createRequest(payload));
      const { body } = await readResponseJson(res);

      // Garante que a senha não é devolvida na resposta
      expect(JSON.stringify(body)).not.toContain(payload.password);
      expect(body).not.toHaveProperty("user.password");
      expect(body).not.toHaveProperty("user.passwordHash");
    });
  });

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO ZOD — CAMPOS OBRIGATÓRIOS AUSENTES
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Campos Obrigatórios Ausentes", () => {
    it("deve retornar 400 quando 'name' está ausente", async () => {
      const payload = buildPatientSignupPayload({ name: undefined });
      const res = await POST(createRequest(payload));
      const { status, body } = await readResponseJson(res);

      expect(status).toBe(400);
      expect(body).toHaveProperty("details");
    });

    it("deve retornar 400 quando 'email' está ausente", async () => {
      const payload = buildPatientSignupPayload({ email: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 quando 'password' está ausente", async () => {
      const payload = buildPatientSignupPayload({ password: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 quando 'cpf' está ausente", async () => {
      const payload = buildPatientSignupPayload({ cpf: undefined });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 com corpo completamente vazio", async () => {
      const res = await POST(createRequest({}));
      const { status, body } = await readResponseJson(res);

      expect(status).toBe(400);
      expect(body).toHaveProperty("error");
    });
  });

  // ───────────────────────────────────────────────────────────
  // VALIDAÇÃO ZOD — REGRAS DE MIN/MAX
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Regras de Tamanho (Zod min/max)", () => {
    it("deve retornar 400 para nome com menos de 2 caracteres", async () => {
      const payload = buildPatientSignupPayload({ name: tooShortName() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 para senha com menos de 8 caracteres", async () => {
      const payload = buildPatientSignupPayload({ password: tooShortPassword() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 para CPF com menos de 11 dígitos", async () => {
      const payload = buildPatientSignupPayload({ cpf: invalidCpf() });
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
      const payload = buildPatientSignupPayload({ email: invalidEmail() });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 para email sem domínio (ex: user@)", async () => {
      const payload = buildPatientSignupPayload({ email: "user@" });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });

    it("deve retornar 400 para email sem arroba (ex: userdomain.com)", async () => {
      const payload = buildPatientSignupPayload({ email: "userdomain.com" });
      const res = await POST(createRequest(payload));
      const { status } = await readResponseJson(res);

      expect(status).toBe(400);
    });
  });

  // ───────────────────────────────────────────────────────────
  // CONFLITO DE IDENTIDADE
  // ───────────────────────────────────────────────────────────

  describe("❌ Erro — Conflito de Identidade", () => {
    it("deve retornar 400 ao tentar registrar um email já existente", async () => {
      const payload = buildPatientSignupPayload();

      // Primeiro cadastro deve ter sucesso
      const firstRes = await POST(createRequest(payload));
      expect(firstRes.status).toBe(201);

      // Segundo cadastro com mesmo email deve falhar
      const secondPayload = buildPatientSignupPayload({ email: payload.email, cpf: generateCpf() });
      const secondRes = await POST(createRequest(secondPayload));
      const { status, body } = await readResponseJson(secondRes);

      expect(status).toBe(400);
      expect(body).toHaveProperty("error");
      expect((body as any).error).toContain("e-mail");
    });

    it("deve retornar 400 ao tentar registrar um CPF já existente", async () => {
      const cpf = generateCpf();
      const payload = buildPatientSignupPayload({ cpf });

      // Primeiro cadastro deve ter sucesso
      await POST(createRequest(payload));

      // Segundo cadastro com mesmo CPF e email diferente deve falhar
      const secondPayload = buildPatientSignupPayload({ cpf });
      const secondRes = await POST(createRequest(secondPayload));
      const { status, body } = await readResponseJson(secondRes);

      expect(status).toBe(400);
      expect(body).toHaveProperty("error");
      expect((body as any).error).toContain("CPF");
    });
  });
});
