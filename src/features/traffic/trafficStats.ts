import * as yup from 'yup';

export type AvailableTrafficStats = {
    status: 'available';
    todayVisits: number;
    lastSevenDaysVisits: number;
    checkedAt: string;
};

export type UnavailableTrafficStats = {
    status: 'unavailable';
    checkedAt: string;
};

export type PublicTrafficStats = AvailableTrafficStats | UnavailableTrafficStats;

const checkedAtSchema = yup
    .string()
    .required()
    .test('iso-date', 'checkedAt must be an ISO date', (value) => {
        if (!value) return false;

        const parsed = new Date(value);
        return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
    });

const availableTrafficStatsSchema: yup.ObjectSchema<AvailableTrafficStats> = yup
    .object({
        status: yup.mixed<'available'>().oneOf(['available']).required(),
        todayVisits: yup.number().integer().min(0).required(),
        lastSevenDaysVisits: yup.number().integer().min(0).required(),
        checkedAt: checkedAtSchema,
    })
    .required();

const unavailableTrafficStatsSchema: yup.ObjectSchema<UnavailableTrafficStats> = yup
    .object({
        status: yup.mixed<'unavailable'>().oneOf(['unavailable']).required(),
        checkedAt: checkedAtSchema,
    })
    .required();

export function parsePublicTrafficStats(value: unknown): PublicTrafficStats {
    if (!value || typeof value !== 'object' || !('status' in value)) {
        throw new Error('Traffic response has an invalid status');
    }

    const schema =
        value.status === 'available' ? availableTrafficStatsSchema : unavailableTrafficStatsSchema;

    return schema.validateSync(value, { abortEarly: false, strict: true });
}
