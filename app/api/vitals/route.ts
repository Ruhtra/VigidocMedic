import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

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
