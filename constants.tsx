
import { TimeZoneEntry } from './types';

export const INITIAL_ZONES: TimeZoneEntry[] = [
  { id: 'local', name: 'Local Time', zoneName: Intl.DateTimeFormat().resolvedOptions().timeZone, city: 'Current Location' },
  { id: 'utc', name: 'Universal Coordinated Time', zoneName: 'UTC', city: 'UTC' },
  { id: 'ny', name: 'Eastern Time', zoneName: 'America/New_York', city: 'New York' },
  { id: 'ldn', name: 'Greenwich Mean Time', zoneName: 'Europe/London', city: 'London' },
  { id: 'tk', name: 'Japan Standard Time', zoneName: 'Asia/Tokyo', city: 'Tokyo' }
];

// Fix: Property 'supportedValuesOf' does not exist on type 'typeof Intl'. 
// Use casting and provide a fallback list of common timezones for search suggestions in case the API is unavailable.
// @ts-ignore
export const MAJOR_TIMEZONES: string[] = (Intl as any).supportedValuesOf 
  ? (Intl as any).supportedValuesOf('timeZone') 
  : [
      'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
      'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota',
      'America/Chicago', 'America/Denver', 'America/Halifax', 'America/Los_Angeles',
      'America/Mexico_City', 'America/New_York', 'America/Phoenix', 'America/Sao_Paulo',
      'Asia/Bangkok', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Istanbul', 'Asia/Jakarta',
      'Asia/Jerusalem', 'Asia/Kolkata', 'Asia/Manila', 'Asia/Riyadh', 'Asia/Seoul',
      'Asia/Shanghai', 'Asia/Singapore', 'Asia/Taipei', 'Asia/Tokyo', 'Australia/Adelaide',
      'Australia/Brisbane', 'Australia/Darwin', 'Australia/Melbourne', 'Australia/Perth',
      'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Berlin', 'Europe/Brussels',
      'Europe/Budapest', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Helsinki',
      'Europe/Lisbon', 'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Oslo',
      'Europe/Paris', 'Europe/Prague', 'Europe/Rome', 'Europe/Stockholm', 'Europe/Vienna',
      'Europe/Warsaw', 'Europe/Zurich', 'Pacific/Auckland', 'Pacific/Guam', 'Pacific/Honolulu', 'UTC'
    ];
