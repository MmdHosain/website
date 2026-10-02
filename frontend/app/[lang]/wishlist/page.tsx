import { getDictionary } from '../../dictionaries';
import { watchService } from '../../../services/watch.service';
import { CollectionsView } from '../../../components/collections/CollectionsView';
export default async function WishlistPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requested } = await params, lang = requested === 'en' ? 'en' : 'fa';
  const [dict, watches] = await Promise.all([getDictionary(lang), watchService.getAll()]);
  return <CollectionsView lang={lang} dict={dict} watches={watches} />;
}
