import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

/**
 * @swagger
 * /api/shared-reports:
 *   get:
 *     summary: List patient's shared reports
 *     description: Retrieve all reports created by the user to be shared with external doctors.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 * 
 *   post:
 *     summary: Create a new shared report
 *     description: Generate a new shareable report with specific permissions.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [share_code, title]
 *             properties:
 *               share_code: { type: string, example: "ABC-123" }
 *               title: { type: string, example: "Relatório Mensal" }
 *               include_blood_pressure: { type: boolean }
 *               include_heart_rate: { type: boolean }
 *               include_temperature: { type: boolean }
 *               include_oxygen: { type: boolean }
 *               include_weight: { type: boolean }
 *               include_pain: { type: boolean }
 *               include_profile: { type: boolean }
 *               date_from: { type: string, format: date }
 *               date_to: { type: string, format: date }
 *               expires_at: { type: string, format: date-time }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Report created successfully
 */

export async function GET(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const reports = await prisma.sharedReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    const mapped = reports.map((r) => ({
      id: r.id,
      share_code: r.shareCode,
      title: r.title,
      include_blood_pressure: r.includeBloodPressure,
      include_heart_rate: r.includeHeartRate,
      include_temperature: r.includeTemperature,
      include_oxygen: r.includeOxygen,
      include_weight: r.includeWeight,
      include_pain: r.includePain,
      include_profile: r.includeProfile,
      date_from: r.dateFrom,
      date_to: r.dateTo,
      expires_at: r.expiresAt,
      views_count: r.viewsCount,
      is_active: r.isActive,
      created_at: r.createdAt,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const body = await req.json();
    const report = await prisma.sharedReport.create({
      data: {
        userId: user.id,
        shareCode: body.share_code,
        title: body.title,
        includeBloodPressure: body.include_blood_pressure,
        includeHeartRate: body.include_heart_rate,
        includeTemperature: body.include_temperature,
        includeOxygen: body.include_oxygen,
        includeWeight: body.include_weight,
        includePain: body.include_pain,
        includeProfile: body.include_profile,
        dateFrom: body.date_from ? new Date(body.date_from) : null,
        dateTo: body.date_to ? new Date(body.date_to) : null,
        expiresAt: body.expires_at ? new Date(body.expires_at) : null,
      },
    });
    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
