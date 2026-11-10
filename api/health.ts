import type { Request, Response } from 'express';

/**
 * Health check endpoint for OneMap serverless API
 * GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  const hasAccountKey = Boolean(
    process.env.ONEMAP_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.ONEMAP_API_KEY
  );

  return res.status(200).json({
    status: 'healthy',
    service: 'onemap-primary-school-routing-service',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      onemapAccountKeyConfigured: hasAccountKey,
    },
    supportedRouteTypes: ['walk', 'drive', 'cycle', 'pt'],
    endpoints: {
      health: '/api/health',
      schooldistance: '/api/schooldistance',
    },
    message: hasAccountKey
      ? 'OneMap AccountKey is configured and ready to query live routing data.'
      : 'OneMap AccountKey is not yet set in environment. Add ONEMAP_ACCOUNT_KEY to your environment variables.',
  });
}
