import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

/**
 * vitest.integration.config.ts
 *
 * Configuração específica para testes de INTEGRAÇÃO.
 * Extende a configuração base e adiciona:
 *  - setupFiles com limpeza de banco entre cada arquivo de teste
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["tests/api/**/*.test.ts"],
      setupFiles: ["./tests/setup/test-env.ts"],
      // Desativa o paralelismo entre arquivos para evitar conflitos no banco de dados compartilhado
      fileParallelism: false,
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
    },
  }),
);
