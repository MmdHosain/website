import Link from "next/link";
export function StoreNotice({ lang, kind }: { lang: 'en' | 'fa'; kind: 'terms' | 'privacy' }) {
  const fa = lang === 'fa';
  const content = kind === 'terms' ? (fa ? [
    ['مجموعه و قیمت‌ها', 'دسته‌بندی هر ساعت در صفحه محصول نمایش داده می‌شود: اورجینال، های‌کپی یا سفارش اختصاصی. قیمت‌ها به تومان هستند. سفارش‌های اختصاصی از طریق فرم درخواست پیگیری می‌شوند.'],
    ['ثبت سفارش و پرداخت', 'قبل از پرداخت، جزئیات محصولات و نشانی تحویل را بررسی کنید. پرداخت در صفحه امن زرین‌پال انجام می‌شود. سفارش تنها پس از تأیید پرداخت توسط سرویس پرداخت، پرداخت‌شده ثبت می‌شود.'],
    ['پیگیری سفارش', 'با شماره موبایل خود وارد شوید و وضعیت سفارش را در «سفارش‌های من» ببینید. تأیید و ارسال سفارش توسط تیم فروشگاه ثبت می‌شود.'],
    ['درخواست‌های پشتیبانی', 'برای پرسش درباره موجودی، ارسال، بازگشت کالا یا اصلاح سفارش، از فرم تماس استفاده کنید و شماره سفارش خود را در پیام وارد کنید.']
  ] : [
    ['Collection and prices', 'Each product identifies its collection: Original, High Copy, or Custom Order. Prices are displayed in toman. Custom sourcing requests are handled through the concierge form.'],
    ['Ordering and payment', 'Review the items and delivery details before paying. Payments take place on Zarinpal’s hosted checkout. An order is marked paid only after the payment service verifies the transaction.'],
    ['Order tracking', 'Sign in with your mobile number to view your orders. Store staff update confirmation and shipping status in your order history.'],
    ['Support requests', 'For questions about availability, delivery, returns, or changes to an order, use the contact form and include your order reference.']
  ]) : (fa ? [
    ['اطلاعات حساب', 'برای ورود، شماره موبایل و کد یک‌بارمصرف شما پردازش می‌شود. اطلاعات نشست برای شناسایی حساب و دسترسی به سفارش‌ها استفاده می‌شود.'],
    ['اطلاعات سفارش و درخواست', 'نام، نشانی تحویل، شهر، کد پستی و اطلاعات تماس ارائه‌شده برای پردازش سفارش ذخیره می‌شود. پیام‌های فرم درخواست و عضویت خبرنامه برای پیگیری توسط تیم فروشگاه ذخیره می‌شوند.'],
    ['پرداخت', 'اطلاعات کارت بانکی در زرین‌پال وارد می‌شود. فروشگاه اطلاعات کارت و رمز شما را دریافت نمی‌کند؛ شماره پیگیری پرداخت و وضعیت سفارش ذخیره می‌شود.'],
    ['ذخیره‌سازی در مرورگر', 'سبد خرید و نشست ورود در مرورگر ذخیره می‌شوند. خروج از حساب، نشست مرورگر را پاک و دسترسی آن را در سرویس لغو می‌کند.'],
    ['درخواست درباره اطلاعات شما', 'برای درخواست اصلاح یا حذف اطلاعات حساب، سفارش، درخواست یا عضویت خبرنامه، با فرم تماس به تیم فروشگاه پیام دهید.']
  ] : [
    ['Account information', 'Your mobile number and one-time verification code are processed for sign-in. Session information identifies your account and controls access to your orders.'],
    ['Orders and inquiries', 'Your name, delivery address, city, postal code, and any contact information you provide are stored to process orders. Concierge messages and newsletter subscriptions are stored for store staff to review.'],
    ['Payments', 'You enter payment card information on Zarinpal. The store does not receive your card details or PIN; it stores a payment reference and order status.'],
    ['Browser storage', 'Your cart and sign-in session are saved in your browser. Signing out clears your browser session and revokes its access on the server.'],
    ['Requests about your information', 'Use the contact form to ask the store team to correct or remove account, order, inquiry, or newsletter information.']
  ]);
  return <article className="max-w-3xl mx-auto px-6 pt-36 pb-24">
    <h1 className="text-3xl md:text-5xl font-serif mb-12">{kind === 'terms' ? (fa ? 'شرایط استفاده' : 'Terms of use') : (fa ? 'حریم خصوصی' : 'Privacy notice')}</h1>
    <div className="space-y-8">{content.map(([title, description]) => <section key={title}><h2 className="text-lg font-bold mb-3">{title}</h2><p className="text-gray-600 leading-8">{description}</p></section>)}</div>
    <Link href={`/${lang}/concierge`} className="mt-10 inline-block border border-black px-8 py-3">{fa ? 'تماس با فروشگاه' : 'Contact the store'}</Link>
  </article>;
}
