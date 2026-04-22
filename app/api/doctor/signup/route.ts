import { NextResponse } from "next/server";
import {
  signupDoctorRequestSchema,
  mapDoctorSignupToResponseDTO,
} from "./dtos";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @swagger
 * /api/doctor/signup:
 *   post:
 *     summary: Register a new doctor
 *     description: Creates a new user record with role 'doctor'. The doctor profile is auto-created with a pending CRM via database hook.
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pre-registration successful, awaiting approval
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(
      "[POST /api/doctor/signup] Request Body:",
      JSON.stringify(body, null, 2),
    );

    const validationResult = signupDoctorRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "[POST /api/doctor/signup] Validation Error Details:",
        JSON.stringify(validationResult.error.format(), null, 2),
      );
      return NextResponse.json(
        {
          error: "Campos de registro inválidos.",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validationResult.data;

    // 1. Verificar Duplicidades (Email)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.warn(
        `[POST /api/doctor/signup] Registration failed: Email ${email} already in use.`,
      );
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 400 },
      );
    }

    // 2. Criar usuário médico via Better-Auth
    // O hook de database em lib/auth.ts criará o DoctorProfile vazio.
    let betterAuthRes;
    try {
      betterAuthRes = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          role: "doctor", // Define o papel corretamente aqui
        },
        headers: req.headers,
      });
    } catch (authError: any) {
      console.error("[POST /api/doctor/signup] Better-Auth Error:", authError);
      return NextResponse.json(
        { error: "Falha ao criar o médico no serviço de autenticação." },
        { status: 500 },
      );
    }

    const createdUser =
      betterAuthRes?.user || (betterAuthRes as any)?.data?.user;

    if (!createdUser) {
      return NextResponse.json(
        { error: "Erro desconhecido ao obter o médico criado." },
        { status: 500 },
      );
    }

    // 3. Formatar o retorno
    const responseData = mapDoctorSignupToResponseDTO(createdUser);

    return NextResponse.json(
      {
        message:
          "Pré-cadastro de médico realizado com sucesso. Aguardando aprovação.",
        user: responseData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(`[POST /api/doctor/signup] Error:`, error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar o cadastro." },
      { status: 500 },
    );
  }
}
