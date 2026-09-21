import { AvailableTrafficStats, UnavailableTrafficStats } from './trafficStats';

const SUCCESS_CACHE_CONTROL = 'public, max-age=60, s-maxage=600, stale-while-revalidate=60';

export async function createTrafficResponse(
    loadTrafficStats: () => Promise<AvailableTrafficStats>,
    now: () => Date = () => new Date()
): Promise<Response> {
    try {
        const trafficStats = await loadTrafficStats();

        return Response.json(trafficStats, {
            headers: {
                'Cache-Control': SUCCESS_CACHE_CONTROL,
            },
        });
    } catch (error) {
        console.error('[traffic] Cloudflare Analytics is unavailable', toSafeLogMessage(error));

        const unavailable: UnavailableTrafficStats = {
            status: 'unavailable',
            checkedAt: now().toISOString(),
        };

        return Response.json(unavailable, {
            status: 503,
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    }
}

function toSafeLogMessage(error: unknown): string {
    return error instanceof Error ? error.name : 'Unknown traffic error';
}
