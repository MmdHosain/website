import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch } from '../../domain/entities/Watch';

export class CreateWatchUseCase {
  constructor(private watchRepository: WatchRepository) {}

  async execute(data: Omit<Watch, 'id'>) {
    return await this.watchRepository.create(data);
  }
}
