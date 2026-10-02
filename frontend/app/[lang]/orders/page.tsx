import { getDictionary } from '../../dictionaries';
import { OrdersView } from '../../../components/checkout/OrdersView';

export default async function OrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  return <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24"><OrdersView lang={lang} dict={dict} /></div>;
}
