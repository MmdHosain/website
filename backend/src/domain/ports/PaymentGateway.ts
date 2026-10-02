export interface PaymentGateway {
  requestPayment(input: { orderId: string; amount: number; description: string; callbackUrl: string; mobile?: string; email?: string }): Promise<{ authority: string; paymentUrl: string }>;
  verifyPayment(input: { authority: string; amount: number }): Promise<{ refId: string }>;
  inquirePayment?(input: { authority: string }): Promise<{ status: 'VERIFIED' | 'PAID' | 'IN_BANK' | 'FAILED' | 'REVERSED' }>;
}
