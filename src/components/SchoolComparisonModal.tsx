import React from 'react';
import { PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { evaluateP1RegistrationChance } from '../utils/distanceUtils';
import { X, Printer, Trash2, Check, Minus } from 'lucide-react';

interface SchoolComparisonModalProps {
  comparedSchools: PrimarySchool[];
  results: SchoolDistanceResult[];
  userProfile: UserEligibilityProfile;
  onClose: () => void;
  onRemoveFromCompare: (schoolId: string) => void;
  onClearAll: () => void;
}

export const SchoolComparisonModal: React.FC<SchoolComparisonModalProps> = ({
  comparedSchools,
  results,
  userProfile,
  onClose,
  onRemoveFromCompare,
  onClearAll,
}) => {
  if (comparedSchools.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Side-by-Side School Comparison ({comparedSchools.length}/4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare home distance, registration priorities, secondary affiliations, and distinctive programmes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="p-4 sm:p-5 overflow-auto flex-1 text-xs">
          <div className="min-w-[650px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-500 border-b border-slate-200 w-1/4">
                    Attribute
                  </th>
                  {comparedSchools.map((school) => {
                    const result = results.find((r) => r.school.id === school.id);
                    return (
                      <th
                        key={school.id}
                        className="p-3 text-left font-semibold text-slate-900 border-b border-slate-200 w-1/4"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="block font-bold text-sm text-slate-900">{school.name}</span>
                            {school.chineseName && (
                              <span className="text-slate-400 font-normal">{school.chineseName}</span>
                            )}
                          </div>
                          <button
                            onClick={() => onRemoveFromCompare(school.id)}
                            title="Remove from comparison"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Distance Row */}
                <tr className="bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">Distance from Home</td>
                  {comparedSchools.map((school) => {
                    const result = results.find((r) => r.school.id === school.id);
                    return (
                      <td key={school.id} className="p-3">
                        {result ? (
                          <div>
                            <span className="font-mono text-base font-bold text-slate-900">
                              {result.distanceKm.toFixed(2)} km
                            </span>
                            <span
                              className={`block text-[10px] font-semibold mt-0.5 ${
                                result.distanceBand === '<1km'
                                  ? 'text-emerald-700'
                                  : result.distanceBand === '1-2km'
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              }`}
                            >
                              {result.distanceBand === '<1km' ? 'Within 1.0 km (Priority 1)' : result.distanceBand === '1-2km' ? '1.0 – 2.0 km (Priority 2)' : 'Over 2.0 km'}
                            </span>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Travel Time */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Travel Times</td>
                  {comparedSchools.map((school) => {
                    const result = results.find((r) => r.school.id === school.id);
                    return (
                      <td key={school.id} className="p-3 font-mono text-slate-600">
                        {result ? (
                          <>
                            <div>~{result.walkingTimeMinutes} mins walk</div>
                            <div>~{result.driveTimeMinutes} mins drive</div>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Priority Assessment */}
                <tr className="bg-sky-50/30">
                  <td className="p-3 font-semibold text-slate-900">
                    Registration Priority & Balloting Likelihood
                  </td>
                  {comparedSchools.map((school) => {
                    const result = results.find((r) => r.school.id === school.id);
                    const evalResult = result ? evaluateP1RegistrationChance(result, userProfile) : null;
                    return (
                      <td key={school.id} className="p-3">
                        {evalResult ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {evalResult.priorityTierLabel}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                evalResult.ballotingLikelihood === 'Guaranteed' || evalResult.ballotingLikelihood === 'Very Low'
                                  ? 'text-emerald-700'
                                  : evalResult.ballotingLikelihood === 'Moderate'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              Balloting Risk: {evalResult.ballotingLikelihood}
                            </span>
                            <p className="text-[11px] text-slate-600 mt-1">{evalResult.recommendation}</p>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Zone & Planning Area */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Planning Area & Zone</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3">
                      {school.planningArea} ({school.zone} Zone)
                    </td>
                  ))}
                </tr>

                {/* Type & Gender */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">School Type & Gender</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3">
                      {school.schoolType} · {school.gender}
                    </td>
                  ))}
                </tr>

                {/* Special Programmes */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">SAP / GEP Status</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3 space-y-1">
                      <div>
                        {school.isSAP ? (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> SAP School
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5" /> Not SAP
                          </span>
                        )}
                      </div>
                      <div>
                        {school.isGEP ? (
                          <span className="text-indigo-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> GEP (Gifted)
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5" /> Not GEP
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Secondary School Affiliations */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Affiliated Secondary Schools</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3">
                      {school.affiliatedSecondary && school.affiliatedSecondary.length > 0 ? (
                        <div className="space-y-1">
                          {school.affiliatedSecondary.map((sec) => (
                            <span key={sec} className="block font-medium text-emerald-800">
                              {sec}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Student Care Centre */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">On-Site Student Care (SCC)</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3">
                      {school.hasStudentCare ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Available on Campus
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Minus className="w-3.5 h-3.5" /> External only
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Applied Learning Programme (ALP) */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Applied Learning (ALP)</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3 text-slate-600">
                      {school.alpTitle}
                    </td>
                  ))}
                </tr>

                {/* Learning for Life Programme (LLP) */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Learning for Life (LLP)</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3 text-slate-600">
                      {school.llpTitle}
                    </td>
                  ))}
                </tr>

                {/* P1 Cohort Vacancies */}
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Recent P1 Vacancies</td>
                  {comparedSchools.map((school) => (
                    <td key={school.id} className="p-3 font-mono font-bold text-slate-800">
                      {school.recentIntakeVacancies} places
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <button
            onClick={onClearAll}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Comparison List
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
