import { beforeEach, describe, expect, it } from 'vitest';
import { resetReportedErrors, shouldReport } from '@/api/errorReporter';

describe('shouldReport', () => {
  beforeEach(() => resetReportedErrors());

  it('reports a key the first time it is seen', () => {
    expect(shouldReport('invoke:roku_keypress|dead', 0)).toBe(true);
  });

  it('suppresses a repeat inside the dedupe window', () => {
    shouldReport('invoke:roku_keypress|dead', 0);
    expect(shouldReport('invoke:roku_keypress|dead', 29_999)).toBe(false);
  });

  it('reports again once the window has passed', () => {
    shouldReport('invoke:roku_keypress|dead', 0);
    expect(shouldReport('invoke:roku_keypress|dead', 30_000)).toBe(true);
  });

  it('tracks distinct keys independently', () => {
    shouldReport('invoke:roku_keypress|dead', 0);
    expect(shouldReport('invoke:roku_launch|dead', 0)).toBe(true);
  });

  it('restarts the window from the most recent report, not the first', () => {
    shouldReport('k', 0);
    shouldReport('k', 30_000);
    expect(shouldReport('k', 45_000)).toBe(false);
  });
});
