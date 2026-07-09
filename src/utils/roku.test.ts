import { describe, expect, it } from 'vitest';

import type { StreamingOption, WatchListItem } from '../types/watch';
import { accessNote, castableServices, ownsAddon, pickRokuDeepLink, requiresRental } from './roku';

const withOptions = (options: StreamingOption[]): WatchListItem => ({
  id: 'x',
  showType: 'series',
  status: 'watching',
  media: { id: 'x', showType: 'series', title: 'T', streamingOptions: options }
});

const option = (
  serviceId: string,
  roku?: StreamingOption['roku'],
  type = 'subscription',
  addon?: { id: string; name: string }
): StreamingOption => ({
  service: { id: serviceId, name: serviceId },
  type,
  addon,
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

  it('prefers the saved preferred service over a subscribed one', () => {
    const result = pickRokuDeepLink(
      withOptions([
        option('max', { app: 'max', channelId: '61322', contentId: 'a', mediaType: 'series' }),
        option('hulu', { app: 'hulu', channelId: '2285', contentId: 'b', mediaType: 'series' })
      ]),
      ['hulu'],
      'max'
    );
    expect(result?.app).toBe('max');
  });
});

describe('castableServices', () => {
  it('lists one entry per service that has a deep link', () => {
    const result = castableServices(
      withOptions([
        option('max', { app: 'max', channelId: '61322', contentId: 'a', mediaType: 'series' }),
        option('max', { app: 'max', channelId: '61322', contentId: 'a', mediaType: 'series' }),
        option('hulu', { app: 'hulu', channelId: '2285', contentId: 'b', mediaType: 'series' }),
        option('starz')
      ])
    );
    expect(result.map(r => r.service.id)).toEqual(['max', 'hulu']);
  });

  it('keeps the most accessible castable option per service', () => {
    const result = castableServices(
      withOptions([
        option('prime', { app: 'prime', channelId: '13', contentId: 'a', mediaType: 'movie' }, 'buy'),
        option('prime', { app: 'prime', channelId: '13', contentId: 'b', mediaType: 'movie' }, 'addon', {
          id: 'crunchyrollus',
          name: 'Crunchyroll'
        })
      ])
    );
    const [entry] = result;
    expect(result).toHaveLength(1);
    expect(entry?.type).toBe('addon'); // add-on is more accessible than buy
    expect(entry?.addon?.name).toBe('Crunchyroll');
  });
});

describe('accessNote', () => {
  it('flags a required add-on', () => {
    expect(accessNote({ type: 'addon', addon: { name: 'Crunchyroll' } })).toBe('Requires the Crunchyroll add-on');
  });

  it('flags a purchase', () => {
    expect(accessNote({ type: 'buy' })).toBe('Purchase required');
  });

  it('returns null when included in the base subscription', () => {
    expect(accessNote({ type: 'subscription' })).toBeNull();
  });
});

describe('ownsAddon', () => {
  const catalog = [
    { id: 'crunchyroll', name: 'Crunchyroll' },
    { id: 'hulu', name: 'Hulu' }
  ];

  it('matches a country-suffixed add-on id to a subscribed service by name', () => {
    expect(ownsAddon({ id: 'crunchyrollus', name: 'Crunchyroll' }, ['crunchyroll'], catalog)).toBe(true);
  });

  it('matches when the add-on id itself is subscribed', () => {
    expect(ownsAddon({ id: 'hulu', name: 'Hulu' }, ['hulu'], catalog)).toBe(true);
  });

  it('is false when the add-on service is not subscribed', () => {
    expect(ownsAddon({ id: 'crunchyrollus', name: 'Crunchyroll' }, ['hulu'], catalog)).toBe(false);
  });

  it('is false when there is no add-on', () => {
    expect(ownsAddon(undefined, ['crunchyroll'], catalog)).toBe(false);
  });
});

describe('requiresRental', () => {
  it('is true when every option is rent or buy', () => {
    expect(requiresRental(withOptions([option('apple', undefined, 'rent'), option('amazon', undefined, 'buy')]))).toBe(
      true
    );
  });

  it('is false when a subscription option exists', () => {
    expect(
      requiresRental(withOptions([option('apple', undefined, 'rent'), option('netflix', undefined, 'subscription')]))
    ).toBe(false);
  });

  it('is false when availability is unknown (no options)', () => {
    expect(requiresRental(withOptions([]))).toBe(false);
  });
});
