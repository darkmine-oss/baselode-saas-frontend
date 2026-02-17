declare module 'baselode' {
  export const HOLE_ID: string;
  export const LATITUDE: string;
  export const LONGITUDE: string;
  export const ELEVATION: string;
  export const AZIMUTH: string;
  export const DIP: string;
  export const FROM: string;
  export const TO: string;
  export const MID: string;
  export const PROJECT_ID: string;
  export const EASTING: string;
  export const NORTHING: string;
  export const CRS: string;
  export const DEPTH: string;

  export function standardizeColumns(row: Record<string, unknown>): Record<string, unknown>;
}
