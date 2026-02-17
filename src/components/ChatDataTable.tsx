import { CollarMap } from './CollarMap';
import styles from './ChatDataTable.module.css';

interface ChatDataTableProps {
  type: string;
  payload: unknown;
}

interface CollarPayload {
  collars: Record<string, unknown>[];
  total_count?: number;
}

function isCollarPayload(payload: unknown): payload is CollarPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'collars' in payload &&
    Array.isArray((payload as CollarPayload).collars)
  );
}

function CollarTable({ payload }: { payload: CollarPayload }) {
  const { collars, total_count } = payload;
  if (collars.length === 0) {
    return <p className={styles.empty}>No collars found</p>;
  }

  const columns = Object.keys(collars[0]);

  return (
    <div className={styles.wrapper}>
      {total_count != null && (
        <div className={styles.count}>{total_count} collars total</div>
      )}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {collars.map((row, i) => (
              <tr key={i} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col} className={styles.td}>
                    {row[col] == null ? '' : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChatDataTable({ type, payload }: ChatDataTableProps) {
  if (type === 'collar_list' && isCollarPayload(payload)) {
    return <CollarTable payload={payload} />;
  }

  if (type === 'collar_map' && isCollarPayload(payload)) {
    return (
      <CollarMap
        collars={payload.collars as { hole_id?: string; latitude?: number; longitude?: number; [key: string]: unknown }[]}
        totalCount={payload.total_count}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.fallbackLabel}>{type}</div>
      <pre className={styles.fallback}>{JSON.stringify(payload, null, 2)}</pre>
    </div>
  );
}
