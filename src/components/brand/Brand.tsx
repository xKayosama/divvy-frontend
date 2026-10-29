// Match the mobile wordmark's visible size, accounting for transparent padding.
export function Brand() {
  return (
    <span
      className="relative block h-12 w-38 shrink-0"
      role="img"
      aria-label="Divvy"
    >
      <img
        src="/brand/wordmark.png"
        alt=""
        className="absolute -left-7.5 top-1/2 h-17.5 w-52.5 -translate-y-1/2 max-w-none object-contain"
      />
    </span>
  );
}

export function BrandMark() {
  return (
    <img
      src="/brand/icon.png"
      alt="Divvy"
      className="size-8 shrink-0 object-contain lg:hidden"
    />
  );
}
