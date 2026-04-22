import { z } from "zod";

export const signupDoctorRequestSchema = z.object({
  name: z.string().min(2, "Nome deve possuir no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve possuir no mínimo 8 caracteres"),
});

export type SignupDoctorRequestDTO = z.infer<typeof signupDoctorRequestSchema>;

export const mapDoctorSignupToResponseDTO = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  role: user.role,
  createdAt: user.createdAt,
});
