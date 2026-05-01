import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SEV_COLORS = {
  1: '#6B7280',
  2: '#D97706',
  3: '#EF4444',
  4: '#DC2626',
};

const CAT_ICONS = {
  road: '🛣',
  water: '💧',
  power: '⚡',
  waste: '🗑',
  drainage: '🌊',
  sanitation: '🚿',
  other: '📌',
};

function createCustomIcon(category, severity) {
  return L.divIcon({
    html: `<div style="
      background:${SEV_COLORS[severity] || '#6B7280'};
      color:white;
      border-radius:50%;
      width:32px;
      height:32px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:16px;
      border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${CAT_ICONS[category] || '📌'}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function IssueMap({ issues }) {
  const center = [27.7172, 85.3240]; // Kathmandu

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '480px', width: '100%', borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map(issue => {
        const lat = parseFloat(issue.latitude);
        const lng = parseFloat(issue.longitude);
        if (!lat || !lng) return null;
        return (
          <div key={issue.id}>
            <Marker
              position={[lat, lng]}
              icon={createCustomIcon(issue.category, issue.severity)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <p style={{ fontWeight: 600, margin: '0 0 6px', fontSize: 14 }}>
                    {CAT_ICONS[issue.category]} {issue.title}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#475569' }}>
                    📍 {issue.address}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#475569' }}>
                    👥 {issue.affected_people_count} affected
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#475569' }}>
                    🏷 Status: <b>{issue.status?.replace('_', ' ')}</b>
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#1D4ED8' }}>
                    ⭐ Priority: {issue.priority_score?.toFixed(1)}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                    ▲ {issue.vote_count} votes
                  </p>
                </div>
              </Popup>
            </Marker>
            {/* Affected radius circle */}
            <Circle
              center={[lat, lng]}
              radius={issue.affected_radius_meters || 100}
              pathOptions={{
                color: SEV_COLORS[issue.severity] || '#6B7280',
                fillColor: SEV_COLORS[issue.severity] || '#6B7280',
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          </div>
        );
      })}
    </MapContainer>
  );
}

export default IssueMap;