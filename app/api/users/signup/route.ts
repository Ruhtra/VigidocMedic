import { NextResponse } from "next/server";
import { signupRequestSchema, mapSignupToResponseDTO } from "./dtos";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new patient/user
 *     description: Creates a new user record and an associated patient profile with PENDING status.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, cpf]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 example: "25/12/1990"
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
    console.log("[POST /api/users/signup] Request Body:", JSON.stringify(body, null, 2));

    const validationResult = signupRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("[POST /api/users/signup] Validation Error Details:", JSON.stringify(validationResult.error.format(), null, 2));
      return NextResponse.json(
        {
          error: "Campos de registro inválidos.",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { name, email, password, cpf, phone, birthDate } = validationResult.data;

    // 1. Verificar Duplicidades (Email e CPF)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.warn(`[POST /api/users/signup] Registration failed: Email ${email} already in use.`);
      return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 400 });
    }

    const existingCpf = await prisma.patientProfile.findUnique({ where: { cpf } });
    if (existingCpf) {
      console.warn(`[POST /api/users/signup] Registration failed: CPF ${cpf} already registered.`);
      return NextResponse.json({ error: "Este CPF já está cadastrado." }, { status: 400 });
    }

    // 2. Parse da Data de Nascimento (DD/MM/YYYY -> Date)
    let parsedBirthDate: Date | null = null;
    if (birthDate) {
      const parts = birthDate.split("/");
      if (parts.length === 3) {
        parsedBirthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
      }
    }

    // 3. Criar usuário via Better-Auth
    // Isso garante que a senha seja encriptada corretamente pelo fluxo padrão da lib.
    // Vai disparar o Hook de banco (lib/auth.ts) que cria o PatientProfile vazio.
    let betterAuthRes;
    try {
      betterAuthRes = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: req.headers
      });
    } catch (authError: any) {
      console.error("[POST /api/users/signup] Better-Auth Error:", authError);
      return NextResponse.json({ error: "Falha ao criar o usuário no serviço de autenticação." }, { status: 500 });
    }

    // Melhor prevenção para retornos diferentes do Better-Auth
    const createdUser = betterAuthRes?.user || (betterAuthRes as any)?.data?.user;
    
    if (!createdUser) {
      return NextResponse.json({ error: "Erro desconhecido ao obter o usuário criado." }, { status: 500 });
    }

    // 4. Atualizar o PatientProfile com os dados do Pré-Cadastro (Mobile Support)
    await prisma.patientProfile.upsert({
      where: { userId: createdUser.id },
      update: {
        cpf,
        phone,
        birthDate: parsedBirthDate,
      },
      create: {
        userId: createdUser.id,
        cpf,
        phone,
        birthDate: parsedBirthDate,
      }
    });

    // 5. Formatar o retorno
    const responseData = mapSignupToResponseDTO(createdUser);

    return NextResponse.json(
      {
        message: "Pré-cadastro realizado com sucesso. Aguardando aprovação.",
        user: responseData,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST /api/users/signup] Error:`, error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar o cadastro." },
      { status: 500 },
    );
  }
}
