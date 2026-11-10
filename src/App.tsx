import React, { useState, useMemo, useEffect } from 'react';
import {
  Coordinates,
  FilterState,
  PrimarySchool,
  SchoolDistanceResult,
  UserEligibilityProfile,
} from './types';
import { SINGAPORE_PRIMARY_SCHOOLS } from './data/schoolsData';
import { resolveSingaporeAddress } from './data/singaporePostalData';
import { computeAllSchoolDistances } from './utils/distanceUtils';
import { SingaporeMap } from './components/SingaporeMap';
import { AddressBar } from './components/AddressBar';
import { EligibilityAdvisor } from './components/EligibilityAdvisor';
import { FilterToolbar } from './components/FilterToolbar';
import { SchoolList } from './components/SchoolList';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { SchoolComparisonModal } from './components/SchoolComparisonModal';
import { BackendIntegrationGuide } from './components/BackendIntegrationGuide';
import {
  Compass,
  MapPin,
  Scale,
  Bookmark,
  Server,
  BookOpen,
  Info,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function App() {
  // Initial default home address: Bishan Central (Singapore central hub)
  const defaultInit = resolveSingaporeAddress('570220');

  const [currentAddress, setCurrentAddress] = useState<string>(defaultInit.formattedAddress);
  const [postalCode, setPostalCode] = useState<string>('570220');
  const [homeCoords, setHomeCoords] = useState<Coordinates>(defaultInit.coords);
  const [planningArea, setPlanningArea] = useState<string>(defaultInit.planningArea);

  // User P1 Eligibility Profile
  const [userProfile, setUserProfile] = useState<UserEligibilityProfile>({
    citizenship: 'Singapore Citizen',
    phase: 'Phase 2C',
    hasSiblingCurrentlyInSchool: false,
    isParentAlumni: false,
    isParentSchoolVolunteerOrGrassroots: false,
  });

  // Filter & Search State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    distanceBand: 'all',
    zone: 'all',
    gender: 'all',
    hasGEP: false,
    hasSAP: false,
    hasAffiliation: false,
    hasStudentCare: false,
    ballotingFilter: 'all',
    sortBy: 'distance',
  });

  // Selection & UI State
  const [selectedSchool, setSelectedSchool] = useState<PrimarySchool | null>(null);
  const [detailModalSchool, setDetailModalSchool] = useState<PrimarySchool | null>(null);
  const [shortlistedSchools, setShortlistedSchools] = useState<PrimarySchool[]>([]);
  const [comparedSchools, setComparedSchools] = useState<PrimarySchool[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState<boolean>(false);

  // Compute distances for all schools from active home coordinates
  const allDistanceResults = useMemo(() => {
    return computeAllSchoolDistances(homeCoords, SINGAPORE_PRIMARY_SCHOOLS);
  }, [homeCoords]);

  // Apply filters and sorting
  const filteredDistanceResults = useMemo(() => {
    let list = [...allDistanceResults];

    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.school.name.toLowerCase().includes(q) ||
          (r.school.chineseName && r.school.chineseName.includes(q)) ||
          r.school.planningArea.toLowerCase().includes(q) ||
          r.school.address.toLowerCase().includes(q) ||
          r.school.alpTitle.toLowerCase().includes(q) ||
          r.school.specialProgrammes.some((p) => p.toLowerCase().includes(q))
      );
    }

    // Distance band
    if (filter.distanceBand !== 'all') {
      list = list.filter((r) => r.distanceBand === filter.distanceBand);
    }

    // Zone
    if (filter.zone !== 'all') {
      list = list.filter((r) => r.school.zone === filter.zone);
    }

    // Gender
    if (filter.gender !== 'all') {
      list = list.filter((r) => r.school.gender === filter.gender);
    }

    // GEP
    if (filter.hasGEP) {
      list = list.filter((r) => r.school.isGEP);
    }

    // SAP
    if (filter.hasSAP) {
      list = list.filter((r) => r.school.isSAP);
    }

    // Affiliation
    if (filter.hasAffiliation) {
      list = list.filter(
        (r) => r.school.affiliatedSecondary && r.school.affiliatedSecondary.length > 0
      );
    }

    // Student Care
    if (filter.hasStudentCare) {
      list = list.filter((r) => r.school.hasStudentCare);
    }

    // Sorting
    if (filter.sortBy === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (filter.sortBy === 'name') {
      list.sort((a, b) => a.school.name.localeCompare(b.school.name));
    } else if (filter.sortBy === 'vacancies') {
      list.sort((a, b) => b.school.recentIntakeVacancies - a.school.recentIntakeVacancies);
    }

    return list;
  }, [allDistanceResults, filter]);

  // Handle address resolved from address bar
  const handleAddressResolved = (
    address: string,
    resolvedPostal: string,
    coords: Coordinates,
    area: string
  ) => {
    setCurrentAddress(address);
    setPostalCode(resolvedPostal);
    setHomeCoords(coords);
    setPlanningArea(area);
  };

  // Handle map click to drop home pin
  const handleMapClickSetHome = (coords: Coordinates) => {
    setHomeCoords(coords);
    setCurrentAddress(`Selected Map Coordinate (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
    setPlanningArea('Custom Map Pin');
    setPostalCode('');
  };

  // Toggle Shortlist
  const handleToggleShortlist = (school: PrimarySchool) => {
    setShortlistedSchools((prev) => {
      const exists = prev.some((s) => s.id === school.id);
      if (exists) {
        return prev.filter((s) => s.id !== school.id);
      } else {
        return [...prev, school];
      }
    });
  };

  // Toggle Compare
  const handleToggleCompare = (school: PrimarySchool) => {
    setComparedSchools((prev) => {
      const exists = prev.some((s) => s.id === school.id);
      if (exists) {
        return prev.filter((s) => s.id !== school.id);
      } else {
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, school];
      }
    });
  };

  const handleResetFilters = () => {
    setFilter({
      searchQuery: '',
      distanceBand: 'all',
      zone: 'all',
      gender: 'all',
      hasGEP: false,
      hasSAP: false,
      hasAffiliation: false,
      hasStudentCare: false,
      ballotingFilter: 'all',
      sortBy: 'distance',
    });
  };

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ==================== 1. TOP BAR CONTRACT ==================== */}
      {/* [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action] */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="/"
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <Building2 className="w-5 h-5 text-slate-900" />
            <span>PrimaryDistance SG</span>
          </a>

          {/* Zone 2: 4-5 single-line clean text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => scrollTo('map-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Interactive Map
            </button>
            <button
              onClick={() => scrollTo('directory-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              School Directory
            </button>
            <button
              onClick={() => scrollTo('p1-section')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              P1 Priorities
            </button>
            <button
              onClick={() => {
                if (comparedSchools.length > 0) setIsCompareModalOpen(true);
                else scrollTo('directory-section');
              }}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Compare ({comparedSchools.length})
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action (Backend Connection Guide) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsBackendGuideOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backend API Contract</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN WORKSPACE VIEWPORT ==================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Banner: Clear Editorial Introduction */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs relative overflow-hidden">
          <div className="max-w-3xl space-y-2">
            <div className="text-xs font-semibold text-sky-800 tracking-wide uppercase">
              Singapore Ministry of Education & SLA OneMap Methodology
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Primary 1 Home-School Distance Calculator
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measure exact straight-line and boundary distance from your residential address to all primary schools in Singapore.
              Determine your eligibility under official MOE Home-School Distance (HSD) bands: <strong>&lt; 1.0 km</strong>, <strong>1.0 – 2.0 km</strong>, and <strong>&gt; 2.0 km</strong>.
            </p>
          </div>

          {/* Quick Notice Pill-Free Metadata Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span>Precision Geodesic Haversine Engine</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>All 5 Singapore Educational Zones</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>2025/2026 Phase 2C Balloting Risk Profiles</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>GEP & SAP Classifications</span>
          </div>
        </section>

        {/* Home Address & Postal Code Origin Resolver */}
        <AddressBar
          currentAddress={currentAddress}
          postalCode={postalCode}
          coords={homeCoords}
          planningArea={planningArea}
          onAddressResolved={handleAddressResolved}
        />

        {/* P1 Registration Priority Advisor */}
        <div id="p1-section">
          <EligibilityAdvisor
            profile={userProfile}
            onProfileChange={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
            results={allDistanceResults}
          />
        </div>

        {/* Interactive Singapore Map Viewport */}
        <div id="map-section" className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Interactive Singapore Geographic Map
              </h2>
              <p className="text-xs text-slate-500">
                Visualizing distance bands centered on your home address. Drag or click on the map to recalculate from any location.
              </p>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Selected origin: <strong className="text-slate-800">{planningArea}</strong>
            </span>
          </div>

          <SingaporeMap
            homeCoords={homeCoords}
            results={filteredDistanceResults}
            selectedSchool={selectedSchool}
            onSelectSchool={(school) => {
              setSelectedSchool(school);
              setDetailModalSchool(school);
            }}
            onMapClickSetHome={handleMapClickSetHome}
          />
        </div>

        {/* Filter & Sorting Controls */}
        <div id="directory-section" className="space-y-4">
          <FilterToolbar
            filter={filter}
            onChange={(updated) => setFilter((prev) => ({ ...prev, ...updated }))}
            onReset={handleResetFilters}
            totalSchoolsCount={allDistanceResults.length}
            filteredSchoolsCount={filteredDistanceResults.length}
          />

          {/* School Listings Grid */}
          <SchoolList
            results={filteredDistanceResults}
            userProfile={userProfile}
            selectedSchool={selectedSchool}
            shortlistedSchools={shortlistedSchools}
            comparedSchools={comparedSchools}
            onSelectSchool={(school) => setSelectedSchool(school)}
            onToggleShortlist={handleToggleShortlist}
            onToggleCompare={handleToggleCompare}
            onOpenDetails={(school) => setDetailModalSchool(school)}
            onOpenComparisonModal={() => setIsCompareModalOpen(true)}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>

      {/* ==================== 3. FOOTER ==================== */}
      <footer className="mt-16 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-900">
              Singapore Primary School Distance Finder & P1 Registration Navigator
            </p>
            <p className="text-slate-500">
              Calculations reference Ministry of Education (MOE) Home-School Distance (HSD) and SLA OneMap guidelines.
            </p>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <button
              onClick={() => setIsBackendGuideOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Backend API Specifications
            </button>
            <a
              href="https://www.moe.gov.sg/primary/p1-registration"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Official MOE P1 Portal
            </a>
            <a
              href="https://www.onemap.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              SLA OneMap
            </a>
          </div>
        </div>
      </footer>

      {/* ==================== 4. MODALS & DRAWERS ==================== */}
      {/* School Detail Modal */}
      {detailModalSchool && (
        <SchoolDetailModal
          school={detailModalSchool}
          distanceResult={allDistanceResults.find((r) => r.school.id === detailModalSchool.id) || null}
          userProfile={userProfile}
          onClose={() => setDetailModalSchool(null)}
          onToggleShortlist={handleToggleShortlist}
          isShortlisted={shortlistedSchools.some((s) => s.id === detailModalSchool.id)}
        />
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <SchoolComparisonModal
          comparedSchools={comparedSchools}
          results={allDistanceResults}
          userProfile={userProfile}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveFromCompare={(id) => setComparedSchools((prev) => prev.filter((s) => s.id !== id))}
          onClearAll={() => setComparedSchools([])}
        />
      )}

      {/* Backend Integration Developer Guide Modal */}
      <BackendIntegrationGuide
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
      />
    </div>
  );
}
