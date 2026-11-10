import type { Request, Response } from 'express';

export type RouteType = 'walk' | 'drive' | 'cycle' | 'pt';

interface CoordinateObj {
  lat: number;
  lng: number;
}

/**
 * Calculates straight-line Haversine distance in meters as a fallback
 */
function calculateHaversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Normalizes input coordinates into 'lat,lng' string
 */
function parseCoordinate(input: unknown): string | null {
  if (!input) return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.includes(',')) {
      const [lat, lng] = trimmed.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return `${lat},${lng}`;
      }
    }
    return null;
  }
  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    const lat = typeof obj.lat === 'number' ? obj.lat : typeof obj.latitude === 'number' ? obj.latitude : NaN;
    const lng = typeof obj.lng === 'number' ? obj.lng : typeof obj.longitude === 'number' ? obj.longitude : NaN;
    if (!isNaN(lat) && !isNaN(lng)) {
      return `${lat},${lng}`;
    }
  }
  return null;
}

/**
 * OneMap Primary School Routing Serverless API
 * GET /api/schooldistance?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk
 * POST /api/schooldistance { start: "1.320981,103.844150", end: "1.326762,103.8559", routeType: "walk", schoolId?: "nanyang-pri" }
 */
export default async function handler(req: Request, res: Response) {
  // Support both GET query params and POST body
  const query = req.query || {};
  const body = req.body || {};

  const rawStart = body.start ?? query.start;
  const rawEnd = body.end ?? query.end;
  const routeType = ((body.routeType ?? query.routeType ?? 'walk') as string).toLowerCase() as RouteType;
  const schoolId = (body.schoolId ?? query.schoolId ?? '') as string;

  const validRouteTypes: RouteType[] = ['walk', 'drive', 'cycle', 'pt'];
  if (!validRouteTypes.includes(routeType)) {
    return res.status(400).json({
      error: `Invalid routeType '${routeType}'. Must be one of: ${validRouteTypes.join(', ')}`,
      validRouteTypes,
    });
  }

  const startCoord = parseCoordinate(rawStart);
  const endCoord = parseCoordinate(rawEnd);

  if (!startCoord || !endCoord) {
    return res.status(400).json({
      error: 'Missing or invalid coordinates. Please provide start and end coordinates as "lat,lng" string or { lat, lng } object.',
      example: '/api/schooldistance?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk',
      received: { start: rawStart, end: rawEnd, routeType },
    });
  }

  // Retrieve AccountKey from environment (without hardcoding any secrets)
  const accountKey =
    process.env.ONEMAP_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.ONEMAP_API_KEY ||
    '';

  const [sLat, sLng] = startCoord.split(',').map(Number);
  const [eLat, eLng] = endCoord.split(',').map(Number);
  const geodesicMeters = calculateHaversineMeters(sLat, sLng, eLat, eLng);

  // If AccountKey is not yet provided by the user in environment
  if (!accountKey) {
    return res.status(200).json({
      success: true,
      source: 'geodesic_fallback',
      warning: 'OneMap AccountKey not yet set in environment (ONEMAP_ACCOUNT_KEY). Returning high-precision geodesic calculation until key is configured.',
      hasAccountKey: false,
      schoolId: schoolId || undefined,
      start: startCoord,
      end: endCoord,
      routeType,
      distanceMeters: geodesicMeters,
      distanceKm: Math.round((geodesicMeters / 1000) * 100) / 100,
      durationSeconds: routeType === 'walk' ? Math.round((geodesicMeters / 1.33)) : Math.round((geodesicMeters / 8.33)),
      durationMinutes: routeType === 'walk' ? Math.round((geodesicMeters / 1.33) / 60) : Math.round((geodesicMeters / 8.33) / 60),
    });
  }

  // Build OneMap Public Routing URL
  const oneMapUrl = new URL('https://www.onemap.gov.sg/api/public/routingsvc/route');
  oneMapUrl.searchParams.set('start', startCoord);
  oneMapUrl.searchParams.set('end', endCoord);
  oneMapUrl.searchParams.set('routeType', routeType);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      AccountKey: accountKey,
    };

    // If key is a JWT/Bearer token or formatted as such, also pass Authorization
    if (accountKey.startsWith('Bearer ') || accountKey.split('.').length === 3) {
      headers['Authorization'] = accountKey.startsWith('Bearer ') ? accountKey : `Bearer ${accountKey}`;
    }

    const response = await fetch(oneMapUrl.toString(), {
      method: 'GET',
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return res.status(response.status || 502).json({
        success: false,
        error: `OneMap Routing API error (HTTP ${response.status})`,
        oneMapResponse: data,
        fallback: {
          distanceMeters: geodesicMeters,
          distanceKm: Math.round((geodesicMeters / 1000) * 100) / 100,
        },
      });
    }

    // Extract distance and time fields from OneMap response structure
    // OneMap routingsvc returns: route_summary: { total_distance, total_time, start_point, end_point }
    const summary = data.route_summary || {};
    const totalDistance = typeof summary.total_distance === 'number'
      ? summary.total_distance
      : typeof data.total_distance === 'number'
      ? data.total_distance
      : geodesicMeters;

    const totalTime = typeof summary.total_time === 'number'
      ? summary.total_time
      : typeof data.total_time === 'number'
      ? data.total_time
      : Math.round(totalDistance / 1.33);

    return res.status(200).json({
      success: true,
      source: 'onemap_live',
      hasAccountKey: true,
      schoolId: schoolId || undefined,
      start: startCoord,
      end: endCoord,
      routeType,
      distanceMeters: totalDistance,
      distanceKm: Math.round((totalDistance / 1000) * 100) / 100,
      durationSeconds: totalTime,
      durationMinutes: Math.round(totalTime / 60),
      routeSummary: summary,
      statusMessage: data.status_message || data.status || 'Found route',
      routeGeometry: data.route_geometry || undefined,
      rawOneMap: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({
      success: false,
      error: `Failed to query OneMap routing service: ${message}`,
      fallback: {
        distanceMeters: geodesicMeters,
        distanceKm: Math.round((geodesicMeters / 1000) * 100) / 100,
      },
    });
  }
}
