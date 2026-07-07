import { invoke } from '@tauri-apps/api/core';

export interface RokuDeviceInfo {
  name: string;
  model: string;
  is_tv: boolean;
  power_on: boolean;
}

export interface RokuApp {
  id: string;
  name: string;
}

// Cast (or plain-launch) an app. Pass contentId + mediaType to deep-link into a title.
export const rokuLaunch = (ip: string, channelId: string, contentId?: string, mediaType?: string): Promise<void> =>
  invoke('roku_launch', { ip, channelId, contentId, mediaType });

export const rokuInstall = (ip: string, channelId: string): Promise<void> =>
  invoke('roku_install', { ip, channelId });

export const rokuKeypress = (ip: string, key: string): Promise<void> => invoke('roku_keypress', { ip, key });

export const rokuType = (ip: string, text: string): Promise<void> => invoke('roku_type', { ip, text });

export const rokuDeviceInfo = (ip: string): Promise<RokuDeviceInfo> => invoke('roku_device_info', { ip });

export const rokuApps = (ip: string): Promise<RokuApp[]> => invoke('roku_apps', { ip });
