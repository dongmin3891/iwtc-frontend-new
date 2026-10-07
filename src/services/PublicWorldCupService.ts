import { BASE_URL } from '@/consts';
import {
    loadWCListData,
    WCListApiEnvelope,
    WCListParent,
} from '@/interfaces/models/world-cup/WcListData';
import { createWorldCupListUrl } from '@/domain/home/worldCupListRequest';

const PUBLIC_REQUEST_TIMEOUT_MS = 10000;

export const worldCupAllList = async (
    page: number,
    size: number,
    sort: string,
    keyword?: string,
    dateRange = 'ALL'
): Promise<WCListParent> => {
    if (!BASE_URL) {
        throw new Error('Public API base URL is not configured');
    }

    const response = await fetch(
        createWorldCupListUrl(BASE_URL, page, size, sort, keyword, dateRange),
        {
            cache: 'no-store',
            signal: AbortSignal.timeout(PUBLIC_REQUEST_TIMEOUT_MS),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to load the world cup list (${response.status})`);
    }

    const envelope = (await response.json()) as WCListApiEnvelope;
    return loadWCListData(envelope.data);
};
