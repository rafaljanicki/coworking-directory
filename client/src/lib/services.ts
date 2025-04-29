import { Wifi, Clock, Coffee, Printer, Users, Projector, ParkingSquare, Lock, Check } from 'lucide-react';
import React from 'react';

export interface ServiceInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Hardcoded mapping from serviceId (string) to display information
export const serviceIdToInfoMap: Record<string, ServiceInfo> = {
  '24_7_access': { name: 'Dostęp 24/7', icon: Clock },
  'wifi': { name: 'Szybkie WiFi', icon: Wifi },
  'coffee_tea': { name: 'Kawa i Herbata', icon: Coffee },
  'private_desks': { name: 'Prywatne Biurka', icon: Lock },
  'meeting_rooms': { name: 'Sale Spotkań', icon: Users },
  'printing': { name: 'Drukarka', icon: Printer },
  'events_space': { name: 'Przestrzeń Eventowa', icon: Projector },
  'parking': { name: 'Parking', icon: ParkingSquare },
  // Add other known service IDs here
  'kitchen': { name: 'Kuchnia', icon: Coffee }, // Example, assuming Coffee icon is ok
  'phone_booths': { name: 'Budki Telefoniczne', icon: Users } // Example, reusing Users icon
};

// Helper function to get service info, returning defaults if ID is unknown
export const getServiceInfo = (serviceId: string): ServiceInfo => {
  return serviceIdToInfoMap[serviceId] || { name: serviceId.replace(/_/g, ' '), icon: Check }; // Default: use ID as name, Check icon
}; 