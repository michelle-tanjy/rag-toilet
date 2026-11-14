import React, { useState } from 'react';
import {
  Accessibility,
  Baby,
  CheckCircle2,
  Clock,
  Droplets,
  ShowerHead,
  Sparkles,
} from 'lucide-react';
import { Facility, QueueStatus } from '../types/facility';

interface HotlinkImgProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

export const SafeHotlinkImage: React.FC<HotlinkImgProps> = ({
  src,
  alt,
  className = '',
  fallback,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export const SgToiletsBrandMark: React.FC<{ className?: string }> = ({
  className = 'w-7 h-7',
}) => (
  <SafeHotlinkImage
    src="https://sgtoilets.web.app/favicon.svg"
    alt="Sanitary Flow Singapore emblem"
    className={`${className} object-contain shrink-0`}
    fallback={
      <span
        className={`${className} rounded-full bg-[#0284c7] text-white inline-flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <Droplets className="w-4 h-4" />
      </span>
    }
  />
);

export const FountainPinGraphic: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => (
  <SafeHotlinkImage
    src="https://sgtoilets.web.app/fountain-pin.svg"
    alt="Drinking fountain pin"
    className={`${className} object-contain shrink-0`}
    fallback={
      <span
        className={`${className} rounded-full bg-[#0ea5e9] text-white inline-flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <Droplets className="w-3.5 h-3.5" />
      </span>
    }
  />
);

export const QueueStatusMeter: React.FC<{
  status: QueueStatus;
  waitLabel: string;
  cubiclesFree?: number;
  cubiclesTotal?: number;
  kind?: 'toilet' | 'fountain';
}> = ({ status, waitLabel, cubiclesFree, cubiclesTotal, kind = 'toilet' }) => {
  const config: Record<
    QueueStatus,
    { dot: string; text: string; label: string }
  > = {
    low: {
      dot: 'bg-[#10b981]',
      text: 'text-[#047857]',
      label: 'Short queue',
    },
    moderate: {
      dot: 'bg-[#f59e0b]',
      text: 'text-[#b45309]',
      label: 'Moderate queue',
    },
    busy: {
      dot: 'bg-[#ef4444]',
      text: 'text-[#b91c1c]',
      label: 'Busy right now',
    },
  };

  const c = config[status];
  const availabilityText =
    kind === 'fountain'
      ? waitLabel
      : cubiclesFree !== undefined && cubiclesTotal !== undefined
        ? `${waitLabel} · ${cubiclesFree}/${cubiclesTotal} cubicles free`
        : `${c.label} · ${waitLabel}`;

  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium text-[#3f4850]">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`}
        aria-hidden="true"
      />
      <span className={`${c.text} font-semibold tabular-nums`}>{c.label}</span>
      <span aria-hidden="true" className="text-[#707881]">
        ·
      </span>
      <span className="tabular-nums text-[#3f4850]">{availabilityText}</span>
    </div>
  );
};

export const AmenityRibbon: React.FC<{
  facility: Facility;
  compact?: boolean;
}> = ({ facility, compact = false }) => {
  const items = [
    facility.amenities.wheelchair && {
      key: 'wheelchair',
      label: 'Wheelchair',
      icon: Accessibility,
    },
    facility.amenities.bidet && {
      key: 'bidet',
      label: 'Bidet',
      icon: Sparkles,
    },
    facility.amenities.babyChanging && {
      key: 'baby',
      label: 'Baby Care',
      icon: Baby,
    },
    facility.amenities.shower && {
      key: 'shower',
      label: 'Shower',
      icon: ShowerHead,
    },
    facility.amenities.waterRefill && {
      key: 'water',
      label: 'Water Refill',
      icon: Droplets,
    },
    facility.amenities.open24h && {
      key: '24h',
      label: '24h Open',
      icon: Clock,
    },
  ].filter(Boolean) as { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[];

  if (items.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5">
      {items.slice(0, compact ? 4 : 6).map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.key}
            className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#3f4850]"
            title={item.label}
          >
            <Icon className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
            <span>{item.label}</span>
          </span>
        );
      })}
    </div>
  );
};

export const FacilityVisualBanner: React.FC<{
  facility: Facility;
  urgentMode?: boolean;
}> = ({ facility, urgentMode = false }) => {
  const isFountain = facility.kind === 'fountain';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 ${
        urgentMode
          ? 'bg-gradient-to-br from-[#fef2f2] via-[#ffffff] to-[#fee2e2]/60 border-[#dc2626]/25'
          : isFountain
            ? 'bg-gradient-to-br from-[#ecfeff] via-[#ffffff] to-[#e0f2fe] border-[#0ea5e9]/20'
            : 'bg-gradient-to-br from-[#ecf4ff] via-[#ffffff] to-[#d1fae5]/45 border-[#0284c7]/15'
      }`}
    >
      {/* Clean geometric architectural floor-tile illustration */}
      <svg
        className="absolute right-0 bottom-0 w-40 h-28 opacity-20 pointer-events-none"
        viewBox="0 0 160 112"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 96H144M32 96V28C32 21.3726 37.3726 16 44 16H116C122.627 16 128 21.3726 128 28V96"
          stroke={urgentMode ? '#dc2626' : '#0284c7'}
          strokeWidth="2"
        />
        <rect
          x="48"
          y="34"
          width="24"
          height="42"
          rx="6"
          stroke={urgentMode ? '#dc2626' : '#0284c7'}
          strokeWidth="1.75"
        />
        <rect
          x="88"
          y="34"
          width="24"
          height="42"
          rx="6"
          stroke={urgentMode ? '#dc2626' : '#10b981'}
          strokeWidth="1.75"
        />
        <circle
          cx="100"
          cy="55"
          r="5"
          fill={urgentMode ? '#dc2626' : '#10b981'}
          fillOpacity="0.4"
        />
      </svg>

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              urgentMode
                ? 'bg-[#dc2626] text-white'
                : isFountain
                  ? 'bg-[#e0f2fe] border border-[#0ea5e9]/30'
                  : 'bg-[#0284c7] text-white'
            }`}
          >
            {isFountain ? (
              <FountainPinGraphic className="w-7 h-7" />
            ) : (
              <SgToiletsBrandMark className="w-7 h-7 brightness-0 invert" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#3f4850]">
              <span>{facility.category}</span>
              <span aria-hidden="true">·</span>
              <span>{facility.district}</span>
            </div>
            <h2 className="text-lg font-semibold text-[#111d27] leading-snug truncate">
              {facility.name}
            </h2>
          </div>
        </div>

        {facility.verifiedClean && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#d1fae5] px-2.5 py-1 text-[11px] font-semibold text-[#047857] shrink-0 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{facility.neaGrade || 'Verified Clean'}</span>
          </span>
        )}
      </div>
    </div>
  );
};
