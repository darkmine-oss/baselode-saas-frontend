import { useEffect, useRef, useState } from 'react';
// @ts-ignore – plotly.js-dist-min ships its own bundle without TS declarations
import Plotly from 'plotly.js-dist-min';
import { buildIntervalPoints, buildPlotConfig } from 'baselode';
import styles from './ChatDataTable.module.css';
import stripStyles from './StripLogChart.module.css';

export interface StripLogPayload {
  hole_id: string;
  data_type: 'assay' | 'geology' | string;
  rows: Record<string, unknown>[];
  properties: string[];
  default_property: string | null;
}

const NUMERIC_CHART_OPTIONS = [
  { value: 'bar', label: 'Bars' },
  { value: 'markers', label: 'Markers' },
  { value: 'markers+line', label: 'Markers + Line' },
  { value: 'line', label: 'Line' },
] as const;

function isStripLogPayload(payload: unknown): payload is StripLogPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'hole_id' in payload &&
    'rows' in payload &&
    Array.isArray((payload as StripLogPayload).rows) &&
    'properties' in payload &&
    Array.isArray((payload as StripLogPayload).properties)
  );
}

export { isStripLogPayload };

export function StripLogChart({ payload }: { payload: StripLogPayload }) {
  const isCategorical = payload.data_type === 'geology';

  const [selectedProperty, setSelectedProperty] = useState<string>(
    payload.default_property ?? payload.properties[0] ?? ''
  );
  const [chartType, setChartType] = useState<string>('bar');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = containerRef.current;
    if (!target || !selectedProperty || payload.rows.length === 0) return;

    const holeObj = { id: payload.hole_id, points: payload.rows };
    const points = buildIntervalPoints(holeObj, selectedProperty, isCategorical);

    if (points.length === 0) return;

    const plotData = buildPlotConfig({
      points,
      isCategorical,
      property: selectedProperty,
      chartType: isCategorical ? 'categorical' : chartType,
    });

    const plotConfig = {
      displayModeBar: true,
      responsive: true,
      modeBarButtonsToRemove: ['select2d', 'lasso2d', 'autoScale2d'],
    };

    Plotly.react(target, plotData.data, plotData.layout, plotConfig);

    return () => {
      try {
        Plotly.purge(target);
      } catch {
        // ignore purge errors on unmount
      }
    };
  }, [selectedProperty, chartType, isCategorical, payload.rows, payload.hole_id]);

  // Resize on container size changes
  useEffect(() => {
    const target = containerRef.current;
    if (!target || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      try {
        if ((target as unknown as { data?: unknown }).data) Plotly.Plots.resize(target);
      } catch {
        // ignore
      }
    });
    ro.observe(target);
    return () => ro.disconnect();
  }, []);

  if (payload.properties.length === 0) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.empty}>No data found for {payload.hole_id}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={stripStyles.header}>
        <span className={stripStyles.holeId}>{payload.hole_id}</span>
        <span className={stripStyles.meta}>
          {payload.rows.length} intervals · {payload.data_type}
        </span>
      </div>
      <div className={stripStyles.controls}>
        <select
          className={stripStyles.select}
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          {payload.properties.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {!isCategorical && (
          <select
            className={stripStyles.select}
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            {NUMERIC_CHART_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
      <div ref={containerRef} className={stripStyles.chart} />
    </div>
  );
}
