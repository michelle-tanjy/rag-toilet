import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
  Plus,
  Siren,
  Star,
} from 'lucide-react';
import {
  DrawerSnap,
  Facility,
  FacilityKind,
  SortMode,
  UserPosition,
} from '../types/facility';
import {
  estimateWalkMinutes,
  formatDistance,
  SINGAPORE_DISTRICTS,
} from '../data/singaporeFacilities';
import {
  AmenityRibbon,
  FountainPinGraphic,
  QueueStatusMeter,
} from './FacilityVisuals';
import { FacilityDetailView } from './FacilityDetailView';
import { AddPinView } from './AddPinView';

export interface FacilityWithDistance {
  facility: Facility;
  distanceMeters: number;
}

interface BottomSheetDrawerProps {
  snap: DrawerSnap;
  onSnapChange: (snap: DrawerSnap) => void;
  items: FacilityWithDistance[];
  selectedFacility: Facility | null;
  routeFacility: Facility | null;
  urgentMode: boolean;
  isAddingPin: boolean;
  newPinKind: FacilityKind;
  mapCenter: { lat: number; lng: number };
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  radiusMeters: number;
  onRadiusChange: (meters: number) => void;
  userPosition: UserPosition;
  onSelectDistrict: (id: string) => void;
  onSelectFacility: (facility: Facility) => void;
  onClearSelection: () => void;
  onStartRoute: (facility: Facility) => void;
  onStopRoute: () => void;
  onToggleUrgentMode: () => void;
  onSubmitLog: (
    facilityId: string,
    rating: number,
    queueStatus: 'low' | 'moderate' | 'busy',
    note: string
  ) => void;
  onStartAddPin: () => void;
  onCancelAddPin: () => void;
  onChangePinKind: (kind: FacilityKind) => void;
  onSubmitPin: (facility: Facility) => void;
  onDeleteCommunityPin: (facilityId: string) => void;
}

export const BottomSheetDrawer: React.FC<BottomSheetDrawerProps> = ({
  snap,
  onSnapChange,
  items,
  selectedFacility,
  routeFacility,
  urgentMode,
  isAddingPin,
  newPinKind,
  mapCenter,
  sortMode,
  onSortModeChange,
  radiusMeters,
  onRadiusChange,
  userPosition,
  onSelectDistrict,
  onSelectFacility,
  onClearSelection,
  onStartRoute,
  onStopRoute,
  onToggleUrgentMode,
  onSubmitLog,
  onStartAddPin,
  onCancelAddPin,
  onChangePinKind,
  onSubmitPin,
  onDeleteCommunityPin,
}) => {
  const nearestItem = items[0] ?? null;

  const selectedEntry = selectedFacility
    ? items.find((i) => i.facility.id === selectedFacility.id) || {
        facility: selectedFacility,
        distanceMeters: 0,
      }
    : null;

  // Height classes for mobile sheet (peek / half / full) and desktop floating panel
  const mobileHeightClass =
    snap === 'peek'
      ? 'h-[92px]'
      : snap === 'half'
        ? 'h-[48vh]'
        : 'h-[86vh]';

  const cycleMobileSnap = () => {
    if (snap === 'peek') onSnapChange('half');
    else if (snap === 'half') onSnapChange('full');
    else onSnapChange('peek');
  };

  return (
    <aside
      aria-label="Restroom details and nearby directory"
      className={`fixed z-[480] left-0 right-0 bottom-0 lg:left-4 lg:right-auto lg:top-[126px] lg:bottom-4 lg:w-[416px] transition-all duration-200 ease-out flex flex-col sf-glass-card rounded-t-[1.75rem] lg:rounded-[1.75rem] overflow-hidden ${mobileHeightClass} lg:h-auto ${
        urgentMode ? 'ring-2 ring-[#dc2626]/35' : ''
      }`}
    >
      {/* Mobile Drag / Tap Snap Handle */}
      <div className="lg:hidden shrink-0 pt-2 pb-1 px-4 flex items-center justify-between">
        <span className="w-8" aria-hidden="true" />
        <button
          type="button"
          onClick={cycleMobileSnap}
          className="py-1.5 px-6 flex items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#0284c7]"
          aria-label={
            snap === 'peek'
              ? 'Expand nearby list'
              : snap === 'half'
                ? 'Expand drawer to full screen'
                : 'Collapse drawer to peek mode'
          }
        >
          <span className="w-10 h-1.5 rounded-full bg-[#bfc7d2]" />
        </button>
        <button
          type="button"
          onClick={() => onSnapChange(snap === 'peek' ? 'half' : 'peek')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#3f4850] hover:bg-[#e3effd]"
          aria-label={snap === 'peek' ? 'Open drawer' : 'Minimize drawer'}
        >
          {snap === 'peek' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Peek Bar on Mobile when collapsed */}
      {snap === 'peek' && !selectedEntry && !isAddingPin && (
        <div className="lg:hidden px-4 pb-3 flex items-center justify-between gap-2.5">
          {nearestItem ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelectFacility(nearestItem.facility);
                  onSnapChange('half');
                }}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111d27] truncate">
                    {nearestItem.facility.name}
                  </span>
                  <span className="text-xs font-bold text-[#0284c7] tabular-nums shrink-0">
                    {formatDistance(nearestItem.distanceMeters)}
                  </span>
                </div>
                <QueueStatusMeter
                  status={nearestItem.facility.queueStatus}
                  waitLabel={nearestItem.facility.waitMinutesLabel}
                  kind={nearestItem.facility.kind}
                />
              </button>

              <button
                type="button"
                onClick={() => onStartRoute(nearestItem.facility)}
                className={`h-10 px-4 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5 shrink-0 shadow-sm ${
                  urgentMode ? 'bg-[#dc2626]' : 'bg-[#0284c7]'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route</span>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-[#3f4850]">
                No matches inside radius
              </span>
              <button
                type="button"
                onClick={() => onRadiusChange(5000)}
                className="h-9 px-3.5 rounded-full bg-[#0284c7] text-white text-xs font-semibold"
              >
                Expand to 5km
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Scrollable Content (Always visible on Desktop, or Half/Full on Mobile) */}
      <div
        className={`flex-1 overflow-y-auto sf-scroll px-4 pb-5 pt-1 lg:pt-4 ${
          snap === 'peek' && !selectedEntry && !isAddingPin
            ? 'hidden lg:block'
            : 'block'
        }`}
      >
        {isAddingPin ? (
          <AddPinView
            centerCoords={mapCenter}
            pinKind={newPinKind}
            onChangeKind={onChangePinKind}
            onCancel={onCancelAddPin}
            onSubmitPin={onSubmitPin}
          />
        ) : selectedEntry ? (
          <FacilityDetailView
            facility={selectedEntry.facility}
            distanceMeters={selectedEntry.distanceMeters}
            isNavigating={routeFacility?.id === selectedEntry.facility.id}
            urgentMode={urgentMode}
            onBack={onClearSelection}
            onStartRoute={() => onStartRoute(selectedEntry.facility)}
            onStopRoute={onStopRoute}
            onSubmitLog={onSubmitLog}
            onDeleteCommunityPin={onDeleteCommunityPin}
          />
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Urgent Need Banner when active */}
            {urgentMode && nearestItem && (
              <div className="rounded-2xl bg-[#fef2f2] border border-[#dc2626]/30 p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc2626]">
                    <Siren className="w-3.5 h-3.5" />
                    <span>Nearest Unlocked Facility</span>
                  </div>
                  <p className="text-sm font-semibold text-[#111d27] truncate mt-0.5">
                    {nearestItem.facility.name}
                  </p>
                  <p className="text-xs text-[#3f4850] tabular-nums">
                    {formatDistance(nearestItem.distanceMeters)} ·{' '}
                    {estimateWalkMinutes(nearestItem.distanceMeters)} min walk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectFacility(nearestItem.facility)}
                  className="h-9 px-3.5 rounded-full bg-[#dc2626] text-white text-xs font-semibold shrink-0"
                >
                  Open Guide
                </button>
              </div>
            )}

            {/* Mobile-only District, Radius & Add Pin quick row */}
            <div className="flex sm:hidden items-center justify-between gap-2 pb-1 border-b border-[#e3effd]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
                <select
                  aria-label="Select Singapore neighborhood"
                  value={
                    SINGAPORE_DISTRICTS.find(
                      (d) => d.name === userPosition.label
                    )?.id || 'orchard'
                  }
                  onChange={(e) => onSelectDistrict(e.target.value)}
                  className="bg-[#f1f5f9] rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#111d27]"
                >
                  {SINGAPORE_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Search radius"
                  value={radiusMeters}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
                  className="bg-[#f1f5f9] rounded-full px-2.5 py-1.5 text-xs font-semibold text-[#111d27] tabular-nums"
                >
                  <option value={500}>500m</option>
                  <option value={1000}>1km</option>
                  <option value={2000}>2km</option>
                  <option value={5000}>5km</option>
                </select>
              </div>
              <button
                type="button"
                onClick={onStartAddPin}
                className="h-8 px-3 rounded-full bg-[#e3effd] text-[#006194] text-xs font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pin</span>
              </button>
            </div>

            {/* Directory Header & Sort Segmented Control */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-[#111d27]">
                  Nearby Facilities
                </h2>
                <p className="text-xs text-[#3f4850] tabular-nums">
                  {items.length}{' '}
                  {items.length === 1 ? 'location' : 'locations'} near{' '}
                  {userPosition.label}
                </p>
              </div>

              <div
                className="flex items-center gap-0.5 p-1 rounded-full bg-[#f1f5f9]"
                role="group"
                aria-label="Sort facilities"
              >
                {(
                  [
                    { key: 'distance', label: 'Closest' },
                    { key: 'rating', label: 'Cleanest' },
                    { key: 'queue', label: 'No Wait' },
                  ] as { key: SortMode; label: string }[]
                ).map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => onSortModeChange(mode.key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      sortMode === mode.key
                        ? 'bg-white text-[#111d27] shadow-sm'
                        : 'text-[#3f4850] hover:text-[#111d27]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="rounded-2xl bg-[#f7f9ff] border border-[#dde9f8] p-6 text-center flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-[#111d27]">
                  No restrooms or fountains matched inside this radius
                </p>
                <p className="text-xs text-[#3f4850]">
                  Try widening your search radius to 5km or clearing active
                  amenity filters.
                </p>
                <button
                  type="button"
                  onClick={() => onRadiusChange(5000)}
                  className="h-10 px-4 rounded-full bg-[#0284c7] text-white text-xs font-semibold"
                >
                  Widen to 5km radius
                </button>
              </div>
            )}

            {/* Facility Cards List */}
            <div className="flex flex-col gap-2.5">
              {items.map(({ facility, distanceMeters }) => {
                const walkMins = estimateWalkMinutes(distanceMeters);
                const isFountain = facility.kind === 'fountain';
                const isRouteActive = routeFacility?.id === facility.id;

                return (
                  <div
                    key={facility.id}
                    className={`rounded-2xl bg-white/95 border transition-all p-3.5 flex flex-col gap-2.5 ${
                      isRouteActive
                        ? urgentMode
                          ? 'border-[#dc2626] shadow-md'
                          : 'border-[#0284c7] shadow-md'
                        : 'border-[#e3effd] hover:border-[#93ccff]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectFacility(facility)}
                        className="flex-1 min-w-0 text-left flex items-start gap-2.5 group"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isFountain
                              ? 'bg-[#e0f2fe] text-[#0284c7]'
                              : 'bg-[#ecf4ff] text-[#006194]'
                          }`}
                        >
                          {isFountain ? (
                            <FountainPinGraphic className="w-6 h-6" />
                          ) : (
                            <span className="text-xs font-bold">
                              {facility.amenities.free ? 'FREE' : '$0.20'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#3f4850]">
                            <span>{facility.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-0.5 font-semibold text-[#111d27] tabular-nums">
                              <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                              {facility.rating.toFixed(1)}
                            </span>
                            {facility.neaGrade && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#047857] font-semibold">
                                  {facility.neaGrade}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="text-[15px] font-semibold text-[#111d27] group-hover:text-[#0284c7] transition-colors truncate">
                            {facility.name}
                          </h3>
                          <p className="text-xs text-[#3f4850] truncate">
                            {facility.locationTier}
                          </p>
                        </div>
                      </button>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-[#006194] tabular-nums">
                          {formatDistance(distanceMeters)}
                        </div>
                        <div className="text-[11px] font-medium text-[#3f4850] tabular-nums">
                          {walkMins} min
                        </div>
                      </div>
                    </div>

                    {/* Queue Status + Direct Route */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f1f5f9]">
                      <QueueStatusMeter
                        status={facility.queueStatus}
                        waitLabel={facility.waitMinutesLabel}
                        cubiclesFree={facility.cubiclesFree}
                        cubiclesTotal={facility.cubiclesTotal}
                        kind={facility.kind}
                      />

                      <button
                        type="button"
                        onClick={() => onStartRoute(facility)}
                        className={`h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition-transform active:scale-[0.97] ${
                          isRouteActive
                            ? 'bg-[#111d27] text-white'
                            : 'bg-[#e3effd] hover:bg-[#0284c7] text-[#006194] hover:text-white'
                        }`}
                      >
                        <Navigation className="w-3 h-3" />
                        <span>{isRouteActive ? 'Active' : 'Route'}</span>
                      </button>
                    </div>

                    <AmenityRibbon facility={facility} compact />
                  </div>
                );
              })}
            </div>

            {/* Footer Actions (Urgent shortcut + Contribute Pin) */}
            <div className="pt-2 border-t border-[#e3effd] flex items-center justify-between gap-2 text-xs text-[#3f4850]">
              <button
                type="button"
                onClick={onStartAddPin}
                className="font-semibold text-[#0284c7] hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Missing a toilet or bubbler?</span>
              </button>
              <button
                type="button"
                onClick={onToggleUrgentMode}
                className="font-semibold text-[#dc2626] hover:underline"
              >
                {urgentMode ? 'Exit Urgent' : 'Urgent Need'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
