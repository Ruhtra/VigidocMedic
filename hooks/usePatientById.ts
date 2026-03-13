// hooks/usePatientById.ts
// Hook para buscar um paciente específico por ID via TanStack Query

import { useQuery } from '@tanstack/react-query';
import { patientsData } from '@/data/mockPatients';
import type { Patient } from '@/types/patient';

/**
 * Simula busca de paciente por ID com latência de 300ms.
 * Futuramente será substituída por chamada real à API.
 */
const fetchPatientById = (id: string): Promise<Patient | null> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const patient = patientsData.find((p) => p.id === id) ?? null;
      resolve(patient);
    }, 300);
  });

/**
 * Hook para buscar e cachear um paciente por ID.
 * Expõe data, isLoading, isError, error e refetch.
 */
export const usePatientById = (id: string) =>
  useQuery<Patient | null>({
    queryKey: ['patient', id],
    queryFn: () => fetchPatientById(id),
    enabled: !!id,
  });
