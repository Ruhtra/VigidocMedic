import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Rota para obter os dados REAIS e ATUALIZADOS do usuário logado.
 * Diferente do /api/me antigo, esta rota consulta o banco de dados diretamente
 * para garantir que mudanças de status (PENDING -> ACTIVE) sejam refletidas imediatamente.
 */
export async function GET() {
  const head = await headers();
  const headerUserId = head.get("x-user-id");
  const authHeader = head.get("authorization");

  console.log(`[GET /api/novo/users/me] DEBUG: auth=${authHeader?.substring(0, 20)}..., x-user-id=${headerUserId}`);

  let userId: string | null = null;

  // 1. Tenta pegar a sessão oficial
  const session = await auth.api.getSession({ headers: head });
  
  if (session?.user?.id) {
    userId = session.user.id;
  } else if (headerUserId) {
    // Fallback para mobile que envia os headers de identidade
    userId = headerUserId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Não autorizado ou sessão não encontrada." }, { status: 401 });
  }

  try {
    // 2. Busca no banco de dados para garantir o status mais recente (A VERDADE)
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 3. Extração do token original para preservar a sessão no mobile
    const authHeader = head.get("authorization");
    let token = session?.session?.token;
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (!token) {
      token = head.get("x-better-auth-session-token") || undefined;
    }

    // Retorna a estrutura que o frontend espera (similar ao getSession)
    // Garantimos que o 'token' seja devolvido para que o mobile não perca a credencial ao atualizar o status
    return NextResponse.json({
      user: dbUser,
      session: {
        ...(session?.session || {}),
        userId: dbUser.id,
        token: token, 
      }
    });

  } catch (error) {
    console.error("[GET /api/novo/users/me] Error:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
