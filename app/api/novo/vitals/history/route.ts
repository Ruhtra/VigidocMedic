import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  vitalsHistoryRequestSchema,
  mapToVitalRecordResponseDTO,
} from "./dtos";
import { headers } from "next/headers";

/**
 * @swagger
 * /api/novo/vitals/history:
 *   get:
 *     summary: Get user vital signs history
 *     description: Returns a list of vital sign records for the authenticated user within a specified period.
 *     tags: [Vitals]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Number of days to include in the history
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  // 1. Autenticação e Autorização
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json(
      { error: "Você precisa estar logado para acessar esta rota." },
      { status: 401 },
    );
  }

  const { user } = authContext;

  try {
    // 2. Extração e Validação dos Parâmetros da Requisição (DTO de Entrada via Zod)
    const { searchParams } = new URL(req.url);
    const validationResult = vitalsHistoryRequestSchema.safeParse({
      days: searchParams.get("days") || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Parâmetros de busca inválidos.",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { days } = validationResult.data;

    // Calcula a data de corte baseada na quantidade de dias
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - days);

    // 3. Busca de Dados via Prisma
    const rawVitals = await prisma.vitalRecord.findMany({
      where: {
        userId: user.id,
        recordedAt: {
          gte: cutOffDate, // Greater than or equal to: Pega do período de corte até hoje
        },
      },
      orderBy: {
        recordedAt: "desc", // Ordem decrescente, mais recentes primeiro
      },
    });

    // 4. Transformação/Mapeamento da Resposta (DTO de Saída)
    const formattedResponse = rawVitals.map(mapToVitalRecordResponseDTO);

    // 5. Retorna a resposta com CORS headers para mobile
    const response = NextResponse.json({
      period: {
        daysRequested: days,
        dateFrom: cutOffDate.toISOString(),
      },
      data: formattedResponse,
    });

    return response;
  } catch (error) {
    console.error(`[GET /api/novo/vitals/history] Error:`, error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao buscar o histórico de afeirições." },
      { status: 500 },
    );
  }
}
