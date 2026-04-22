import { defineConfig } from "vitest/config";
import path from "path";
import { config } from "dotenv";

// Carrega o .env.test antes de qualquer coisa para garantir que DATABASE_URL
// esteja disponível desde o global-setup e nos testes
config({ path: ".env.test" });

export default defineConfig({
  test: {
    // Timeout generoso pois testes de integração com banco podem ser lentos
    testTimeout: 30000,

    // Garante que os testes rodem em sequência (não em paralelo)
    // Essencial para um banco único compartilhado — evita condições de corrida
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Executa o setup global antes de qualquer suíte de teste
    globalSetup: ["./tests/setup/global-setup.ts"],

    // test-env.ts é importado APENAS em testes de integração
    // Para testes unitários (tests/unit), não há setupFiles
    // A separação é feita pelos scripts npm (test:unit vs test:integration)
    setupFiles: [],

    // Organiza os reporters de forma legível
    reporters: ["verbose"],

    // Cobertura de código
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "app/api/**/*.ts",
        "lib/**/*.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "**/generated/**",
        "**/node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      // Espelha os path aliases do tsconfig.json
      "@": path.resolve(__dirname, "./"),
    },
  },
});
