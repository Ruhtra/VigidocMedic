import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/doctor/patients:
 *   get:
 *     summary: "[Doctor] List all patients and their last vital signs"
 *     description: Retrieve a list of all patients with their profile data and the most recent vital record. Restricted to doctor roles.
 *     tags: [Doctor]
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *         description: Filter vitals from this date
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *         description: Filter vitals up to this date
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter by specific user ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Admin only)
 */

export async function GET(req: Request) {
  console.time("doctor-patients:auth");
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;
  if (
    cannot("get", {
      kind: "User",
      id: "ANY",
    }) &&
    user.role !== "admin"
  ) {
    // Basic protection (allowing only admin to view patients list or patients detail here unless specified by casl)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  console.timeEnd("doctor-patients:auth");

  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const filterUserId = searchParams.get("userId");

    const whereProfile: any = {};
    if (filterUserId) {
      whereProfile.userId = filterUserId;
    }

    const whereVitals: any = {};
    if (dateFrom) {
      whereVitals.recordedAt = { gte: new Date(dateFrom) };
    }
    if (dateTo) {
      whereVitals.recordedAt = {
        ...whereVitals.recordedAt,
        lte: new Date(`${dateTo}T23:59:59`),
      };
    }

    console.time("doctor-patients:query");
    const profiles = await prisma.patientProfile.findMany({
      where: whereProfile,
      take: 50, // Limita a 50 perfis por vez
      orderBy: { createdAt: "desc" },
      relationLoadStrategy: "join",
      select: {
        id: true,
        userId: true,
        phone: true,
        birthDate: true,
        emergencyContact: true,
        medicalNotes: true,
        user: {
          select: {
            name: true,
            vitalRecords: {
              where: whereVitals,
              orderBy: { recordedAt: "desc" },
              take: 1, // Pega apenas o último registro vital para o resumo
              select: {
                id: true,
                recordedAt: true,
                systolic: true,
                diastolic: true,
                heartRate: true,
                temperature: true,
                oxygenSaturation: true,
                weight: true,
                painLevel: true,
              },
            },
          },
        },
      },
    });
    console.timeEnd("doctor-patients:query");

    console.time("doctor-patients:mapping");

    const mapped = profiles.map((p) => ({
      id: p.id,
      user_id: p.userId,
      full_name: p.user.name,
      phone: p.phone,
      birth_date: p.birthDate,
      emergency_contact: p.emergencyContact,
      medical_notes: p.medicalNotes,
      vitals: p.user.vitalRecords.map((v) => ({
        id: v.id,
        recorded_at: v.recordedAt,
        systolic: v.systolic,
        diastolic: v.diastolic,
        heart_rate: v.heartRate,
        temperature: v.temperature,
        oxygen_saturation: v.oxygenSaturation,
        weight: v.weight,
        pain_level: v.painLevel,
      })),
    }));

    console.timeEnd("doctor-patients:mapping");

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Erro ao buscar doctor patients:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
