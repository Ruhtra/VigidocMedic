import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

/**
 * @swagger
 * /api/vitals:
 *   get:
 *     summary: Retrieve clinical vital signs records
 *     description: Returns a list of all vital sign records for the authenticated user.
 *     tags: [Vitals]
 *     responses:
 *       200:
 *         description: A list of vital records
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const vitals = await prisma.vitalRecord.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        recordedAt: "desc",
      },
    });

    return NextResponse.json(vitals);
  } catch (error) {
    console.error("Erro ao buscar vitals:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/vitals:
 *   post:
 *     summary: Create a new vital signs record
 *     description: Save a new set of clinical vital signs for the authenticated user.
 *     tags: [Vitals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               systolic: { type: number, example: 120 }
 *               diastolic: { type: number, example: 80 }
 *               heart_rate: { type: number, example: 70 }
 *               temperature: { type: number, example: 36.5 }
 *               oxygen_saturation: { type: number, example: 98 }
 *               weight: { type: number, example: 75.0 }
 *               pain_level: { type: number, example: 0 }
 *               notes: { type: string, example: "Feeling good" }
 *               recorded_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Vital record created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const body = await req.json();

    // Assegura que recordedAt é uma Data válida, ou usa a atual
    const recordedAt = body.recorded_at
      ? new Date(body.recorded_at)
      : new Date();

    const vital = await prisma.vitalRecord.create({
      data: {
        userId: user.id,
        recordedAt,
        systolic: body.systolic ?? null,
        diastolic: body.diastolic ?? null,
        heartRate: body.heart_rate ?? null,
        temperature: body.temperature ?? null,
        oxygenSaturation: body.oxygen_saturation ?? null,
        weight: body.weight ?? null,
        painLevel: body.pain_level ?? null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(vital, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar vital record:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
