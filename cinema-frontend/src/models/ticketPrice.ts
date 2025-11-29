export default interface TicketPrice {
    id: string;
    type: "ADULT" | "SENIOR" | "CHILD";
    price: number;
}