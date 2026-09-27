import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch } from '../../domain/entities/Watch';

export class UpdateWatchUseCase {
  constructor(private watchRepository: WatchRepository) {}

  async execute(id: string, data: Partial<Omit<Watch, 'id'>>) {
    return await this.watchRepository.update(id, data);
  }
}
