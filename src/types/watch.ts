// Subset of the brainerd-api /watch response shapes the app needs (mirrors src/types/watch.ts there).
export type WatchStatus = 'watchlist' | 'watching' | 'completed' | 'dropped';
export type ShowType = 'movie' | 'series';

export interface RokuDeepLink {
  app: string;
  channelId?: string;
  contentId: string;
  mediaType: string;
}

export interface StreamingServiceRef {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface StreamingOption {
  service: StreamingServiceRef;
  type: string;
  link: string;
  price?: { formatted: string };
  roku?: RokuDeepLink;
}

export interface WatchMedia {
  id: string;
  showType: ShowType;
  title: string;
  year?: number;
  poster?: string;
  streamingOptions: StreamingOption[];
}

export interface WatchListItem {
  id: string;
  showType: ShowType;
  status: WatchStatus;
  media?: WatchMedia;
}

export interface WatchSettings {
  country: string;
  services: string[];
}

export interface WatchListResponse {
  items: WatchListItem[];
  settings: WatchSettings;
}
