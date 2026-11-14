import React, { useEffect, useMemo, useRef, useState } from 'react';
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

interface LatLng {
  lat: number;
  lng: number;
}

const WATER_POLYGONS: LatLng[][] = [
  // Marina Bay Basin
  [
    { lat: 1.2892, lng: 103.8524 },
    { lat: 1.2886, lng: 103.8588 },
    { lat: 1.2855, lng: 103.8615 },
    { lat: 1.2812, lng: 103.8594 },
    { lat: 1.2804, lng: 103.8554 },
    { lat: 1.2846, lng: 103.8528 },
  ],
  // Singapore River
  [
    { lat: 1.2924, lng: 103.8365 },
    { lat: 1.2932, lng: 103.8374 },
    { lat: 1.2896, lng: 103.8452 },
    { lat: 1.2888, lng: 103.8512 },
    { lat: 1.2868, lng: 103.8548 },
    { lat: 1.2852, lng: 103.8535 },
    { lat: 1.2874, lng: 103.8498 },
    { lat: 1.2884, lng: 103.8442 },
  ],
  // Singapore Strait / Southern Coastline
  [
    { lat: 1.2625, lng: 103.7800 },
    { lat: 1.2620, lng: 103.8250 },
    { lat: 1.2720, lng: 103.8500 },
    { lat: 1.2765, lng: 103.8720 },
    { lat: 1.2950, lng: 103.9080 },
    { lat: 1.3042, lng: 103.9380 },
    { lat: 1.3140, lng: 103.9750 },
    { lat: 1.3350, lng: 104.0150 },
    { lat: 1.2200, lng: 104.0150 },
    { lat: 1.2200, lng: 103.7800 },
  ],
];

const PARK_POLYGONS: { name: string; points: LatLng[] }[] = [
  {
    name: 'Istana & Fort Canning',
    points: [
      { lat: 1.3005, lng: 103.8406 },
      { lat: 1.2988, lng: 103.8452 },
      { lat: 1.2920, lng: 103.8476 },
      { lat: 1.2928, lng: 103.8424 },
      { lat: 1.2974, lng: 103.8392 },
    ],
  },
  {
    name: 'Gardens by the Bay',
    points: [
      { lat: 1.2848, lng: 103.8618 },
      { lat: 1.2856, lng: 103.8692 },
      { lat: 1.2788, lng: 103.8685 },
      { lat: 1.2792, lng: 103.8614 },
    ],
  },
  {
    name: 'East Coast Park',
    points: [
      { lat: 1.3020, lng: 103.9180 },
      { lat: 1.3095, lng: 103.9460 },
      { lat: 1.3050, lng: 103.9480 },
      { lat: 1.2978, lng: 103.9200 },
    ],
  },
  {
    name: 'Orchard Boulevard Green',
    points: [
      { lat: 1.3068, lng: 103.8255 },
      { lat: 1.3076, lng: 103.8295 },
      { lat: 1.3046, lng: 103.8298 },
      { lat: 1.3038, lng: 103.8260 },
    ],
  },
];

const ARTERIAL_ROADS: {
  name: string;
  major?: boolean;
  points: LatLng[];
  labelAt?: LatLng;
}[] = [
  {
    name: 'Orchard Rd',
    major: true,
    labelAt: { lat: 1.3028, lng: 103.8355 },
    points: [
      { lat: 1.3075, lng: 103.8265 },
      { lat: 1.3044, lng: 103.8318 },
      { lat: 1.3010, lng: 103.8384 },
      { lat: 1.2998, lng: 103.8454 },
      { lat: 1.2982, lng: 103.8515 },
    ],
  },
  {
    name: 'Scotts Rd',
    major: true,
    labelAt: { lat: 1.3068, lng: 103.8322 },
    points: [
      { lat: 1.3125, lng: 103.8328 },
      { lat: 1.3044, lng: 103.8318 },
      { lat: 1.2972, lng: 103.8304 },
    ],
  },
  {
    name: 'Somerset / Grange Rd',
    points: [
      { lat: 1.3016, lng: 103.8278 },
      { lat: 1.3002, lng: 103.8342 },
      { lat: 1.3006, lng: 103.8410 },
    ],
  },
  {
    name: 'Clemenceau Ave',
    points: [
      { lat: 1.3072, lng: 103.8416 },
      { lat: 1.2994, lng: 103.8414 },
      { lat: 1.2908, lng: 103.8412 },
    ],
  },
  {
    name: 'Victoria St',
    major: true,
    labelAt: { lat: 1.2998, lng: 103.8554 },
    points: [
      { lat: 1.3070, lng: 103.8602 },
      { lat: 1.3006, lng: 103.8558 },
      { lat: 1.2948, lng: 103.8524 },
      { lat: 1.2896, lng: 103.8512 },
    ],
  },
  {
    name: 'Rochor / Ophir Rd',
    points: [
      { lat: 1.3048, lng: 103.8505 },
      { lat: 1.3010, lng: 103.8558 },
      { lat: 1.2982, lng: 103.8618 },
    ],
  },
  {
    name: 'Bayfront Ave',
    major: true,
    labelAt: { lat: 1.2832, lng: 103.8601 },
    points: [
      { lat: 1.2890, lng: 103.8588 },
      { lat: 1.2836, lng: 103.8598 },
      { lat: 1.2782, lng: 103.8552 },
    ],
  },
  {
    name: 'Shenton Way',
    major: true,
    labelAt: { lat: 1.2818, lng: 103.8508 },
    points: [
      { lat: 1.2865, lng: 103.8528 },
      { lat: 1.2812, lng: 103.8506 },
      { lat: 1.2748, lng: 103.8474 },
    ],
  },
  {
    name: 'New Bridge Rd',
    major: true,
    labelAt: { lat: 1.2836, lng: 103.8442 },
    points: [
      { lat: 1.2898, lng: 103.8468 },
      { lat: 1.2846, lng: 103.8446 },
      { lat: 1.2794, lng: 103.8406 },
    ],
  },
  {
    name: 'Tiong Bahru Rd',
    major: true,
    labelAt: { lat: 1.2856, lng: 103.8318 },
    points: [
      { lat: 1.2878, lng: 103.8225 },
      { lat: 1.2855, lng: 103.8322 },
      { lat: 1.2840, lng: 103.8402 },
    ],
  },
  {
    name: 'Telok Blangah Rd',
    major: true,
    points: [
      { lat: 1.2680, lng: 103.8120 },
      { lat: 1.2650, lng: 103.8220 },
      { lat: 1.2682, lng: 103.8320 },
    ],
  },
  {
    name: 'East Coast Pkwy',
    major: true,
    labelAt: { lat: 1.3054, lng: 103.9308 },
    points: [
      { lat: 1.2980, lng: 103.9020 },
      { lat: 1.3055, lng: 103.9305 },
      { lat: 1.3125, lng: 103.9580 },
    ],
  },
  {
    name: 'Airport Blvd',
    major: true,
    labelAt: { lat: 1.3604, lng: 103.9885 },
    points: [
      { lat: 1.3480, lng: 103.9860 },
      { lat: 1.3602, lng: 103.9898 },
      { lat: 1.3680, lng: 103.9920 },
    ],
  },
  {
    name: 'Jurong Gateway Rd',
    major: true,
    labelAt: { lat: 1.3335, lng: 103.7422 },
    points: [
      { lat: 1.3360, lng: 103.7360 },
      { lat: 1.3332, lng: 103.7424 },
      { lat: 1.3305, lng: 103.7485 },
    ],
  },
];

const MRT_STATIONS: { name: string; code: string; lat: number; lng: number }[] = [
  { name: 'Orchard', code: 'NS22', lat: 1.3044, lng: 103.8318 },
  { name: 'Somerset', code: 'NS23', lat: 1.3005, lng: 103.8390 },
  { name: 'Dhoby Ghaut', code: 'NS24', lat: 1.2991, lng: 103.8458 },
  { name: 'Bayfront', code: 'CE1', lat: 1.2819, lng: 103.8590 },
  { name: 'Raffles Place', code: 'EW14', lat: 1.2839, lng: 103.8515 },
  { name: 'Chinatown', code: 'NE4', lat: 1.2848, lng: 103.8439 },
  { name: 'Bugis', code: 'EW12', lat: 1.3007, lng: 103.8559 },
  { name: 'Tiong Bahru', code: 'EW17', lat: 1.2862, lng: 103.8270 },
  { name: 'HarbourFront', code: 'NE1', lat: 1.2653, lng: 103.8214 },
  { name: 'Jurong East', code: 'EW24', lat: 1.3332, lng: 103.7422 },
  { name: 'Changi Airport', code: 'CG2', lat: 1.3574, lng: 103.9885 },
];

const DISTRICT_LABELS: { name: string; lat: number; lng: number }[] = [
  { name: 'ORCHARD', lat: 1.3065, lng: 103.8355 },
  { name: 'MARINA BAY', lat: 1.2858, lng: 103.8565 },
  { name: 'CHINATOWN', lat: 1.2816, lng: 103.8430 },
  { name: 'BUGIS', lat: 1.3016, lng: 103.8582 },
  { name: 'TIONG BAHRU', lat: 1.2845, lng: 103.8300 },
  { name: 'EAST COAST', lat: 1.3062, lng: 103.9325 },
  { name: 'CHANGI JEWEL', lat: 1.3618, lng: 103.9896 },
  { name: 'JURONG EAST', lat: 1.3348, lng: 103.7424 },
];

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [center, setCenter] = useState<LatLng>({
    lat: userPosition.lat,
    lng: userPosition.lng,
  });
  const [zoom, setZoom] = useState<number>(15.2);

  const panDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startCenter: LatLng;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startCenter: { lat: userPosition.lat, lng: userPosition.lng },
    moved: false,
  });

  const userDragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPos: LatLng;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startPos: { lat: userPosition.lat, lng: userPosition.lng },
  });

  // Track container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewport({
        width: el.clientWidth || 1200,
        height: el.clientHeight || 800,
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-center when user switches district or GPS
  useEffect(() => {
    setCenter({ lat: userPosition.lat, lng: userPosition.lng });
  }, [userPosition.lat, userPosition.lng]);

  // Gently pan to selected facility
  useEffect(() => {
    if (!selectedFacility || routeFacility) return;
    setCenter({ lat: selectedFacility.lat, lng: selectedFacility.lng });
  }, [selectedFacility, routeFacility]);

  // Frame both user and route target when route is active
  useEffect(() => {
    if (!routeFacility) return;
    const midLat = (userPosition.lat + routeFacility.lat) / 2;
    const midLng = (userPosition.lng + routeFacility.lng) / 2;
    setCenter({ lat: midLat, lng: midLng });
  }, [routeFacility, userPosition.lat, userPosition.lng]);

  // Projection scale (pixels per degree)
  const scale = useMemo(() => {
    const pxPerDegLng = (256 * Math.pow(2, zoom)) / 360;
    const pxPerDegLat = pxPerDegLng / Math.cos((center.lat * Math.PI) / 180);
    const metersPerPixel =
      (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) /
      Math.pow(2, zoom);
    return { pxPerDegLng, pxPerDegLat, metersPerPixel };
  }, [zoom, center.lat]);

  const project = (lat: number, lng: number) => ({
    x: viewport.width / 2 + (lng - center.lng) * scale.pxPerDegLng,
    y: viewport.height / 2 - (lat - center.lat) * scale.pxPerDegLat,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-map-interactive="true"]')) {
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    panDragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startCenter: center,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (userDragRef.current.active) {
      const dx = e.clientX - userDragRef.current.startX;
      const dy = e.clientY - userDragRef.current.startY;
      const nextLat = userDragRef.current.startPos.lat - dy / scale.pxPerDegLat;
      const nextLng = userDragRef.current.startPos.lng + dx / scale.pxPerDegLng;
      onUserPositionMove(nextLat, nextLng);
      return;
    }

    if (!panDragRef.current.active) return;
    const dx = e.clientX - panDragRef.current.startX;
    const dy = e.clientY - panDragRef.current.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      panDragRef.current.moved = true;
    }

    const nextLat = panDragRef.current.startCenter.lat + dy / scale.pxPerDegLat;
    const nextLng = panDragRef.current.startCenter.lng - dx / scale.pxPerDegLng;
    setCenter({ lat: nextLat, lng: nextLng });
  };

  const handlePointerUp = () => {
    if (userDragRef.current.active) {
      userDragRef.current.active = false;
      return;
    }
    if (panDragRef.current.active) {
      panDragRef.current.active = false;
      onMapCenterChange(center.lat, center.lng);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY < 0 ? 0.35 : -0.35;
    setZoom((z) => Math.max(12, Math.min(18, Number((z + delta).toFixed(2)))));
  };

  const userPixel = project(userPosition.lat, userPosition.lng);
  const radiusPx = Math.max(24, radiusMeters / scale.metersPerPixel);

  const routePath = useMemo(() => {
    if (!routeFacility) return null;
    const start = project(userPosition.lat, userPosition.lng);
    const end = project(routeFacility.lat, routeFacility.lng);
    // Subtle street-grid elbow waypoint for realistic walking path look
    const mid = {
      x: start.x + (end.x - start.x) * 0.56,
      y: start.y + (end.y - start.y) * 0.38,
    };
    return `M ${start.x} ${start.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`;
  }, [routeFacility, userPosition.lat, userPosition.lng, center, zoom, viewport]);

  const radiusLabel =
    radiusMeters >= 1000
      ? `${(radiusMeters / 1000).toFixed(radiusMeters % 1000 === 0 ? 0 : 1)}km radius`
      : `${radiusMeters}m radius`;

  // Subtle repeating local block grid anchored in geographic space
  const gridLines = useMemo(() => {
    const stepLat = 0.0022;
    const stepLng = 0.0026;
    const latSpan = viewport.height / 2 / scale.pxPerDegLat + stepLat;
    const lngSpan = viewport.width / 2 / scale.pxPerDegLng + stepLng;

    const minLat = Math.floor((center.lat - latSpan) / stepLat) * stepLat;
    const maxLat = Math.ceil((center.lat + latSpan) / stepLat) * stepLat;
    const minLng = Math.floor((center.lng - lngSpan) / stepLng) * stepLng;
    const maxLng = Math.ceil((center.lng + lngSpan) / stepLng) * stepLng;

    const horizontals: number[] = [];
    for (let lat = minLat; lat <= maxLat; lat += stepLat) {
      horizontals.push(project(lat, center.lng).y);
    }

    const verticals: number[] = [];
    for (let lng = minLng; lng <= maxLng; lng += stepLng) {
      verticals.push(project(center.lat, lng).x);
    }

    return { horizontals, verticals };
  }, [center, scale, viewport]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      role="application"
      aria-label="Interactive demo map of Singapore public restrooms and drinking fountains"
      className="relative w-full h-full overflow-hidden select-none touch-none bg-[#f2f6fb] cursor-grab active:cursor-grabbing"
    >
      {/* Cartographic Vector Base Layer */}
      <svg
        width={viewport.width}
        height={viewport.height}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Subtle Neighborhood Street Grid */}
        <g stroke="#e2ebf5" strokeWidth="5" strokeLinecap="round">
          {gridLines.horizontals.map((y, idx) => (
            <line key={`h-${idx}`} x1={0} y1={y} x2={viewport.width} y2={y} />
          ))}
          {gridLines.verticals.map((x, idx) => (
            <line key={`v-${idx}`} x1={x} y1={0} x2={x} y2={viewport.height} />
          ))}
        </g>

        {/* Parks & Green Reserves */}
        {PARK_POLYGONS.map((park) => {
          const pts = park.points
            .map((p) => {
              const pt = project(p.lat, p.lng);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={park.name}
              points={pts}
              fill="#dcf2e7"
              stroke="#c4e6d5"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Water Bodies (Marina Bay, Singapore River, Straits) */}
        {WATER_POLYGONS.map((poly, idx) => {
          const pts = poly
            .map((p) => {
              const pt = project(p.lat, p.lng);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={`water-${idx}`}
              points={pts}
              fill="#cce6f9"
              stroke="#b0d6f2"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Arterial Roads Casing */}
        {ARTERIAL_ROADS.map((road) => {
          const d = road.points
            .map((p, i) => {
              const pt = project(p.lat, p.lng);
              return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
            })
            .join(' ');
          return (
            <g key={road.name}>
              <path
                d={d}
                fill="none"
                stroke="#d2dfec"
                strokeWidth={road.major ? 12 : 8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={d}
                fill="none"
                stroke={road.major ? '#ffffff' : '#f8fbff'}
                strokeWidth={road.major ? 8.5 : 5.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* District & Street Labels */}
        {DISTRICT_LABELS.map((d) => {
          const pt = project(d.lat, d.lng);
          if (
            pt.x < -80 ||
            pt.x > viewport.width + 80 ||
            pt.y < -40 ||
            pt.y > viewport.height + 40
          ) {
            return null;
          }
          return (
            <text
              key={d.name}
              x={pt.x}
              y={pt.y}
              textAnchor="middle"
              fill="#64748b"
              fontSize="11"
              fontWeight="700"
              letterSpacing="1.6"
              opacity="0.7"
            >
              {d.name}
            </text>
          );
        })}

        {ARTERIAL_ROADS.map((road) => {
          if (!road.labelAt) return null;
          const pt = project(road.labelAt.lat, road.labelAt.lng);
          if (
            pt.x < -60 ||
            pt.x > viewport.width + 60 ||
            pt.y < -30 ||
            pt.y > viewport.height + 30
          ) {
            return null;
          }
          return (
            <text
              key={`lbl-${road.name}`}
              x={pt.x}
              y={pt.y - 8}
              textAnchor="middle"
              fill="#475569"
              fontSize="10"
              fontWeight="600"
            >
              {road.name}
            </text>
          );
        })}

        {/* Search Radius Dashed Circle */}
        <circle
          cx={userPixel.x}
          cy={userPixel.y}
          r={radiusPx}
          fill={urgentMode ? 'rgba(255, 95, 21, 0.07)' : 'rgba(14, 165, 233, 0.08)'}
          stroke={urgentMode ? '#FF5F15' : 'rgba(2, 132, 199, 0.5)'}
          strokeWidth="2"
          strokeDasharray="6 8"
        />

        {/* Walking Route Polyline */}
        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke={urgentMode ? '#FF5F15' : '#0284c7'}
            strokeWidth={urgentMode ? 5 : 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={urgentMode ? undefined : '9 7'}
          />
        )}
      </svg>

      {/* MRT Station Landmarks */}
      {MRT_STATIONS.map((mrt) => {
        const pt = project(mrt.lat, mrt.lng);
        if (
          pt.x < -60 ||
          pt.x > viewport.width + 60 ||
          pt.y < -40 ||
          pt.y > viewport.height + 40
        ) {
          return null;
        }
        return (
          <div
            key={mrt.code}
            style={{ left: pt.x, top: pt.y }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-white/85 border border-[#cbd5e1] px-2 py-0.5 shadow-xs"
          >
            <span className="text-[9px] font-bold text-[#006194]">{mrt.code}</span>
            <span className="text-[10px] font-medium text-[#3f4850] whitespace-nowrap">
              {mrt.name}
            </span>
          </div>
        );
      })}

      {/* Facility Markers */}
      {facilities.map((facility) => {
        const pt = project(facility.lat, facility.lng);
        if (
          pt.x < -50 ||
          pt.x > viewport.width + 50 ||
          pt.y < -50 ||
          pt.y > viewport.height + 50
        ) {
          return null;
        }

        const isSelected = selectedFacility?.id === facility.id;
        const isRouteTarget = routeFacility?.id === facility.id;
        const isUrgentTarget = urgentMode && isRouteTarget;
        const active = isSelected || isRouteTarget;

        const bgClass = isUrgentTarget
          ? 'bg-[#FF5F15]'
          : facility.queueStatus === 'busy'
            ? 'bg-[#f59e0b]'
            : facility.verifiedClean && facility.amenities.free
              ? 'bg-[#0284c7]'
              : 'bg-[#006194]';

        const dotClass =
          facility.queueStatus === 'low'
            ? 'bg-[#10b981]'
            : facility.queueStatus === 'moderate'
              ? 'bg-[#f59e0b]'
              : 'bg-[#ef4444]';

        return (
          <button
            key={facility.id}
            type="button"
            data-map-interactive="true"
            onClick={() => onSelectFacility(facility)}
            style={{ left: pt.x, top: pt.y, zIndex: active ? 410 : 300 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
            aria-label={`Select ${facility.name}`}
          >
            <div
              className={`relative flex items-center justify-center transition-transform duration-150 ${
                active ? 'w-11 h-11 scale-110' : 'w-9 h-9 hover:scale-110'
              }`}
            >
              {(isSelected || isUrgentTarget) && (
                <span
                  className={`marker-ping absolute inset-0 rounded-full ${
                    isUrgentTarget ? 'bg-[#FF5F15]/35' : 'bg-[#0284c7]/35'
                  }`}
                />
              )}

              {facility.kind === 'fountain' ? (
                <div
                  className={`relative w-full h-full rounded-full bg-white shadow-md border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#0284c7]' : 'border-[#0ea5e9]/80'
                  }`}
                >
                  <FountainPinGraphic className="w-5 h-5" />
                </div>
              ) : (
                <div
                  className={`relative w-full h-full rounded-full text-white shadow-lg border-2 border-white flex items-center justify-center ${bgClass}`}
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
              )}
            </div>

            {/* Label on active or hover */}
            <span
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#111d27] shadow-sm whitespace-nowrap transition-opacity ${
                active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {facility.name}
            </span>
          </button>
        );
      })}

      {/* Draggable User Location Pin */}
      <div
        data-map-interactive="true"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          userDragRef.current = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            startPos: { lat: userPosition.lat, lng: userPosition.lng },
          };
        }}
        style={{ left: userPixel.x, top: userPixel.y, zIndex: 415 }}
        title="Your location (drag to move)"
        className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
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

      {/* Subtle Demo Map Caption */}
      <div className="pointer-events-none fixed bottom-24 lg:bottom-3 right-3 z-[410] rounded-full bg-white/75 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-medium text-[#3f4850]">
        Demo Map · Singapore Vector View
      </div>

      {/* Map Controls (Zoom & Recenter) */}
      <div className="fixed right-4 bottom-28 lg:bottom-10 z-[440] flex flex-col gap-2">
        <button
          type="button"
          data-map-interactive="true"
          onClick={() =>
            setZoom((z) => Math.min(18, Number((z + 0.6).toFixed(2))))
          }
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom in map"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          data-map-interactive="true"
          onClick={() =>
            setZoom((z) => Math.max(12, Number((z - 0.6).toFixed(2))))
          }
          className="sf-glass w-11 h-11 rounded-full flex items-center justify-center text-[#111d27] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label="Zoom out map"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          type="button"
          data-map-interactive="true"
          onClick={() => {
            setCenter({ lat: userPosition.lat, lng: userPosition.lng });
            setZoom(15.2);
            onRecenter();
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
