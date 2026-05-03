import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SEV_COLORS = { 1:'#6B7280', 2:'#D97706', 3:'#EF4444', 4:'#DC2626' };
const CAT_ICONS  = { road:'🛣', water:'💧', power:'⚡', waste:'🗑', drainage:'🌊', sanitation:'🚿', other:'📌' };

function IssueMap({ issues }) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const layerRef  = useRef(null);

  // Initialise map once
  useEffect(() => {
    if (mapObj.current) return;
    mapObj.current = L.map(mapRef.current).setView([27.7172, 85.3240], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapObj.current);
    layerRef.current = L.layerGroup().addTo(mapObj.current);
  }, []);

  // Update markers whenever issues change
  useEffect(() => {
    if (!mapObj.current) return;
    layerRef.current.clearLayers();

    issues.forEach(issue => {
      const lat = parseFloat(issue.latitude);
      const lng = parseFloat(issue.longitude);
      if (!lat || !lng) return;

      const icon = L.divIcon({
        html: `<div style="background:${SEV_COLORS[issue.severity]||'#6B7280'};color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${CAT_ICONS[issue.category]||'📌'}</div>`,
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([lat, lng], { icon })
        .addTo(layerRef.current)
        .bindPopup(`
          <div style="min-width:190px;font-family:sans-serif">
            <p style="font-weight:600;margin:0 0 6px;font-size:14px">${CAT_ICONS[issue.category]||'📌'} ${issue.title}</p>
            <p style="margin:0 0 3px;font-size:12px;color:#475569">📍 ${issue.address}</p>
            <p style="margin:0 0 3px;font-size:12px;color:#475569">👥 ${issue.affected_people_count} affected</p>
            <p style="margin:0 0 3px;font-size:12px">🏷 Status: <b>${issue.status?.replace('_',' ')}</b></p>
            <p style="margin:0 0 3px;font-size:12px;color:#1D4ED8">⭐ Priority: ${issue.priority_score?.toFixed(1)}</p>
            <p style="margin:0;font-size:12px">▲ ${issue.vote_count} votes</p>
          </div>
        `);

      L.circle([lat, lng], {
        radius: issue.affected_radius_meters || 150,
        color: SEV_COLORS[issue.severity] || '#6B7280',
        fillColor: SEV_COLORS[issue.severity] || '#6B7280',
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(layerRef.current);
    });
  }, [issues]);

  return (
    <div
      ref={mapRef}
      style={{ height: 480, width: '100%', borderRadius: 12, overflow: 'hidden', zIndex: 0 }}
    />
  );
}

export default IssueMap;