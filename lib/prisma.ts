import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Configuração básica com logs de query
const prismaInstance =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: [
    //   { emit: "event", level: "query" },
    //   { emit: "stdout", level: "error" },
    //   { emit: "stdout", level: "warn" },
    // ],
  });

// Adicionando middleware/extensão para medir tempo de execução se necessário
// Ou simplesmente ouvindo o evento de query
// if (!globalForPrisma.prisma) {
//   (prismaInstance as any).$on("query", (e: any) => {
//     console.log(`\x1b[36mprisma:query\x1b[0m ${e.query}`);
//     console.log(`\x1b[33mprisma:duration\x1b[0m ${e.duration}ms`);
//   });
// }

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
