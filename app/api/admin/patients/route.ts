import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPermision } from "@/lib/casl/utils/getUserPermission";

export async function GET(req: Request) {
  console.time("admin-patients:auth");
  // Try to get from headers first (injected by proxy/middleware)
  const headerUserId = (await headers()).get("x-user-id");
  const headerUserRole = (await headers()).get("x-user-role");

  let sessionData: { user: { id: string; role: string } } | null = null;

  if (headerUserId && headerUserRole) {
    sessionData = {
      user: {
        id: headerUserId,
        role: headerUserRole,
      },
    };
  } else {
    // Fallback if proxy didn't run or headers missing
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      sessionData = {
        user: {
          id: session.user.id,
          // @ts-ignore
          role: session.user.role || "user",
        },
      };
    }
  }
  console.timeEnd("admin-patients:auth");

  if (!sessionData) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const session = sessionData;

  try {
    const { cannot } = getUserPermision(session.user.id, session.user.role);
    if (
      cannot("get", {
        kind: "User",
        id: "ANY",
      }) &&
      session.user.role !== "admin"
    ) {
      // Basic protection (allowing only admin to view patients list or patients detail here unless specified by casl)
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

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

    console.time("admin-patients:query");
    const profiles = await prisma.patientProfile.findMany({
      where: whereProfile,
      take: 50, // Limita a 50 perfis por vez
      orderBy: { createdAt: "desc" },
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
    console.timeEnd("admin-patients:query");

    console.time("admin-patients:mapping");

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

    console.timeEnd("admin-patients:mapping");

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Erro ao buscar admin patients:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
