import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DistrictPreset,
  DrawerSnap,
  Facility,
  FacilityKind,
  FilterKey,
  QueueStatus,
  SortMode,
  UserPosition,
} from './types/facility';
import {
  calculateDistanceMeters,
  INITIAL_FACILITIES,
  SINGAPORE_DISTRICTS,
} from './data/singaporeFacilities';
import { TopControlZone } from './components/TopControlZone';
import { SingaporeMap } from './components/SingaporeMap';
import {
  BottomSheetDrawer,
  FacilityWithDistance,
} from './components/BottomSheetDrawer';

const STORAGE_KEY = 'sanitary-flow-sg-facilities-v1';

function loadInitialFacilities(): Facility[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FACILITIES;
    const parsed = JSON.parse(raw) as Facility[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to initial seed data
  }
  return INITIAL_FACILITIES;
}

export default function App() {
  const [facilities, setFacilities] = useState<Facility[]>(loadInitialFacilities);
  const [userPosition, setUserPosition] = useState<UserPosition>({
    lat: SINGAPORE_DISTRICTS[0].lat,
    lng: SINGAPORE_DISTRICTS[0].lng,
    label: SINGAPORE_DISTRICTS[0].name,
    isLiveGps: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [radiusMeters, setRadiusMeters] = useState<number>(2000);
  const [sortMode, setSortMode] = useState<SortMode>('distance');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null
  );
  const [routeFacilityId, setRouteFacilityId] = useState<string | null>(null);
  const [urgentMode, setUrgentMode] = useState(false);

  const [snap, setSnap] = useState<DrawerSnap>('half');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [newPinKind, setNewPinKind] = useState<FacilityKind>('toilet');
  const [mapCenter, setMapCenter] = useState({
    lat: SINGAPORE_DISTRICTS[0].lat,
    lng: SINGAPORE_DISTRICTS[0].lng,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
    } catch {
      // Ignore storage quota errors
    }
  }, [facilities]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const filteredWithDistance = useMemo<FacilityWithDistance[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = facilities
      .map((facility) => ({
        facility,
        distanceMeters: calculateDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          facility.lat,
          facility.lng
        ),
      }))
      .filter(({ facility, distanceMeters }) => {
        if (nearbyOnly && !q && distanceMeters > radiusMeters) {
          return false;
        }
        if (q) {
          const haystack = [
            facility.name,
            facility.district,
            facility.locationTier,
            facility.category,
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        switch (activeFilter) {
          case 'toilet':
            return facility.kind === 'toilet';
          case 'fountain':
            return facility.kind === 'fountain';
          case 'wheelchair':
            return facility.amenities.wheelchair;
          case 'bidet':
            return facility.amenities.bidet;
          case 'babyChanging':
            return facility.amenities.babyChanging;
          case 'free':
            return facility.amenities.free;
          default:
            return true;
        }
      });

    const queueWeight: Record<QueueStatus, number> = {
      low: 0,
      moderate: 1,
      busy: 2,
    };

    list.sort((a, b) => {
      if (sortMode === 'rating') {
        if (b.facility.rating !== a.facility.rating) {
          return b.facility.rating - a.facility.rating;
        }
        return a.distanceMeters - b.distanceMeters;
      }
      if (sortMode === 'queue') {
        const diff =
          queueWeight[a.facility.queueStatus] -
          queueWeight[b.facility.queueStatus];
        if (diff !== 0) return diff;
        return a.distanceMeters - b.distanceMeters;
      }
      return a.distanceMeters - b.distanceMeters;
    });

    return list;
  }, [
    facilities,
    userPosition.lat,
    userPosition.lng,
    searchQuery,
    nearbyOnly,
    radiusMeters,
    activeFilter,
    sortMode,
  ]);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  const routeFacility = useMemo(
    () => facilities.find((f) => f.id === routeFacilityId) ?? null,
    [facilities, routeFacilityId]
  );

  const handleToggleNearby = () => {
    const next = !nearbyOnly;
    setNearbyOnly(next);
    if (next && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const insideSingapore =
            latitude >= 1.15 &&
            latitude <= 1.48 &&
            longitude >= 103.58 &&
            longitude <= 104.12;
          if (insideSingapore) {
            setUserPosition({
              lat: latitude,
              lng: longitude,
              label: 'Live GPS',
              isLiveGps: true,
            });
            showToast('Centered on your live Singapore location');
          } else {
            showToast(
              `GPS outside Singapore — showing ${userPosition.label} area`
            );
          }
        },
        () => {
          showToast(`Showing facilities within ${radiusMeters >= 1000 ? `${radiusMeters / 1000}km` : `${radiusMeters}m`} of ${userPosition.label}`);
        },
        { timeout: 4000 }
      );
    }
  };

  const handleToggleUrgentMode = () => {
    if (urgentMode) {
      setUrgentMode(false);
      setRouteFacilityId(null);
      return;
    }

    // Find absolute nearest open toilet across Singapore regardless of active filter
    const nearestToilet = facilities
      .filter((f) => f.kind === 'toilet')
      .map((f) => ({
        facility: f,
        distanceMeters: calculateDistanceMeters(
          userPosition.lat,
          userPosition.lng,
          f.lat,
          f.lng
        ),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];

    if (!nearestToilet) return;

    setUrgentMode(true);
    setIsAddingPin(false);
    setSelectedFacilityId(nearestToilet.facility.id);
    setRouteFacilityId(nearestToilet.facility.id);
    setSnap('half');
    showToast(`Urgent route locked: ${nearestToilet.facility.name}`);
  };

  const handleSelectDistrict = (district: DistrictPreset) => {
    setUserPosition({
      lat: district.lat,
      lng: district.lng,
      label: district.name,
      isLiveGps: false,
    });
    setRouteFacilityId(null);
    setUrgentMode(false);
    showToast(`Exploring ${district.name}`);
  };

  const handleSelectDistrictById = (id: string) => {
    const found = SINGAPORE_DISTRICTS.find((d) => d.id === id);
    if (found) handleSelectDistrict(found);
  };

  const handleSelectFacility = (facility: Facility) => {
    setIsAddingPin(false);
    setSelectedFacilityId(facility.id);
    if (snap === 'peek') {
      setSnap('half');
    }
  };

  const handleStartRoute = (facility: Facility) => {
    setSelectedFacilityId(facility.id);
    setRouteFacilityId(facility.id);
    setSnap('half');
  };

  const handleSubmitLog = (
    facilityId: string,
    rating: number,
    queueStatus: QueueStatus,
    note: string
  ) => {
    const waitMap: Record<QueueStatus, string> = {
      low: '< 1 min',
      moderate: '2–4 min',
      busy: '5–8 min',
    };

    setFacilities((prev) =>
      prev.map((item) => {
        if (item.id !== facilityId) return item;
        const nextCount = item.reviewCount + 1;
        const nextRating = Number(
          ((item.rating * item.reviewCount + rating) / nextCount).toFixed(1)
        );
        const newLog = {
          id: `log-${Date.now()}`,
          author: 'Community Member',
          rating,
          queueStatus,
          note: note || `Updated queue status to ${waitMap[queueStatus]}.`,
          timestamp: 'Just now',
        };
        return {
          ...item,
          rating: nextRating,
          reviewCount: nextCount,
          queueStatus,
          waitMinutesLabel: waitMap[queueStatus],
          lastCleaned: rating >= 4 ? 'Just verified' : item.lastCleaned,
          logs: [newLog, ...item.logs],
        };
      })
    );
    showToast('Thanks! Cleanliness & queue status updated.');
  };

  const handleStartAddPin = () => {
    if (isAddingPin) {
      setIsAddingPin(false);
      return;
    }
    setUrgentMode(false);
    setSelectedFacilityId(null);
    setRouteFacilityId(null);
    setIsAddingPin(true);
    setSnap('half');
  };

  const handleSubmitPin = (newFacility: Facility) => {
    setFacilities((prev) => [newFacility, ...prev]);
    setIsAddingPin(false);
    setSelectedFacilityId(newFacility.id);
    setNearbyOnly(false);
    setActiveFilter('all');
    setSnap('half');
    showToast(`Added ${newFacility.name} to Singapore map`);
  };

  const handleDeleteCommunityPin = (facilityId: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== facilityId));
    setSelectedFacilityId(null);
    if (routeFacilityId === facilityId) setRouteFacilityId(null);
    showToast('Community pin removed');
  };

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#e8f1fb]">
      {/* Full-Bleed Interactive Singapore Map */}
      <SingaporeMap
        facilities={filteredWithDistance.map((i) => i.facility)}
        selectedFacility={selectedFacility}
        routeFacility={routeFacility}
        userPosition={userPosition}
        radiusMeters={radiusMeters}
        urgentMode={urgentMode}
        isAddingPin={isAddingPin}
        newPinKind={newPinKind}
        onSelectFacility={handleSelectFacility}
        onMapCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
        onUserPositionMove={(lat, lng) =>
          setUserPosition({
            lat,
            lng,
            label: 'Pinned Spot',
            isLiveGps: false,
          })
        }
        onRecenter={() => showToast(`Centered on ${userPosition.label}`)}
      />

      {/* Top Safe Control Zone */}
      <TopControlZone
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nearbyOnly={nearbyOnly}
        onToggleNearby={handleToggleNearby}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        radiusMeters={radiusMeters}
        onRadiusChange={setRadiusMeters}
        urgentMode={urgentMode}
        onToggleUrgentMode={handleToggleUrgentMode}
        userPosition={userPosition}
        onSelectDistrict={handleSelectDistrict}
        onStartAddPin={handleStartAddPin}
        isAddingPin={isAddingPin}
      />

      {/* Non-blocking Toast Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-[174px] sm:top-[164px] left-1/2 -translate-x-1/2 lg:left-[calc(50%+210px)] z-[520] pointer-events-none"
        >
          <div className="rounded-full bg-[#111d27]/90 text-white px-4 py-1.5 text-xs font-medium shadow-lg whitespace-nowrap">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Responsive Bottom Sheet / Desktop Floating Sidebar */}
      <BottomSheetDrawer
        snap={snap}
        onSnapChange={setSnap}
        items={filteredWithDistance}
        selectedFacility={selectedFacility}
        routeFacility={routeFacility}
        urgentMode={urgentMode}
        isAddingPin={isAddingPin}
        newPinKind={newPinKind}
        mapCenter={mapCenter}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        radiusMeters={radiusMeters}
        onRadiusChange={setRadiusMeters}
        userPosition={userPosition}
        onSelectDistrict={handleSelectDistrictById}
        onSelectFacility={handleSelectFacility}
        onClearSelection={() => {
          setSelectedFacilityId(null);
          if (urgentMode) {
            setUrgentMode(false);
            setRouteFacilityId(null);
          }
        }}
        onStartRoute={handleStartRoute}
        onStopRoute={() => {
          setRouteFacilityId(null);
          setUrgentMode(false);
        }}
        onToggleUrgentMode={handleToggleUrgentMode}
        onSubmitLog={handleSubmitLog}
        onStartAddPin={handleStartAddPin}
        onCancelAddPin={() => setIsAddingPin(false)}
        onChangePinKind={setNewPinKind}
        onSubmitPin={handleSubmitPin}
        onDeleteCommunityPin={handleDeleteCommunityPin}
      />
    </main>
  );
}
