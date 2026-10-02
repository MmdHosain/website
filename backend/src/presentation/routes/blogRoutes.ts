import { Router } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { Database } from '../../infrastructure/database/postgres';
import { HttpError } from '../../application/errors';
import { language, object, text, uuid } from '../../application/validation';
import { articleSummary, mapArticle, mapComment } from '../../application/blog/blogValidation';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';

export function createBlogRoutes(auth: Pick<AuthService, 'authenticate'>, db: Database): Router {
  const router = Router();
  router.get('/', asyncRoute(async (req, res) => {
    const lang = language(req.query.lang);
    const rows = await db.query("SELECT * FROM blog_articles WHERE lang=$1 AND status='published' ORDER BY published_at DESC,id LIMIT 500", [lang]);
    res.json(rows.rows.map(articleSummary));
  }));
  router.post('/:id/comments', authMiddleware(auth), rateLimit(5, 60000), asyncRoute(async (req, res) => {
    const id = uuid(req.params.id, 'Article ID'), input = object(req.body);
    const article = await db.query("SELECT id FROM blog_articles WHERE id=$1 AND status='published'", [id]);
    if (!article.rows.length) throw new HttpError(404, 'Article not found');
    const result = await db.query('INSERT INTO blog_comments(article_id,user_id,name,body) VALUES($1,$2,$3,$4) RETURNING *',
      [id, req.user!.id, text(input.name, 'Name', 100, 2), text(input.body, 'Comment', 2000, 2)]);
    res.status(201).json(mapComment(result.rows[0]));
  }));
  router.get('/:slug/comments', asyncRoute(async (req, res) => {
    const rows = await db.query(`SELECT c.* FROM blog_comments c JOIN blog_articles a ON a.id=c.article_id
      WHERE a.slug=$1 AND a.lang=$2 AND a.status='published' AND c.status='approved' ORDER BY c.created_at DESC LIMIT 100`,
      [text(req.params.slug, 'Slug', 180), language(req.query.lang)]);
    res.json(rows.rows.map(mapComment));
  }));
  router.get('/:slug', asyncRoute(async (req, res) => {
    const result = await db.query("SELECT * FROM blog_articles WHERE slug=$1 AND lang=$2 AND status='published'",
      [text(req.params.slug, 'Slug', 180), language(req.query.lang)]);
    if (!result.rows.length) throw new HttpError(404, 'Article not found');
    res.json(mapArticle(result.rows[0]));
  }));
  return router;
}
