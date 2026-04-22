import { afterEach } from "vitest";
import { prismaTest } from "@/tests/helpers/prisma-test-client";

/**
 * test-env.ts
 *
 * Executado antes de CADA ARQUIVO de teste.
 * Responsabilidade: Limpar o banco de dados entre suítes para garantir
 * que nenhum dado vaze de um teste para outro.
 *
 * A limpeza ocorre em ordem de dependência de foreign key (filhos antes dos pais).
 */
afterEach(async () => {
  // A ordem é crítica: limpar tabelas que possuem FK primeiro
  await prismaTest.$executeRaw`TRUNCATE TABLE
    "vital_record",
    "reminders",
    "notifications",
    "shared_reports",
    "patient_profile",
    "doctor_profile",
    "verification",
    "session",
    "account",
    "user"
    RESTART IDENTITY CASCADE`;
});
