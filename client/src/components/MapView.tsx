import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSpaces } from "@/hooks/useSpaces";

// Fix icon paths for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  onMarkerClick: (id: number) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const MapView = ({ onMarkerClick, expanded = false, onToggleExpand }: MapViewProps) => {
  const { spaces, loading } = useSpaces();
  
  // Default center - Warsaw, Poland
  const center: [number, number] = [52.2297, 21.0122];
  
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg overflow-hidden map-container relative flex items-center justify-center ${expanded ? 'expanded' : ''}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gray-100 rounded-lg overflow-hidden map-container relative ${expanded ? 'expanded' : ''}`}>
      {onToggleExpand && (
        <button 
          onClick={onToggleExpand}
          className="absolute top-2 right-2 z-[1000] bg-white px-2 py-1 rounded shadow-md text-xs font-medium"
        >
          {expanded ? 'Minimalizuj mapę' : 'Rozwiń mapę'}
        </button>
      )}
      <MapContainer 
        center={center} 
        zoom={6} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {spaces?.map((space) => (
          <Marker 
            key={space.id} 
            position={[parseFloat(space.latitude), parseFloat(space.longitude)]}
            eventHandlers={{
              click: () => onMarkerClick(space.id)
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{space.name}</h3>
                <button 
                  className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => onMarkerClick(space.id)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
