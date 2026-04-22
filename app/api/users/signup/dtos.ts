import { z } from "zod";

export const signupRequestSchema = z.object({
  name: z.string().min(2, "Nome deve possuir no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve possuir no mínimo 8 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().optional(),
  birthDate: z.string().optional(), // Esperado no formato DD/MM/YYYY
});

export type SignupRequestDTO = z.infer<typeof signupRequestSchema>;

export const mapSignupToResponseDTO = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  role: user.role,
  createdAt: user.createdAt,
});
