export const RENTAL_PLANS = {
    weekly: {
        label: '1 Week',
        days: 7,
        price: 250,
        lenderPayout: 200,
        fee: 50
    },
    monthly: {
        label: '1 Month',
        days: 30,
        price: 600,
        lenderPayout: 500,
        fee: 100
    },
    term: {
        label: '1 Term (approx. 4 months)',
        days: 120, // 4 months
        price: 1200,
        lenderPayout: 1000,
        fee: 200
    }
} as const;

export type RentalDuration = keyof typeof RENTAL_PLANS;

export function getRentalDetails(duration: RentalDuration) {
    return RENTAL_PLANS[duration];
}
