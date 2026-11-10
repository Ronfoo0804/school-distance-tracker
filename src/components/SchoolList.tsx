import React, { useState } from 'react';
import { PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';
import { SchoolCard } from './SchoolCard';
import { Bookmark, Scale, ListFilter, AlertCircle, LayoutGrid, List } from 'lucide-react';

interface SchoolListProps {
  results: SchoolDistanceResult[];
  userProfile: UserEligibilityProfile;
  selectedSchool: PrimarySchool | null;
  shortlistedSchools: PrimarySchool[];
  comparedSchools: PrimarySchool[];
  onSelectSchool: (school: PrimarySchool) => void;
  onToggleShortlist: (school: PrimarySchool) => void;
  onToggleCompare: (school: PrimarySchool) => void;
  onOpenDetails: (school: PrimarySchool) => void;
  onOpenComparisonModal: () => void;
  onResetFilters: () => void;
}

export const SchoolList: React.FC<SchoolListProps> = ({
  results,
  userProfile,
  selectedSchool,
  shortlistedSchools,
  comparedSchools,
  onSelectSchool,
  onToggleShortlist,
  onToggleCompare,
  onOpenDetails,
  onOpenComparisonModal,
  onResetFilters,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'shortlist'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>('grid');

  // Filter list by tab
  const displayedResults = activeTab === 'all'
    ? results
    : results.filter((r) => shortlistedSchools.some((s) => s.id === r.school.id));

  return (
    <div className="space-y-4">
      {/* List Header and Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Tabs for All vs Shortlist */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Schools ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('shortlist')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'shortlist'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-rose-500" />
            Shortlisted ({shortlistedSchools.length})
          </button>
        </div>

        {/* Action Controls: Compare Drawer & Layout Toggle */}
        <div className="flex items-center gap-2">
          {comparedSchools.length > 0 && (
            <button
              onClick={onOpenComparisonModal}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare ({comparedSchools.length}/4)
            </button>
          )}

          {/* Layout Mode Toggles */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded transition-colors ${
                layoutMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('compact')}
              title="Compact View"
              className={`p-1.5 rounded transition-colors ${
                layoutMode === 'compact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {displayedResults.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ListFilter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {activeTab === 'shortlist' ? 'No Shortlisted Schools' : 'No Primary Schools Match Your Filters'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'shortlist'
              ? 'Click the "Shortlist" button on any school card to bookmark schools you are considering for P1 registration.'
              : 'Try clearing your distance band, zone, or keyword filters to see schools across Singapore.'}
          </p>
          {activeTab === 'all' && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* School Cards Container */}
      {displayedResults.length > 0 && (
        <div
          className={`grid gap-3.5 ${
            layoutMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {displayedResults.map((result) => {
            const isSelected = selectedSchool?.id === result.school.id;
            const isShortlisted = shortlistedSchools.some((s) => s.id === result.school.id);
            const isCompared = comparedSchools.some((s) => s.id === result.school.id);

            return (
              <SchoolCard
                key={result.school.id}
                result={result}
                userProfile={userProfile}
                isSelected={isSelected}
                isShortlisted={isShortlisted}
                isCompared={isCompared}
                onSelect={onSelectSchool}
                onToggleShortlist={onToggleShortlist}
                onToggleCompare={onToggleCompare}
                onOpenDetails={onOpenDetails}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
