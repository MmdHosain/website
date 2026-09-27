interface StoryBannerProps {
  dict: any;
}

export function StoryBanner({ dict }: StoryBannerProps) {
  return (
    <section className="py-32 text-center bg-dotted border-t border-gray-200">
       <span className="text-[10px] font-bold tracking-widest text-ariwatch-red uppercase mb-4 block bg-white/90 inline-block px-4 py-2">
         {dict.home.storySubtitle}
       </span>
       <br/>
       <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-widest text-ariwatch-black uppercase bg-white/90 inline-block px-8 py-4 mt-2">
         {dict.home.storyTitle}
       </h2>
    </section>
  );
}
