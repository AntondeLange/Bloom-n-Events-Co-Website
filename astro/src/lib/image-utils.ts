export const RESPONSIVE_WIDTHS = [480, 768, 1024, 1600] as const;
export const DEFAULT_WIDTH = 1024;

const splitExt = (src: string) => {
  const dotIndex = src.lastIndexOf(".");
  if (dotIndex === -1) {
    return { base: src, ext: "" };
  }
  return { base: src.slice(0, dotIndex), ext: src.slice(dotIndex) };
};

export const withWidthSuffix = (src: string, width: number) => {
  const { base, ext } = splitExt(src);
  return `${base}-${width}w${ext}`;
};

export const withWidthSuffixAndFormat = (src: string, width: number, format: string) => {
  const { base } = splitExt(src);
  return `${base}-${width}w.${format}`;
};

export const encodeSrc = (src: string) => encodeURI(src);

export const buildSrcSet = (src: string, format?: string) =>
  RESPONSIVE_WIDTHS.map((width) => {
    const url = format
      ? withWidthSuffixAndFormat(src, width, format)
      : withWidthSuffix(src, width);
    return `${encodeSrc(url)} ${width}w`;
  }).join(", ");
