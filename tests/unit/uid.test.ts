import { describe, it, expect } from 'vitest';
import { getCanonicalUid } from '../../server/lib/uid.js';

describe('getCanonicalUid', () => {
  it('passes through firebaseUid if provided', () => {
    const uid = getCanonicalUid({ firebaseUid: 'abc123' });
    expect(uid).toBe('abc123');
  });

  it('generates deterministic emp_ hash for employeeId', () => {
    const uid1 = getCanonicalUid({ employeeId: 'EMP001' });
    const uid2 = getCanonicalUid({ employeeId: 'EMP001' });
    expect(uid1).toBe(uid2);
    expect(uid1).toMatch(/^emp_/);
  });

  it('generates different hashes for different employeeIds', () => {
    const uid1 = getCanonicalUid({ employeeId: 'EMP001' });
    const uid2 = getCanonicalUid({ employeeId: 'EMP002' });
    expect(uid1).not.toBe(uid2);
  });

  it('prefers firebaseUid over employeeId', () => {
    const uid = getCanonicalUid({ firebaseUid: 'fire_abc', employeeId: 'EMP001' });
    expect(uid).toBe('fire_abc');
  });

  it('throws if neither argument is provided', () => {
    expect(() => getCanonicalUid({})).toThrow('Cannot generate canonical UID');
  });
});
