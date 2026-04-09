import { z } from "zod";
import { VitalRecord } from "@/prisma/generated/client";

// DTO de Entrada - Validando os Parâmetros da Requisição
export const vitalsHistoryRequestSchema = z.object({
  days: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 90; // Default: 90 dias
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed <= 0 ? 90 : parsed;
    }),
});

// Tipos baseados nos esquemas
export type VitalsHistoryRequestDTO = z.infer<typeof vitalsHistoryRequestSchema>;

// DTO de Saída - Mapeamento da Resposta
export interface VitalRecordResponseDTO {
  id: string;
  recordedAt: string; // ISO 8601 string para o front-end
  vitals: {
    bloodPressure: string | null;  // Junta sistólica e diastólica, ex: "120/80"
    heartRate: number | null;
    temperature: number | null;
    oxygenSaturation: number | null;
    weight: number | null;
    painLevel: number | null;
  };
  notes: string | null;
}

// Mapper: transforma o resultado do Banco de Dados para o DTO de Saída
export function mapToVitalRecordResponseDTO(record: VitalRecord): VitalRecordResponseDTO {
  let bloodPressure = null;
  if (record.systolic !== null && record.diastolic !== null) {
    bloodPressure = `${record.systolic}/${record.diastolic}`;
  } else if (record.systolic !== null) {
    bloodPressure = `${record.systolic}`;
  } else if (record.diastolic !== null) {
    bloodPressure = `?/${record.diastolic}`;
  }

  return {
    id: record.id,
    recordedAt: record.recordedAt.toISOString(),
    vitals: {
      bloodPressure,
      heartRate: record.heartRate,
      temperature: record.temperature,
      oxygenSaturation: record.oxygenSaturation,
      weight: record.weight,
      painLevel: record.painLevel,
    },
    notes: record.notes,
  };
}
