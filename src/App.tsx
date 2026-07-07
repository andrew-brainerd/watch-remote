import { useDeviceStore } from '@/stores/deviceStore';
import { DeviceBar } from '@/components/DeviceBar';
import { Remote } from '@/components/Remote';
import { rokuLaunch } from '@/api/ipc';

interface CastExample {
  title: string;
  service: string;
  channelId: string;
  contentId: string;
  mediaType: string;
}

// On-device deep-link tests (V0) — both CONFIRMED on a real Roku (watch-roku R-C): Hulu (GUID) and
// Crunchyroll (the web series id works directly as the Roku contentId).
const CAST_TESTS: CastExample[] = [
  {
    title: 'Desperate Housewives',
    service: 'Hulu',
    channelId: '2285',
    contentId: '38846006-4365-4005-9ec2-64b910b5d683',
    mediaType: 'series'
  },
  {
    title: 'DARLING in the FRANXX',
    service: 'Crunchyroll',
    channelId: '2595',
    contentId: 'GY8VEQ95Y',
    mediaType: 'series'
  }
];

export const App = () => {
  const { devices, activeId } = useDeviceStore();
  const active = devices.find(d => d.id === activeId);

  const cast = (example: CastExample) => {
    if (!active) return;
    rokuLaunch(active.ip, example.channelId, example.contentId, example.mediaType).catch(() => {});
  };

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-4">
      <header className="pt-2">
        <h1 className="text-lg font-semibold text-neutral-100">Watch Remote</h1>
        <p className="text-xs text-neutral-500">V0 · saved-device Roku control</p>
      </header>

      <DeviceBar />

      {active ? (
        <>
          <div className="flex flex-col gap-2">
            {CAST_TESTS.map(example => (
              <button
                key={example.title}
                type="button"
                onClick={() => cast(example)}
                className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                Cast &ldquo;{example.title}&rdquo; → {example.service}
              </button>
            ))}
          </div>
          <Remote ip={active.ip} />
        </>
      ) : (
        <p className="rounded-xl border border-line bg-panel p-4 text-center text-sm text-neutral-500">
          Add your Roku&apos;s IP above to start controlling it.
        </p>
      )}
    </div>
  );
};
