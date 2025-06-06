import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { CoworkingSpace } from "@shared/schema"; // Import the type

// Fix icon paths for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  spaces: CoworkingSpace[]; // Expect spaces as a prop
  isLoading: boolean; // Expect loading state as a prop
  onBoundsChange: (bounds: L.LatLngBounds) => void; // Expect bounds change callback
  onMarkerClick: (id: number) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

// Simple debounce hook
const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
};

// Custom hook to handle map events and update bounds
const MapEventHandler = ({ onBoundsChange, setCenter, setZoom }: { 
  onBoundsChange: (bounds: L.LatLngBounds) => void,
  setCenter: React.Dispatch<React.SetStateAction<L.LatLng>>,
  setZoom: React.Dispatch<React.SetStateAction<number>>
}) => {
  const map = useMap();
  // Debounce the bounds change handler (e.g., 300ms delay)
  const debouncedBoundsChange = useDebouncedCallback(onBoundsChange, 300);
  
  // Set initial bounds (no debounce needed here)
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  
  // Update bounds when map view changes (use debounced handler)
  useMapEvents({
    moveend: () => {
      console.log("MapView: moveend event fired");
      debouncedBoundsChange(map.getBounds());
      setCenter(map.getCenter());
      setZoom(map.getZoom());
    },
    zoomend: () => {
      console.log("MapView: zoomend event fired");
      debouncedBoundsChange(map.getBounds());
      setZoom(map.getZoom());
    }
  });
  
  return null;
};

// Marker cluster component
const MarkerClusterGroup = ({ markers, onMarkerClick }: { 
  markers: Array<{id: number, name: string, position: [number, number]}>, 
  onMarkerClick: (id: number) => void 
}) => {
  const prevMarkersRef = useRef<typeof markers>();
  const prevOnClickRef = useRef<typeof onMarkerClick>();
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  
  // Initialize cluster group
  useEffect(() => {
    // Create marker cluster group
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50
      });
      
      map.addLayer(clusterGroupRef.current);
    }
  }, [map]);
  
  // Update markers when they change
  useEffect(() => {
    if (!clusterGroupRef.current) return;
    
    // Clear existing markers
    clusterGroupRef.current.clearLayers();
    
    // Add new markers from the markers array
    const layers: L.Layer[] = markers.map(marker => {
      const { id, name, position } = marker;
      
      const leafletMarker = L.marker(position);
      
      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'text-center';
      
      const title = document.createElement('h3');
      title.className = 'font-semibold';
      title.textContent = name;
      popupContent.appendChild(title);
      
      const button = document.createElement('button');
      button.className = 'mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded';
      button.textContent = 'Szczegóły';
      button.onclick = () => onMarkerClick(id);
      popupContent.appendChild(button);
      
      leafletMarker.bindPopup(popupContent);
      
      return leafletMarker;
    });
    
    if (layers.length > 0) {
      clusterGroupRef.current.addLayers(layers);
    }
  }, [markers, onMarkerClick]);
  
  return null;
};

// Define MapView as a Function Component
const MapViewComponent: React.FC<MapViewProps> = ({ 
  spaces, 
  isLoading,
  onBoundsChange,
  onMarkerClick, 
  expanded = false, 
  onToggleExpand 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const center: [number, number] = [52.2297, 21.0122]; // Default center
  const defaultZoom = 6;

  // State to hold current map view
  const [currentCenter, setCurrentCenter] = useState<L.LatLng>(L.latLng(center[0], center[1]));
  const [currentZoom, setCurrentZoom] = useState<number>(defaultZoom);

  // Prepare markers - This must run unconditionally before any early returns
  const validMarkers = useMemo(() => {
    return (spaces || [])
      .filter(space => space.latitude && space.longitude)
      .map(space => {
        const lat = typeof space.latitude === 'string' ? parseFloat(space.latitude) : space.latitude;
        const lng = typeof space.longitude === 'string' ? parseFloat(space.longitude) : space.longitude;
        if (isNaN(lat) || isNaN(lng)) return null;
        return {
          id: space.id,
          name: space.name,
          position: [lat, lng] as [number, number]
        };
      })
      .filter(Boolean) as Array<{id: number, name: string, position: [number, number]}>;
  }, [spaces]); // Recalculate only when spaces prop changes

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg overflow-hidden map-container relative flex items-center justify-center ${expanded ? 'expanded' : ''}`}>
        <div className="text-gray-500">Ładowanie mapy...</div>
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
        center={currentCenter} 
        zoom={currentZoom} 
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Pass setters to update map state */}
        <MapEventHandler 
          onBoundsChange={onBoundsChange} 
          setCenter={setCurrentCenter}
          setZoom={setCurrentZoom}
        />
        
        {/* Marker cluster group */}
        {!isLoading && (
          <MarkerClusterGroup 
            markers={validMarkers} // Use memoized markers
            onMarkerClick={onMarkerClick}
          />
        )}
      </MapContainer>
    </div>
  );
};

// Memoize MapView
const MapView = React.memo(MapViewComponent);

export default MapView;