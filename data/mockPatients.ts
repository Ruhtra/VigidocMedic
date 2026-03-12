// data/mockPatients.ts
// Dados mockados de pacientes gerados com Faker.js (seed fixa para consistência)

import { faker } from '@faker-js/faker/locale/pt_BR';
import type {
  Patient,
  RecordSession,
  VitalValue,
  VitalStatus,
} from '@/types/patient';

// Seed fixa para resultados determinísticos entre reloads
faker.seed(42);

/* ==========================================================================
   HELPERS – geração de sinais vitais realistas
   ========================================================================== */

/** Determina status com base em valor e faixas de referência */
function resolveStatus(
  value: number,
  normalRange: [number, number],
  warningRange: [number, number],
): VitalStatus {
  if (value >= normalRange[0] && value <= normalRange[1]) return 'normal';
  if (value >= warningRange[0] && value <= warningRange[1]) return 'warning';
  return 'critical';
}

function generateHeartRate(): VitalValue {
  const value = faker.number.int({ min: 45, max: 140 });
  return {
    label: 'FC',
    value,
    unit: 'bpm',
    status: resolveStatus(value, [60, 100], [50, 120]),
  };
}

function generateBloodPressure(): VitalValue {
  const systolic = faker.number.int({ min: 90, max: 180 });
  const diastolic = faker.number.int({ min: 60, max: 110 });
  return {
    label: 'PA',
    value: `${systolic}/${diastolic}`,
    unit: 'mmHg',
    status: resolveStatus(systolic, [90, 130], [80, 150]),
  };
}

function generateOxygenSaturation(): VitalValue {
  const value = faker.number.int({ min: 85, max: 100 });
  return {
    label: 'SpO2',
    value,
    unit: '%',
    status: resolveStatus(value, [95, 100], [90, 94]),
  };
}

function generateTemperature(): VitalValue {
  const value = parseFloat(
    faker.number.float({ min: 35.0, max: 40.5, fractionDigits: 1 }).toFixed(1),
  );
  return {
    label: 'Temp',
    value,
    unit: '°C',
    status: resolveStatus(value, [36.0, 37.5], [35.5, 38.5]),
  };
}

function generateWeight(): VitalValue {
  const value = parseFloat(
    faker.number.float({ min: 45.0, max: 120.0, fractionDigits: 1 }).toFixed(1),
  );
  return {
    label: 'Peso',
    value,
    unit: 'kg',
    status: 'normal',
  };
}

function generatePain(): VitalValue {
  const value = faker.number.int({ min: 0, max: 10 });
  return {
    label: 'Dor',
    value,
    unit: '/10',
    status: resolveStatus(value, [0, 3], [4, 6]),
  };
}

/** Gera uma sessão de registro completa */
function generateSession(date: Date): RecordSession {
  return {
    date: date.toISOString(),
    heartRate: generateHeartRate(),
    bloodPressure: generateBloodPressure(),
    oxygenSaturation: generateOxygenSaturation(),
    temperature: generateTemperature(),
    weight: generateWeight(),
    pain: generatePain(),
  };
}

/* ==========================================================================
   GERAÇÃO DOS PACIENTES
   ========================================================================== */

function generatePatient(): Patient {
  const historyCount = faker.number.int({ min: 0, max: 5 });
  const today = new Date();

  // Gera histórico diário com datas retroativas
  const dailyHistory: RecordSession[] = Array.from(
    { length: historyCount },
    (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (i + 1));
      return generateSession(date);
    },
  );

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 92 }),
    phone: faker.phone.number({ style: 'national' }),
    avatarUrl: null, // sem avatar externo; usaremos iniciais
    lastRecord: generateSession(today),
    dailyHistory,
  };
}

/** Lista de 8 pacientes mockados */
export const patientsData: Patient[] = Array.from({ length: 8 }, generatePatient);
