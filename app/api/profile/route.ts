import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/casl/utils/getUserPermission";

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Retrieve patient profile
 *     description: Returns the detailed profile of the authenticated patient.
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile details
 *       401:
 *         description: Not authenticated
 */
export async function GET(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const profile = await prisma.patientProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!profile) {
      // Retorna vazio ou cria um perfil default
      return NextResponse.json({
        userId: user.id,
        phone: null,
      });
    }

    return NextResponse.json({
      userId: profile.userId,
      birthDate: profile.birthDate,
      phone: profile.phone,
      emergencyContact: profile.emergencyContact,
      medicalNotes: profile.medicalNotes,
    });
  } catch (error) {
    console.error("Erro ao buscar profile:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update patient profile
 *     description: Update or create the profile for the authenticated patient.
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone: { type: string, example: "+55 11 99999-9999" }
 *               birthDate: { type: string, format: date, example: "1990-01-01" }
 *               medicalNotes: { type: string, example: "No allergies" }
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Not authenticated
 */
export async function PUT(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  try {
    const body = await req.json();

    const profile = await prisma.patientProfile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        phone: body.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        medicalNotes: body.medicalNotes,
      },
      create: {
        userId: user.id,
        phone: body.phone,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        medicalNotes: body.medicalNotes,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao atualizar profile:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
