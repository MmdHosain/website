import { Router } from 'express';
import { WatchController } from '../controllers/WatchController';
import { GetWatchesUseCase } from '../../application/use-cases/GetWatches';
import { GetWatchByIdUseCase } from '../../application/use-cases/GetWatchById';
import { CreateWatchUseCase } from '../../application/use-cases/CreateWatch';
import { UpdateWatchUseCase } from '../../application/use-cases/UpdateWatch';
import { DeleteWatchUseCase } from '../../application/use-cases/DeleteWatch';
import { PostgresWatchRepository } from '../../infrastructure/repositories/PostgresWatchRepository';

export const watchRoutes = Router();

const repository = new PostgresWatchRepository();
const watchController = new WatchController(
  new GetWatchesUseCase(repository),
  new GetWatchByIdUseCase(repository),
  new CreateWatchUseCase(repository),
  new UpdateWatchUseCase(repository),
  new DeleteWatchUseCase(repository)
);

watchRoutes.get('/', watchController.getAll.bind(watchController));
watchRoutes.get('/:id', watchController.getById.bind(watchController));
watchRoutes.post('/', watchController.create.bind(watchController));
watchRoutes.put('/:id', watchController.update.bind(watchController));
watchRoutes.delete('/:id', watchController.delete.bind(watchController));
