import { Watch } from '../entities/Watch';

export interface WatchRepository {
  findAll(): Promise<Watch[]>;
  findById(id: string): Promise<Watch | null>;
}