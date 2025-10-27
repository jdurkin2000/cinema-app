export default interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: "USER" | "ADMIN";
    status: "ACTIVE" | "INACTIVE";
    promotionsOptIn: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    emailVerifyTokenHash: string;
    emailVerifyExpiry: Date;
    address: Address | null;
    paymentCards: PaymentCard[];
}

export interface PaymentCard {
    id: string;
    brand: string;
    last4: string;
    expMonth: string;
    expYear: string;
    numberEnc: string;
    billingName: string;
    billingAddress: Address;
    addedAt: Date;
}

export interface Address {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
}