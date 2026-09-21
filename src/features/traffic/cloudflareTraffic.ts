import * as yup from 'yup';

const SEOUL_UTC_OFFSET_MS = 9 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

const graphQlEnvelopeSchema = yup
    .object({
        data: yup.mixed().nullable().optional(),
        errors: yup
            .array(
                yup
                    .object({
                        message: yup.string().required(),
                    })
                    .required()
            )
            .nullable()
            .optional(),
    })
    .required();

const visitGroupSchema = yup
    .object({
        sum: yup
            .object({
                visits: yup.number().integer().min(0).required(),
            })
            .required(),
    })
    .required();

const cloudflareTrafficDataSchema = yup
    .object({
        viewer: yup
            .object({
                zones: yup
                    .array(
                        yup
                            .object({
                                today: yup.array(visitGroupSchema).required(),
                                lastSevenDays: yup.array(visitGroupSchema).required(),
                            })
                            .required()
                    )
                    .required(),
            })
            .required(),
    })
    .required();

export type TrafficQueryWindow = {
    todayStartsAt: string;
    lastSevenDaysStartAt: string;
    endsAt: string;
};

export type CloudflareTrafficCounts = {
    todayVisits: number;
    lastSevenDaysVisits: number;
};

export function getSeoulTrafficQueryWindow(now: Date): TrafficQueryWindow {
    if (!Number.isFinite(now.getTime())) {
        throw new Error('Traffic query time must be valid');
    }

    const seoulNow = new Date(now.getTime() + SEOUL_UTC_OFFSET_MS);
    const todayStartsAtMs =
        Date.UTC(seoulNow.getUTCFullYear(), seoulNow.getUTCMonth(), seoulNow.getUTCDate()) -
        SEOUL_UTC_OFFSET_MS;

    return {
        todayStartsAt: new Date(todayStartsAtMs).toISOString(),
        lastSevenDaysStartAt: new Date(todayStartsAtMs - 6 * DAY_MS).toISOString(),
        endsAt: now.toISOString(),
    };
}

export function parseCloudflareTrafficCounts(body: unknown): CloudflareTrafficCounts {
    const envelope = graphQlEnvelopeSchema.validateSync(body, {
        abortEarly: false,
        strict: true,
    });

    if (envelope.errors && envelope.errors.length > 0) {
        throw new Error('Cloudflare Analytics returned GraphQL errors');
    }

    const data = cloudflareTrafficDataSchema.validateSync(envelope.data, {
        abortEarly: false,
        strict: true,
    });

    if (data.viewer.zones.length !== 1) {
        throw new Error('Cloudflare Analytics must return exactly one zone');
    }

    const zone = data.viewer.zones[0];

    return {
        todayVisits: sumVisits(zone.today),
        lastSevenDaysVisits: sumVisits(zone.lastSevenDays),
    };
}

function sumVisits(groups: Array<yup.InferType<typeof visitGroupSchema>>): number {
    return groups.reduce((total, group) => total + group.sum.visits, 0);
}
