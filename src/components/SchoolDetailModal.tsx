import React from 'react';
import { PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { evaluateP1RegistrationChance } from '../utils/distanceUtils';
import {
  X,
  MapPin,
  Compass,
  Footprints,
  Car,
  BookOpen,
  GraduationCap,
  Sparkles,
  Phone,
  Globe,
  ShieldAlert,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface SchoolDetailModalProps {
  school: PrimarySchool | null;
  distanceResult: SchoolDistanceResult | null;
  userProfile: UserEligibilityProfile;
  onClose: () => void;
  onToggleShortlist: (school: PrimarySchool) => void;
  isShortlisted: boolean;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  distanceResult,
  userProfile,
  onClose,
  onToggleShortlist,
  isShortlisted,
}) => {
  if (!school) return null;

  const evaluation = distanceResult
    ? evaluateP1RegistrationChance(distanceResult, userProfile)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{school.name}</h2>
              {school.chineseName && (
                <span className="text-sm text-slate-500 font-normal">{school.chineseName}</span>
              )}
            </div>

            {/* Clean unboxed metadata line */}
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

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Distance & Priority Metric Strip */}
          {distanceResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Home Distance</span>
                <span className="font-mono text-xl font-bold text-slate-900">
                  {distanceResult.distanceKm.toFixed(2)} km
                </span>
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                  {distanceResult.distanceBand === '<1km'
                    ? 'Within 1.0 km Priority Band'
                    : distanceResult.distanceBand === '1-2km'
                    ? '1.0 – 2.0 km Priority Band'
                    : 'Beyond 2.0 km'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Travel Estimates</span>
                <div className="mt-1 space-y-1 font-mono text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-slate-400" />
                    ~{distanceResult.walkingTimeMinutes} mins walk
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    ~{distanceResult.driveTimeMinutes} mins drive
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">P1 Intake Vacancies</span>
                <span className="font-mono text-xl font-bold text-slate-900">
                  {school.recentIntakeVacancies}
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Standard Primary 1 Cohort
                </span>
              </div>
            </div>
          )}

          {/* Registration Assessment */}
          {evaluation && (
            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  {evaluation.priorityTierLabel}
                </span>
                <span className="font-semibold text-sky-900">
                  Balloting Likelihood: {evaluation.ballotingLikelihood}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{evaluation.recommendation}</p>
              <ul className="list-disc pl-4 text-slate-600 space-y-0.5 pt-1">
                {evaluation.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* School Description */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-1">About the School</h4>
            <p className="text-slate-600 leading-relaxed">{school.description}</p>
          </div>

          {/* MOE Flagship Programmes: ALP & LLP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Applied Learning Programme (ALP)
              </div>
              <p className="text-slate-700">{school.alpTitle}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Learning for Life Programme (LLP)
              </div>
              <p className="text-slate-700">{school.llpTitle}</p>
            </div>
          </div>

          {/* Secondary School Affiliation */}
          {school.affiliatedSecondary && school.affiliatedSecondary.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <h4 className="font-semibold text-emerald-950 mb-1 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                Affiliated Secondary Schools
              </h4>
              <p className="text-emerald-900">
                Graduates enjoy priority admission and lower PSLE Achievement Level (AL) entry cutoffs for:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {school.affiliatedSecondary.map((sec) => (
                  <span
                    key={sec}
                    className="font-medium text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-300"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* School Attributes Grid: Student Care, Mother Tongue, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="font-medium text-slate-900 block mb-1">Mother Tongue Languages</span>
              <div className="flex flex-wrap gap-1">
                {school.motherTongue.map((lang) => (
                  <span key={lang} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium text-slate-900 block mb-1">Student Care Centre (SCC)</span>
              <p className="text-slate-600">
                {school.hasStudentCare
                  ? 'Yes — On-campus school-based student care center operational after curriculum hours.'
                  : 'No on-site student care; nearby community student care operators available.'}
              </p>
            </div>

            <div>
              <span className="font-medium text-slate-900 block mb-1">School Campus Address</span>
              <p className="text-slate-600 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                {school.address}, Singapore {school.postalCode}
              </p>
            </div>

            <div>
              <span className="font-medium text-slate-900 block mb-1">Contact & Verification</span>
              <div className="space-y-1">
                <p className="text-slate-600 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {school.phone}
                </p>
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  Visit Official School Website
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => onToggleShortlist(school)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors border ${
              isShortlisted
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
