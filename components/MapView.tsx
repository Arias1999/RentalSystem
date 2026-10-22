'use client';
import { useEffect, useRef, useState } from 'react';

export interface MapLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  locations: MapLocation[];
  selected?: string | null;
}

export default function MapView({ locations, selected }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    let cancelled = false;
    let map: any = null;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Effects can be set up, cleaned up, and set up again before the
      // dynamic import resolves (for example, during React Strict Mode).
      if (cancelled || !container.isConnected || mapRef.current) return;

      // Fix default marker icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      map = L.map(container).setView([9.85, 123.4], 10);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const greenIcon = L.divIcon({
        className: '',
        html: `<div style="background:var(--green,#16a34a);width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(`<b>${loc.name}</b><br/><span style="font-size:0.8rem;color:#555">${loc.address}</span>`);
        markersRef.current.push({ name: loc.name, marker });
      });
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        if (mapRef.current === map) mapRef.current = null;
        markersRef.current = [];
        setMapReady(false);
      }
    };
  }, []);

  // Pan to selected location
  useEffect(() => {
    if (!selected || !mapReady || !mapRef.current) return;
    import('leaflet').then(() => {
      const found = markersRef.current.find(m => m.name === selected);
      if (found) {
        mapRef.current.setView(found.marker.getLatLng(), 14, { animate: true });
        found.marker.openPopup();
      }
    });
  }, [selected, mapReady]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
    </>
  );
}
