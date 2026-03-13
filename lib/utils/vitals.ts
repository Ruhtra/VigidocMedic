import type { VitalStatus } from '@/types/patient';

/**
 * Helper para resolver status baseando-se em intervalo.
 */
export function resolveStatus(
  value: number | null | undefined,
  normalRange: [number, number],
  warningRange: [number, number]
): VitalStatus {
  if (value === null || value === undefined) return 'normal'; // fallback seguro

  if (value >= normalRange[0] && value <= normalRange[1]) return 'normal';
  if (value >= warningRange[0] && value <= warningRange[1]) return 'warning';
  
  return 'critical';
}
