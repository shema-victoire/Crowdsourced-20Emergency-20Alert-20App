import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EmergencyAlert } from '@/lib/rwanda-data';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom emergency icons
const createEmergencyIcon = (type: string, severity: string) => {
  const getColor = () => {
    switch (type) {
      case 'fire': return '#dc2626';
      case 'flood': return '#1d4ed8';
      case 'accident': return '#f59e0b';
      case 'medical': return '#16a34a';
      case 'crime': return '#7c3aed';
      case 'weather': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'fire': return '🔥';
      case 'flood': return '💧';
      case 'accident': return '🚗';
      case 'medical': return '🏥';
      case 'crime': return '🚨';
      case 'weather': return '⛈️';
      default: return '⚠️';
    }
  };

  const size = severity === 'critical' ? 40 : severity === 'high' ? 35 : 30;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${getColor()};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${Math.floor(size * 0.5)}px;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
        ${getEmoji()}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'emergency-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Component to fit map bounds to show all Rwanda
function RwandaBounds() {
  const map = useMap();
  
  useEffect(() => {
    // Rwanda bounds: roughly covers the entire country
    const rwandaBounds = L.latLngBounds(
      [-2.917, 28.862], // Southwest coordinates
      [-1.047, 30.899]  // Northeast coordinates
    );
    
    map.fitBounds(rwandaBounds, { padding: [20, 20] });
  }, [map]);

  return null;
}

interface RwandaEmergencyMapProps {
  alerts: EmergencyAlert[];
  userLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

export default function RwandaEmergencyMap({ 
  alerts, 
  userLocation, 
  onLocationSelect 
}: RwandaEmergencyMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Rwanda center coordinates (Kigali)
  const rwandaCenter: [number, number] = [-1.9441, 30.0619];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const minutes = Math.floor((now.getTime() - alertTime.getTime()) / 60000);
    
    if (minutes < 1) return "Vuba vuba";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onLocationSelect) {
      const { lat, lng } = e.latlng;
      // For now, we'll use coordinates as address. In production, use reverse geocoding
      const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      onLocationSelect(lat, lng, address);
    }
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={rwandaCenter}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RwandaBounds />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #3b82f6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>Aho uri</strong>
                <br />
                <small>Ahantu hawe h'ubu</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Emergency alert markers */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createEmergencyIcon(alert.alert_type, alert.severity)}
          >
            <Popup maxWidth={300}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {alert.alert_type === 'fire' ? '🔥' : 
                     alert.alert_type === 'flood' ? '💧' : 
                     alert.alert_type === 'accident' ? '🚗' : 
                     alert.alert_type === 'medical' ? '🏥' : 
                     alert.alert_type === 'crime' ? '🚨' : '⛈️'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                    alert.severity === 'critical' ? 'bg-red-600' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600">{alert.description}</p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div>📍 {alert.location_address}</div>
                  <div>🏛️ {alert.province} - {alert.district}</div>
                  <div>⏰ {formatTimeAgo(alert.created_at)}</div>
                  {alert.user_name && <div>👤 {alert.user_name}</div>}
                </div>

                <div className="flex gap-2 mt-3">
                  <button 
                    className="flex-1 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                    onClick={() => {
                      if (userLocation) {
                        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${alert.latitude},${alert.longitude}`;
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    🗺️ Inzira
                  </button>
                  <button 
                    className="bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
                    onClick={() => window.open('tel:112', '_self')}
                  >
                    📞 112
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-1000">
        <h4 className="font-bold mb-2">Ibimenyetso</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>🔥</span> <span>Umuriro</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💧</span> <span>Imyuzure</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚗</span> <span>Impanuka</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏥</span> <span>Ubuvuzi</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚨</span> <span>Umutekano</span>
          </div>
        </div>
      </div>
    </div>
  );
}
