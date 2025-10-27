export default interface PaymentCard {
    cardNumber: string,
    expirationDate: Date,
    billingAddress: string,
    isDefault: boolean
}