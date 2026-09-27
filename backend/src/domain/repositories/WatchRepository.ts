import { Watch } from '../entities/Watch';

export interface WatchRepository {
  findAll(): Promise<Watch[]>;
  findById(id: string): Promise<Watch | null>;
  create(watch: Omit<Watch, 'id'>): Promise<Watch>;
  update(id: string, watch: Partial<Omit<Watch, 'id'>>): Promise<Watch | null>;
  delete(id: string): Promise<boolean>;
}
