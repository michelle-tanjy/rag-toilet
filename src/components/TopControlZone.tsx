import React from 'react';
import {
  Accessibility,
  Baby,
  Droplets,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Siren,
  X,
} from 'lucide-react';
import {
  DistrictPreset,
  FilterKey,
  UserPosition,
} from '../types/facility';
import { SINGAPORE_DISTRICTS } from '../data/singaporeFacilities';
import { SgToiletsBrandMark } from './FacilityVisuals';

interface TopControlZoneProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  nearbyOnly: boolean;
  onToggleNearby: () => void;
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  radiusMeters: number;
  onRadiusChange: (meters: number) => void;
  urgentMode: boolean;
  onToggleUrgentMode: () => void;
  userPosition: UserPosition;
  onSelectDistrict: (district: DistrictPreset) => void;
  onStartAddPin: () => void;
  isAddingPin: boolean;
}

const FILTERS: {
  key: FilterKey;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'all', label: 'All' },
  { key: 'toilet', label: 'Toilets' },
  { key: 'fountain', label: 'Fountains', icon: Droplets },
  { key: 'wheelchair', label: 'Wheelchair', icon: Accessibility },
  { key: 'bidet', label: 'Bidet', icon: Sparkles },
  { key: 'babyChanging', label: 'Baby Care', icon: Baby },
  { key: 'free', label: 'Free Only' },
];

const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
];

export const TopControlZone: React.FC<TopControlZoneProps> = ({
  searchQuery,
  onSearchChange,
  nearbyOnly,
  onToggleNearby,
  activeFilter,
  onFilterChange,
  radiusMeters,
  onRadiusChange,
  urgentMode,
  onToggleUrgentMode,
  userPosition,
  onSelectDistrict,
  onStartAddPin,
  isAddingPin,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-[500] p-3 sm:p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* App Header Bar */}
        <div className="sf-glass h-11 rounded-full px-3.5 sm:px-4 flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <SgToiletsBrandMark className="w-6 h-6" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#111d27] whitespace-nowrap truncate">
              Toilet Go Where?
            </h1>
          </div>

          <button
            type="button"
            onClick={onStartAddPin}
            className={`h-8 px-3 sm:px-3.5 rounded-full font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-transform active:scale-[0.97] ${
              isAddingPin
                ? 'bg-[#111d27] text-white'
                : 'bg-[#e3effd] text-[#006194] hover:bg-[#cce5ff]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{isAddingPin ? 'Cancel Pin' : 'Add Pin'}</span>
          </button>
        </div>

        {/* Row 2: Floating Search Pill + Urgent Need */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Integrated Search Pill */}
          <div
            className={`sf-glass flex-1 min-w-0 h-12 rounded-full px-3.5 sm:px-4 flex items-center gap-2.5 transition-all ${
              urgentMode ? 'ring-2 ring-[#FF5F15]/50 bg-white/95' : ''
            }`}
          >
            <Search
              className="w-4 h-4 text-[#707881] shrink-0"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search MRT, mall, hawker centre..."
              aria-label="Search Singapore restrooms and drinking fountains"
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-[15px] font-medium text-[#111d27] placeholder:text-[#707881] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="w-7 h-7 rounded-full hover:bg-[#e3effd] flex items-center justify-center text-[#3f4850] shrink-0"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Right-aligned Nearby Tactile Switch */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#bfc7d2]/60 shrink-0">
              <span className="text-xs font-semibold text-[#3f4850] whitespace-nowrap">
                Nearby
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={nearbyOnly}
                onClick={onToggleNearby}
                aria-label="Filter to nearby facilities within radius"
                className={`relative w-11 h-6 rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#0284c7] ${
                  nearbyOnly ? 'bg-[#0284c7]' : 'bg-[#bfc7d2]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                    nearbyOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Urgent Need Mode CTA */}
          <button
            type="button"
            onClick={onToggleUrgentMode}
            aria-pressed={urgentMode}
            className={`h-12 px-3.5 sm:px-4 rounded-full font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5F15] ${
              urgentMode
                ? 'bg-[#FF5F15] hover:bg-[#E5530D] text-white shadow-md'
                : 'bg-[#FFE6D9] hover:bg-[#FFD8C4] text-[#8A2B00] shadow-sm'
            }`}
          >
            <Siren
              className={`w-4 h-4 shrink-0 ${
                urgentMode ? 'text-white' : 'text-[#FF5F15]'
              }`}
            />
            <span>{urgentMode ? 'Exit Urgent' : 'Urgent Need'}</span>
          </button>
        </div>

        {/* Row 2: Single-line Filter Buttons + District & Radius Selectors */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto sf-scroll-hidden py-0.5">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => onFilterChange(filter.key)}
                  className={`h-9 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : 'sf-glass text-[#3f4850] hover:bg-white hover:text-[#111d27]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {/* Radius Selector */}
            <div className="sf-glass h-9 rounded-full px-1.5 flex items-center gap-0.5">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onRadiusChange(opt.value)}
                  className={`px-2.5 h-7 rounded-full text-xs font-semibold tabular-nums transition-colors ${
                    radiusMeters === opt.value
                      ? 'bg-[#0284c7] text-white'
                      : 'text-[#3f4850] hover:text-[#111d27]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Area Switcher */}
            <div className="sf-glass h-9 rounded-full px-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <select
                aria-label="Jump to Singapore district"
                value={
                  SINGAPORE_DISTRICTS.find((d) => d.name === userPosition.label)
                    ?.id || 'custom'
                }
                onChange={(e) => {
                  const found = SINGAPORE_DISTRICTS.find(
                    (d) => d.id === e.target.value
                  );
                  if (found) onSelectDistrict(found);
                }}
                className="bg-transparent text-xs font-semibold text-[#111d27] focus:outline-none cursor-pointer pr-1"
              >
                {userPosition.isLiveGps && (
                  <option value="custom">Live GPS</option>
                )}
                {SINGAPORE_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
