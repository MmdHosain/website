import { localMediaUrl } from '../../../services/media';
import { Watch } from "../../../types";
export function ProductGallery({ watch, isFa }: { watch: Watch; isFa: boolean }) {
  return <div className="w-full lg:w-[55%]">
    <div className="w-full aspect-square md:aspect-[4/5] bg-ariwatch-cream border border-gray-100 overflow-hidden">
      <img src={localMediaUrl(watch.imageUrl)} alt={watch.name} className="w-full h-full object-cover" />
    </div>
  </div>;
}
