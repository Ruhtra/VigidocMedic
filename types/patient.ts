// types/patient.ts
// Tipos centrais para a feature de listagem de pacientes

/** Status de um sinal vital */
export type VitalStatus = 'normal' | 'warning' | 'critical';

/** Valor individual de um sinal vital */
export interface VitalValue {
  label: string;
  value: number | string;
  unit: string;
  status: VitalStatus;
}

/** Sessão de registro (último registro ou item do histórico) */
export interface RecordSession {
  date: string; // ISO date string
  heartRate: VitalValue;
  bloodPressure: VitalValue;
  oxygenSaturation: VitalValue;
  temperature: VitalValue;
  weight: VitalValue;
  pain: VitalValue;
}

/** Paciente completo */
export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  avatarUrl: string | null;
  lastRecord: RecordSession;
  dailyHistory: RecordSession[];
}
