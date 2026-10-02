import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { Database } from '../../infrastructure/database/postgres';
import { HttpError } from '../../application/errors';
import { object, uuid } from '../../application/validation';
import { articleInput, mapArticle, mapComment } from '../../application/blog/blogValidation';
import { asyncRoute, authMiddleware } from '../middleware';
import { requirePermission } from '../permissions';

export function createAdminBlogRoutes(auth: Pick<AuthService, 'authenticate'>, db: Database): Router {
  const router = Router();
  router.use(authMiddleware(auth), requirePermission('blog'));
  router.get('/', asyncRoute(async (_req, res) => {
    res.json((await db.query('SELECT * FROM blog_articles ORDER BY updated_at DESC LIMIT 500')).rows.map(mapArticle));
  }));
  router.get('/comments', asyncRoute(async (_req, res) => {
    res.json((await db.query(`SELECT c.*,a.title AS article_title FROM blog_comments c JOIN blog_articles a ON a.id=c.article_id
      ORDER BY CASE WHEN c.status='pending' THEN 0 ELSE 1 END,c.created_at DESC LIMIT 500`)).rows.map(mapComment));
  }));
  router.patch('/comments/:id', asyncRoute(async (req, res) => {
    const status = object(req.body).status;
    if (!['approved','rejected','pending'].includes(status as string)) throw new HttpError(400, 'Invalid comment status');
    const result = await db.query('UPDATE blog_comments SET status=$2 WHERE id=$1 RETURNING *', [uuid(req.params.id), status]);
    if (!result.rows.length) throw new HttpError(404, 'Comment not found');
    res.json(mapComment(result.rows[0]));
  }));
  async function save(raw: unknown, authorId: string, id?: string) {
    const input = articleInput(raw);
    const ids = input.blocks.flatMap(block => block.type === 'product' ? [block.watchId] : []);
    if (ids.length) {
      const found = await db.query('SELECT id FROM watches WHERE id=ANY($1::uuid[])', [ids]);
      if (new Set(found.rows.map(row => row.id)).size !== new Set(ids).size) throw new HttpError(400, 'An embedded product no longer exists');
    }
    try {
      const values = [input.lang,input.title,input.slug,input.excerpt,JSON.stringify(input.blocks),input.status];
      const result = id ? await db.query(`UPDATE blog_articles SET lang=$1,title=$2,slug=$3,excerpt=$4,blocks=$5,status=$6,
        published_at=CASE WHEN $6::varchar='published' THEN COALESCE(published_at,NOW()) ELSE published_at END,updated_at=NOW() WHERE id=$7 RETURNING *`, [...values,id]) :
        await db.query(`INSERT INTO blog_articles(lang,title,slug,excerpt,blocks,status,author_id,published_at)
          VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $6::varchar='published' THEN NOW() ELSE NULL END) RETURNING *`, [...values,authorId]);
      if (!result.rows.length) throw new HttpError(404, 'Article not found');
      return mapArticle(result.rows[0]);
    } catch (error: any) { if (error.code === '23505') throw new HttpError(409, 'This language already has an article with this slug'); throw error; }
  }
  router.post('/', asyncRoute(async (req, res) => { res.status(201).json(await save(req.body,req.user!.id)); }));
  router.put('/:id', asyncRoute(async (req, res) => { res.json(await save(req.body,req.user!.id,uuid(req.params.id))); }));
  router.delete('/:id', asyncRoute(async (req, res) => {
    const result = await db.query('DELETE FROM blog_articles WHERE id=$1 RETURNING id', [uuid(req.params.id)]);
    if (!result.rows.length) throw new HttpError(404, 'Article not found');
    res.status(204).end();
  }));
  return router;
}
