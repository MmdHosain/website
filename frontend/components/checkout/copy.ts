import { formatPrice } from '../../services/format';

export function checkoutCopy(lang: string) {
  return lang === 'fa' ? {
    title: 'تکمیل خرید', cart: 'سبد خرید', total: 'مبلغ کل', toman: 'تومان', quantity: 'تعداد', remove: 'حذف',
    loading: 'در حال بارگذاری…', empty: 'سبد خرید شما خالی است.', browse: 'مشاهده ساعت‌ها',
    signIn: 'ورود برای ادامه', signInHelp: 'برای پرداخت و پیگیری سفارش با شماره موبایل خود وارد شوید.',
    delivery: 'اطلاعات تحویل', name: 'نام و نام خانوادگی', email: 'ایمیل (اختیاری)', city: 'شهر',
    address: 'آدرس کامل', postalCode: 'کد پستی ده‌رقمی', notes: 'یادداشت سفارش (اختیاری)',
    payment: 'پرداخت امن با زرین‌پال', paymentHelp: 'مبلغ نهایی به تومان است. پس از پرداخت به فروشگاه بازمی‌گردید.',
    pay: 'ادامه و پرداخت', redirecting: 'در حال انتقال به زرین‌پال…', error: 'امکان انجام درخواست وجود ندارد. دوباره تلاش کنید.',
    invalidPostal: 'کد پستی باید ده رقم باشد.', invalidAddress: 'آدرس کامل تحویل را وارد کنید.', retry: 'تلاش دوباره',
    orders: 'سفارش‌های من', noOrders: 'هنوز سفارشی ثبت نکرده‌اید.', order: 'سفارش', details: 'جزئیات سفارش',
    received: 'پرداخت شما تأیید شد', paidHelp: 'سفارش شما ثبت شد. جزئیات و وضعیت آن را می‌توانید در سفارش‌های من ببینید.',
    pending: 'پرداخت تکمیل نشده است', pendingHelp: 'این سفارش هنوز پرداخت نشده است. سبد خرید شما حفظ شده و می‌توانید پرداخت را ادامه دهید.',
    cancelledHelp: 'این سفارش لغو شده است. برای ثبت سفارش جدید به سبد خرید بروید.',
    resume: 'ادامه پرداخت', backToCart: 'بازگشت به سبد خرید', missingOrder: 'شماره سفارش معتبر نیست.',
    unavailable: 'برخی ساعت‌های سبد خرید قابل پرداخت نیستند. سبد خرید خود را بررسی کنید.',
    pricesChanged: 'قیمت‌ها تغییر کرده‌اند. مبلغ جدید را بررسی کنید و دوباره پرداخت را انتخاب کنید.',
    paymentRef: 'کد پیگیری پرداخت', gatewayUnavailable: 'پرداخت آنلاین در حال حاضر در دسترس نیست. دوباره تلاش کنید یا با فروشگاه تماس بگیرید.',
    paymentReview: 'پرداخت در حال بررسی است', reviewHelp: 'پرداخت شما دریافت شده است. فروشگاه پیش از آماده‌سازی سفارش باید پرداخت را بررسی کند. برای پیگیری با فروشگاه تماس بگیرید.', contact: 'ارتباط با فروشگاه',
    paymentLimit: 'پرداخت آنلاین برای مبلغ ۱٬۰۰۰ تا ۱۰۰٬۰۰۰٬۰۰۰ تومان در دسترس است. تعداد ساعت‌ها را تغییر دهید یا برای این خرید با فروشگاه تماس بگیرید.',
    statuses: { pending_payment: 'در انتظار پرداخت', paid: 'پرداخت شده', confirmed: 'تأیید شده', shipped: 'ارسال شده', cancelled: 'لغو شده' },
  } : {
    title: 'Checkout', cart: 'Shopping bag', total: 'Total', toman: 'toman', quantity: 'Quantity', remove: 'Remove',
    loading: 'Loading…', empty: 'Your shopping bag is empty.', browse: 'Explore watches',
    signIn: 'Sign in to continue', signInHelp: 'Sign in with your mobile number to pay and track your order.',
    delivery: 'Delivery details', name: 'Full name', email: 'Email (optional)', city: 'City',
    address: 'Full street address', postalCode: '10-digit Iranian postal code', notes: 'Order notes (optional)',
    payment: 'Secure payment with Zarinpal', paymentHelp: 'The final amount is in Iranian toman. You will return to the store after payment.',
    pay: 'Continue to payment', redirecting: 'Opening Zarinpal…', error: 'We could not complete your request. Please try again.',
    invalidPostal: 'Enter a 10-digit postal code.', invalidAddress: 'Enter your complete delivery address.', retry: 'Try again',
    orders: 'My orders', noOrders: 'You have no orders yet.', order: 'Order', details: 'Order details',
    received: 'Your payment is confirmed', paidHelp: 'Your order has been placed. Follow its progress in My orders.',
    pending: 'Payment is incomplete', pendingHelp: 'This order has not been paid. Your shopping bag is saved, and you can continue payment.',
    cancelledHelp: 'This order has been cancelled. Return to your shopping bag to place a new order.',
    resume: 'Continue payment', backToCart: 'Back to shopping bag', missingOrder: 'A valid order number is required.',
    unavailable: 'Some watches in your bag are unavailable for online payment. Please review your bag.',
    pricesChanged: 'Prices have changed. Review the updated total and select payment again.',
    paymentRef: 'Payment reference', gatewayUnavailable: 'Online payment is currently unavailable. Please try again or contact the store.',
    paymentReview: 'Payment under review', reviewHelp: 'Your payment was received. The store needs to review the payment before preparing your order. Please contact the store for help.', contact: 'Contact the store',
    paymentLimit: 'Online payment supports totals from 1,000 to 100,000,000 toman. Adjust your quantities or contact the store for this purchase.',
    statuses: { pending_payment: 'Awaiting payment', paid: 'Paid', confirmed: 'Confirmed', shipped: 'Shipped', cancelled: 'Cancelled' },
  };
}

export const formatToman = formatPrice;
export const normalizeDigits = (value: string) => value.replace(/[۰-۹٠-٩]/g, digit => String(digit.charCodeAt(0) - (digit.charCodeAt(0) >= 0x6f0 ? 0x6f0 : 0x660)));

export function checkoutError(error: unknown, lang: string) {
  const copy = checkoutCopy(lang);
  if (error && typeof error === 'object' && 'status' in error && [502, 503].includes(Number(error.status))) return copy.gatewayUnavailable;
  if (error instanceof Error && /prices.*changed|price.*review/i.test(error.message)) return copy.pricesChanged;
  if (error instanceof Error && /no longer available|custom watches/i.test(error.message)) return copy.unavailable;
  if (error instanceof Error && /cancelled/i.test(error.message)) return copy.cancelledHelp;
  if (error instanceof Error && /must total between|payment amount is invalid/i.test(error.message)) return copy.paymentLimit;
  return lang === 'en' && error instanceof Error ? error.message : copy.error;
}
