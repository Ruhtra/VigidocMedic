import { execSync } from "child_process";

/**
 * global-setup.ts
 *
 * Executado UMA ÚNICA VEZ antes de toda a suíte de testes.
 * Responsabilidades:
 *  1. Verificar se o banco de teste está rodando (Docker)
 *  2. Aplicar as migrations do Prisma no banco de teste
 *
 * IMPORTANTE: Não importar instâncias do Prisma aqui pois o env ainda não foi carregado.
 */
export async function setup() {
  console.log("\n🔧 [global-setup] Preparando ambiente de testes...");

  // 1. Verifica se o banco de testes está acessível
  const dbUrl = process.env.DATABASE_URL ?? "postgresql://vigitest:vigitest_secret@localhost:5433/vigidoc_test";
  console.log(`🔗 [global-setup] Database URL: ${dbUrl.replace(/:([^@]+)@/, ":****@")}`);

  // 2. Aplica as migrations Prisma no banco de teste.
  // Usa "migrate deploy" para ambientes não-interativos (ideal para CI/CD também).
  // Se o banco não estiver disponível, apenas emite um aviso:
  // testes unitários (tests/unit) não dependem do banco e podem rodar sem ele.
  try {
    console.log("🚀 [global-setup] Sincronizando schema com o banco de testes (db push)...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });
    console.log("✅ [global-setup] Banco de dados sincronizado com sucesso!\n");
  } catch (error) {
    console.warn("⚠️  [global-setup] Banco de dados inacessível em localhost:5433.");
    console.warn("   Testes de INTEGRAÇÃO falharão. Testes UNITÁRIOS continuarão normalmente.");
    console.warn("   👉 Para rodar testes de integração: docker-compose -f docker-compose.test.yml up -d\n");
    // Não relança o erro — permite que testes unitários rodem offline
  }
}

export async function teardown() {
  console.log("\n🧹 [global-setup] Teardown do ambiente de testes concluído.");
}
