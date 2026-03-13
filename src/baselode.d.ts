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

  export interface IntervalPoint {
    z: number;
    val: unknown;
    from: number;
    to: number;
    errorPlus: number;
    errorMinus: number;
  }

  export interface PlotConfig {
    data: unknown[];
    layout: unknown;
  }

  export interface HoleObject {
    id?: string;
    points: Record<string, unknown>[];
  }

  export function buildIntervalPoints(
    hole: HoleObject,
    property: string,
    isCategorical: boolean
  ): IntervalPoint[];

  export function buildPlotConfig(options: {
    points: IntervalPoint[];
    isCategorical: boolean;
    property: string;
    chartType: string;
    colourMap?: Record<string, string> | string | null;
    template?: unknown;
  }): PlotConfig;

  export function buildCategoricalStripLogConfig(
    rows: Record<string, unknown>[],
    options?: {
      fromCol?: string;
      toCol?: string;
      categoryCol?: string;
      colourMap?: Record<string, string> | string | null;
      template?: unknown;
    }
  ): PlotConfig;
}
