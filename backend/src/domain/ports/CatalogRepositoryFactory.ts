import type { QueryExecutor } from './Database';
import type { WatchRepository } from '../repositories/WatchRepository';

export type CatalogRepositoryFactory = (executor: QueryExecutor) => WatchRepository;
