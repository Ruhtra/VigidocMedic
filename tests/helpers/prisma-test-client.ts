import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * prisma-test-client.ts
 *
 * Cliente Prisma dedicado ao ambiente de testes.
 * Aponta para o banco Docker via DATABASE_URL do .env.test.
 * 
 * Exportado como "prismaTest" para distinguir do cliente de produção ("prisma").
 * Use SEMPRE este cliente nos helpers e factories de testes para garantir
 * que nenhuma operação de teste toque no banco de desenvolvimento.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[prisma-test-client] DATABASE_URL não definida. Verifique o arquivo .env.test"
  );
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prismaTest = new PrismaClient({ adapter });
