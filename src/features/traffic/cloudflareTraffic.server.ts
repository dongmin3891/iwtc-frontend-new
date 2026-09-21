import * as yup from 'yup';
import { getSeoulTrafficQueryWindow, parseCloudflareTrafficCounts } from './cloudflareTraffic';
import { AvailableTrafficStats } from './trafficStats';

const CLOUDFLARE_GRAPHQL_URL = 'https://api.cloudflare.com/client/v4/graphql';
const TRAFFIC_HOSTNAME = 'iwtc.ddongmy.com';
const TRAFFIC_CACHE_TTL_MS = 10 * 60 * 1_000;
const TRAFFIC_REQUEST_TIMEOUT_MS = 10_000;

const cloudflareTrafficEnvironmentSchema = yup
    .object({
        CLOUDFLARE_ANALYTICS_API_TOKEN: yup.string().trim().required(),
        CLOUDFLARE_ZONE_ID: yup.string().trim().required(),
    })
    .required();

type CloudflareTrafficConfig = {
    apiToken: string;
    zoneId: string;
};

type CachedTrafficStats = {
    expiresAt: number;
    value: AvailableTrafficStats;
};

class CloudflareTrafficResponseError extends Error {
    constructor(readonly status: number) {
        super(`Cloudflare Analytics request failed with status ${status}`);
    }
}

const trafficQuery = `
  query Traffic(
    $zoneTag: string
    $hostname: string
    $todayStartsAt: Time
    $lastSevenDaysStartAt: Time
    $endsAt: Time
  ) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        today: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {
            clientRequestHTTPHost: $hostname
            requestSource: "eyeball"
            datetime_geq: $todayStartsAt
            datetime_lt: $endsAt
          }
        ) {
          sum {
            visits
          }
        }
        lastSevenDays: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {
            clientRequestHTTPHost: $hostname
            requestSource: "eyeball"
            datetime_geq: $lastSevenDaysStartAt
            datetime_lt: $endsAt
          }
        ) {
          sum {
            visits
          }
        }
      }
    }
  }
`;

let successfulCache: CachedTrafficStats | undefined;
let inFlightRequest: Promise<AvailableTrafficStats> | undefined;

function getCloudflareTrafficConfig(): CloudflareTrafficConfig {
    const environment = cloudflareTrafficEnvironmentSchema.validateSync(
        {
            CLOUDFLARE_ANALYTICS_API_TOKEN: process.env.CLOUDFLARE_ANALYTICS_API_TOKEN,
            CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
        },
        { abortEarly: false, stripUnknown: true }
    );

    return {
        apiToken: environment.CLOUDFLARE_ANALYTICS_API_TOKEN,
        zoneId: environment.CLOUDFLARE_ZONE_ID,
    };
}

async function readRequiredJson(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        throw new Error('Cloudflare Analytics returned an invalid JSON response');
    }
}

async function requestCloudflareTrafficStats(): Promise<AvailableTrafficStats> {
    const checkedAt = new Date();
    const config = getCloudflareTrafficConfig();
    const queryWindow = getSeoulTrafficQueryWindow(checkedAt);
    const response = await fetch(CLOUDFLARE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: trafficQuery,
            variables: {
                zoneTag: config.zoneId,
                hostname: TRAFFIC_HOSTNAME,
                ...queryWindow,
            },
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(TRAFFIC_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new CloudflareTrafficResponseError(response.status);
    }

    const counts = parseCloudflareTrafficCounts(await readRequiredJson(response));

    return {
        status: 'available',
        ...counts,
        checkedAt: checkedAt.toISOString(),
    };
}

export async function getCloudflareTrafficStats(): Promise<AvailableTrafficStats> {
    const now = Date.now();

    if (successfulCache && successfulCache.expiresAt > now) {
        return successfulCache.value;
    }

    if (inFlightRequest) return inFlightRequest;

    inFlightRequest = requestCloudflareTrafficStats()
        .then((value) => {
            successfulCache = {
                value,
                expiresAt: Date.now() + TRAFFIC_CACHE_TTL_MS,
            };
            return value;
        })
        .finally(() => {
            inFlightRequest = undefined;
        });

    return inFlightRequest;
}
