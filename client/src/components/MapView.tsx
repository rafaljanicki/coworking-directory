import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
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

// Custom hook to handle map events and update bounds
const MapEventHandler = ({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) => {
  const map = useMap();
  
  // Set initial bounds
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  
  // Update bounds when map view changes
  useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds())
  });
  
  return null;
};

// Marker cluster component
const MarkerClusterGroup = ({ markers, onMarkerClick }: { 
  markers: Array<{id: number, name: string, position: [number, number]}>, 
  onMarkerClick: (id: number) => void 
}) => {
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
    
    // Clean up on unmount
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
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

const MapView = ({ onMarkerClick, expanded = false, onToggleExpand }: MapViewProps) => {
  const { spaces, loading, updateMapBounds } = useSpaces();
  const mapRef = useRef<L.Map | null>(null);
  
  // Default center - Warsaw, Poland
  const center: [number, number] = [52.2297, 21.0122];
  
  // Handle bounds change
  const handleBoundsChange = useMemo(() => {
    return (bounds: L.LatLngBounds) => {
      updateMapBounds(bounds);
    };
  }, [updateMapBounds]);
  
  if (loading) {
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
        center={center} 
        zoom={6} 
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map event handler */}
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        
        {/* Marker cluster group */}
        <MarkerClusterGroup 
          markers={spaces
            .filter(space => space.latitude && space.longitude)
            .map(space => {
              const lat = typeof space.latitude === 'string' ? parseFloat(space.latitude) : space.latitude;
              const lng = typeof space.longitude === 'string' ? parseFloat(space.longitude) : space.longitude;
              
              // Skip invalid coordinates
              if (isNaN(lat) || isNaN(lng)) return null;
              
              return {
                id: space.id,
                name: space.name,
                position: [lat, lng] as [number, number]
              };
            })
            .filter(Boolean) as Array<{id: number, name: string, position: [number, number]}>
          }
          onMarkerClick={onMarkerClick}
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
