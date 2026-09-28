import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { RequestOtpUseCase } from '../../application/use-cases/auth/RequestOtp';
import { VerifyOtpUseCase } from '../../application/use-cases/auth/VerifyOtp';
import { MockOtpProvider } from '../../infrastructure/providers/MockOtpProvider';

export const authRoutes = Router();

const otpProvider = new MockOtpProvider();
const requestOtpUseCase = new RequestOtpUseCase(otpProvider);
const verifyOtpUseCase = new VerifyOtpUseCase();
const authController = new AuthController(requestOtpUseCase, verifyOtpUseCase);

authRoutes.post('/request-otp', authController.requestOtp.bind(authController));
authRoutes.post('/verify-otp', authController.verifyOtp.bind(authController));
