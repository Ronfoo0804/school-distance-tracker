import React from 'react';
import { FilterState, PlanningZone, GenderType } from '../types';
import { Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

interface FilterToolbarProps {
  filter: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalSchoolsCount: number;
  filteredSchoolsCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filter,
  onChange,
  onReset,
  totalSchoolsCount,
  filteredSchoolsCount,
}) => {
  const hasActiveFilters =
    filter.searchQuery !== '' ||
    filter.distanceBand !== 'all' ||
    filter.zone !== 'all' ||
    filter.gender !== 'all' ||
    filter.hasGEP ||
    filter.hasSAP ||
    filter.hasAffiliation ||
    filter.hasStudentCare;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 text-xs space-y-3">
      {/* Top row: Search and Distance Band Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Quick Filter Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search school name, area, or programme (e.g. Nanyang, GEP, SAP)..."
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Distance Band Segmented Button Group */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          <button
            onClick={() => onChange({ distanceBand: 'all' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter.distanceBand === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Distances
          </button>
          <button
            onClick={() => onChange({ distanceBand: '<1km' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter.distanceBand === '<1km'
                ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &lt; 1 km (Priority 1)
          </button>
          <button
            onClick={() => onChange({ distanceBand: '1-2km' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter.distanceBand === '1-2km'
                ? 'bg-white text-amber-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 - 2 km (Priority 2)
          </button>
          <button
            onClick={() => onChange({ distanceBand: '>2km' })}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter.distanceBand === '>2km'
                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            &gt; 2 km
          </button>
        </div>
      </div>

      {/* Second row: Dropdowns & Attribute Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        {/* Zone Filter */}
        <select
          value={filter.zone}
          onChange={(e) => onChange({ zone: e.target.value as 'all' | PlanningZone })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="all">All Zones (Islandwide)</option>
          <option value="Central">Central Zone</option>
          <option value="East">East Zone</option>
          <option value="North">North Zone</option>
          <option value="North-East">North-East Zone</option>
          <option value="West">West Zone</option>
        </select>

        {/* Gender Filter */}
        <select
          value={filter.gender}
          onChange={(e) => onChange({ gender: e.target.value as 'all' | GenderType })}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="all">All Genders</option>
          <option value="Co-educational">Co-educational</option>
          <option value="Boys">Boys Only</option>
          <option value="Girls">Girls Only</option>
        </select>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Sort:</span>
          <select
            value={filter.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as 'distance' | 'name' | 'vacancies' })}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="distance">Nearest Distance First</option>
            <option value="name">School Name (A - Z)</option>
            <option value="vacancies">Highest Intake Capacity</option>
          </select>
        </div>
      </div>

      {/* Attribute Pill Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          onClick={() => onChange({ hasGEP: !filter.hasGEP })}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border ${
            filter.hasGEP
              ? 'bg-slate-900 text-white border-slate-900 font-medium'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          GEP School
        </button>
        <button
          onClick={() => onChange({ hasSAP: !filter.hasSAP })}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border ${
            filter.hasSAP
              ? 'bg-slate-900 text-white border-slate-900 font-medium'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          SAP School (Special Assistance Plan)
        </button>
        <button
          onClick={() => onChange({ hasAffiliation: !filter.hasAffiliation })}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border ${
            filter.hasAffiliation
              ? 'bg-slate-900 text-white border-slate-900 font-medium'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          Secondary Affiliation
        </button>
        <button
          onClick={() => onChange({ hasStudentCare: !filter.hasStudentCare })}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap border ${
            filter.hasStudentCare
              ? 'bg-slate-900 text-white border-slate-900 font-medium'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          On-Campus Student Care (SCC)
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 px-2 py-1"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Results Count Line */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredSchoolsCount}</strong> of{' '}
          <strong className="text-slate-800">{totalSchoolsCount}</strong> primary schools
        </span>
        <span>Distances computed from your home coordinate origin</span>
      </div>
    </div>
  );
};
