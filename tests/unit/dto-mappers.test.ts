import { describe, it, expect } from "vitest";
import {
  mapSignupToResponseDTO,
} from "@/app/api/users/signup/dtos";
import {
  mapDoctorSignupToResponseDTO,
} from "@/app/api/doctor/signup/dtos";

// =============================================================================
// TESTES UNITÁRIOS — MAPEADORES DE DTO
// Verifica que as funções de mapeamento:
//   1. Retornam apenas os campos esperados
//   2. NÃO expõem dados sensíveis (password, hashes, tokens internos)
//   3. Mapeiam os campos corretamente
// =============================================================================

/** Simula um objeto User retornado pelo Better-Auth */
const mockUser = {
  id: "user-id-abc-123",
  name: "João Teste",
  email: "joao@test.com",
  role: "user",
  status: "PENDING",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  // Campos sensíveis que NUNCA devem aparecer na resposta
  password: "senha-super-secreta",
  passwordHash: "$2b$10$hash-ficticio",
  expoPushToken: "ExponentPushToken[xxx]",
  currentStreak: 5,
  lastActiveAt: new Date(),
};

describe("Mapeadores de DTO", () => {

  // ───────────────────────────────────────────────────────────
  // mapSignupToResponseDTO (Paciente)
  // ───────────────────────────────────────────────────────────

  describe("mapSignupToResponseDTO (Paciente)", () => {
    it("deve retornar os campos esperados na resposta", () => {
      const result = mapSignupToResponseDTO(mockUser);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("createdAt");
    });

    it("deve mapear os valores corretamente", () => {
      const result = mapSignupToResponseDTO(mockUser);

      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(result.status).toBe(mockUser.status);
      expect(result.role).toBe(mockUser.role);
    });

    it("NÃO deve expor o campo 'password'", () => {
      const result = mapSignupToResponseDTO(mockUser);
      expect(result).not.toHaveProperty("password");
      expect(JSON.stringify(result)).not.toContain("senha-super-secreta");
    });

    it("NÃO deve expor o campo 'passwordHash'", () => {
      const result = mapSignupToResponseDTO(mockUser);
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("NÃO deve expor o 'expoPushToken' (dado interno de notificação)", () => {
      const result = mapSignupToResponseDTO(mockUser);
      expect(result).not.toHaveProperty("expoPushToken");
    });
  });

  // ───────────────────────────────────────────────────────────
  // mapDoctorSignupToResponseDTO (Médico)
  // ───────────────────────────────────────────────────────────

  describe("mapDoctorSignupToResponseDTO (Médico)", () => {
    const mockDoctor = { ...mockUser, role: "doctor" };

    it("deve retornar os campos esperados na resposta", () => {
      const result = mapDoctorSignupToResponseDTO(mockDoctor);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("createdAt");
    });

    it("deve retornar role='doctor'", () => {
      const result = mapDoctorSignupToResponseDTO(mockDoctor);
      expect(result.role).toBe("doctor");
    });

    it("NÃO deve conter o termo 'medico' em nenhum campo", () => {
      const result = mapDoctorSignupToResponseDTO(mockDoctor);
      expect(JSON.stringify(result)).not.toContain("medico");
    });

    it("NÃO deve expor o campo 'password'", () => {
      const result = mapDoctorSignupToResponseDTO(mockDoctor);
      expect(result).not.toHaveProperty("password");
    });
  });
});
