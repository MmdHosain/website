import { getDictionary } from "../dictionaries";
import { HeroSection } from "../../components/home/HeroSection";
import { BrandMarquee } from "../../components/home/BrandMarquee";
import { CategorySpotlight } from "../../components/home/CategorySpotlight";
import { HighCopyShowcase } from "../../components/home/HighCopyShowcase";
import { CustomOrderBanner } from "../../components/home/CustomOrderBanner";
import { CategorisedLookbook } from "../../components/home/CategorisedLookbook";
import { EditorialSlider } from "../../components/home/EditorialSlider";
import { BrandStoryTeaser } from "../../components/home/BrandStoryTeaser";
import { SaleOffers } from "../../components/home/SaleOffers";
import { InstagramPosts } from "../../components/home/InstagramPosts";
import { watchService } from "../../services/watch.service";
import { getStorefrontSettings } from "../../services/store-settings";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  const [watches, settings] = await Promise.all([watchService.getAll(), getStorefrontSettings()]);
  const isFa = lang === 'fa';

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <HeroSection lang={lang} dict={dict} isFa={isFa} heroStyle={settings.heroStyle} />
      <SaleOffers watches={watches} lang={lang} dict={dict} />
      <BrandMarquee lang={lang} dict={dict} isFa={isFa} />
      <CategorySpotlight lang={lang} dict={dict} isFa={isFa} />
      <HighCopyShowcase lang={lang} dict={dict} isFa={isFa} />
      <CustomOrderBanner lang={lang} dict={dict} isFa={isFa} />
      <CategorisedLookbook lang={lang} dict={dict} isFa={isFa} />
      <EditorialSlider lang={lang} dict={dict} isFa={isFa} />
      <BrandStoryTeaser lang={lang} dict={dict} isFa={isFa} />
      <InstagramPosts lang={lang} />
    </div>
  );
}
