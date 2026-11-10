import React, { useState, useRef, useMemo } from 'react';
import { Coordinates, PrimarySchool, SchoolDistanceResult } from '../types';
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';

interface SingaporeMapProps {
  homeCoords: Coordinates;
  results: SchoolDistanceResult[];
  selectedSchool: PrimarySchool | null;
  onSelectSchool: (school: PrimarySchool) => void;
  onMapClickSetHome: (coords: Coordinates) => void;
}

// Bounding box for Singapore map view
const SG_BOUNDS = {
  minLat: 1.205,
  maxLat: 1.478,
  minLng: 103.605,
  maxLng: 104.045,
};

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 640;

/**
 * Projects WGS84 GPS Coordinates to SVG Canvas X, Y
 */
function projectToSvg(coords: Coordinates): { x: number; y: number } {
  const x = ((coords.lng - SG_BOUNDS.minLng) / (SG_BOUNDS.maxLng - SG_BOUNDS.minLng)) * MAP_WIDTH;
  // Latitude goes up as y goes down in SVG
  const y = ((SG_BOUNDS.maxLat - coords.lat) / (SG_BOUNDS.maxLat - SG_BOUNDS.minLat)) * MAP_HEIGHT;
  return { x, y };
}

/**
 * Unprojects SVG Canvas X, Y back to GPS Coordinates
 */
function unprojectFromSvg(x: number, y: number): Coordinates {
  const lng = SG_BOUNDS.minLng + (x / MAP_WIDTH) * (SG_BOUNDS.maxLng - SG_BOUNDS.minLng);
  const lat = SG_BOUNDS.maxLat - (y / MAP_HEIGHT) * (SG_BOUNDS.maxLat - SG_BOUNDS.minLat);
  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
  };
}

/**
 * Calculate pixels for 1 kilometer on our projected SVG
 */
function getPixelsPerKm(): number {
  // 1 degree latitude ~ 110.574 km
  const totalKmLat = (SG_BOUNDS.maxLat - SG_BOUNDS.minLat) * 110.574;
  return MAP_HEIGHT / totalKmLat;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  homeCoords,
  results,
  selectedSchool,
  onSelectSchool,
  onMapClickSetHome,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredSchoolId, setHoveredSchoolId] = useState<string | null>(null);
  const [showRings, setShowRings] = useState<boolean>(true);
  const [filterNearbyOnly, setFilterNearbyOnly] = useState<boolean>(false);

  const pixelsPerKm = useMemo(() => getPixelsPerKm(), []);
  const homePos = useMemo(() => projectToSvg(homeCoords), [homeCoords]);

  // Radius in SVG pixels
  const r1km = 1.0 * pixelsPerKm;
  const r2km = 2.0 * pixelsPerKm;

  // Filter schools to display
  const displayedResults = useMemo(() => {
    if (!filterNearbyOnly) return results;
    return results.filter((r) => r.distanceKm <= 2.5);
  }, [results, filterNearbyOnly]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse button if not clicking directly on interactive elements
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If we just dragged, avoid firing click
    if (Math.abs(e.clientX - (dragStart.x + pan.x)) > 5 || Math.abs(e.clientY - (dragStart.y + pan.y)) > 5) {
      return;
    }

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    // Check bounds
    if (clickX >= 0 && clickX <= MAP_WIDTH && clickY >= 0 && clickY <= MAP_HEIGHT) {
      const newCoords = unprojectFromSvg(clickX, clickY);
      onMapClickSetHome(newCoords);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(3.2, z * 1.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.85, z / 1.25));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Focus map on home location
  const handleFocusHome = () => {
    setZoom(1.8);
    const targetX = MAP_WIDTH / 2 - homePos.x * 1.8;
    const targetY = MAP_HEIGHT / 2 - homePos.y * 1.8;
    setPan({ x: targetX, y: targetY });
  };

  const hoveredResult = useMemo(
    () => results.find((r) => r.school.id === hoveredSchoolId),
    [results, hoveredSchoolId]
  );

  return (
    <div className="relative w-full h-[520px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm select-none">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs text-slate-200">
        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium">Interactive SLA OneMap Reference</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400 hidden sm:inline">Click map to move Home pin</span>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFocusHome}
          title="Center on Home Address"
          className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
        >
          <MapPin className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* View Options Toggle Pill in Map */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 text-xs">
        <button
          onClick={() => setShowRings(!showRings)}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            showRings ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3 h-3 inline mr-1" />
          1km & 2km Bands
        </button>
        <button
          onClick={() => setFilterNearbyOnly(!filterNearbyOnly)}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            filterNearbyOnly ? 'bg-slate-800 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3 inline mr-1" />
          {filterNearbyOnly ? 'Nearby Only (≤2.5km)' : 'Show All Schools'}
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
          <span>&lt; 1 km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
          <span>1 - 2 km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-400/30" />
          <span>&gt; 2 km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
          <span>Home</span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleSvgClick}
      >
        <defs>
          {/* Radial gradient for Home pulsing radar */}
          <radialGradient id="homeRadar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Fill pattern for water/sea */}
          <pattern id="seaPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 0 15 Q 7.5 10, 15 15 T 30 15" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>

          {/* 1km & 2km distance gradients */}
          <radialGradient id="grad1km" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="90%" stopColor="#10b981" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="grad2km" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
            <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background water */}
          <rect x="-300" y="-300" width={MAP_WIDTH + 600} height={MAP_HEIGHT + 600} fill="#0b1120" />
          <rect x="-300" y="-300" width={MAP_WIDTH + 600} height={MAP_HEIGHT + 600} fill="url(#seaPattern)" />

          {/* Surrounding neighboring terrain hints: Johor Bahru (North) & Batam (South) */}
          <path
            d="M -50 -50 L 1050 -50 L 1050 90 Q 750 110, 500 80 Q 250 95, -50 85 Z"
            fill="#131d33"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <text x="460" y="55" fill="#475569" fontSize="12" fontWeight="500" letterSpacing="2">
            JOHOR, MALAYSIA
          </text>

          {/* Straits of Johor divider waterway */}
          <text x="470" y="115" fill="#334155" fontSize="10" fontStyle="italic" letterSpacing="1">
            Straits of Johor
          </text>

          {/* Singapore Straits (South) */}
          <text x="480" y="580" fill="#334155" fontSize="10" fontStyle="italic" letterSpacing="1">
            Singapore Strait
          </text>

          {/* Singapore Mainland Island Geometry */}
          <path
            d="
              M 110,340
              C 130,310 160,285 200,260
              C 230,240 260,210 290,195
              C 330,175 365,160 410,150
              C 440,140 480,135 520,138
              C 560,140 600,145 640,155
              C 690,165 740,170 780,185
              C 820,200 860,225 890,260
              C 915,290 925,320 900,350
              C 870,380 820,390 770,395
              C 710,400 660,405 610,415
              C 570,425 540,445 500,455
              C 460,465 420,460 380,450
              C 330,440 290,425 250,410
              C 210,400 170,395 130,390
              C 105,385 95,365 110,340 Z
            "
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Jurong Island */}
          <path
            d="M 190,460 C 230,450 270,465 260,490 C 240,510 200,505 180,485 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="205" y="482" fill="#475569" fontSize="8">Jurong Is.</text>

          {/* Sentosa Island */}
          <path
            d="M 450,475 C 490,470 520,480 510,495 C 480,505 440,495 450,475 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="465" y="488" fill="#64748b" fontSize="8" fontWeight="500">Sentosa</text>

          {/* Pulau Ubin */}
          <path
            d="M 800,165 C 840,155 870,165 860,180 C 830,190 790,180 800,165 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="815" y="175" fill="#475569" fontSize="8">Pulau Ubin</text>

          {/* Pulau Tekong */}
          <path
            d="M 890,160 C 930,150 960,170 950,195 C 920,205 880,185 890,160 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text x="905" y="180" fill="#475569" fontSize="8">P. Tekong</text>

          {/* Planning Zone Faint Region Outlines & Typography */}
          <g opacity="0.6">
            <text x="490" y="325" fill="#475569" fontSize="13" fontWeight="600" letterSpacing="1">CENTRAL</text>
            <text x="250" y="320" fill="#475569" fontSize="13" fontWeight="600" letterSpacing="1">WEST</text>
            <text x="460" y="210" fill="#475569" fontSize="13" fontWeight="600" letterSpacing="1">NORTH</text>
            <text x="660" y="240" fill="#475569" fontSize="13" fontWeight="600" letterSpacing="1">NORTH-EAST</text>
            <text x="740" y="330" fill="#475569" fontSize="13" fontWeight="600" letterSpacing="1">EAST</text>
          </g>

          {/* Major expressways/arterial spine hints */}
          <path
            d="M 180,340 Q 350,320 520,330 T 850,330"
            fill="none"
            stroke="#334155"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 490,160 Q 500,280 500,430"
            fill="none"
            stroke="#334155"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Distance Radius Bands around Home Pin */}
          {showRings && (
            <g pointerEvents="none">
              {/* 2 km Priority Ring */}
              <circle
                cx={homePos.x}
                cy={homePos.y}
                r={r2km}
                fill="url(#grad2km)"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="6 4"
                opacity="0.85"
              />
              <text
                x={homePos.x + r2km - 10}
                y={homePos.y - 8}
                fill="#f59e0b"
                fontSize="10"
                fontWeight="600"
              >
                2.0 km SLA Boundary
              </text>

              {/* 1 km Priority Ring (Highest Priority) */}
              <circle
                cx={homePos.x}
                cy={homePos.y}
                r={r1km}
                fill="url(#grad1km)"
                stroke="#10b981"
                strokeWidth="2.2"
                opacity="0.95"
              />
              <text
                x={homePos.x + r1km - 8}
                y={homePos.y - 8}
                fill="#10b981"
                fontSize="10"
                fontWeight="700"
              >
                1.0 km Priority Band
              </text>
            </g>
          )}

          {/* Connecting line to selected school */}
          {selectedSchool && (
            <line
              x1={homePos.x}
              y1={homePos.y}
              x2={projectToSvg({ lat: selectedSchool.latitude, lng: selectedSchool.longitude }).x}
              y2={projectToSvg({ lat: selectedSchool.latitude, lng: selectedSchool.longitude }).y}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          )}

          {/* School Pins */}
          {displayedResults.map((result) => {
            const { school, distanceKm, distanceBand } = result;
            const pos = projectToSvg({ lat: school.latitude, lng: school.longitude });
            const isSelected = selectedSchool?.id === school.id;
            const isHovered = hoveredSchoolId === school.id;

            // Color coding based on distance band
            let pinColor = '#94a3b8'; // >2km slate
            let strokeColor = '#cbd5e1';
            let pinRadius = 4.5;

            if (distanceBand === '<1km') {
              pinColor = '#10b981'; // <1km emerald
              strokeColor = '#ffffff';
              pinRadius = 6.5;
            } else if (distanceBand === '1-2km') {
              pinColor = '#f59e0b'; // 1-2km amber
              strokeColor = '#ffffff';
              pinRadius = 5.5;
            }

            if (isSelected) {
              pinColor = '#38bdf8';
              strokeColor = '#ffffff';
              pinRadius = 8;
            }

            return (
              <g
                key={school.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredSchoolId(school.id)}
                onMouseLeave={() => setHoveredSchoolId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSchool(school);
                }}
              >
                {/* Glow ring if selected or within 1km */}
                {(isSelected || distanceBand === '<1km') && (
                  <circle
                    r={pinRadius + 4}
                    fill={distanceBand === '<1km' ? '#10b981' : '#38bdf8'}
                    opacity={isSelected ? 0.4 : 0.25}
                  />
                )}

                {/* Main pin body */}
                <circle
                  r={pinRadius}
                  fill={pinColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : 1.2}
                  className="transition-all duration-150"
                />

                {/* School Acronym or mini marker */}
                {(distanceBand === '<1km' || isSelected) && (
                  <text
                    y={-pinRadius - 5}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#ffffff'}
                    fontSize="9"
                    fontWeight="700"
                    className="drop-shadow-md pointer-events-none"
                  >
                    {school.name.split(' ')[0]} ({distanceKm}km)
                  </text>
                )}
              </g>
            );
          })}

          {/* Home Address Pin */}
          <g transform={`translate(${homePos.x}, ${homePos.y})`} className="cursor-pointer pointer-events-none">
            {/* Animated Radar Beacon */}
            <circle r="18" fill="url(#homeRadar)" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle r="10" fill="#ef4444" opacity="0.3" />
            <circle r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            {/* Home Label Badge */}
            <g transform="translate(0, -18)">
              <rect
                x="-36"
                y="-12"
                width="72"
                height="16"
                rx="4"
                fill="#ef4444"
                className="drop-shadow-md"
              />
              <text x="0" y="-1" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
                MY HOME
              </text>
            </g>
          </g>
        </g>
      </svg>

      {/* Floating Hover Card / Tooltip */}
      {hoveredResult && (
        <div className="absolute top-14 left-4 z-30 max-w-xs bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-xl text-white pointer-events-none">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-xs leading-tight text-white">{hoveredResult.school.name}</p>
              {hoveredResult.school.chineseName && (
                <p className="text-[11px] text-slate-400">{hoveredResult.school.chineseName}</p>
              )}
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                hoveredResult.distanceBand === '<1km'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : hoveredResult.distanceBand === '1-2km'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {hoveredResult.distanceBand}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Distance from Home:</span>
            <span className="font-mono font-bold text-emerald-400">{hoveredResult.distanceKm} km</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-0.5">
            <span className="text-slate-400">Planning Area:</span>
            <span className="text-slate-200">{hoveredResult.school.planningArea}</span>
          </div>
          {hoveredResult.school.affiliatedSecondary && hoveredResult.school.affiliatedSecondary.length > 0 && (
            <div className="flex items-center justify-between text-[11px] mt-0.5">
              <span className="text-slate-400">Affiliation:</span>
              <span className="text-sky-300 truncate max-w-[150px]">
                {hoveredResult.school.affiliatedSecondary[0]}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
