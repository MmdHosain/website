import { Router } from 'express';
import { GetWatchesUseCase } from '../../application/use-cases/GetWatches';
import { GetWatchByIdUseCase } from '../../application/use-cases/GetWatchById';
import { CreateWatchUseCase } from '../../application/use-cases/CreateWatch';
import { UpdateWatchUseCase } from '../../application/use-cases/UpdateWatch';
import { DeleteWatchUseCase } from '../../application/use-cases/DeleteWatch';
import { PostgresWatchRepository } from '../../infrastructure/repositories/PostgresWatchRepository';
import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch } from '../../domain/entities/Watch';
import { AuthService } from '../../application/services/AuthService';
import { HttpError } from '../../application/errors';
import { uuid, watchData } from '../../application/validation';
import { asyncRoute, authMiddleware, requirePermission } from '../middleware';
import { searchCatalog } from '../../application/catalog/search';

export function createWatchRoutes(auth: AuthService, repository: WatchRepository = new PostgresWatchRepository()) {
  const router = Router();
  router.get('/', asyncRoute(async (req, res) => {
    if (req.query.q !== undefined && (typeof req.query.q !== 'string' || req.query.q.length > 100)) throw new HttpError(400, 'Search must contain at most 100 characters');
    res.json(searchCatalog(await new GetWatchesUseCase(repository).execute(), (req.query.q as string) || ''));
  }));
  router.get('/:id', asyncRoute(async (req, res) => {
    const watch = await new GetWatchByIdUseCase(repository).execute(uuid(req.params.id));
    if (!watch) throw new HttpError(404, 'Watch not found');
    res.json(watch);
  }));
  router.post('/', authMiddleware(auth), requirePermission('catalog'), asyncRoute(async (req, res) => {
    res.status(201).json(await new CreateWatchUseCase(repository).execute(watchData(req.body) as Omit<Watch, 'id'>));
  }));
  router.put('/:id', authMiddleware(auth), requirePermission('catalog'), asyncRoute(async (req, res) => {
    const watch = await new UpdateWatchUseCase(repository).execute(uuid(req.params.id), watchData(req.body, true) as Partial<Omit<Watch, 'id'>>);
    if (!watch) throw new HttpError(404, 'Watch not found');
    res.json(watch);
  }));
  router.delete('/:id', authMiddleware(auth), requirePermission('catalog'), asyncRoute(async (req, res) => {
    if (!await new DeleteWatchUseCase(repository).execute(uuid(req.params.id))) throw new HttpError(404, 'Watch not found');
    res.status(204).end();
  }));
  return router;
}
