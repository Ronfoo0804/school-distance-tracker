import React from 'react';
import { Citizenship, P1Phase, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { ShieldCheck, Info, Sparkles, AlertTriangle } from 'lucide-react';

interface EligibilityAdvisorProps {
  profile: UserEligibilityProfile;
  onProfileChange: (updated: Partial<UserEligibilityProfile>) => void;
  results: SchoolDistanceResult[];
}

export const EligibilityAdvisor: React.FC<EligibilityAdvisorProps> = ({
  profile,
  onProfileChange,
  results,
}) => {
  // Compute distance band breakdown counts
  const within1kmCount = results.filter((r) => r.distanceBand === '<1km').length;
  const between1and2kmCount = results.filter((r) => r.distanceBand === '1-2km').length;
  const over2kmCount = results.filter((r) => r.distanceBand === '>2km').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              P1 Registration Priority & Eligibility Navigator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Singapore MOE Primary 1 registration rules prioritize Singapore Citizens over Permanent Residents,
            and closer distance bands when places are oversubscribed.
          </p>
        </div>

        {/* Live Distance Band Stats Counter */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <div className="px-3 py-1 bg-emerald-50 rounded border border-emerald-200 text-center">
            <span className="block font-mono font-bold text-sm text-emerald-800">{within1kmCount}</span>
            <span className="text-[10px] font-medium text-emerald-700 whitespace-nowrap">&lt; 1.0 km</span>
          </div>
          <div className="px-3 py-1 bg-amber-50 rounded border border-amber-200 text-center">
            <span className="block font-mono font-bold text-sm text-amber-800">{between1and2kmCount}</span>
            <span className="text-[10px] font-medium text-amber-700 whitespace-nowrap">1 - 2 km</span>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded border border-slate-200 text-center">
            <span className="block font-mono font-bold text-sm text-slate-700">{over2kmCount}</span>
            <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">&gt; 2.0 km</span>
          </div>
        </div>
      </div>

      {/* Interactive Profile Form */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Citizenship Selector */}
        <div>
          <label className="block font-medium text-slate-700 mb-1.5">Child Citizenship</label>
          <select
            value={profile.citizenship}
            onChange={(e) => onProfileChange({ citizenship: e.target.value as Citizenship })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="Singapore Citizen">Singapore Citizen (SC)</option>
            <option value="Permanent Resident">Permanent Resident (PR)</option>
            <option value="International Student">International Student</option>
          </select>
        </div>

        {/* P1 Phase Selector */}
        <div>
          <label className="block font-medium text-slate-700 mb-1.5">Registration Phase Target</label>
          <select
            value={profile.phase}
            onChange={(e) => onProfileChange({ phase: e.target.value as P1Phase })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="Phase 1">Phase 1 (Older Sibling in School)</option>
            <option value="Phase 2A">Phase 2A (Alumni / Staff Child)</option>
            <option value="Phase 2B">Phase 2B (Volunteer / Clan / Church)</option>
            <option value="Phase 2C">Phase 2C (Open Distance-Based)</option>
            <option value="Phase 2C Supplementary">Phase 2C Supplementary (Unplaced)</option>
          </select>
        </div>

        {/* Phase 2A Alumni Checkbox */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={profile.isParentAlumni}
              onChange={(e) => onProfileChange({ isParentAlumni: e.target.checked })}
              className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
            />
            <span className="font-medium text-slate-700">Parent is Alumni / Ex-Student</span>
          </label>
        </div>

        {/* Phase 2B Volunteer / Grassroots Checkbox */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={profile.isParentSchoolVolunteerOrGrassroots}
              onChange={(e) => onProfileChange({ isParentSchoolVolunteerOrGrassroots: e.target.checked })}
              className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
            />
            <span className="font-medium text-slate-700">School Volunteer / Grassroots</span>
          </label>
        </div>
      </div>

      {/* Advisory Banner based on selected inputs */}
      <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="text-slate-900">Official MOE Order of Priority:</strong> In Phase 2C, if applications exceed vacancies, priority is strictly given by citizenship: 
            <span className="font-semibold text-slate-800"> (1) SC &lt;1km</span>, 
            <span className="font-semibold text-slate-800"> (2) SC 1-2km</span>, 
            <span className="font-semibold text-slate-800"> (3) SC &gt;2km</span>, followed by PR applicants in the same distance sequence.
          </p>
          {profile.citizenship === 'Permanent Resident' && (
            <p className="text-amber-700 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Permanent Residents are subject to the MOE 25-30% school enrollment ceiling and priority occurs after all Singapore Citizens.
            </p>
          )}
          {within1kmCount === 0 && (
            <p className="text-amber-700">
              No primary schools found within 1.0 km of your selected location. You will enter Phase 2C in the 1-2km distance band.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
