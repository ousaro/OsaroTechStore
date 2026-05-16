export function QtyControl({ value, min=1, max, onDecrement, onIncrement }) {
  return (
    <div className="qty-control">
      <button className="qty-btn" onClick={onDecrement} disabled={value <= min}>−</button>
      <div className="qty-value">{value}</div>
      <button className="qty-btn" onClick={onIncrement} disabled={max !== undefined && value >= max}>+</button>
    </div>
  );
}
