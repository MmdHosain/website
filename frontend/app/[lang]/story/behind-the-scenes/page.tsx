import { getDictionary } from "../../../dictionaries";
import Link from "next/link";

export default async function BehindTheScenesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  const article = dict.story.articles.behindTheScenes;

  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        {/* Back Link */}
        <Link href={`/${lang}/story`} className="inline-block mb-12 text-[10px] font-bold tracking-widest text-ariwatch-gray hover:text-ariwatch-black uppercase transition-colors">
          &larr; Back to Story
        </Link>

        {/* Header */}
        <div className="mb-16">
           <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
             {article.subtitle}
           </span>
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-ariwatch-black uppercase tracking-widest leading-tight">
             {article.title}
           </h1>
        </div>

        {/* Visual Hero */}
        <div className="w-full aspect-[21/9] bg-[#f4f4f4] mb-16 flex items-center justify-center border border-gray-100 shadow-sm">
          <img src="/resourses/photo-1524592094714-0f0654e20314.jpg" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Content Flow */}
        <div className="flex flex-col gap-8 text-ariwatch-gray text-base md:text-lg leading-[2.2] text-justify md:text-left">
          <p>{article.content1}</p>
          <div className="w-12 h-[1px] bg-ariwatch-red my-4 md:mx-0 mx-auto"></div>
          <p>{article.content2}</p>
        </div>
      </div>
    </div>
  );
}
