import { Request, Response } from 'express';
import { RequestOtpUseCase } from '../../application/use-cases/auth/RequestOtp';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/VerifyOtp';

export class AuthController {
  constructor(
    private requestOtpUseCase: RequestOtpUseCase,
    private verifyOtpUseCase: VerifyOtpUseCase
  ) {}

  async requestOtp(req: Request, res: Response) {
    try {
      const { mobile } = req.body;
      if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
      }

      const result = await this.requestOtpUseCase.execute(mobile);
      res.json({ success: true, devOtp: result.code });
    } catch (error: any) {
      console.error('Error requesting OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { mobile, code } = req.body;
      if (!mobile || !code) {
        return res.status(400).json({ error: 'Mobile and code are required' });
      }

      const result = await this.verifyOtpUseCase.execute(mobile, code);
      res.json({ success: true, user: result.user, token: result.token });
    } catch (error: any) {
      console.error('Error verifying OTP:', error.message);
      res.status(400).json({ error: error.message || 'Verification failed' });
    }
  }
}
