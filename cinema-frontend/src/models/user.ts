import PaymentCard from "./paymentCard";

export default interface User {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    paymentCards: PaymentCard[]
}