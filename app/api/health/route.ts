import { NextRequest, NextResponse } from 'next/server';
import { verifySystemIntegrity } from '@/lib/rarity/integrity';
import { metrics } from '@/lib/observability/metrics';
import { applySecurityHeaders } from '@/lib/security/cors';
import { getAppConfig } from '@/lib/config/env';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isReadiness = searchParams.get('ready') === 'true';
  const config = getAppConfig();
  const integrity = verifySystemIntegrity();
  const metricsSnapshot = metrics.getSnapshot();

  if (isReadiness) {
    if (!integrity.isHealthy) {
      const res = NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          integrity: {
            isHealthy: false,
            errors: integrity.errors,
          },
        },
        { status: 503 }
      );
      return applySecurityHeaders(res, req);
    }

    const res = NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      environment: config.env,
      versions: integrity.versions,
      integrity: {
        isHealthy: true,
        registryCount: integrity.registryCount,
        datasetPatternCount: integrity.datasetPatternCount,
      },
      metrics: metricsSnapshot,
    });
    return applySecurityHeaders(res, req);
  }

  // Basic Liveness
  const res = NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: metricsSnapshot.uptimeSeconds,
    versions: {
      calculationVersion: config.versions.calculationVersion,
      referenceDatasetVersion: config.versions.referenceDatasetVersion,
    },
  });
  return applySecurityHeaders(res, req);
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return applySecurityHeaders(res, req);
}
