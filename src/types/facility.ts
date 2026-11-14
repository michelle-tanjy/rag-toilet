export type FacilityKind = 'toilet' | 'fountain';

export type QueueStatus = 'low' | 'moderate' | 'busy';

export type FacilityCategory =
  | 'MRT Station'
  | 'Shopping Mall'
  | 'Hawker Centre'
  | 'Park & Trail'
  | 'Civic Hub'
  | 'Community Pin';

export interface FacilityAmenities {
  wheelchair: boolean;
  bidet: boolean;
  babyChanging: boolean;
  shower: boolean;
  free: boolean;
  open24h: boolean;
  waterRefill: boolean;
}

export interface CleanlinessLog {
  id: string;
  author: string;
  rating: number;
  queueStatus: QueueStatus;
  note: string;
  timestamp: string;
}

export interface Facility {
  id: string;
  name: string;
  kind: FacilityKind;
  category: FacilityCategory;
  district: string;
  locationTier: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  neaGrade?: string;
  verifiedClean: boolean;
  queueStatus: QueueStatus;
  waitMinutesLabel: string;
  cubiclesFree: number;
  cubiclesTotal: number;
  feeLabel: string;
  hoursLabel: string;
  lastCleaned: string;
  amenities: FacilityAmenities;
  wayfindingSteps: string[];
  logs: CleanlinessLog[];
  isCommunityAdded?: boolean;
}

export type FilterKey =
  | 'all'
  | 'toilet'
  | 'fountain'
  | 'wheelchair'
  | 'bidet'
  | 'babyChanging'
  | 'free';

export type DrawerSnap = 'peek' | 'half' | 'full';

export type SortMode = 'distance' | 'rating' | 'queue';

export interface UserPosition {
  lat: number;
  lng: number;
  label: string;
  isLiveGps: boolean;
}

export interface DistrictPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
}
