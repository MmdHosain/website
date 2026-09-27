import { WatchRepository } from '../../domain/repositories/WatchRepository';

export class DeleteWatchUseCase {
  constructor(private watchRepository: WatchRepository) {}

  async execute(id: string) {
    return await this.watchRepository.delete(id);
  }
}
