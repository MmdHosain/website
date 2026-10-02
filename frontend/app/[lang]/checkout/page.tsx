import { getDictionary } from '../../dictionaries';
import { CheckoutView } from '../../../components/checkout/CheckoutView';
import { PaymentResultView } from '../../../components/checkout/PaymentResultView';

export default async function CheckoutPage({ params, searchParams: searchParamsPromise }: { params: Promise<{ lang: string }>; searchParams: Promise<{ order?: string; orderId?: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const searchParams = await searchParamsPromise;
  const dict = await getDictionary(lang);
  const orderId = typeof searchParams.order === 'string' ? searchParams.order : typeof searchParams.orderId === 'string' ? searchParams.orderId : '';
  return <div className="max-w-6xl mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24">{orderId ? <PaymentResultView lang={lang} dict={dict} orderId={orderId} /> : <CheckoutView lang={lang} dict={dict} />}</div>;
}
