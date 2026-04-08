import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Update reminder status
 *     description: Enable or disable a specific reminder.
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled: { type: boolean }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated successfully
 * 
 *   delete:
 *     summary: Delete a reminder
 *     description: Remove a reminder from the user's schedule.
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted successfully
 */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const resolvedParams = await params;
    const body = await req.json();

    const reminder = await prisma.reminder.updateMany({
      where: {
        id: resolvedParams.id,
        userId: user.id, // assegura segurança
      },
      data: {
        enabled: body.enabled,
      },
    });

    if (reminder.count === 0) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar reminder:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const resolvedParams = await params;

    // Verifica primeiro se pertence ao usuário ou deleta direto via where duplo
    const reminder = await prisma.reminder.deleteMany({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    if (reminder.count === 0) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar reminder:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
