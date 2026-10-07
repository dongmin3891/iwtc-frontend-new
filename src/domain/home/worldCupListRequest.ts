export const createWorldCupListUrl = (
    baseUrl: string,
    page: number,
    size: number,
    sort: string,
    keyword?: string,
    dateRange = 'ALL'
) => {
    const url = new URL('api/world-cups', baseUrl);

    url.searchParams.set('page', String(page));
    url.searchParams.set('size', String(size));
    url.searchParams.set('sort', `${sort},DESC`);
    if (keyword !== undefined) {
        url.searchParams.set('keyword', keyword);
    }
    url.searchParams.set('dateRange', dateRange);

    return url;
};
