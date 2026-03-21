import { useState, type FormEvent } from 'react';
import { StripLogChart } from '../components/StripLogChart';
import type { StripLogPayload } from '../components/StripLogChart';
import { fetchAssayStripLog, fetchGeologyStripLog } from '../api/assay';
import styles from './StripLogPage.module.css';

type DataType = 'assay' | 'geology';

export function StripLogPage() {
  const [holeId, setHoleId] = useState('');
  const [dataType, setDataType] = useState<DataType>('assay');
  const [payload, setPayload] = useState<StripLogPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = holeId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      const result = dataType === 'assay'
        ? await fetchAssayStripLog(id)
        : await fetchGeologyStripLog(id);
      setPayload(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Strip Log</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Hole ID (e.g. DD54)"
          value={holeId}
          onChange={(e) => setHoleId(e.target.value)}
          disabled={loading}
        />
        <div className={styles.typeToggle}>
          <label className={`${styles.typeOption} ${dataType === 'assay' ? styles.typeSelected : ''}`}>
            <input
              type="radio"
              name="dataType"
              value="assay"
              checked={dataType === 'assay'}
              onChange={() => setDataType('assay')}
            />
            Assay
          </label>
          <label className={`${styles.typeOption} ${dataType === 'geology' ? styles.typeSelected : ''}`}>
            <input
              type="radio"
              name="dataType"
              value="geology"
              checked={dataType === 'geology'}
              onChange={() => setDataType('geology')}
            />
            Geology
          </label>
        </div>
        <button className={styles.btn} type="submit" disabled={loading || !holeId.trim()}>
          {loading ? 'Loading…' : 'Load'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {payload && payload.rows.length === 0 && (
        <p className={styles.empty}>No {dataType} data found for {payload.hole_id}.</p>
      )}

      {payload && payload.rows.length > 0 && (
        <div className={styles.chart}>
          <StripLogChart payload={payload} />
        </div>
      )}
    </div>
  );
}
