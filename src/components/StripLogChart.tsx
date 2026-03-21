import { StripLogControls, StripLogPlot, useStripLogConfig } from 'baselode';
import styles from './ChatDataTable.module.css';
import stripStyles from './StripLogChart.module.css';

export interface StripLogPayload {
  hole_id: string;
  data_type: 'assay' | 'geology' | string;
  rows: Record<string, unknown>[];
  properties: string[];
  default_property: string | null;
}

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
  const properties = payload.properties.length > 0 ? payload.properties : undefined;
  const defaultProperty = payload.default_property ?? undefined;
  const stripLogConfig = useStripLogConfig({
    rows: payload.rows,
    holeId: payload.hole_id,
    dataType: payload.data_type,
    defaultProperty,
    properties,
  });

  return (
    <div className={styles.wrapper}>
      <div className={stripStyles.header}>
        <span className={stripStyles.holeId}>{payload.hole_id}</span>
        <span className={stripStyles.meta}>
          {payload.rows.length} intervals · {payload.data_type}
        </span>
      </div>
      <div className={stripStyles.controls}>
        <StripLogControls
          property={stripLogConfig.property}
          chartType={stripLogConfig.chartType}
          properties={stripLogConfig.properties}
          displayType={stripLogConfig.displayType}
          columnMeta={stripLogConfig.columnMeta}
          onPropertyChange={stripLogConfig.setProperty}
          onChartTypeChange={stripLogConfig.setChartType}
        />
      </div>
      <StripLogPlot
        rows={payload.rows}
        holeId={payload.hole_id}
        dataType={payload.data_type}
        property={stripLogConfig.property}
        chartType={stripLogConfig.chartType}
        properties={properties}
        defaultProperty={defaultProperty}
        mode="plot"
      />
    </div>
  );
}
