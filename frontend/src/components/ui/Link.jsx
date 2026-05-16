/**
 * SHARED INFRASTRUCTURE UI — Link
 * Hash-aware anchor. Shared across all module view pages.
 */

export function Link({ to, children, className = "", style, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.hash = to;
    onClick?.();
  };
  return <a href={`#${to}`} className={className} style={style} onClick={handleClick}>{children}</a>;
}
