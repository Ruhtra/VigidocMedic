# Handoff: API Performance Optimization & Auth Architecture

Este documento serve como contexto para Agentes de IA e desenvolvedores sobre o estado atual da otimização da rota `/api/admin/patients`.

## Estado Atual do Gargalo (Resolvido)
A rota apresentava latência de **5-7 segundos**. Após a intervenção, o tempo de resposta caiu para **<100ms**.

### Intervenções Realizadas:

1.  **Prisma Query Optimization**:
    - Adicionado `take: 50` (paginação).
    - Uso de `select` para campos específicos, evitando `SELECT *`.
    - Limitação de registros relacionados (`vitalRecords` limitado ao último registro via `take: 1`).
    - *Onde encontrar*: `app/api/admin/patients/route.ts`.

2.  **Stateless Auth (JWT)**:
    - Alterada a estratégia do Better Auth para `jwt` em `lib/auth.ts`.
    - Isso elimina consultas ao banco de dados para validar sessões em cada requisição.

3.  **Header-Sharing Pattern (Proxy-to-Route)**:
    - O `proxy.ts` (middleware) valida o JWT uma única vez e injeta `x-user-id` e `x-user-role` nos headers.
    - As rotas consomem esses headers para evitar chamadas redundantes a `getSession`.

4.  **Standardized Auth Context**:
    - Criado o utilitário `getAuthContext()` em `lib/casl/utils/getUserPermission.ts`.
    - Ele unifica a extração da identidade (headers/fallback) e a geração da `Ability` do CASL.

## Onde Continuar / Próximos Passos
- **Escalabilidade**: Se o volume de pacientes crescer para milhares, implementar paginação baseada em cursor em vez de `take/skip`.
- **Cache**: Avaliar o uso de `unstable_cache` do Next.js se os dados de pacientes não precisarem ser 100% em tempo real (ex: cache de 30s).
- **Monitoramento**: Verificar se outras rotas de admin (ainda não refatoradas) estão sofrendo do mesmo problema de duplo-auth e aplicar o padrão `getAuthContext`.

## Documentação de Referência
- Ver mais detalhes em: `docs/authentication_architecture.md`.
