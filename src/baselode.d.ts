declare module 'baselode' {
  import type { JSX } from 'react';
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

  export interface TracePlotConfig {
    holeId?: string;
    property?: string;
    chartType?: string;
  }

  export type TracePlotHoleOption =
    | string
    | {
        holeId: string;
        label?: string;
      };

  export interface TracePlotGraph {
    hole?: HoleObject;
    points?: IntervalPoint[];
    isCategorical?: boolean;
    isComment?: boolean;
    displayType?: string;
    loading?: boolean;
  }

  export interface TracePlotProps {
    config?: TracePlotConfig;
    graph?: TracePlotGraph;
    holeOptions?: TracePlotHoleOption[];
    propertyOptions?: string[];
    onConfigChange?: (config: Partial<TracePlotConfig>) => void;
    template?: unknown;
  }

  export interface StripLogPlotProps {
    rows?: Record<string, unknown>[];
    holeId?: string;
    dataType?: string;
    property?: string;
    properties?: string[];
    defaultProperty?: string | null;
    chartType?: string;
    template?: unknown;
    colourMap?: Record<string, string> | string | null;
    mode?: 'plot' | 'plot+controls';
  }

  export interface StripLogControlsProps {
    property?: string;
    chartType?: string;
    properties?: string[];
    onPropertyChange?: (property: string) => void;
    onChartTypeChange?: (chartType: string) => void;
    displayType?: string;
    columnMeta?: Record<string, string>;
    className?: string;
  }

  export interface StripLogConfigResult {
    property: string;
    setProperty: (property: string) => void;
    chartType: string;
    setChartType: (chartType: string) => void;
    properties: string[];
    displayType: string;
    columnMeta: Record<string, string>;
    standardizedRows: Record<string, unknown>[];
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

  export function buildStripLogPlotConfig(options: {
    rows: Record<string, unknown>[];
    property: string;
    dataType?: string;
    chartType?: string;
    colourMap?: Record<string, string> | string | null;
    template?: unknown;
  }): PlotConfig;

  export function getDefaultPlotlyConfig(): Record<string, unknown>;

  export function TracePlot(props: TracePlotProps): JSX.Element;
  export function StripLogPlot(props: StripLogPlotProps): JSX.Element;
  export function StripLogControls(props: StripLogControlsProps): JSX.Element;
  export function useStripLogConfig(options?: {
    rows?: Record<string, unknown>[];
    holeId?: string;
    dataType?: string;
    defaultProperty?: string;
    properties?: string[];
  }): StripLogConfigResult;

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
