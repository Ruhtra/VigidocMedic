import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/novo/users/{id}/approve:
 *   post:
 *     summary: Approve a pending user
 *     description: Activates a user account with PENDING status. Only accessible by administrators.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to approve
 *     responses:
 *       200:
 *         description: User approved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Autenticação e Autorização (Apenas Administradores)
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Você precisa estar logado para acessar esta rota." },
      { status: 401 }
    );
  }

  // Verifica se a role é estritamente admin
  if (authContext.user.role !== "admin") {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administradores podem aprovar usuários." },
      { status: 403 }
    );
  }

  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário não fornecido." },
        { status: 400 }
      );
    }

    // 2. Verifica se o usuário existe e se o status é PENDING
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    if (targetUser.status === "ACTIVE") {
      return NextResponse.json(
        { message: "Usuário já está ativo." },
        { status: 200 }
      );
    }

    // 3. Atualiza o status para ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Usuário aprovado e acesso liberado com sucesso.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(`[POST /api/novo/users/[id]/approve] Error:`, error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao tentar aprovar o usuário." },
      { status: 500 }
    );
  }
}
