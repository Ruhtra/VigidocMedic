import { describe, it, expect } from "vitest";
import {
  signupRequestSchema,
} from "@/app/api/users/signup/dtos";
import {
  signupDoctorRequestSchema,
} from "@/app/api/doctor/signup/dtos";

// =============================================================================
// TESTES UNITÁRIOS — SCHEMAS ZOD
// Testa os schemas de validação de forma ISOLADA (sem banco, sem HTTP).
// Útil para garantir que qualquer mudança nos schemas não quebre silenciosamente.
// =============================================================================

describe("Schemas Zod — Validação Isolada", () => {

  // ───────────────────────────────────────────────────────────
  // SCHEMA DO PACIENTE (signupRequestSchema)
  // ───────────────────────────────────────────────────────────

  describe("signupRequestSchema (Paciente)", () => {

    describe("✅ Parsing Válido", () => {
      it("deve aceitar todos os campos válidos e obrigatórios", () => {
        const result = signupRequestSchema.safeParse({
          name: "João da Silva",
          email: "joao@example.com",
          password: "Senha@123",
          cpf: "12345678901",
        });
        expect(result.success).toBe(true);
      });

      it("deve aceitar campos opcionais (phone, birthDate) sem erros", () => {
        const result = signupRequestSchema.safeParse({
          name: "Maria Souza",
          email: "maria@example.com",
          password: "Senha@123",
          cpf: "12345678901",
          phone: "(11) 99999-9999",
          birthDate: "15/06/1990",
        });
        expect(result.success).toBe(true);
      });

      it("deve aceitar payload sem campos opcionais", () => {
        const result = signupRequestSchema.safeParse({
          name: "Carlos",
          email: "carlos@example.com",
          password: "Senha@123",
          cpf: "12345678901",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("❌ Rejeição por Campo Inválido", () => {
      // name
      it("deve falhar quando name tem menos de 2 caracteres", () => {
        const result = signupRequestSchema.safeParse({ name: "A", email: "a@a.com", password: "Senha@123", cpf: "12345678901" });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0].path).toContain("name");
      });

      it("deve falhar quando name está ausente", () => {
        const result = signupRequestSchema.safeParse({ email: "a@a.com", password: "Senha@123", cpf: "12345678901" });
        expect(result.success).toBe(false);
      });

      // email
      it("deve falhar para email sem @", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "joaodomain.com", password: "Senha@123", cpf: "12345678901" });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0].path).toContain("email");
      });

      it("deve falhar para email com espaço", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "joao @domain.com", password: "Senha@123", cpf: "12345678901" });
        expect(result.success).toBe(false);
      });

      it("deve falhar para email vazio", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "", password: "Senha@123", cpf: "12345678901" });
        expect(result.success).toBe(false);
      });

      // password
      it("deve falhar para senha com menos de 8 caracteres", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "a@a.com", password: "abc", cpf: "12345678901" });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0].path).toContain("password");
      });

      it("deve falhar para senha vazia", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "a@a.com", password: "", cpf: "12345678901" });
        expect(result.success).toBe(false);
      });

      // cpf
      it("deve falhar para CPF com menos de 11 caracteres", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "a@a.com", password: "Senha@123", cpf: "12345" });
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0].path).toContain("cpf");
      });

      it("deve falhar para CPF vazio", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "a@a.com", password: "Senha@123", cpf: "" });
        expect(result.success).toBe(false);
      });

      it("deve falhar para CPF ausente", () => {
        const result = signupRequestSchema.safeParse({ name: "João", email: "a@a.com", password: "Senha@123" });
        expect(result.success).toBe(false);
      });
    });

    describe("📦 Estrutura de Erros", () => {
      it("deve reportar MÚLTIPLOS erros de campos de uma vez (não fail-fast)", () => {
        const result = signupRequestSchema.safeParse({
          name: "A",
          email: "invalido",
          password: "abc",
          cpf: "123",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          // Zod deve reportar múltiplos erros simultaneamente
          expect(result.error.issues.length).toBeGreaterThan(1);
        }
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // SCHEMA DO MÉDICO (signupDoctorRequestSchema)
  // ───────────────────────────────────────────────────────────

  describe("signupDoctorRequestSchema (Médico)", () => {

    describe("✅ Parsing Válido", () => {
      it("deve aceitar todos os campos válidos", () => {
        const result = signupDoctorRequestSchema.safeParse({
          name: "Dr. Ana Lima",
          email: "ana.lima@hospital.com",
          password: "Senha@Segura",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("❌ Rejeição por Campo Inválido", () => {
      it("deve falhar quando name tem menos de 2 caracteres", () => {
        const result = signupDoctorRequestSchema.safeParse({ name: "A", email: "a@a.com", password: "Senha@123" });
        expect(result.success).toBe(false);
      });

      it("deve falhar para email inválido", () => {
        const result = signupDoctorRequestSchema.safeParse({ name: "Dr. Ana", email: "email-invalido", password: "Senha@123" });
        expect(result.success).toBe(false);
      });

      it("deve falhar para senha com menos de 8 caracteres", () => {
        const result = signupDoctorRequestSchema.safeParse({ name: "Dr. Ana", email: "a@a.com", password: "abc" });
        expect(result.success).toBe(false);
      });

      it("deve falhar com payload vazio", () => {
        const result = signupDoctorRequestSchema.safeParse({});
        expect(result.success).toBe(false);
      });
    });
  });
});
