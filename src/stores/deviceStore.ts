import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deleteDevice as apiDeleteDevice, getDevices as apiGetDevices, saveDevice as apiSaveDevice } from '@/api/watchApi';

export interface SavedDevice {
  id: string;
  name: string;
  ip: string;
  model?: string;
  // Pinned shortcut ids for this device (Roku channelIds or tvinput.* input ids).
  pinnedShortcuts?: string[];
}

interface DeviceState {
  devices: SavedDevice[];
  activeId: string | null;
  addDevice: (name: string, ip: string) => void;
  removeDevice: (id: string) => void;
  setActive: (id: string) => void;
  togglePin: (deviceId: string, shortcutId: string) => void;
  syncFromBackend: () => Promise<void>;
}

// Saved Rokos are cached in localStorage AND synced to the user's account (brainerd-api
// `/watch/devices`) so a device added on one client appears on the others. The active
// device stays per-client (which TV you're controlling right now). The device id is its IP.
export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      devices: [],
      activeId: null,

      addDevice: (name, ip) => {
        const trimmedIp = ip.trim();
        const trimmedName = name.trim() || trimmedIp;
        const state = get();
        const exists = state.devices.some(d => d.ip === trimmedIp);
        const devices = exists
          ? state.devices.map(d => (d.ip === trimmedIp ? { ...d, name: trimmedName } : d))
          : [...state.devices, { id: trimmedIp, name: trimmedName, ip: trimmedIp, pinnedShortcuts: [] }];
        set({ devices, activeId: state.activeId ?? trimmedIp });
        const device = devices.find(d => d.id === trimmedIp);
        if (device) void apiSaveDevice(device).catch(() => {});
      },

      removeDevice: id => {
        set(state => ({
          devices: state.devices.filter(d => d.id !== id),
          activeId: state.activeId === id ? null : state.activeId
        }));
        void apiDeleteDevice(id).catch(() => {});
      },

      setActive: id => set({ activeId: id }),

      togglePin: (deviceId, shortcutId) => {
        const devices = get().devices.map(d => {
          if (d.id !== deviceId) return d;
          const pins = d.pinnedShortcuts ?? [];
          const pinnedShortcuts = pins.includes(shortcutId)
            ? pins.filter(s => s !== shortcutId)
            : [...pins, shortcutId];
          return { ...d, pinnedShortcuts };
        });
        set({ devices });
        const device = devices.find(d => d.id === deviceId);
        if (device) void apiSaveDevice(device).catch(() => {});
      },

      syncFromBackend: async () => {
        try {
          const remote = await apiGetDevices();
          const merged: SavedDevice[] = remote.map(r => ({
            id: r.id,
            name: r.name,
            ip: r.ip,
            model: r.model,
            pinnedShortcuts: r.pinnedShortcuts ?? []
          }));
          // Push up any local-only devices (e.g. added while offline) so they persist too.
          const remoteIds = new Set(merged.map(d => d.id));
          for (const local of get().devices) {
            if (!remoteIds.has(local.id)) {
              merged.push(local);
              void apiSaveDevice(local).catch(() => {});
            }
          }
          const currentActive = get().activeId;
          const activeId = currentActive && merged.some(d => d.id === currentActive) ? currentActive : merged[0]?.id ?? null;
          set({ devices: merged, activeId });
        } catch {
          // Offline or not signed in — keep the local cache.
        }
      }
    }),
    { name: 'rimokon-miru-devices' }
  )
);
