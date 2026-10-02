import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { AuthService } from '../../application/services/AuthService';
import { Database } from '../../infrastructure/database/postgres';
import type { CatalogRepositoryFactory } from '../../domain/ports/CatalogRepositoryFactory';
import { CatalogImportService } from '../../application/imports/CatalogImportService';
import { catalogTemplate } from '../../application/imports/workbooks';
import { HttpError } from '../../application/errors';
import { uuid } from '../../application/validation';
import { asyncRoute, authMiddleware, rateLimit } from '../middleware';
import { requirePermission } from '../permissions';

export function createBulkCatalogRoutes(auth: Pick<AuthService,'authenticate'>, db: Database, catalog: CatalogRepositoryFactory, mediaDirectory: string, mediaBaseUrl?: string): Router {
  const router = Router(), service = new CatalogImportService(db,catalog,mediaDirectory,mediaBaseUrl);
  const parse = multer({ storage:multer.memoryStorage(),limits:{ fileSize:20*1024*1024,files:2,fields:0,parts:2 },
    fileFilter: (_req,file,callback) => {
      const expected = file.fieldname === 'workbook' ? /\.xlsx$/i : file.fieldname === 'images' ? /\.zip$/i : null;
      if (!expected?.test(file.originalname)) callback(new HttpError(400,'Upload workbook.xlsx and optional images.zip'));
      else callback(null,true);
    } }).fields([{ name:'workbook',maxCount:1 },{ name:'images',maxCount:1 }]);
  const upload: RequestHandler = (req,res,next) => parse(req,res,error => next(error ? new HttpError(400,error instanceof multer.MulterError ? 'Upload exceeds the file or multipart limits' : error.message) : undefined));
  router.use(authMiddleware(auth),requirePermission('catalog'));
  router.get('/template', asyncRoute(async (_req,res) => {
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('ariwatch-catalog-template.xlsx').send(await catalogTemplate());
  }));
  router.post('/preview', rateLimit(5,60000),upload,asyncRoute(async (req,res) => {
    const files = req.files as Record<string,Express.Multer.File[]> | undefined;
    if (!files?.workbook?.[0]) throw new HttpError(400,'An XLSX workbook is required');
    res.status(201).json(await service.preview(req.user!.id,files.workbook[0].buffer,files.images?.[0]?.buffer));
  }));
  router.post('/:id/confirm', rateLimit(10,60000),asyncRoute(async (req,res) => { res.json(await service.confirm(req.user!.id,uuid(req.params.id))); }));
  return router;
}
