// components/BlurImage.tsx
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

function getBlurUrl(src: string): string {
  if (src.includes("cloudinary.com")) {
    const [base, rest] = src.split("/upload/");
    return `${base}/upload/w_10,q_10/${rest}`;
  }
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
}

export default function BlurImage({ src, alt, className, fill = false, width, height }: Props) {
  const blurDataURL = getBlurUrl(src);

  return fill ? (
    <Image
      src={src} alt={alt} fill
      placeholder="blur" blurDataURL={blurDataURL}
      className={className} style={{ objectFit: "cover" }}
    />
  ) : (
    <Image
      src={src} alt={alt}
      width={width ?? 800} height={height ?? 600}
      placeholder="blur" blurDataURL={blurDataURL}
      className={className}
    />
  );
}