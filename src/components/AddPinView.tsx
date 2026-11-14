import React, { useState } from 'react';
import {
  Accessibility,
  ArrowLeft,
  Baby,
  Clock,
  Droplets,
  MapPin,
  ShowerHead,
  Sparkles,
} from 'lucide-react';
import {
  Facility,
  FacilityCategory,
  FacilityKind,
} from '../types/facility';
import { FountainPinGraphic, SgToiletsBrandMark } from './FacilityVisuals';

interface AddPinViewProps {
  centerCoords: { lat: number; lng: number };
  pinKind: FacilityKind;
  onChangeKind: (kind: FacilityKind) => void;
  onCancel: () => void;
  onSubmitPin: (facility: Facility) => void;
}

export const AddPinView: React.FC<AddPinViewProps> = ({
  centerCoords,
  pinKind,
  onChangeKind,
  onCancel,
  onSubmitPin,
}) => {
  const [name, setName] = useState('');
  const [locationTier, setLocationTier] = useState('');
  const [category, setCategory] = useState<FacilityCategory>('Community Pin');
  const [isFree, setIsFree] = useState(true);
  const [wheelchair, setWheelchair] = useState(true);
  const [bidet, setBidet] = useState(false);
  const [babyChanging, setBabyChanging] = useState(false);
  const [shower, setShower] = useState(false);
  const [open24h, setOpen24h] = useState(false);
  const [waterRefill, setWaterRefill] = useState(pinKind === 'fountain');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a facility or landmark name.');
      return;
    }

    const newFacility: Facility = {
      id: `community-${Date.now()}`,
      name: name.trim(),
      kind: pinKind,
      category,
      district: 'Singapore',
      locationTier:
        locationTier.trim() ||
        (pinKind === 'fountain'
          ? 'Ground Level · Water Refill Point'
          : 'Level 1 · Community Verified Pin'),
      lat: centerCoords.lat,
      lng: centerCoords.lng,
      rating: 4.8,
      reviewCount: 1,
      neaGrade: 'Community Verified',
      verifiedClean: true,
      queueStatus: 'low',
      waitMinutesLabel: pinKind === 'fountain' ? 'No wait' : '< 1 min',
      cubiclesFree: pinKind === 'fountain' ? 1 : 3,
      cubiclesTotal: pinKind === 'fountain' ? 1 : 4,
      feeLabel: isFree ? 'Free' : '$0.20',
      hoursLabel: open24h ? '24 Hours' : '07:00 – 22:00',
      lastCleaned: 'Just verified',
      amenities: {
        wheelchair,
        bidet: pinKind === 'toilet' ? bidet : false,
        babyChanging: pinKind === 'toilet' ? babyChanging : false,
        shower: pinKind === 'toilet' ? shower : false,
        free: isFree,
        open24h,
        waterRefill: pinKind === 'fountain' ? true : waterRefill,
      },
      wayfindingSteps: [
        locationTier.trim() || 'Follow map pin to ground-level entrance',
        'Community-contributed access point',
      ],
      logs: [
        {
          id: `log-${Date.now()}`,
          author: 'You',
          rating: 5,
          queueStatus: 'low',
          note: locationTier.trim() || 'Added to Singapore map.',
          timestamp: 'Just now',
        },
      ],
      isCommunityAdded: true,
    };

    onSubmitPin(newFacility);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-3 rounded-full bg-[#f1f5f9] hover:bg-[#e3effd] text-xs font-semibold text-[#111d27] inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <span className="text-xs font-semibold text-[#006194] tabular-nums inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)}
        </span>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#111d27]">
          Contribute a New Pin
        </h2>
        <p className="text-xs text-[#3f4850]">
          Pan the map so the center crosshair sits on the exact entrance.
        </p>
      </div>

      {/* Type Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#f1f5f9]">
        <button
          type="button"
          onClick={() => onChangeKind('toilet')}
          className={`h-10 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
            pinKind === 'toilet'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'text-[#3f4850] hover:text-[#111d27]'
          }`}
        >
          <SgToiletsBrandMark
            className={`w-4 h-4 ${pinKind === 'toilet' ? 'brightness-0 invert' : ''}`}
          />
          <span>Public Toilet</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeKind('fountain')}
          className={`h-10 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
            pinKind === 'fountain'
              ? 'bg-[#0284c7] text-white shadow-sm'
              : 'text-[#3f4850] hover:text-[#111d27]'
          }`}
        >
          <FountainPinGraphic className="w-4 h-4" />
          <span>Drinking Fountain</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#3f4850]">
            Place or Building Name *
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder={
              pinKind === 'fountain'
                ? 'e.g. Bishan Park Shelter B Water Bubbler'
                : 'e.g. Bugis+ Level 3 Restroom'
            }
            className="h-11 rounded-2xl bg-[#f7f9ff] border border-[#dde9f8] px-3.5 text-sm text-[#111d27] placeholder:text-[#707881] focus:outline-none focus:border-[#0284c7]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#3f4850]">
            Floor & Access Note
          </span>
          <input
            type="text"
            value={locationTier}
            onChange={(e) => setLocationTier(e.target.value)}
            maxLength={100}
            placeholder="e.g. Level B1, behind MRT Exit C escalators"
            className="h-11 rounded-2xl bg-[#f7f9ff] border border-[#dde9f8] px-3.5 text-sm text-[#111d27] placeholder:text-[#707881] focus:outline-none focus:border-[#0284c7]"
          />
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#3f4850]">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FacilityCategory)}
              className="h-11 rounded-2xl bg-[#f7f9ff] border border-[#dde9f8] px-3 text-xs font-semibold text-[#111d27] focus:outline-none focus:border-[#0284c7]"
            >
              <option value="Community Pin">Community Pin</option>
              <option value="MRT Station">MRT Station</option>
              <option value="Shopping Mall">Shopping Mall</option>
              <option value="Hawker Centre">Hawker Centre</option>
              <option value="Park & Trail">Park & Trail</option>
              <option value="Civic Hub">Civic Hub</option>
            </select>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#3f4850]">Access Fee</span>
            <div className="grid grid-cols-2 gap-1 h-11 p-1 rounded-2xl bg-[#f7f9ff] border border-[#dde9f8]">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`rounded-xl text-xs font-semibold transition-colors ${
                  isFree ? 'bg-[#10b981] text-white' : 'text-[#3f4850]'
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`rounded-xl text-xs font-semibold transition-colors ${
                  !isFree ? 'bg-[#0284c7] text-white' : 'text-[#3f4850]'
                }`}
              >
                $0.20
              </button>
            </div>
          </div>
        </div>

        {/* Amenity Toggles */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#3f4850]">
            Available Features
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              {
                label: 'Wheelchair',
                active: wheelchair,
                toggle: () => setWheelchair((v) => !v),
                icon: Accessibility,
                show: true,
              },
              {
                label: 'Bidet',
                active: bidet,
                toggle: () => setBidet((v) => !v),
                icon: Sparkles,
                show: pinKind === 'toilet',
              },
              {
                label: 'Baby Care',
                active: babyChanging,
                toggle: () => setBabyChanging((v) => !v),
                icon: Baby,
                show: pinKind === 'toilet',
              },
              {
                label: 'Shower',
                active: shower,
                toggle: () => setShower((v) => !v),
                icon: ShowerHead,
                show: pinKind === 'toilet',
              },
              {
                label: '24 Hours',
                active: open24h,
                toggle: () => setOpen24h((v) => !v),
                icon: Clock,
                show: true,
              },
              {
                label: 'Water Refill',
                active: waterRefill,
                toggle: () => setWaterRefill((v) => !v),
                icon: Droplets,
                show: pinKind === 'toilet',
              },
            ]
              .filter((a) => a.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.toggle}
                    className={`h-9 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      item.active
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-[#f1f5f9] text-[#3f4850] hover:bg-[#e3effd]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-[#dc2626]">{error}</p>
      )}

      <button
        type="submit"
        className="h-12 rounded-full bg-[#0284c7] hover:bg-[#006194] text-white font-semibold text-sm transition-transform active:scale-[0.97] shadow-md"
      >
        Save {pinKind === 'fountain' ? 'Fountain' : 'Restroom'} Pin
      </button>
    </form>
  );
};
