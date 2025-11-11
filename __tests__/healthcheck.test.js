import { describe, expect, it } from 'vitest';

import health from '../src/healthcheck.js';

describe('healthcheck', () => {
  it('returns an ok status with an ISO timestamp', () => {
    const result = health.getHealthStatus();
    expect(result.status).toBe('ok');
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});
