import { Router } from 'express';
import { WatchController } from '../controllers/WatchController';
import { GetWatchesUseCase } from '../../application/use-cases/GetWatches';
import { PostgresWatchRepository } from '../../infrastructure/repositories/PostgresWatchRepository';

export const watchRoutes = Router();

const repository = new PostgresWatchRepository();
const getWatchesUseCase = new GetWatchesUseCase(repository);
const watchController = new WatchController(getWatchesUseCase);

watchRoutes.get('/', watchController.getAll.bind(watchController));
