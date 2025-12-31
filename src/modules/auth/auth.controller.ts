import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AppError } from '../../shared/errors/app-error';
import { Role } from '../../domain/enums/role.enum';

export class AuthController {
  register = async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  };

  verifyEmail = async (req: Request, res: Response) => {
    await authService.verifyEmail({ token: req.body.token ?? req.query.token });
    res.json({ success: true, message: 'Email verified' });
  };

  verifyPhone = async (req: Request, res: Response) => {
    await authService.verifyPhone(req.body);
    res.json({ success: true, message: 'Phone verified' });
  };

  login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  };

  refresh = async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body);
    res.json({ success: true, data: result });
  };

  approveAdmin = async (req: Request, res: Response) => {
    await authService.approveAdmin(req.body);
    res.json({ success: true, message: 'Admin approved' });
  };

  declineAdmin = async (req: Request, res: Response) => {
    await authService.declineAdmin(req.body);
    res.json({ success: true, message: 'Admin declined' });
  };

  approveSeller = async (req: Request, res: Response) => {
    await authService.approveSeller(req.body);
    res.json({ success: true, message: 'Seller approved' });
  };

  declineSeller = async (req: Request, res: Response) => {
    await authService.declineSeller(req.body);
    res.json({ success: true, message: 'Seller declined' });
  };

  approveDriver = async (req: Request, res: Response) => {
    await authService.approveDriver(req.body);
    res.json({ success: true, message: 'Driver approved' });
  };

  declineDriver = async (req: Request, res: Response) => {
    await authService.declineDriver(req.body);
    res.json({ success: true, message: 'Driver declined' });
  };
}

export const authController = new AuthController();
