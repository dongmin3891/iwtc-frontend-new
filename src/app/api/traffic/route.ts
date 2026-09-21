import { getCloudflareTrafficStats } from '@/features/traffic/cloudflareTraffic.server';
import { createTrafficResponse } from '@/features/traffic/trafficRoute';

export const dynamic = 'force-dynamic';

export function GET(): Promise<Response> {
    return createTrafficResponse(getCloudflareTrafficStats);
}
