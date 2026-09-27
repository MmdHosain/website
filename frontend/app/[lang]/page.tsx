import { getDictionary } from "../dictionaries";
import { HeroSection } from "../../components/home/HeroSection";
import { CategorisedSection } from "../../components/home/CategorisedSection";
import { ThreePathsSection } from "../../components/home/ThreePathsSection";
import { StoryBanner } from "../../components/home/StoryBanner";

export default async function Home({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';

  return (
    <div className="flex flex-col w-full">
      <HeroSection lang={lang} dict={dict} isFa={isFa} />
      <CategorisedSection lang={lang} dict={dict} isFa={isFa} />
      <ThreePathsSection lang={lang} dict={dict} isFa={isFa} />
      <StoryBanner dict={dict} />
    </div>
  );
}
