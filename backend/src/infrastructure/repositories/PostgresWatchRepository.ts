import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch } from '../../domain/entities/Watch';
import { query } from '../database/postgres';

export class PostgresWatchRepository implements WatchRepository {
  async findAll(): Promise<Watch[]> {
    const result = await query('SELECT * FROM watches');
    return result.rows.map(row => this.mapToWatch(row));
  }

  async findById(id: string): Promise<Watch | null> {
    const result = await query('SELECT * FROM watches WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToWatch(result.rows[0]);
  }

  private mapToWatch(row: any): Watch {
    return new Watch(
      row.id,
      row.name,
      row.description,
      parseFloat(row.price),
      row.image_url
    );
  }
}
