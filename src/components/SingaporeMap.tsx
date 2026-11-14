import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { Facility, FacilityKind, UserPosition } from '../types/facility';
import { FountainPinGraphic } from './FacilityVisuals';

interface SingaporeMapProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  routeFacility: Facility | null;
  userPosition: UserPosition;
  radiusMeters: number;
  urgentMode: boolean;
  isAddingPin: boolean;
  newPinKind: FacilityKind;
  onSelectFacility: (facility: Facility) => void;
  onMapCenterChange: (lat: number, lng: number) => void;
  onUserPositionMove: (lat: number, lng: number) => void;
  onRecenter: () => void;
}

function getMarkerHtml(
  facility: Facility,
  isSelected: boolean,
  isRouteTarget: boolean,
  urgentMode: boolean
): string {
  const isUrgentTarget = urgentMode && isRouteTarget;
  const size = isSelected || isRouteTarget ? 42 : 34;

  if (facility.kind === 'fountain') {
    return `
      <div class="relative flex items-center justify-center" style="width:${size}px;height:${size}px;">
        ${
          isSelected || isRouteTarget
            ? `<span class="marker-ping absolute inset-0 rounded-full bg-[#0ea5e9]/35"></span>`
            : ''
        }
        <div class="relative flex items-center justify-center rounded-full bg-white shadow-md border-2 ${
          isSelected ? 'border-[#0284c7] scale-110' : 'border-[#0ea5e9]/80'
        } transition-transform duration-150" style="width:${size}px;height:${size}px;">
          <img
            src="https://sgtoilets.web.app/fountain-pin.svg"
            alt="Water fountain"
            referrerpolicy="no-referrer"
            style="width:20px;height:20px;object-fit:contain;"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
          />
          <span style="display:none;align-items:center;justify-content:center;color:#0284c7;font-size:14px;font-weight:700;">💧</span>
        </div>
      </div>
    `;
  }

  const bg = isUrgentTarget
    ? '#dc2626'
    : facility.queueStatus === 'busy'
      ? '#f59e0b'
      : facility.verifiedClean && facility.amenities.free
        ? '#0284c7'
        : '#006194';

  const ringColor = isUrgentTarget
    ? 'rgba(220, 38, 38, 0.4)'
    : 'rgba(2, 132, 199, 0.35)';

  const badgeDot =
    facility.queueStatus === 'low'
      ? '#10b981'
      : facility.queueStatus === 'moderate'
        ? '#f59e0b'
        : '#ef4444';

  return `
    <div class="relative flex items-center justify-center" style="width:${size}px;height:${size}px;">
      ${
        isSelected || isUrgentTarget
          ? `<span class="marker-ping absolute inset-0 rounded-full" style="background:${ringColor};"></span>`
          : ''
      }
      <div
        class="relative flex items-center justify-center rounded-full text-white shadow-lg border-2 border-white transition-transform duration-150 ${
          isSelected || isUrgentTarget ? 'scale-110' : ''
        }"
        style="width:${size}px;height:${size}px;background:${bg};box-shadow:0 3px 10px rgba(2,132,199,0.28);"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 12h10l-1 8H8l-1-8Z"/>
          <path d="M8 12V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/>
          <path d="M5 12h14"/>
        </svg>
        <span
          class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
          style="background:${badgeDot};"
        ></span>
      </div>
    </div>
  `;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  facilities,
  selectedFacility,
  routeFacility,
  userPosition,
  radiusMeters,
  urgentMode,
  isAddingPin,
  newPinKind,
  onSelectFacility,
  onMapCenterChange,
  onUserPositionMove,
  onRecenter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const onSelectFacilityRef = useRef(onSelectFacility);
  onSelectFacilityRef.current = onSelectFacility;

  const onMapCenterChangeRef = useRef(onMapCenterChange);
  onMapCenterChangeRef.current = onMapCenterChange;

  const onUserPositionMoveRef = useRef(onUserPositionMove);
  onUserPositionMoveRef.current = onUserPositionMove;

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userPosition.lat, userPosition.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    map.on('moveend', () => {
      const center = map.getCenter();
      onMapCenterChangeRef.current(center.lat, center.lng);
    });

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update user marker and search radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    radiusCircleRef.current = L.circle([userPosition.lat, userPosition.lng], {
      radius: radiusMeters,
      color: urgentMode ? '#dc2626' : 'rgba(2, 132, 199, 0.5)',
      weight: urgentMode ? 2 : 1.75,
      dashArray: '6 8',
      fillColor: urgentMode ? '#dc2626' : '#0ea5e9',
      fillOpacity: urgentMode ? 0.05 : 0.06,
      interactive: false,
    }).addTo(map);

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: 'sf-div-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      html: `
        <div class="relative flex items-center justify-center w-7 h-7" title="Your location (drag to simulate walking)">
          <span class="marker-ping absolute inset-0 rounded-full ${
            urgentMode ? 'bg-[#dc2626]/35' : 'bg-[#0284c7]/35'
          }"></span>
          <span class="relative w-4 h-4 rounded-full border-[3px] border-white shadow-md ${
            urgentMode ? 'bg-[#dc2626]' : 'bg-[#0284c7]'
          }"></span>
        </div>
      `,
    });

    const userMarker = L.marker([userPosition.lat, userPosition.lng], {
      icon: userIcon,
      draggable: true,
      zIndexOffset: 900,
    }).addTo(map);

    userMarker.on('dragend', () => {
      const pos = userMarker.getLatLng();
      onUserPositionMoveRef.current(pos.lat, pos.lng);
    });

    userMarkerRef.current = userMarker;
  }, [userPosition.lat, userPosition.lng, radiusMeters, urgentMode]);

  // Smooth pan when user switches district preset or GPS
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo([userPosition.lat, userPosition.lng], {
      animate: true,
      duration: 0.45,
    });
  }, [userPosition.lat, userPosition.lng]);

  // Render facility markers
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    facilities.forEach((facility) => {
      const isSelected = selectedFacility?.id === facility.id;
      const isRouteTarget = routeFacility?.id === facility.id;
      const size = isSelected || isRouteTarget ? 42 : 34;

      const icon = L.divIcon({
        className: 'sf-div-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: getMarkerHtml(facility, isSelected, isRouteTarget, urgentMode),
      });

      const marker = L.marker([facility.lat, facility.lng], {
        icon,
        zIndexOffset: isSelected || isRouteTarget ? 800 : 200,
      });

      marker.on('click', () => {
        onSelectFacilityRef.current(facility);
      });

      marker.addTo(layer);
    });
  }, [facilities, selectedFacility, routeFacility, urgentMode]);

  // Draw walking route polyline when navigating or in Urgent Need Mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (!routeFacility) return;

    const midLat =
      userPosition.lat + (routeFacility.lat - userPosition.lat) * 0.52;
    const midLng =
      userPosition.lng + (routeFacility.lng - userPosition.lng) * 0.45 + 0.00025;

    const points: L.LatLngExpression[] = [
      [userPosition.lat, userPosition.lng],
      [midLat, midLng],
      [routeFacility.lat, routeFacility.lng],
    ];

    routeLineRef.current = L.polyline(points, {
      color: urgentMode ? '#dc2626' : '#0284c7',
      weight: urgentMode ? 5 : 4,
      opacity: 0.9,
      dashArray: urgentMode ? undefined : '8 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      paddingTopLeft: [40, 120],
      paddingBottomRight: [40, 180],
      maxZoom: 17,
      animate: true,
    });
  }, [routeFacility, userPosition.lat, userPosition.lng, urgentMode]);

  // Pan to selected facility gently
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFacility || routeFacility) return;
    map.panTo([selectedFacility.lat, selectedFacility.lng], {
      animate: true,
      duration: 0.35,
    });
  }, [selectedFacility, routeFacility]);

  const radiusLabel =
    radiusMeters >= 1000
      ? `${(radiusMeters / 1000).toFixed(radiusMeters % 1000 === 0 ? 0 : 1)}km radius`
      : `${radiusMeters}m radius`;

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive map of Singapore public restrooms and drinking fountains"
      />

      {/* Floating Radius Bubble */}
      <div className="pointer-events-none fixed top-[134px] sm:top-[126px] left-1/2 -translate-x-1/2 lg:left-[calc(50%+210px)] z-[420]">
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums shadow-sm transition-colors ${
            urgentMode
              ? 'bg-[#dc2626] text-white'
              : 'sf-glass text-[#006194]'
          }`}
        >
          {urgentMode ? 'Urgent Nearest Lock · Direct Path' : radiusLabel}
        </div>
      </div>

      {/* Add Pin Crosshair Overlay */}
      {isAddingPin && (
        <div className="pointer-events-none fixed inset-0 lg:left-[420px] z-[450] flex items-center justify-center">
          <div className="relative -translate-y-4 flex flex-col items-center">
            <div className="sf-glass-card rounded-full px-3 py-1 text-xs font-semibold text-[#111d27] mb-2 whitespace-nowrap">
              Drag map to place {newPinKind === 'fountain' ? 'water fountain' : 'restroom'}
            </div>
            {newPinKind === 'fountain' ? (
              <div className="w-11 h-11 rounded-full bg-white border-2 border-[#0ea5e9] shadow-lg flex items-center justify-center">
                <FountainPinGraphic className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#0284c7] border-2 border-white shadow-lg flex items-center justify-center text-white">
                <span className="text-lg font-bold">+</span>
              </div>
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-[#111d27]/40 mt-1" />
          </div>
        </div>
      )}

      {/* Map Controls (Zoom & Recenter) */}
      <div className="fixed right-4 bottom-28 lg:bottom-8 z-[440] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom in map"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom out map"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            onRecenter();
            mapRef.current?.setView([userPosition.lat, userPosition.lng], 15, {
              animate: true,
            });
          }}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#0284c7] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Re-center map on your location"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
