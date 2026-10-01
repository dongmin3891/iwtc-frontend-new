import { dehydrate, Hydrate } from '@tanstack/react-query';
import getQueryClient from '@/lib/react-query/getQueryClient';
import { worldCupAllList } from '@/services/WorldCupService';
import WorldCup from './worldcup/WorldCupWrapper';
import { mappingMediaFile2 } from '@/utils/common';
import { HOME_WORLD_CUP_PAGE_SIZE } from '@/domain/home/worldCupPagination';

export default async function HydratedWCList() {
    const queryClient = getQueryClient();

    await queryClient.prefetchInfiniteQuery(
        ['wclist', 'id', undefined, 'ALL'],
        async ({ pageParam = 0 }) => {
            const data = await worldCupAllList(
                pageParam,
                HOME_WORLD_CUP_PAGE_SIZE,
                'id',
                undefined,
                'ALL'
            );
            const transformedData = await mappingMediaFile2(data.list);
            return {
                ...data,
                list: transformedData,
            };
        }
    );

    const dehydratedState = dehydrate(queryClient);

    return (
        <Hydrate state={dehydratedState}>
            <WorldCup />
        </Hydrate>
    );
}
