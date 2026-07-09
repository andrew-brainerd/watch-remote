import { describe, expect, it } from 'vitest';

import type { StreamingOption, WatchListItem } from '../types/watch';
import { pickRokuDeepLink } from './roku';

const withOptions = (options: StreamingOption[]): WatchListItem => ({
  id: 'x',
  showType: 'series',
  status: 'watching',
  media: { id: 'x', showType: 'series', title: 'T', streamingOptions: options }
});

const option = (serviceId: string, roku?: StreamingOption['roku']): StreamingOption => ({
  service: { id: serviceId, name: serviceId },
  type: 'subscription',
  link: `https://${serviceId}.com`,
  roku
});

describe('pickRokuDeepLink', () => {
  it('prefers an option on a subscribed service', () => {
    const result = pickRokuDeepLink(
      withOptions([
        option('max', { app: 'max', channelId: '61322', contentId: 'a', mediaType: 'series' }),
        option('hulu', { app: 'hulu', channelId: '2285', contentId: 'b', mediaType: 'series' })
      ]),
      ['hulu']
    );
    expect(result?.app).toBe('hulu');
  });

  it('falls back to any deep link when none match the services', () => {
    const result = pickRokuDeepLink(
      withOptions([option('max', { app: 'max', channelId: '61322', contentId: 'a', mediaType: 'series' })]),
      ['netflix']
    );
    expect(result?.app).toBe('max');
  });

  it('returns undefined when no option has a deep link', () => {
    expect(pickRokuDeepLink(withOptions([option('starz')]), [])).toBeUndefined();
  });
});
