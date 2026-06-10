import { useState } from "react";
import { ProductPlaceholder } from "./ProductPlaceholder.jsx";

export function ProductImage({
  src,
  alt = "",
  placeholderSize = 58,
  imgClassName = "",
  wrapperClassName = "",
}) {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center text-ink-faint ${wrapperClassName}`}
      >
        <ProductPlaceholder size={placeholderSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
