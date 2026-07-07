import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedDevice {
  id: string;
  name: string;
  ip: string;
}

interface DeviceState {
  devices: SavedDevice[];
  activeId: string | null;
  addDevice: (name: string, ip: string) => void;
  removeDevice: (id: string) => void;
  setActive: (id: string) => void;
}

// Saved Rokos live in localStorage (V0 has no SSDP discovery — the user adds by IP). The device id
// is just its IP, which is unique enough for a personal LAN.
export const useDeviceStore = create<DeviceState>()(
  persist(
    set => ({
      devices: [],
      activeId: null,
      addDevice: (name, ip) =>
        set(state => {
          const trimmedIp = ip.trim();
          const exists = state.devices.some(d => d.ip === trimmedIp);
          const devices = exists
            ? state.devices.map(d => (d.ip === trimmedIp ? { ...d, name } : d))
            : [...state.devices, { id: trimmedIp, name, ip: trimmedIp }];
          return { devices, activeId: state.activeId ?? trimmedIp };
        }),
      removeDevice: id =>
        set(state => ({
          devices: state.devices.filter(d => d.id !== id),
          activeId: state.activeId === id ? null : state.activeId
        })),
      setActive: id => set({ activeId: id })
    }),
    { name: 'watch-remote-devices' }
  )
);
