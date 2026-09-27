import { WatchRepository } from '../../domain/repositories/WatchRepository';

export class GetWatchesUseCase {
  constructor(private watchRepository: WatchRepository) {}

  async execute() {
    return await this.watchRepository.findAll();
  }
}