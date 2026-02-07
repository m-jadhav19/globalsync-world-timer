
export interface TimeZoneEntry {
  id: string;
  name: string;
  zoneName: string; // IANA Zone Name (e.g., 'America/New_York')
  city: string;
  country?: string;
}

export interface SearchResult {
  zoneName: string;
  city: string;
  country: string;
}

export enum TimeFormat {
  H12 = '12h',
  H24 = '24h'
}

export interface ClockState {
  now: Date;
  format: TimeFormat;
}
