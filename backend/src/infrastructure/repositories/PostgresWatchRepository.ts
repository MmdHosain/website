import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch } from '../../domain/entities/Watch';
import { query } from '../database/postgres';

export class PostgresWatchRepository implements WatchRepository {
  async findAll(): Promise<Watch[]> {
    const result = await query('SELECT * FROM watches ORDER BY name ASC');
    return result.rows.map(row => this.mapToWatch(row));
  }

  async findById(id: string): Promise<Watch | null> {
    const result = await query('SELECT * FROM watches WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToWatch(result.rows[0]);
  }

  async create(watch: Omit<Watch, 'id'>): Promise<Watch> {
    const result = await query(
      'INSERT INTO watches (name, description, price, image_url, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [watch.name, watch.description, watch.price, watch.imageUrl, watch.category]
    );
    return this.mapToWatch(result.rows[0]);
  }

  async update(id: string, watch: Partial<Omit<Watch, 'id'>>): Promise<Watch | null> {
    // A simplified update for demonstration. In a real app, you'd dynamically build this query or use an ORM.
    const current = await this.findById(id);
    if (!current) return null;

    const updatedName = watch.name ?? current.name;
    const updatedDesc = watch.description ?? current.description;
    const updatedPrice = watch.price ?? current.price;
    const updatedImage = watch.imageUrl ?? current.imageUrl;
    const updatedCategory = watch.category ?? current.category;

    const result = await query(
      'UPDATE watches SET name = $1, description = $2, price = $3, image_url = $4, category = $5 WHERE id = $6 RETURNING *',
      [updatedName, updatedDesc, updatedPrice, updatedImage, updatedCategory, id]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapToWatch(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM watches WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  private mapToWatch(row: any): Watch {
    return new Watch(
      row.id,
      row.name,
      row.description,
      parseFloat(row.price),
      row.image_url,
      row.category || 'original'
    );
  }
}
