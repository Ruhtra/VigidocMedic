import { faker } from "@faker-js/faker/locale/pt_BR";

/**
 * factories.ts
 *
 * Fábricas de dados de teste usando @faker-js/faker.
 *
 * Centraliza a geração de dados realistas e aleatórios para os testes,
 * evitando que dados hardcoded (ex: cpf = "12345678901") causem conflitos
 * em diferentes rodadas de execução.
 *
 * Padrão de uso:
 *   const payload = buildPatientSignupPayload()
 *   const response = await POST(createRequest(payload))
 */

// ─────────────────────────────────────────────────────────────
// PACIENTE (User)
// ─────────────────────────────────────────────────────────────

/**
 * Gera um payload válido para cadastro de paciente.
 * Todos os campos seguem as regras do signupRequestSchema (Zod).
 */
export function buildPatientSignupPayload(
  overrides: Record<string, unknown> = {},
) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: "Senha@Segura123", // Atende min 8 chars
    cpf: generateCpf(),
    phone: faker.helpers.fromRegExp(/\([1-9]{2}\) 9\d{4}-\d{4}/),
    birthDate: faker.date.birthdate(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// MÉDICO (Doctor)
// ─────────────────────────────────────────────────────────────

/**
 * Gera um payload válido para cadastro de médico.
 * Todos os campos seguem as regras do signupDoctorRequestSchema (Zod).
 */
export function buildDoctorSignupPayload(
  overrides: Record<string, unknown> = {},
) {
  return {
    name: `Dr. ${faker.person.fullName()}`,
    email: faker.internet.email().toLowerCase(),
    password: "Senha@Segura123",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────────────────────────

/**
 * Gera um CPF numérico com 11 dígitos.
 * Não valida o dígito verificador — apenas gera um número único de 11 dígitos
 * para fins de unicidade no banco de testes.
 */
export function generateCpf(): string {
  return String(faker.number.int({ min: 10000000000, max: 99999999999 }));
}

/**
 * Gera um e-mail garantidamente inválido para testes de rejeição.
 */
export function invalidEmail(): string {
  return faker.lorem.word() + "-not-an-email";
}

/**
 * Gera uma senha inválida (menos de 8 caracteres).
 */
export function tooShortPassword(): string {
  return "abc";
}

/**
 * Gera um nome inválido (menos de 2 caracteres).
 */
export function tooShortName(): string {
  return "A";
}

/**
 * Gera um CPF inválido (menos de 11 dígitos).
 */
export function invalidCpf(): string {
  return "12345"; // Menos que o min(11) do schema Zod
}
