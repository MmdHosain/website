import { getDictionary } from '../../../dictionaries';
import { PaymentResultView } from '../../../../components/checkout/PaymentResultView';

export default async function OrderPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: requestedLang, id } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  return <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24"><PaymentResultView lang={lang} dict={dict} orderId={id} confirmation={false} /></div>;
}
