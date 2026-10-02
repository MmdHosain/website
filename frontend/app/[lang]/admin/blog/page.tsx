import { AdminBlog } from '../../../../components/admin/blog/AdminBlog';
export default async function AdminBlogPage({ params }:{ params:Promise<{ lang:string }> }) {
  const { lang } = await params;return <AdminBlog lang={lang==='en' ? 'en' : 'fa'}/>;
}
