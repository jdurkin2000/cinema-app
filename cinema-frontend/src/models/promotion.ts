export default interface Promotion {
    id: string;
    code: string;
    startDate: Date;
    endDate: Date;
    discountPercent: number;
}