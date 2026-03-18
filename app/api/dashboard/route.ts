import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

export async function GET(_req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    // Busca tudo em paralelo para minimizar latência (1 round-trip ao DB ao invés de 3)
    const [profile, vitals, reminders] = await Promise.all([
      prisma.patientProfile.findUnique({
        where: { userId: user.id },
      }),
      prisma.vitalRecord.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        take: 30,
      }),
      prisma.reminder.findMany({
        where: { userId: user.id },
        orderBy: { time: "asc" },
      }),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        // name: session.user.name,
        // email: session.user.email,
        role: (user as any).role ?? "user",
      },
      profile: profile
        ? {
            userId: profile.userId,
            birthDate: profile.birthDate,
            phone: profile.phone,
            emergencyContact: profile.emergencyContact,
            medicalNotes: profile.medicalNotes,
          }
        : { userId: user.id, phone: null },
      vitals,
      reminders,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
