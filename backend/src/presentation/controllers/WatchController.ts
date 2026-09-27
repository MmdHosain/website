import { Request, Response } from 'express';
import { GetWatchesUseCase } from '../../application/use-cases/GetWatches';

export class WatchController {
  constructor(private getWatchesUseCase: GetWatchesUseCase) {}

  async getAll(req: Request, res: Response) {
    try {
      const watches = await this.getWatchesUseCase.execute();
      res.json(watches);
    } catch (error) {
      console.error('Error fetching watches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
