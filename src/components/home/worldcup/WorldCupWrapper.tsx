'use client';
import { worldCupAllList } from '@/services/WorldCupService';
import React, { useState } from 'react';
import WorldCupList from './WorldCupList';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroller';
import SearchBar from '@/components/search';
import RankSelect from '@/components/button/RankSelect';
import Order from '@/components/dropdown/Order';
import { mappingMediaFile2 } from '@/utils/common';
import { WCListViewData, WCListViewPage } from '@/interfaces/models/world-cup/WcListData';

const WorldCupWrapper = () => {
    const [keyword, setKeyword] = useState<undefined | string>(undefined);
    const [order, setOrder] = useState<string>('id');
    const [rank, setRank] = useState<string>('ALL');

    const { data, fetchNextPage, hasNextPage, isSuccess, isLoading, isError, isFetchingNextPage } =
        useInfiniteQuery<WCListViewPage>(
            ['wclist', order, keyword, rank],
            async ({ pageParam = 0 }) => {
                const response = await worldCupAllList(pageParam, 20, order, keyword, rank);
                const newlist = await mappingMediaFile2(response.list);
                return { ...response, list: newlist };
            },
            {
                getNextPageParam: (lastPage) => {
                    const currentPageNumber = lastPage.pageable.pageNumber;

                    if (
                        currentPageNumber === lastPage.totalPage - 1 ||
                        lastPage.list.length < 1 ||
                        lastPage.list.length < lastPage.pageable.pageSize
                    ) {
                        return undefined;
                    }
                    return currentPageNumber + 1;
                },
                staleTime: 3000,
            }
        );

    const totalCount = data?.pages[0]?.totalCount ?? 0;

    return (
        <section id="world-cups" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-black tracking-[0.18em] text-violet-600">DISCOVER</p>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                        지금 즐길 수 있는 월드컵
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        검색하거나 기간과 인기순으로 취향에 맞는 게임을 찾아보세요.
                    </p>
                </div>
                {isSuccess && (
                    <span className="text-sm font-semibold text-slate-400">
                        총 <strong className="text-slate-700">{totalCount}</strong>개
                    </span>
                )}
            </div>

            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(280px,1fr)_minmax(300px,auto)_180px] lg:items-end">
                <SearchBar setKeyword={setKeyword} />
                <RankSelect setRank={setRank} />
                <Order setOrder={setOrder} />
            </div>

            {isLoading && (
                <div className="grid min-h-[280px] place-items-center text-sm font-semibold text-slate-400">
                    월드컵을 불러오는 중입니다.
                </div>
            )}

            {isError && (
                <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center text-sm font-semibold text-rose-700">
                    월드컵을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
                </div>
            )}

            {isSuccess && totalCount === 0 && (
                <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <p className="text-lg font-black text-slate-800">조건에 맞는 월드컵이 없어요.</p>
                    <p className="mt-2 text-sm text-slate-500">검색어나 기간 조건을 바꿔보세요.</p>
                </div>
            )}

            {isSuccess && totalCount > 0 && (
                <InfiniteScroll loadMore={() => fetchNextPage()} hasMore={Boolean(hasNextPage)}>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {data?.pages.flatMap((page, pageIndex) =>
                            page.list.map((item: WCListViewData, itemIndex) => (
                                <WorldCupList
                                    wcList={item}
                                    key={item.worldCupId}
                                    priority={pageIndex === 0 && itemIndex === 0}
                                />
                            ))
                        )}
                    </div>
                    {isFetchingNextPage && (
                        <p className="mt-8 text-center text-sm font-semibold text-slate-400">
                            더 많은 월드컵을 불러오는 중입니다.
                        </p>
                    )}
                </InfiniteScroll>
            )}
        </section>
    );
};

export default WorldCupWrapper;
