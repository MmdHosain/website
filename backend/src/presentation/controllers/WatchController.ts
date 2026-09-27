import { Request, Response } from 'express';
import { GetWatchesUseCase } from '../../application/use-cases/GetWatches';
import { GetWatchByIdUseCase } from '../../application/use-cases/GetWatchById';
import { CreateWatchUseCase } from '../../application/use-cases/CreateWatch';
import { UpdateWatchUseCase } from '../../application/use-cases/UpdateWatch';
import { DeleteWatchUseCase } from '../../application/use-cases/DeleteWatch';

export class WatchController {
  constructor(
    private getWatchesUseCase: GetWatchesUseCase,
    private getWatchByIdUseCase: GetWatchByIdUseCase,
    private createWatchUseCase: CreateWatchUseCase,
    private updateWatchUseCase: UpdateWatchUseCase,
    private deleteWatchUseCase: DeleteWatchUseCase
  ) {}

  async getAll(req: Request, res: Response) {
    try {
      const watches = await this.getWatchesUseCase.execute();
      res.json(watches);
    } catch (error) {
      console.error('Error fetching watches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const watch = await this.getWatchByIdUseCase.execute(id);
      if (!watch) {
        return res.status(404).json({ error: 'Watch not found' });
      }
      res.json(watch);
    } catch (error) {
      console.error(`Error fetching watch ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const newWatch = await this.createWatchUseCase.execute(data);
      res.status(201).json(newWatch);
    } catch (error) {
      console.error('Error creating watch:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = req.body;
      const updatedWatch = await this.updateWatchUseCase.execute(id, data);
      if (!updatedWatch) {
        return res.status(404).json({ error: 'Watch not found' });
      }
      res.json(updatedWatch);
    } catch (error) {
      console.error(`Error updating watch ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const success = await this.deleteWatchUseCase.execute(id);
      if (!success) {
        return res.status(404).json({ error: 'Watch not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting watch ${req.params.id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
