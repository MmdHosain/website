import type { PaymentGateway } from '../../domain/ports/PaymentGateway';

/** An unpaid/invalid verification alone cannot rule out an in-progress charge. */
export async function inquireAfterVerificationError(gateway: PaymentGateway, authority: string, error: unknown) {
  const providerCode = (error as { providerCode?: number } | null)?.providerCode;
  if (![-51, -54].includes(providerCode ?? 0)) throw error;
  if (!gateway.inquirePayment) {
    if (providerCode === -51) return null;
    throw error;
  }
  try { return await gateway.inquirePayment({ authority }); }
  catch (inquiryError: any) {
    // Both provider methods must agree the authority is invalid before release or replacement.
    if (providerCode !== -54 || inquiryError?.providerCode !== -54) throw inquiryError;
    return { status: 'FAILED' as const };
  }
}
