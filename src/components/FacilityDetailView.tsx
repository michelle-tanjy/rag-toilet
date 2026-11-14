import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Footprints,
  Navigation,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
import { Facility, QueueStatus } from '../types/facility';
import {
  estimateWalkMinutes,
  formatDistance,
} from '../data/singaporeFacilities';
import {
  AmenityRibbon,
  FacilityVisualBanner,
  QueueStatusMeter,
} from './FacilityVisuals';

interface FacilityDetailViewProps {
  facility: Facility;
  distanceMeters: number;
  isNavigating: boolean;
  urgentMode: boolean;
  onBack: () => void;
  onStartRoute: () => void;
  onStopRoute: () => void;
  onSubmitLog: (
    facilityId: string,
    rating: number,
    queueStatus: QueueStatus,
    note: string
  ) => void;
  onDeleteCommunityPin?: (facilityId: string) => void;
}

export const FacilityDetailView: React.FC<FacilityDetailViewProps> = ({
  facility,
  distanceMeters,
  isNavigating,
  urgentMode,
  onBack,
  onStartRoute,
  onStopRoute,
  onSubmitLog,
  onDeleteCommunityPin,
}) => {
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [queueInput, setQueueInput] = useState<QueueStatus>('low');
  const [noteInput, setNoteInput] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const walkMins = estimateWalkMinutes(distanceMeters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLog(facility.id, ratingInput, queueInput, noteInput.trim());
    setNoteInput('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 2600);
  };

  const handleShare = async () => {
    const shareText = `${facility.name} (${facility.locationTier}) — ${formatDistance(distanceMeters)} away`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      // Ignore clipboard errors in restricted frames
    }
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Header Row */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="h-9 px-3 rounded-full bg-[#f1f5f9] hover:bg-[#e3effd] text-xs font-semibold text-[#111d27] inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Nearby list</span>
        </button>

        <div className="flex items-center gap-1.5">
          {facility.isCommunityAdded && onDeleteCommunityPin && (
            <button
              type="button"
              onClick={() => onDeleteCommunityPin(facility.id)}
              className="h-9 px-3 rounded-full bg-[#fee2e2] hover:bg-[#fecaca] text-xs font-semibold text-[#b91c1c] inline-flex items-center gap-1 transition-colors"
              aria-label="Remove community pin"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="h-9 px-3 rounded-full bg-[#f1f5f9] hover:bg-[#e3effd] text-xs font-semibold text-[#3f4850] inline-flex items-center gap-1.5 transition-colors"
          >
            {copiedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-[#047857]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Facility Visual Banner */}
      <FacilityVisualBanner facility={facility} urgentMode={urgentMode} />

      {/* Location Tier & Primary Metrics Row */}
      <div className="flex flex-col gap-2.5 px-1">
        <p className="text-sm font-medium text-[#3f4850]">
          {facility.locationTier}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-[#ecf4ff] p-3">
            <div className="text-[11px] font-semibold text-[#3f4850]">
              Distance
            </div>
            <div className="text-lg font-bold text-[#006194] tabular-nums">
              {formatDistance(distanceMeters)}
            </div>
            <div className="text-xs text-[#3f4850] tabular-nums">
              {walkMins} min walk
            </div>
          </div>

          <div className="rounded-2xl bg-[#ecf4ff] p-3">
            <div className="text-[11px] font-semibold text-[#3f4850]">
              Hygiene Rating
            </div>
            <div className="text-lg font-bold text-[#111d27] tabular-nums flex items-center gap-1">
              <span>{facility.rating.toFixed(1)}</span>
              <Star className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
            </div>
            <div className="text-xs text-[#3f4850] tabular-nums">
              {facility.reviewCount} reports
            </div>
          </div>

          <div className="rounded-2xl bg-[#ecf4ff] p-3">
            <div className="text-[11px] font-semibold text-[#3f4850]">
              Access & Fee
            </div>
            <div
              className={`text-lg font-bold tabular-nums ${
                facility.amenities.free ? 'text-[#047857]' : 'text-[#111d27]'
              }`}
            >
              {facility.feeLabel}
            </div>
            <div className="text-xs text-[#3f4850] truncate">
              {facility.hoursLabel}
            </div>
          </div>
        </div>

        {/* Live Queue & Last Cleaned */}
        <div className="flex items-center justify-between flex-wrap gap-2 py-2 border-y border-[#e3effd]">
          <QueueStatusMeter
            status={facility.queueStatus}
            waitLabel={facility.waitMinutesLabel}
            cubiclesFree={facility.cubiclesFree}
            cubiclesTotal={facility.cubiclesTotal}
            kind={facility.kind}
          />
          <span className="inline-flex items-center gap-1 text-xs text-[#3f4850]">
            <Clock className="w-3.5 h-3.5 text-[#707881]" />
            <span>Cleaned {facility.lastCleaned}</span>
          </span>
        </div>

        {/* Amenities */}
        <AmenityRibbon facility={facility} />
      </div>

      {/* Primary Route CTA */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isNavigating ? onStopRoute : onStartRoute}
          className={`flex-1 h-12 rounded-full font-semibold text-sm inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.97] shadow-md ${
            urgentMode
              ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
              : isNavigating
                ? 'bg-[#111d27] hover:bg-[#26323c] text-white'
                : 'bg-[#0284c7] hover:bg-[#006194] text-white'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>
            {isNavigating
              ? 'Stop Active Route'
              : urgentMode
                ? 'Direct Urgent Route'
                : 'Navigate · Direct Route'}
          </span>
        </button>
      </div>

      {/* Step-by-step Wayfinding */}
      <div
        className={`rounded-2xl p-4 border ${
          isNavigating || urgentMode
            ? 'bg-[#ecf4ff] border-[#0284c7]/25'
            : 'bg-[#f7f9ff] border-[#dde9f8]'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#006194] mb-2.5">
          <Footprints className="w-4 h-4" />
          <span>Indoor & Street Wayfinding</span>
        </div>
        <ol className="flex flex-col gap-2">
          {facility.wayfindingSteps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm text-[#111d27]"
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums ${
                  urgentMode
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#0284c7] text-white'
                }`}
              >
                {index + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Community Check-In & Cleanliness Rating */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#ffffff] border border-[#dde9f8] p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#111d27]">
            Update Cleanliness & Queue
          </h3>
          {submittedNotice && (
            <span className="text-xs font-semibold text-[#047857]">
              Report posted
            </span>
          )}
        </div>

        {/* Star Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#3f4850]">
            Cleanliness
          </span>
          <div className="flex items-center gap-1" role="group" aria-label="Rate cleanliness">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingInput(star)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fef3c7]/60 transition-colors"
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= ratingInput
                      ? 'fill-[#f59e0b] text-[#f59e0b]'
                      : 'text-[#bfc7d2]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Queue Status Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#3f4850]">Queue now</span>
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-full">
            {(
              [
                { key: 'low', label: 'No wait' },
                { key: 'moderate', label: '2–5 min' },
                { key: 'busy', label: 'Busy' },
              ] as { key: QueueStatus; label: string }[]
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setQueueInput(opt.key)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  queueInput === opt.key
                    ? 'bg-white text-[#111d27] shadow-sm'
                    : 'text-[#3f4850] hover:text-[#111d27]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            maxLength={120}
            placeholder="Optional note (e.g. soap refilled, near Lift B)..."
            className="flex-1 min-w-0 h-10 rounded-full bg-[#f7f9ff] border border-[#dde9f8] px-3.5 text-xs sm:text-sm text-[#111d27] placeholder:text-[#707881] focus:outline-none focus:border-[#0284c7]"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-full bg-[#0284c7] hover:bg-[#006194] text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Post
          </button>
        </div>
      </form>

      {/* Recent Community Cleanliness Logs */}
      <div className="flex flex-col gap-2 pb-2">
        <h3 className="text-xs font-semibold text-[#3f4850] px-1">
          Recent Community Logs
        </h3>
        {facility.logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl bg-[#f7f9ff] border border-[#e3effd] p-3 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#111d27]">{log.author}</span>
              <div className="flex items-center gap-1.5 text-[#3f4850] tabular-nums">
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#111d27]">
                  <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                  {log.rating}.0
                </span>
                <span aria-hidden="true">·</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
            {log.note && (
              <p className="text-xs text-[#3f4850] leading-relaxed">
                {log.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
