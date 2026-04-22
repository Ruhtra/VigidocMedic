/**
 * api-client.ts
 *
 * Helper para fazer requisições HTTP às rotas da API Next.js durante os testes.
 * 
 * Como os testes rodam contra as handlers diretamente (sem servidor HTTP),
 * este helper cria objetos Request/Response compatíveis com o Next.js App Router,
 * permitindo chamar os handlers de rota diretamente como funções.
 *
 * Padrão de uso:
 *   const response = await POST(createRequest({ email: "..." }))
 */

/**
 * Cria um objeto Request do Next.js a partir de um body JSON e opções HTTP.
 * @param body - O body JSON a ser enviado.
 * @param options - Opções adicionais (headers, method, etc).
 */
export function createRequest(
  body: Record<string, unknown>,
  options: RequestInit = {}
): Request {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * Lê e parseia o JSON de uma Response do Next.js.
 * Garante o acesso tipado ao body retornado pela API.
 */
export async function readResponseJson<T = Record<string, unknown>>(
  response: Response
): Promise<{ status: number; body: T }> {
  const body = (await response.json()) as T;
  return { status: response.status, body };
}
