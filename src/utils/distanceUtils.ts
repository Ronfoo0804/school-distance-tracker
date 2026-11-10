import { Coordinates, DistanceBand, PrimarySchool, SchoolDistanceResult, UserEligibilityProfile } from '../types';

/**
 * Calculates Great-Circle distance using Haversine formula between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return rounded to 2 decimal places (standard SLA OneMap precision display)
  return Math.round(distance * 100) / 100;
}

/**
 * Categorize distance into official MOE Home-School Distance (HSD) priority bands:
 * - Within 1 km (< 1.00 km)
 * - Between 1 km and 2 km (1.00 km to 2.00 km inclusive)
 * - Outside 2 km (> 2.00 km)
 */
export function getDistanceBand(distanceKm: number): DistanceBand {
  if (distanceKm <= 1.00) {
    return '<1km';
  } else if (distanceKm <= 2.00) {
    return '1-2km';
  } else {
    return '>2km';
  }
}

/**
 * Returns priority numeric score: 1 is best (<1km), 2 is medium (1-2km), 3 is lowest (>2km)
 */
export function getPriorityScore(distanceBand: DistanceBand): number {
  switch (distanceBand) {
    case '<1km':
      return 1;
    case '1-2km':
      return 2;
    case '>2km':
      return 3;
  }
}

/**
 * Estimate walking and driving travel time in Singapore conditions
 */
export function estimateTravelTimes(distanceKm: number): { walkingTimeMinutes: number; driveTimeMinutes: number } {
  // Average pedestrian speed ~4.8 km/h = 12.5 mins per km
  const walkingTimeMinutes = Math.max(1, Math.round(distanceKm * 12.5));
  
  // Urban driving with traffic lights (~25-30 km/h average + 2 mins parking/junctions)
  const driveTimeMinutes = Math.max(2, Math.round(distanceKm * 2.2 + 2));

  return { walkingTimeMinutes, driveTimeMinutes };
}

/**
 * Compute distances and priority classifications for all primary schools relative to home coordinates
 */
export function computeAllSchoolDistances(
  homeCoords: Coordinates,
  schools: PrimarySchool[]
): SchoolDistanceResult[] {
  return schools.map((school) => {
    const distanceKm = calculateHaversineDistanceKm(homeCoords, {
      lat: school.latitude,
      lng: school.longitude,
    });
    const distanceBand = getDistanceBand(distanceKm);
    const priorityScore = getPriorityScore(distanceBand);
    const { walkingTimeMinutes, driveTimeMinutes } = estimateTravelTimes(distanceKm);

    return {
      school,
      distanceKm,
      distanceBand,
      priorityScore,
      walkingTimeMinutes,
      driveTimeMinutes,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Evaluates registration priority and balloting likelihood for a specific school
 * according to Singapore Ministry of Education (MOE) P1 registration rules.
 */
export function evaluateP1RegistrationChance(
  result: SchoolDistanceResult,
  profile: UserEligibilityProfile
): {
  priorityTierLabel: string;
  ballotingLikelihood: 'Very Low' | 'Moderate' | 'High' | 'Guaranteed';
  recommendation: string;
  notes: string[];
} {
  const isSC = profile.citizenship === 'Singapore Citizen';
  const isPR = profile.citizenship === 'Permanent Resident';
  const band = result.distanceBand;
  const risk = result.school.ballotingRisk2025;

  // Phase 1 (Siblings)
  if (profile.phase === 'Phase 1') {
    return {
      priorityTierLabel: 'Phase 1 (Sibling Reserved)',
      ballotingLikelihood: 'Guaranteed',
      recommendation: 'Guaranteed admission for children with older sibling currently studying in this school.',
      notes: ['Distance band is not a deciding factor in Phase 1 as long as the sibling remains in school.'],
    };
  }

  // Phase 2A (Alumni / Staff / SAC)
  if (profile.phase === 'Phase 2A') {
    if (!profile.isParentAlumni) {
      return {
        priorityTierLabel: 'Phase 2A (Ineligible)',
        ballotingLikelihood: 'Very Low',
        recommendation: 'Requires parent to be an alumnus or former student of the school, or school advisory member.',
        notes: ['Consider Phase 2B (volunteer/clan) or Phase 2C (open distance-based) instead.'],
      };
    }

    if (risk.includes('Over-subscribed')) {
      return {
        priorityTierLabel: `Phase 2A · ${isSC ? 'SC' : 'PR'} (${band})`,
        ballotingLikelihood: band === '<1km' ? 'Moderate' : 'High',
        recommendation: 'High-demand school. Balloting occasionally triggers in 2A for applicants living outside 1km.',
        notes: ['Singapore Citizens are given absolute priority over PRs within Phase 2A.'],
      };
    }

    return {
      priorityTierLabel: `Phase 2A · ${isSC ? 'SC' : 'PR'} (${band})`,
      ballotingLikelihood: 'Guaranteed',
      recommendation: 'High likelihood of securing a place in Phase 2A without balloting.',
      notes: ['Strong alumni privilege.'],
    };
  }

  // Phase 2B (Volunteer, Church, Clan, Grassroots)
  if (profile.phase === 'Phase 2B') {
    if (!profile.isParentSchoolVolunteerOrGrassroots) {
      return {
        priorityTierLabel: 'Phase 2B (Ineligible)',
        ballotingLikelihood: 'Very Low',
        recommendation: 'Requires confirmed parent volunteer hours (typically 40+ hours), church/clan affiliation, or grassroots endorsement.',
        notes: ['Check if you qualify before registration date.'],
      };
    }

    if (risk.includes('Over-subscribed') || risk.includes('1-2km')) {
      return {
        priorityTierLabel: `Phase 2B · ${isSC ? 'SC' : 'PR'} (${band})`,
        ballotingLikelihood: band === '<1km' ? 'Moderate' : 'High',
        recommendation: band === '<1km' 
          ? 'Competitive in Phase 2B. Singapore Citizens <1km have top priority.' 
          : 'High balloting risk in Phase 2B beyond 1km for popular schools.',
        notes: ['MOE reserves a minimum of 20 places for Phase 2B.'],
      };
    }

    return {
      priorityTierLabel: `Phase 2B · ${isSC ? 'SC' : 'PR'} (${band})`,
      ballotingLikelihood: 'Moderate',
      recommendation: 'Good opportunity if qualifying criteria are fully verified.',
      notes: ['Priority given to SC within 1km.'],
    };
  }

  // Phase 2C (General Open Registration - strictly by Distance & Citizenship)
  if (profile.phase === 'Phase 2C' || profile.phase === 'Phase 2C Supplementary') {
    if (!isSC && !isPR) {
      return {
        priorityTierLabel: 'International Student (Phase 3)',
        ballotingLikelihood: 'Very Low',
        recommendation: 'International students register in Phase 3 after all SC and PR applications are processed.',
        notes: ['Subject to availability of remaining vacancies across the island.'],
      };
    }

    // Singapore Citizen Phase 2C
    if (isSC) {
      if (band === '<1km') {
        if (risk.includes('<1km SC Balloting')) {
          return {
            priorityTierLabel: 'SC within 1km (Tier 1 Priority)',
            ballotingLikelihood: 'High',
            recommendation: 'Qualifies for top distance band (<1km), but historical data indicates SC balloting occurs even within 1km. Have a reliable backup school ready.',
            notes: [
              'Top priority band for Phase 2C.',
              'Balloting conducted electronically by MOE if applicant count exceeds available quota.',
            ],
          };
        }
        return {
          priorityTierLabel: 'SC within 1km (Tier 1 Priority)',
          ballotingLikelihood: 'Very Low',
          recommendation: 'Excellent prospects. Singapore Citizens living within 1km rarely face balloting in this school.',
          notes: ['SLA OneMap reference distance is under 1.0km.'],
        };
      }

      if (band === '1-2km') {
        if (risk.includes('<1km SC Balloting')) {
          return {
            priorityTierLabel: 'SC 1-2km (Tier 2 Priority)',
            ballotingLikelihood: 'Very Low',
            recommendation: 'Low chance in Phase 2C. All vacancies will likely be absorbed by SC applicants living within 1km.',
            notes: ['Strongly consider schools where you reside within 1km.'],
          };
        }
        if (risk.includes('1-2km SC Balloting')) {
          return {
            priorityTierLabel: 'SC 1-2km (Tier 2 Priority)',
            ballotingLikelihood: 'High',
            recommendation: 'Balloting expected for SC residing between 1km and 2km.',
            notes: ['Subject to electronic balloting.'],
          };
        }
        return {
          priorityTierLabel: 'SC 1-2km (Tier 2 Priority)',
          ballotingLikelihood: 'Moderate',
          recommendation: 'Viable option. Usually clears within 1-2km without balloting.',
          notes: ['Check Phase 2C day-to-day applicant counts on MOE portal.'],
        };
      }

      // SC > 2km
      if (risk.includes('Over-subscribed') || risk.includes('1-2km')) {
        return {
          priorityTierLabel: 'SC > 2km (Tier 3 Priority)',
          ballotingLikelihood: 'Very Low',
          recommendation: 'Very low admission chance in Phase 2C. Vacancies will be consumed by applicants living within 1km and 1-2km.',
          notes: ['Pick a closer school within 1km for Phase 2C safety.'],
        };
      }

      return {
        priorityTierLabel: 'SC > 2km (Tier 3 Priority)',
        ballotingLikelihood: 'Moderate',
        recommendation: 'Neighborhood school with comfortable vacancies. May accept SC residing beyond 2km.',
        notes: ['Check remaining vacancies before applying.'],
      };
    }

    // Permanent Resident (PR) Phase 2C
    if (isPR) {
      if (risk.includes('Over-subscribed') || risk.includes('1-2km')) {
        return {
          priorityTierLabel: `PR ${band} (Tier ${band === '<1km' ? '4' : band === '1-2km' ? '5' : '6'})`,
          ballotingLikelihood: 'Very Low',
          recommendation: 'Extremely high balloting competition. Singapore Citizens take full precedence across all distance bands before any PR is admitted.',
          notes: [
            'All SC applicants take priority over PR regardless of distance.',
            'Schools may also enforce the MOE PR cap (~25-30%).',
          ],
        };
      }

      return {
        priorityTierLabel: `PR ${band}`,
        ballotingLikelihood: band === '<1km' ? 'Moderate' : 'Very Low',
        recommendation: 'Feasible if vacancies remain after all Singapore Citizens have been admitted.',
        notes: ['Admissions subject to overall PR quota cap.'],
      };
    }
  }

  return {
    priorityTierLabel: `${profile.citizenship} · ${profile.phase} · ${band}`,
    ballotingLikelihood: 'Moderate',
    recommendation: 'Evaluate day-by-day vacancy counts during the active registration window.',
    notes: ['Always prepare an alternative secondary choice for Phase 2C Supplementary.'],
  };
}

/**
 * Service hook / integration abstraction for future Backend Connection.
 * The user stated: "Build just the front end for now. I will integrate the backend connection later."
 * This function provides the drop-in signature for connecting to SLA OneMap API,
 * MOE SchoolFinder backend, or custom Express/PostgreSQL backend.
 */
export interface OneMapLiveRouteResult {
  success: boolean;
  source: 'onemap_live' | 'geodesic_fallback';
  hasAccountKey?: boolean;
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  routeType: 'walk' | 'drive' | 'cycle' | 'pt';
  statusMessage?: string;
  warning?: string;
  error?: string;
}

/**
 * Queries the /api/schooldistance serverless endpoint for live SLA OneMap route data
 * (walk, drive, cycle, pt)
 */
export async function fetchLiveOneMapRoute(
  startCoords: Coordinates,
  endCoords: Coordinates,
  routeType: 'walk' | 'drive' | 'cycle' | 'pt' = 'walk',
  schoolId?: string
): Promise<OneMapLiveRouteResult> {
  const params = new URLSearchParams({
    start: `${startCoords.lat},${startCoords.lng}`,
    end: `${endCoords.lat},${endCoords.lng}`,
    routeType,
  });
  if (schoolId) params.set('schoolId', schoolId);

  try {
    const res = await fetch(`/api/schooldistance?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // If backend route fails or network issue, compute client-side fallback
  }

  const geodesicKm = calculateHaversineDistanceKm(startCoords, endCoords);
  const meters = Math.round(geodesicKm * 1000);
  const durSec = routeType === 'walk' ? Math.round(meters / 1.33) : Math.round(meters / 8.33);

  return {
    success: true,
    source: 'geodesic_fallback',
    hasAccountKey: false,
    distanceMeters: meters,
    distanceKm: geodesicKm,
    durationSeconds: durSec,
    durationMinutes: Math.round(durSec / 60),
    routeType,
    warning: 'Local fallback used',
  };
}

/**
 * Service hook / integration abstraction for Backend Connection.
 */
export async function fetchDistancesFromBackend(
  homeCoords: Coordinates,
  schools: PrimarySchool[],
  backendUrl?: string
): Promise<SchoolDistanceResult[]> {
  if (backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/api/calculate-distances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeCoordinates: homeCoords,
          schoolIds: schools.map((s) => s.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.results;
      }
    } catch {
      console.warn('Backend unavailable, falling back to client-side geodesic calculator.');
    }
  }

  // Instant local client-side calculation fallback
  return computeAllSchoolDistances(homeCoords, schools);
}

