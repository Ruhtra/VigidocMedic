// hooks/usePatients.ts
// Hook customizado para buscar lista de pacientes via TanStack Query

import { useQuery } from '@tanstack/react-query';
import { patientsData } from '@/data/mockPatients';
import type { Patient } from '@/types/patient';

/**
 * Simula uma chamada de API com latência de 500ms.
 * Futuramente será substituída por uma chamada real.
 */
const fetchPatients = (): Promise<Patient[]> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(patientsData), 500);
  });

/**
 * Hook para buscar e cachear a lista de pacientes.
 * Expõe data, isLoading, isError, error e refetch.
 */
export const usePatients = () =>
  useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });
