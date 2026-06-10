export function Spinner({ full = false, size = 40 }) {
  const s = { width: size, height: size, borderWidth: size > 30 ? 3 : 2.5 };
  if (full)
    return (
      <div className="loading-page">
        <div className="spinner" style={s} />
      </div>
    );
  return <div className="spinner" style={s} />;
}
