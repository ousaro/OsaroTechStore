const MAP = {
  new:"badge-new", active:"badge-active", inactive:"badge-inactive", deprecated:"badge-deprecated",
  pending:"badge-pending", processing:"badge-processing", shipped:"badge-shipped",
  delivered:"badge-delivered", cancelled:"badge-cancelled",
  paid:"badge-paid", failed:"badge-failed", refunded:"badge-refunded", expired:"badge-expired",
};
export function Badge({ status }) {
  return <span className={`badge ${MAP[status?.toLowerCase()] || "badge-inactive"}`}>{status}</span>;
}
