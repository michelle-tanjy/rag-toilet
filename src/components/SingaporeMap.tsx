import React, { useEffect, useRef } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  Map as GoogleMap,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react';
import { Facility, FacilityKind, UserPosition } from '../types/facility';
import { FountainPinGraphic } from './FacilityVisuals';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined'
    ? __GOOGLE_MAPS_API_KEY__
    : '') ||
  '';

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

const MapStatusMonitor: React.FC = () => {
  const status = useApiLoadingStatus();

  useEffect(() => {
    if (
      status === APILoadingStatus.AUTH_FAILURE ||
      status === APILoadingStatus.FAILED
    ) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [status]);

  return null;
};

interface MapControllerProps {
  userPosition: UserPosition;
  selectedFacility: Facility | null;
  routeFacility: Facility | null;
  mapRefOut: React.MutableRefObject<google.maps.Map | null>;
}

const MapController: React.FC<MapControllerProps> = ({
  userPosition,
  selectedFacility,
  routeFacility,
  mapRefOut,
}) => {
  const map = useMap();

  useEffect(() => {
    mapRefOut.current = map;
  }, [map, mapRefOut]);

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: userPosition.lat, lng: userPosition.lng });
  }, [map, userPosition.lat, userPosition.lng]);

  useEffect(() => {
    if (!map || !selectedFacility || routeFacility) return;
    map.panTo({ lat: selectedFacility.lat, lng: selectedFacility.lng });
  }, [map, selectedFacility, routeFacility]);

  return null;
};

const SearchRadiusCircle: React.FC<{
  center: { lat: number; lng: number };
  radiusMeters: number;
  urgentMode: boolean;
}> = ({ center, radiusMeters, urgentMode }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius: radiusMeters,
        clickable: false,
        strokeColor: urgentMode ? '#FF5F15' : '#0284c7',
        strokeOpacity: 0.65,
        strokeWeight: 2,
        fillColor: urgentMode ? '#FF5F15' : '#0ea5e9',
        fillOpacity: 0.08,
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMeters);
      circleRef.current.setOptions({
        strokeColor: urgentMode ? '#FF5F15' : '#0284c7',
        fillColor: urgentMode ? '#FF5F15' : '#0ea5e9',
      });
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center.lat, center.lng, radiusMeters, urgentMode]);

  return null;
};

const WalkingRouteOverlay: React.FC<{
  origin: { lat: number; lng: number };
  destination: Facility | null;
  urgentMode: boolean;
}> = ({ origin, destination, urgentMode }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    const clearPolylines = () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };

    clearPolylines();
    if (!map || !destination) return;

    let cancelled = false;
    const strokeColor = urgentMode ? '#FF5F15' : '#0284c7';

    // Immediate direct dashed polyline so navigation feedback is instant
    const fallbackLine = new google.maps.Polyline({
      map,
      path: [
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
      ],
      geodesic: true,
      strokeColor,
      strokeOpacity: 0,
      icons: [
        {
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.9,
            strokeWeight: urgentMode ? 5 : 4,
            scale: 3,
          },
          offset: '0',
          repeat: '14px',
        },
      ],
    });
    polylinesRef.current = [fallbackLine];

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: origin.lat, lng: origin.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });
    map.fitBounds(bounds, { top: 190, bottom: 190, left: 48, right: 48 });

    // Upgrade to road/sidewalk walking path via modern Routes API SDK wrapper
    if (routesLib?.Route) {
      routesLib.Route.computeRoutes({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: routesLib.TravelMode.WALKING,
        fields: ['path', 'viewport'],
      })
        .then((res) => {
          if (cancelled) return;
          const route = res.routes?.[0];
          if (!route) return;

          clearPolylines();
          const created = route.createPolylines({
            polylineOptions: {
              strokeColor,
              strokeOpacity: 0.92,
              strokeWeight: urgentMode ? 6 : 5,
            },
          });
          created.forEach((p) => p.setMap(map));
          polylinesRef.current = created;

          if (route.viewport) {
            map.fitBounds(route.viewport, {
              top: 190,
              bottom: 190,
              left: 48,
              right: 48,
            });
          }
        })
        .catch((err) => {
          const msg = String(err ?? '');
          if (
            msg.includes('429') ||
            msg.includes('OVER_QUERY_LIMIT') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.toLowerCase().includes('quota')
          ) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
          // Keep direct dashed polyline rendered on fallback
        });
    }

    return () => {
      cancelled = true;
      clearPolylines();
    };
  }, [
    map,
    routesLib,
    origin.lat,
    origin.lng,
    destination?.id,
    destination?.lat,
    destination?.lng,
    urgentMode,
  ]);

  return null;
};

const FacilityMarkerBadge: React.FC<{
  facility: Facility;
  isSelected: boolean;
  isRouteTarget: boolean;
  urgentMode: boolean;
}> = ({ facility, isSelected, isRouteTarget, urgentMode }) => {
  const isUrgentTarget = urgentMode && isRouteTarget;
  const active = isSelected || isRouteTarget;
  const sizeClass = active ? 'w-11 h-11 scale-110' : 'w-9 h-9';

  if (facility.kind === 'fountain') {
    return (
      <div className={`relative flex items-center justify-center ${sizeClass}`}>
        {active && (
          <span className="marker-ping absolute inset-0 rounded-full bg-[#0ea5e9]/35" />
        )}
        <div
          className={`relative w-full h-full rounded-full bg-white shadow-md border-2 flex items-center justify-center transition-transform ${
            isSelected ? 'border-[#0284c7]' : 'border-[#0ea5e9]/80'
          }`}
        >
          <FountainPinGraphic className="w-5 h-5" />
        </div>
      </div>
    );
  }

  const bgClass = isUrgentTarget
    ? 'bg-[#FF5F15]'
    : facility.queueStatus === 'busy'
      ? 'bg-[#f59e0b]'
      : facility.verifiedClean && facility.amenities.free
        ? 'bg-[#0284c7]'
        : 'bg-[#006194]';

  const ringClass = isUrgentTarget ? 'bg-[#FF5F15]/35' : 'bg-[#0284c7]/30';

  const dotClass =
    facility.queueStatus === 'low'
      ? 'bg-[#10b981]'
      : facility.queueStatus === 'moderate'
        ? 'bg-[#f59e0b]'
        : 'bg-[#ef4444]';

  return (
    <div className={`relative flex items-center justify-center ${sizeClass}`}>
      {(isSelected || isUrgentTarget) && (
        <span className={`marker-ping absolute inset-0 rounded-full ${ringClass}`} />
      )}
      <div
        className={`relative w-full h-full rounded-full text-white shadow-lg border-2 border-white flex items-center justify-center transition-transform ${bgClass}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 12h10l-1 8H8l-1-8Z" />
          <path d="M8 12V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" />
          <path d="M5 12h14" />
        </svg>
        <span
          className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${dotClass}`}
        />
      </div>
    </div>
  );
};

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const radiusLabel =
    radiusMeters >= 1000
      ? `${(radiusMeters / 1000).toFixed(radiusMeters % 1000 === 0 ? 0 : 1)}km radius`
      : `${radiusMeters}m radius`;

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const current = map.getZoom() ?? 15;
    map.setZoom(Math.max(10, Math.min(20, current + delta)));
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.panTo({ lat: userPosition.lat, lng: userPosition.lng });
      map.setZoom(15);
    }
    onRecenter();
  };

  return (
    <div className="relative w-full h-full bg-[#e8f1fb]">
      {GOOGLE_MAPS_API_KEY ? (
        <APIProvider
          apiKey={GOOGLE_MAPS_API_KEY}
          libraries={['marker', 'routes']}
          language="en"
          region="SG"
        >
          <MapStatusMonitor />
          <GoogleMap
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={{ lat: userPosition.lat, lng: userPosition.lng }}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={true}
            clickableIcons={false}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            onCameraChanged={(ev) => {
              onMapCenterChange(ev.detail.center.lat, ev.detail.center.lng);
            }}
          >
            <MapController
              userPosition={userPosition}
              selectedFacility={selectedFacility}
              routeFacility={routeFacility}
              mapRefOut={mapInstanceRef}
            />

            <SearchRadiusCircle
              center={{ lat: userPosition.lat, lng: userPosition.lng }}
              radiusMeters={radiusMeters}
              urgentMode={urgentMode}
            />

            <WalkingRouteOverlay
              origin={{ lat: userPosition.lat, lng: userPosition.lng }}
              destination={routeFacility}
              urgentMode={urgentMode}
            />

            {/* User Location Marker */}
            <AdvancedMarker
              position={{ lat: userPosition.lat, lng: userPosition.lng }}
              draggable={true}
              zIndex={900}
              title="Your location (drag to move)"
              onDragEnd={(e) => {
                if (e.latLng) {
                  onUserPositionMove(e.latLng.lat(), e.latLng.lng());
                }
              }}
            >
              <div className="relative flex items-center justify-center w-7 h-7 cursor-grab active:cursor-grabbing">
                <span
                  className={`marker-ping absolute inset-0 rounded-full ${
                    urgentMode ? 'bg-[#FF5F15]/35' : 'bg-[#0284c7]/35'
                  }`}
                />
                <span
                  className={`relative w-4 h-4 rounded-full border-[3px] border-white shadow-md ${
                    urgentMode ? 'bg-[#FF5F15]' : 'bg-[#0284c7]'
                  }`}
                />
              </div>
            </AdvancedMarker>

            {/* Facility Markers */}
            {facilities.map((facility) => {
              const isSelected = selectedFacility?.id === facility.id;
              const isRouteTarget = routeFacility?.id === facility.id;

              return (
                <AdvancedMarker
                  key={facility.id}
                  position={{ lat: facility.lat, lng: facility.lng }}
                  zIndex={isSelected || isRouteTarget ? 800 : 200}
                  title={facility.name}
                  onClick={() => onSelectFacility(facility)}
                >
                  <FacilityMarkerBadge
                    facility={facility}
                    isSelected={isSelected}
                    isRouteTarget={isRouteTarget}
                    urgentMode={urgentMode}
                  />
                </AdvancedMarker>
              );
            })}
          </GoogleMap>
        </APIProvider>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center p-6"
          role="region"
          aria-label="Map configuration notice"
        >
          <div className="sf-glass-card rounded-3xl p-6 max-w-sm text-center flex flex-col items-center gap-2">
            <MapPin className="w-8 h-8 text-[#0284c7]" />
            <h2 className="text-base font-semibold text-[#111d27]">
              Google Maps API Key Needed
            </h2>
            <p className="text-xs text-[#3f4850] leading-relaxed">
              Configure <code className="font-semibold">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
              or enable Google Maps in settings to render the live Singapore map.
            </p>
          </div>
        </div>
      )}

      {/* Floating Radius Bubble */}
      <div className="pointer-events-none fixed top-[174px] sm:top-[178px] left-1/2 -translate-x-1/2 lg:left-[calc(50%+210px)] z-[420]">
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums shadow-sm transition-colors ${
            urgentMode
              ? 'bg-[#FF5F15] text-white'
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
              Drag map to place{' '}
              {newPinKind === 'fountain' ? 'water fountain' : 'restroom'}
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
          onClick={() => handleZoom(1)}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom in map"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom out map"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#0284c7] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Re-center map on your location"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
