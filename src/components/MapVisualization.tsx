import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { PotholeMarker } from '../App';
import { MapPin } from 'lucide-react';

/* ───────── Marker Icon ───────── */
const severityIcon = (severity: string) => {
  const color =
    severity === 'high'
      ? '#ef4444'
      : severity === 'medium'
      ? '#f97316'
      : '#3b82f6';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;">
        <div style="
          width:30px; height:30px; border-radius:50% 50% 50% 0;
          background:${color}; border:3px solid white;
          box-shadow:0 0 10px ${color}, 0 0 20px ${color}88;
          transform: rotate(-45deg);
        "></div>
        <div style="
          position:absolute; top:6px; left:6px;
          width:14px; height:14px; border-radius:50%;
          background:white; opacity:0.8;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -35],
  });
};

/* ───────── Fly to latest ───────── */
function FlyToMarker({ markers }: { markers: PotholeMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const latest = markers[markers.length - 1];
      map.flyTo([latest.lat, latest.lng], 14, { duration: 1.5 });
    }
  }, [markers, map]);

  return null;
}

/* ───────── Heatmap ───────── */
function HeatmapLayer({ markers }: { markers: PotholeMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const heatData = markers.map(m => [
      m.lat,
      m.lng,
      m.severity === 'high' ? 1 : m.severity === 'medium' ? 0.6 : 0.3
    ]);

    const heat = (L as any).heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        1.0: 'red'
      }
    });

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [markers, map]);

  return null;
}

/* ───────── Severity UI ───────── */
const severityColor = (severity: string) => {
  if (severity === 'high')
    return { text: 'text-red-400', dot: 'bg-red-500' };
  if (severity === 'medium')
    return { text: 'text-orange-400', dot: 'bg-orange-400' };
  return { text: 'text-blue-400', dot: 'bg-blue-500' };
};

/* ───────── MAIN ───────── */
export default function MapVisualization({ markers }: { markers: PotholeMarker[] }) {
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap' | 'both'>('both');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">Live Detection Map</h2>
          <p className="text-gray-400">Real-time pothole visualization</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center gap-3 mb-4">
          {['markers', 'heatmap', 'both'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-white/20 shadow-xl" style={{ height: 'clamp(300px, 80vh, 600px)' }}>
          <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <FlyToMarker markers={markers} />

            {(viewMode === 'heatmap' || viewMode === 'both') && (
              <HeatmapLayer markers={markers} />
            )}

            {(viewMode === 'markers' || viewMode === 'both') &&
              markers.map(marker => (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={severityIcon(marker.severity)}
                >
                  <Popup>
                    <div style={{ minWidth: '220px' }}>

                      <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                        🕳️ Pothole #{marker.id}
                      </p>

                      {/* REPORT ID */}
                      {marker.report_id && (
                        <p style={{ fontSize: '11px', color: '#2563eb', marginBottom: '8px', fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: '#f0f9ff', padding: '4px 6px', borderRadius: '4px' }}>
                          📋 {marker.report_id}
                        </p>
                      )}

                      <p style={{ marginBottom: '4px' }}>
                        Severity: <strong>{marker.severity}</strong>
                      </p>

                      <p style={{ marginBottom: '8px' }}>
                        Confidence: <strong>{marker.confidence}%</strong>
                      </p>

                      {/* IMAGE */}
                      {marker.image_name && (
                        <div style={{ marginTop: '8px' }}>
                          <img
                            src={`http://localhost:5000/uploads/${marker.image_name}`}
                            alt="pothole"
                            style={{
                              width: '100%',
                              height: '110px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      )}

                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-center gap-6 text-sm text-gray-400">
          <span>Total: <span className="text-white font-bold">{markers.length}</span></span>
          <span>
            High: <span className="text-red-400 font-bold">
              {markers.filter(m => m.severity === 'high').length}
            </span>
          </span>
        </div>

        {/* TABLE */}
        {markers.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-400 w-5 h-5" />
              <h3 className="text-xl font-semibold text-white">
                Detected Potholes
              </h3>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl">

              {/* Header */}
              <div className="grid grid-cols-5 px-6 py-3 text-xs uppercase text-gray-400 border-b border-white/10 tracking-wider">
                <span>ID</span>
                <span>Coordinates</span>
                <span>Severity</span>
                <span>Confidence</span>
                <span>Date & Time</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {markers.map((m) => {
                  const c = severityColor(m.severity);

                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-5 px-6 py-4 items-center hover:bg-white/5 transition"
                    >
                      <span className="text-blue-400 font-mono font-semibold text-sm">
  {m.report_id || `RPT-${m.id}`}
</span>

                      <span className="text-white font-mono text-sm">
                        {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
                      </span>

                      <span className={`flex items-center gap-2 ${c.text}`}>
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        {m.severity}
                      </span>

                      <span className="text-white font-semibold">
                        {m.confidence}%
                      </span>

                      <span className="text-gray-400 text-sm">
                        {new Date(m.timestamp).toLocaleString([], {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}