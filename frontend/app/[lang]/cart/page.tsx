import { getDictionary } from "../../dictionaries";
import { CartView } from "../../../components/cart/CartView";

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  
  return (
    <div className="w-full min-h-[70vh] bg-white pt-32 pb-24 flex flex-col items-center justify-center">
      <CartView lang={lang} dict={dict} />
    </div>
  );
}
