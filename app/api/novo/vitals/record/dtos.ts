import { z } from "zod";

export const vitalRecordRequestSchema = z.object({
  systolic: z.number().nullable().optional(),
  diastolic: z.number().nullable().optional(),
  heartRate: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  oxygenSaturation: z.number().nullable().optional(),
  painLevel: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  recordedAt: z.string().optional().transform(val => val ? new Date(val) : new Date()),
});

export type VitalRecordRequestDTO = z.infer<typeof vitalRecordRequestSchema>;

export interface VitalRecordResponseDTO {
  id: string;
  userId: string;
  recordedAt: string;
  severity: string;
  vitals: {
    systolic: number | null;
    diastolic: number | null;
    heartRate: number | null;
    temperature: number | null;
    oxygenSaturation: number | null;
    painLevel: number | null;
    weight: number | null;
  };
  streak: {
    current: number;
    lastActiveAt: string | null;
  };
}
