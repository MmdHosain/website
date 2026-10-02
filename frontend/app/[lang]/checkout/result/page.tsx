import { getDictionary } from '../../../dictionaries';
import { PaymentResultView } from '../../../../components/checkout/PaymentResultView';

export default async function CheckoutResultPage({ params, searchParams: searchParamsPromise }: { params: Promise<{ lang: string }>; searchParams: Promise<{ orderId?: string; order?: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const searchParams = await searchParamsPromise;
  const dict = await getDictionary(lang);
  const orderId = typeof searchParams.orderId === 'string' ? searchParams.orderId : typeof searchParams.order === 'string' ? searchParams.order : '';
  return <div className="max-w-5xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24"><PaymentResultView lang={lang} dict={dict} orderId={orderId} /></div>;
}
