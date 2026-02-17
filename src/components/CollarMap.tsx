import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { HOLE_ID } from 'baselode';
import styles from './CollarMap.module.css';

interface Collar {
  hole_id?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface CollarMapProps {
  collars: Collar[];
  totalCount?: number;
}

export function CollarMap({ collars, totalCount }: CollarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const validCollars = useMemo(
    () =>
      collars.filter(
        (c) =>
          c.hole_id &&
          typeof c.latitude === 'number' &&
          Number.isFinite(c.latitude) &&
          typeof c.longitude === 'number' &&
          Number.isFinite(c.longitude) &&
          Math.abs(c.latitude) <= 90 &&
          Math.abs(c.longitude) <= 180,
      ),
    [collars],
  );

  const geojsonData = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: validCollars.map((c, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [c.longitude!, c.latitude!],
        },
        properties: {
          id: idx,
          [HOLE_ID]: c.hole_id ?? '',
          hole_id: c.hole_id ?? '',
        },
      })),
    }),
    [validCollars],
  );

  const center = useMemo<[number, number]>(() => {
    if (!validCollars.length) return [122.0, -24.5];
    const lngs = validCollars.map((c) => c.longitude!);
    const lats = validCollars.map((c) => c.latitude!);
    return [
      lngs.reduce((a, b) => a + b, 0) / lngs.length,
      lats.reduce((a, b) => a + b, 0) / lats.length,
    ];
  }, [validCollars]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center,
      zoom: 8,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
      'top-right',
    );

    map.on('load', () => {
      popupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 6,
      });

      map.addSource('collars', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterRadius: 60,
        clusterMaxZoom: 12,
      });

      map.addLayer({
        id: 'collars-clusters',
        type: 'circle',
        source: 'collars',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#8b1e3f',
          'circle-radius': ['step', ['get', 'point_count'], 14, 10, 16, 25, 18],
          'circle-opacity': 0.75,
        },
      });

      map.addLayer({
        id: 'collars-cluster-count',
        type: 'symbol',
        source: 'collars',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addLayer({
        id: 'collars-unclustered',
        type: 'circle',
        source: 'collars',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#8b1e3f',
          'circle-radius': 4,
          'circle-opacity': 0.9,
        },
      });

      map.on('mouseenter', 'collars-unclustered', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = e.features?.[0];
        if (!feature || !popupRef.current) return;
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        const props = feature.properties ?? {};
        const holeId = props[HOLE_ID] || props.hole_id || '';
        popupRef.current
          .setLngLat(coords)
          .setHTML(`<div><strong>${holeId}</strong></div>`)
          .addTo(map);
      });

      map.on('mouseleave', 'collars-unclustered', () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });

      map.on('click', 'collars-clusters', (e) => {
        const feature = e.features?.[0];
        const source = map.getSource('collars');
        if (!feature || !source || !('getClusterExpansionZoom' in source)) return;
        (source as maplibregl.GeoJSONSource).getClusterExpansionZoom(
          feature.id as number,
          (err, zoom) => {
            if (err || zoom == null) return;
            map.easeTo({
              center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
              zoom,
            });
          },
        );
      });

      // Fit bounds to show all collars
      if (validCollars.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        validCollars.forEach((c) => bounds.extend([c.longitude!, c.latitude!]));
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update source data when geojson changes after initial mount
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('collars') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojsonData);
    }
  }, [geojsonData]);

  if (!validCollars.length) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.empty}>No collars with valid coordinates</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {totalCount != null && (
        <div className={styles.count}>{totalCount} collars total</div>
      )}
      <div ref={mapContainerRef} className={styles.map} />
    </div>
  );
}
