import { useState } from "react";

function getInitials({ name = "", firstName = "", lastName = "" }) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || name.trim();
  if (!fullName) return "U";
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export function Avatar({
  src,
  name,
  firstName,
  lastName,
  alt = "",
  className = "",
  fallbackClassName = "",
}) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials({ name, firstName, lastName });

  if (src && !imgError) {
    return <img src={src} alt={alt} className={className} onError={() => setImgError(true)} loading="lazy" />;
  }

  return (
    <span
      className={fallbackClassName || className}
      aria-label={alt || name || `${firstName} ${lastName}`.trim() || "User avatar"}
      title={name || `${firstName} ${lastName}`.trim() || "User"}
    >
      {initials}
    </span>
  );
}
