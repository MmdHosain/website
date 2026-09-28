export interface OtpProvider {
  sendOtp(mobile: string, code: string): Promise<boolean>;
}
