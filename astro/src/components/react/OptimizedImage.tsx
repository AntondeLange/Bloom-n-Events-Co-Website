import { buildSrcSet, encodeSrc, withWidthSuffix, DEFAULT_WIDTH } from "../../lib/image-utils";

type ImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "sizes"
>;

interface Props extends ImgProps {
  src: string;
  alt: string;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  sizes = "100vw",
  className,
  width = 1600,
  height = 900,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  ...rest
}: Props) {
  const fallbackSrc = encodeSrc(withWidthSuffix(src, DEFAULT_WIDTH));
  const fallbackSrcSet = buildSrcSet(src);
  const avifSrcSet = buildSrcSet(src, "avif");
  const webpSrcSet = buildSrcSet(src, "webp");
  const resolvedFetchPriority = fetchPriority ?? (loading === "lazy" ? "low" : undefined);

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallbackSrc}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        width={width}
        height={height}
        {...rest}
      />
    </picture>
  );
}
