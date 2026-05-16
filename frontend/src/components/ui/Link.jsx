export function Link({ to, children, className = "", style, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.hash = to;
    onClick?.();
  };
  return <a href={`#${to}`} className={className} style={style} onClick={handleClick}>{children}</a>;
}
