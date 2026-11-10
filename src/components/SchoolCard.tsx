import React from 'react';
import { PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { evaluateP1RegistrationChance } from '../utils/distanceUtils';
import { MapPin, Footprints, Car, Bookmark, BookmarkCheck, ExternalLink, Scale, Check } from 'lucide-react';

interface SchoolCardProps {
  result: SchoolDistanceResult;
  userProfile: UserEligibilityProfile;
  isSelected: boolean;
  isShortlisted: boolean;
  isCompared: boolean;
  onSelect: (school: PrimarySchool) => void;
  onToggleShortlist: (school: PrimarySchool) => void;
  onToggleCompare: (school: PrimarySchool) => void;
  onOpenDetails: (school: PrimarySchool) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  result,
  userProfile,
  isSelected,
  isShortlisted,
  isCompared,
  onSelect,
  onToggleShortlist,
  onToggleCompare,
  onOpenDetails,
}) => {
  const { school, distanceKm, distanceBand, walkingTimeMinutes, driveTimeMinutes } = result;
  const evaluation = evaluateP1RegistrationChance(result, userProfile);

  // Band styling
  const bandBadgeColor =
    distanceBand === '<1km'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : distanceBand === '1-2km'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <div
      onClick={() => onSelect(school)}
      className={`group relative bg-white rounded-xl border transition-all duration-150 p-4 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500/20'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Top Header: School Name, Chinese Name, Distance Band */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
              {school.name}
            </h3>
            {school.chineseName && (
              <span className="text-xs text-slate-400 shrink-0 font-normal">
                {school.chineseName}
              </span>
            )}
          </div>

          {/* Clean Unboxed Metadata Line with typographic separators */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>{school.planningArea}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{school.zone} Zone</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{school.gender}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{school.schoolType}</span>
          </div>
        </div>

        {/* Distance Badge & Band */}
        <div className="text-right shrink-0">
          <div className="font-mono text-base font-bold text-slate-900 tabular-nums">
            {distanceKm.toFixed(2)} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <span
            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${bandBadgeColor}`}
          >
            {distanceBand === '<1km' ? 'Within 1.0 km' : distanceBand === '1-2km' ? '1.0 – 2.0 km' : 'Above 2.0 km'}
          </span>
        </div>
      </div>

      {/* Special Badges & Offerings Row */}
      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
        {school.isSAP && (
          <span className="text-rose-700 font-medium">SAP School</span>
        )}
        {school.isSAP && (school.isGEP || school.affiliatedSecondary) && (
          <span aria-hidden="true" className="text-slate-300">·</span>
        )}
        {school.isGEP && (
          <span className="text-indigo-700 font-medium">GEP (Gifted)</span>
        )}
        {school.isGEP && school.affiliatedSecondary && (
          <span aria-hidden="true" className="text-slate-300">·</span>
        )}
        {school.affiliatedSecondary && school.affiliatedSecondary.length > 0 && (
          <span className="text-sky-700 font-medium">
            Affiliated: {school.affiliatedSecondary[0]}
          </span>
        )}
        {school.hasStudentCare && (
          <>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-700">Student Care Available</span>
          </>
        )}
      </div>

      {/* Travel Times estimation */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Footprints className="w-3.5 h-3.5 text-slate-400" />
            ~{walkingTimeMinutes} min walk
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Car className="w-3.5 h-3.5 text-slate-400" />
            ~{driveTimeMinutes} min drive
          </span>
        </div>

        {/* Vacancies */}
        <span className="text-[11px] text-slate-500 font-mono">
          Intake: <strong className="text-slate-700">{school.recentIntakeVacancies}</strong> places
        </span>
      </div>

      {/* P1 Phase 2C Registration Probability Assessment */}
      <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">{evaluation.priorityTierLabel}</span>
          <span
            className={`text-[10px] font-semibold ${
              evaluation.ballotingLikelihood === 'Guaranteed' || evaluation.ballotingLikelihood === 'Very Low'
                ? 'text-emerald-700'
                : evaluation.ballotingLikelihood === 'Moderate'
                ? 'text-amber-700'
                : 'text-rose-700'
            }`}
          >
            Balloting Risk: {evaluation.ballotingLikelihood}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
          {evaluation.recommendation}
        </p>
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Compare toggle */}
          <button
            onClick={() => onToggleCompare(school)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 border ${
              isCompared
                ? 'bg-sky-50 text-sky-700 border-sky-300 font-medium'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Scale className="w-3 h-3" />
            {isCompared ? 'Comparing' : 'Compare'}
          </button>

          {/* Shortlist bookmark toggle */}
          <button
            onClick={() => onToggleShortlist(school)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 border ${
              isShortlisted
                ? 'bg-rose-50 text-rose-700 border-rose-300 font-medium'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {isShortlisted ? (
              <BookmarkCheck className="w-3 h-3 text-rose-600" />
            ) : (
              <Bookmark className="w-3 h-3" />
            )}
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </button>
        </div>

        {/* View Details modal button */}
        <button
          onClick={() => onOpenDetails(school)}
          className="text-xs px-3 py-1 font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
        >
          Details
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
