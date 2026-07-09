import Image from "next/image";

export function ImageCard({
  src,
  alt,
  caption,
  priority = false
}: {
  src: string;
  alt: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-[#dbe5df] bg-white">
      <div className="relative aspect-[16/9] w-full">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 1100px" priority={priority} loading={priority ? "eager" : "lazy"} className="object-cover" />
      </div>
      <figcaption className="border-t border-[#dbe5df] px-4 py-3 text-sm text-[#5d6f6e]">{caption}</figcaption>
    </figure>
  );
}
