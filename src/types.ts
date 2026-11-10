/**
 * Types for Singapore Primary School Distance Finder & P1 Navigator
 */

export type PlanningZone = 'Central' | 'East' | 'North' | 'North-East' | 'West';

export type SchoolType = 'Government' | 'Government-Aided';

export type GenderType = 'Co-educational' | 'Boys' | 'Girls';

export type DistanceBand = '<1km' | '1-2km' | '>2km';

export type BallotingRisk = 
  | 'Over-subscribed (<1km SC Balloting)' 
  | 'Balloting (1-2km SC Balloting)' 
  | 'Balloting (PR Balloting)' 
  | 'Low Risk (All Admitted)' 
  | 'Moderate Risk';

export interface PrimarySchool {
  id: string;
  name: string;
  chineseName?: string;
  address: string;
  postalCode: string;
  planningArea: string; // e.g. Bishan, Tampines, Bukit Timah, Bedok
  zone: PlanningZone;
  latitude: number;
  longitude: number;
  schoolType: SchoolType;
  gender: GenderType;
  motherTongue: string[]; // Chinese, Malay, Tamil
  specialProgrammes: string[]; // 'SAP', 'GEP', 'Higher Chinese', etc.
  isSAP: boolean;
  isGEP: boolean;
  affiliatedSecondary?: string[];
  hasStudentCare: boolean;
  alpTitle: string; // Applied Learning Programme
  llpTitle: string; // Learning for Life Programme
  ballotingRisk2025: BallotingRisk;
  recentIntakeVacancies: number;
  description: string;
  website: string;
  phone: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SchoolDistanceResult {
  school: PrimarySchool;
  distanceKm: number; // in kilometers, rounded to 2 decimal places
  distanceBand: DistanceBand;
  priorityScore: number; // 1 for <1km, 2 for 1-2km, 3 for >2km
  walkingTimeMinutes: number;
  driveTimeMinutes: number;
}

export type Citizenship = 'Singapore Citizen' | 'Permanent Resident' | 'International Student';

export type P1Phase = 
  | 'Phase 1' 
  | 'Phase 2A' 
  | 'Phase 2B' 
  | 'Phase 2C' 
  | 'Phase 2C Supplementary';

export interface UserEligibilityProfile {
  citizenship: Citizenship;
  phase: P1Phase;
  hasSiblingCurrentlyInSchool: boolean;
  isParentAlumni: boolean;
  isParentSchoolVolunteerOrGrassroots: boolean;
}

export interface AddressPreset {
  name: string;
  postalCode: string;
  address: string;
  area: string;
  coords: Coordinates;
}

export interface FilterState {
  searchQuery: string;
  distanceBand: 'all' | '<1km' | '1-2km' | '>2km';
  zone: 'all' | PlanningZone;
  gender: 'all' | GenderType;
  hasGEP: boolean;
  hasSAP: boolean;
  hasAffiliation: boolean;
  hasStudentCare: boolean;
  ballotingFilter: 'all' | 'low' | 'moderate' | 'high';
  sortBy: 'distance' | 'name' | 'vacancies';
}
