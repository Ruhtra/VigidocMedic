# Regras para Documentação de API (Swagger/Scalar)

Esta regra garante que a documentação da API esteja sempre sincronizada com a implementação das rotas no Next.js.

## Quando Aplicar
- Sempre que um arquivo `app/api/**/route.ts` for criado ou modificado.
- Sempre que um schema do Zod utilizado em uma rota for alterado.

## Instruções Obrigatórias

1. **Sincronismo de Parâmetros**: Ao alterar os campos aceitos em um `POST`, `PUT` ou `PATCH`, atualize imediatamente o bloco `@swagger` correspondente (tags `requestBody`).
2. **Códigos de Resposta**: Certifique-se de que todos os possíveis retornos (`NextResponse.json` com status específico) estejam listados na seção `responses` do Swagger.
3. **Tags de Organização**: Use tags consistentes para agrupar rotas relacionadas (ex: `Authentication`, `Patients`, `Vitals`, `Admin`).
4. **Exemplos Reais**: Sempre forneça `example` nos campos do schema para facilitar o teste imediato através da interface do Scalar.
5. **Segurança**: Se uma rota exige autenticação (usa `getAuthContext` ou `auth.getSession`), inclua a definição de segurança no Swagger:
   ```yaml
   security:
     - bearerAuth: []
   ```

## Checklist de Verificação
- [ ] A rota no Swagger corresponde ao caminho do arquivo?
- [ ] O método HTTP (GET, POST, etc) está correto?
- [ ] O corpo da requisição reflete as validações do Zod/Prisma?
- [ ] Os exemplos fornecidos são válidos para teste?
- [ ] A tag de grupo está correta?
