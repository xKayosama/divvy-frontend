import type { Group } from '../types';
export function parseStoredGroup(value: string | null): Group | null {
  if (!value) return null;
  try {
    const group: unknown = JSON.parse(value);
    if (
      typeof group === 'object' &&
      group !== null &&
      'id' in group &&
      typeof group.id === 'string' &&
      group.id.length > 0 &&
      'name' in group &&
      typeof group.name === 'string' &&
      'currency' in group &&
      typeof group.currency === 'string'
    )
      return group as Group;
  } catch {
    /* Ignore invalid or pre-JSON selections. */
  }
  return null;
}
export function getStoredGroup(
  storage: Pick<Storage, 'getItem'> = localStorage,
) {
  return (
    parseStoredGroup(storage.getItem('selectedGroup')) ??
    parseStoredGroup(storage.getItem('selectedHousehold'))
  );
}
export function storeGroup(
  group: Group,
  storage: Pick<Storage, 'setItem' | 'removeItem'> = localStorage,
) {
  storage.setItem('selectedGroup', JSON.stringify(group));
  storage.removeItem('selectedHousehold');
}
export function removeStoredGroup(
  storage: Pick<Storage, 'removeItem'> = localStorage,
) {
  storage.removeItem('selectedGroup');
  storage.removeItem('selectedHousehold');
}
