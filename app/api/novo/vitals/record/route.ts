import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { vitalRecordRequestSchema } from "./dtos";
import {
  resolveHeartRate,
  resolveO2Saturation,
  resolveTemperature,
  resolveSystolicPressure,
  resolvePain,
} from "@/lib/utils/vitals";

/**
 * @swagger
 * /api/novo/vitals/record:
 *   post:
 *     summary: Submit a new vital signs record
 *     description: Saves a full set of vital signs (BP, HR, Temp, O2, Pain, Weight) and updates user streak.
 *     tags: [Vitals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               systolic: { type: integer }
 *               diastolic: { type: integer }
 *               heartRate: { type: integer }
 *               temperature: { type: number }
 *               oxygenSaturation: { type: integer }
 *               painLevel: { type: integer }
 *               weight: { type: number }
 *               notes: { type: string }
 *               recordedAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Record saved successfully
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { user } = authContext;

  try {
    const body = await req.json();
    const validation = vitalRecordRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // 1. Calcular Severidade (MEWS Logic)
    const severities = [
      resolveSystolicPressure(data.systolic),
      resolveHeartRate(data.heartRate),
      resolveTemperature(data.temperature),
      resolveO2Saturation(data.oxygenSaturation),
      resolvePain(data.painLevel),
    ];

    let overallSeverity: "NORMAL" | "ALERT" | "CRITICAL" = "NORMAL";
    if (severities.includes("critical")) overallSeverity = "CRITICAL";
    else if (severities.includes("alert")) overallSeverity = "ALERT";
    else if (severities.includes("warning")) overallSeverity = "ALERT"; // Mapeia warning para Alert no DB

    // 2. Atualizar Streak (Ofensiva)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var userDb = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userDb) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const lastActive = userDb?.lastActiveAt
      ? new Date(userDb.lastActiveAt)
      : null;
    let newStreak = userDb?.currentStreak || 0;

    if (!lastActive) {
      newStreak = 1;
    } else {
      const lastActiveDay = new Date(
        lastActive.getFullYear(),
        lastActive.getMonth(),
        lastActive.getDate(),
      );
      const diffTime = today.getTime() - lastActiveDay.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Ativo ontem, incrementa
        newStreak += 1;
      } else if (diffDays > 1) {
        // Pulou um dia, reseta
        newStreak = 1;
      }
      // Se diffDays === 0 (já ativo hoje), mantém o streak
    }

    // 3. Salvar no Banco
    const [record] = await prisma.$transaction([
      prisma.vitalRecord.create({
        data: {
          userId: user.id,
          recordedAt: data.recordedAt,
          systolic: data.systolic,
          diastolic: data.diastolic,
          heartRate: data.heartRate,
          temperature: data.temperature,
          oxygenSaturation: data.oxygenSaturation,
          painLevel: data.painLevel,
          weight: data.weight,
          notes: data.notes,
          severity: overallSeverity,
          source: "MANUAL",
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          currentStreak: newStreak,
          lastActiveAt: now,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Registro finalizado com sucesso.",
        data: {
          id: record.id,
          severity: record.severity,
          streak: {
            current: newStreak,
            lastActiveAt: now.toISOString(),
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/novo/vitals/record] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar registro." },
      { status: 500 },
    );
  }
}
