import { apiRequest } from '../../services/api';
interface Post { id: string; caption: string; permalink: string; imageUrl: string | null; publishedAt: string; }
export async function InstagramPosts({ lang }: { lang: string }) {
  let posts: Post[];
  try { posts = await apiRequest<Post[]>('/api/social/instagram'); } catch { return null; }
  if (!posts.length) return null;
  return <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full"><h2 className="text-3xl font-serif mb-8">{lang === 'fa' ? 'آریواچ در اینستاگرام' : 'ARIWATCH on Instagram'}</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{posts.slice(0, 8).map(post => <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer" className="block border bg-gray-50 hover:border-ariwatch-red"><div className="aspect-square">{post.imageUrl ? <img src={post.imageUrl} alt={post.caption.slice(0, 120)} className="w-full h-full object-cover" loading="lazy" /> : <span className="flex h-full items-center justify-center text-sm">{lang === 'fa' ? 'نمایش پست' : 'View post'}</span>}</div><p className="p-4 text-sm line-clamp-3">{post.caption}</p></a>)}</div></section>;
}
