import React, { useState } from 'react';
import { Coordinates, PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { evaluateP1RegistrationChance, fetchLiveOneMapRoute, OneMapLiveRouteResult } from '../utils/distanceUtils';
import {
  X,
  MapPin,
  Compass,
  Footprints,
  Car,
  Bike,
  Bus,
  BookOpen,
  GraduationCap,
  Sparkles,
  Phone,
  Globe,
  ShieldAlert,
  Clock,
  HeartHandshake,
  Navigation,
  Loader2,
} from 'lucide-react';

interface SchoolDetailModalProps {
  school: PrimarySchool | null;
  distanceResult: SchoolDistanceResult | null;
  userProfile: UserEligibilityProfile;
  homeCoords?: Coordinates;
  onClose: () => void;
  onToggleShortlist: (school: PrimarySchool) => void;
  isShortlisted: boolean;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  distanceResult,
  userProfile,
  homeCoords,
  onClose,
  onToggleShortlist,
  isShortlisted,
}) => {
  const [liveRouteType, setLiveRouteType] = useState<'walk' | 'drive' | 'cycle' | 'pt'>('walk');
  const [liveRouteResult, setLiveRouteResult] = useState<OneMapLiveRouteResult | null>(null);
  const [isLoadingLiveRoute, setIsLoadingLiveRoute] = useState<boolean>(false);

  if (!school) return null;

  const handleQueryLiveRoute = async () => {
    if (!homeCoords) return;
    setIsLoadingLiveRoute(true);
    try {
      const res = await fetchLiveOneMapRoute(
        homeCoords,
        { lat: school.latitude, lng: school.longitude },
        liveRouteType,
        school.id
      );
      setLiveRouteResult(res);
    } catch {
      // Error handled inside fetchLiveOneMapRoute
    } finally {
      setIsLoadingLiveRoute(false);
    }
  };

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

          {/* Live OneMap Route Query Panel */}
          {homeCoords && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>OneMap Live Route Service (/api/schooldistance)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  SLA Routing API (walk · drive · cycle · pt)
                </span>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 font-medium">Mode:</span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLiveRouteType('walk')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                      liveRouteType === 'walk'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" /> Walk
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveRouteType('drive')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                      liveRouteType === 'drive'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" /> Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveRouteType('cycle')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                      liveRouteType === 'cycle'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" /> Cycle
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiveRouteType('pt')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                      liveRouteType === 'pt'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5" /> Public Transit
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleQueryLiveRoute}
                  disabled={isLoadingLiveRoute}
                  className="ml-auto px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                >
                  {isLoadingLiveRoute ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" /> Query Route
                    </>
                  )}
                </button>
              </div>

              {/* Live Result Readout */}
              {liveRouteResult && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Route Type: <span className="capitalize">{liveRouteResult.routeType}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Source: {liveRouteResult.source === 'onemap_live' ? 'Live OneMap API' : 'Calculated Fallback'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div className="p-2 bg-slate-50 rounded">
                      <span className="text-[10px] text-slate-500 block">Total Distance</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {liveRouteResult.distanceKm} km ({liveRouteResult.distanceMeters.toLocaleString()} m)
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <span className="text-[10px] text-slate-500 block">Estimated Duration</span>
                      <span className="font-bold text-slate-900 text-sm">
                        ~{liveRouteResult.durationMinutes} mins ({liveRouteResult.durationSeconds} s)
                      </span>
                    </div>
                  </div>

                  {liveRouteResult.statusMessage && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      Status: {liveRouteResult.statusMessage}
                    </p>
                  )}

                  {liveRouteResult.warning && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                      {liveRouteResult.warning}
                    </p>
                  )}
                </div>
              )}
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
