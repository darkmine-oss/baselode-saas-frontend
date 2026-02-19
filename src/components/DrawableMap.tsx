import { useEffect, useRef, useMemo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './CollarMap.module.css';

const HOLE_ID = 'hole_id';

interface Collar {
  hole_id?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface SavedExtent {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  geometry: GeoJSON.Feature;
}

interface DrawableMapProps {
  collars: Collar[];
  totalCount?: number;
  chatInstanceId: string | null;
  onExtentSaved?: (extent: SavedExtent) => void;
}

export function DrawableMap({ 
  collars, 
  totalCount, 
  chatInstanceId: _chatInstanceId, // eslint-disable-line @typescript-eslint/no-unused-vars
  // chatInstanceId kept in signature for future use (e.g., server-side extent association)
  onExtentSaved 
}: DrawableMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<GeoJSON.Feature | null>(null);
  const [extentName, setExtentName] = useState('');

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

  const handleSaveExtent = () => {
    if (!pendingFeature || !extentName.trim()) return;

    const geometry = pendingFeature.geometry as GeoJSON.Polygon;
    const coordinates = geometry.coordinates[0];
    
    // Calculate bounds from the rectangle coordinates
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    const savedExtent: SavedExtent = {
      id: `extent-${Date.now()}`,
      name: extentName.trim(),
      bounds: {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      geometry: pendingFeature,
    };

    onExtentSaved?.(savedExtent);
    
    // Reset dialog state
    setShowNameDialog(false);
    setPendingFeature(null);
    setExtentName('');
  };

  const handleCancelDialog = () => {
    // Remove the drawn feature
    if (drawRef.current && pendingFeature?.id) {
      drawRef.current.delete(pendingFeature.id as string);
    }
    
    setShowNameDialog(false);
    setPendingFeature(null);
    setExtentName('');
  };

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

    // Add drawing controls
    // Note: Using 'draw_polygon' mode for drawing rectangles/bounding boxes
    // MapLibre Draw doesn't have a separate rectangle mode; rectangles are polygons
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false, // Hide default polygon button; using custom button
        trash: true,    // Keep trash button for deleting shapes
      },
      modes: {
        ...MapboxDraw.modes,
      },
    });

    map.addControl(draw as unknown as maplibregl.IControl, 'top-left');
    drawRef.current = draw;

    // Listen for rectangle creation
    map.on('draw.create', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        setPendingFeature(feature);
        setShowNameDialog(true);
      }
    });

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
        const holeId = (props[HOLE_ID] || props.hole_id || '') as string;
        const popupContent = document.createElement('div');
        const strongElement = document.createElement('strong');
        strongElement.textContent = holeId;
        popupContent.appendChild(strongElement);
        popupRef.current
          .setLngLat(coords)
          .setDOMContent(popupContent)
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
        const clusterId = Number(feature.properties?.cluster_id);
        if (!Number.isFinite(clusterId)) return;

        (source as maplibregl.GeoJSONSource)
          .getClusterExpansionZoom(clusterId)
          .then((zoom) => {
            map.easeTo({
              center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
              zoom,
            });
          })
          .catch(() => {
            // no-op
          });
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
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => drawRef.current?.changeMode('draw_polygon')}
          style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            zIndex: 1,
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Draw Rectangle
        </button>
        <div ref={mapContainerRef} className={styles.map} />
      </div>
      
      {showNameDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              minWidth: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
              Name this extent
            </h3>
            <input
              type="text"
              value={extentName}
              onChange={(e) => setExtentName(e.target.value)}
              placeholder="Enter extent name"
              autoFocus
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveExtent();
                } else if (e.key === 'Escape') {
                  handleCancelDialog();
                }
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelDialog}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExtent}
                disabled={!extentName.trim()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: extentName.trim() ? '#8b1e3f' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: extentName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
