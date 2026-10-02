import { getDictionary } from "../../dictionaries";

export default async function StoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  
  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
           <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
             {dict.story.subtitle}
           </span>
           <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-ariwatch-black uppercase tracking-widest">
             {dict.story.title}
           </h1>
        </div>
        
        {/* Visual Hero */}
        <div className="w-full aspect-[16/9] bg-[#f4f4f4] mb-16 flex items-center justify-center border border-gray-100 shadow-sm">
          <img src="/resourses/photo-1524592094714-0f0654e20314.jpg" alt={dict.story.title} className="w-full h-full object-cover" />
        </div>

        {/* Content Flow */}
        <div className="max-w-3xl mx-auto flex flex-col gap-8 text-ariwatch-gray text-base md:text-lg leading-[2.2] text-justify md:text-left">
          <p>{dict.story.p1}</p>
          <div className="w-12 h-[1px] bg-ariwatch-red my-4 md:mx-0 mx-auto"></div>
          <p>{dict.story.p2}</p>
        </div>
      </div>
    </div>
  );
}
