import { describe, expect, it } from 'vitest';
import { normalizeInvitationCode } from './auth-helpers.js';

describe('normalizeInvitationCode', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeInvitationCode('  creator2026  ')).toBe('CREATOR2026');
  });

  it('uppercases mixed-case input', () => {
    expect(normalizeInvitationCode('Vip-2026')).toBe('VIP-2026');
  });

  it('returns empty string for non-string values', () => {
    expect(normalizeInvitationCode(undefined)).toBe('');
    expect(normalizeInvitationCode(null)).toBe('');
  });
});
