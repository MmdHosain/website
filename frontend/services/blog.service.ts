import { apiRequest, ApiError } from './api';
export type BlogBlock = { type:'text'; text:string } | { type:'product'; watchId:string };
export interface ArticleInput { lang:'en'|'fa'; title:string; slug:string; excerpt:string; status:'draft'|'published'; blocks:BlogBlock[]; }
export interface BlogArticle extends ArticleInput { id:string; publishedAt:string|null; createdAt:string; updatedAt:string; }
export interface BlogComment { id:string; articleId:string; name:string; body:string; status:'pending'|'approved'|'rejected'; createdAt:string; articleTitle?:string; }
const query = (lang:string) => `?lang=${lang === 'fa' ? 'fa' : 'en'}`;
export const blogService = {
  list(lang:string) { return apiRequest<BlogArticle[]>(`/api/blog${query(lang)}`); },
  async detail(slug:string,lang:string):Promise<BlogArticle|null> {
    try { return await apiRequest(`/api/blog/${encodeURIComponent(slug)}${query(lang)}`); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return null; throw error; }
  },
  comments(slug:string,lang:string) { return apiRequest<BlogComment[]>(`/api/blog/${encodeURIComponent(slug)}/comments${query(lang)}`); },
  comment(id:string,name:string,body:string) { return apiRequest<BlogComment>(`/api/blog/${id}/comments`,{ method:'POST',authenticated:true,body:{ name,body } }); },
  adminList() { return apiRequest<BlogArticle[]>('/api/admin/blog',{ authenticated:true }); },
  save(input:ArticleInput,id?:string) { return apiRequest<BlogArticle>(`/api/admin/blog${id ? `/${id}` : ''}`,{ method:id ? 'PUT' : 'POST',body:input,authenticated:true }); },
  remove(id:string) { return apiRequest(`/api/admin/blog/${id}`,{ method:'DELETE',authenticated:true }); },
  moderateList() { return apiRequest<BlogComment[]>('/api/admin/blog/comments',{ authenticated:true }); },
  moderate(id:string,status:BlogComment['status']) { return apiRequest<BlogComment>(`/api/admin/blog/comments/${id}`,{ method:'PATCH',authenticated:true,body:{ status } }); },
};
