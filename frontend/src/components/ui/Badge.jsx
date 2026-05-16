import PropTypes from "prop-types";

const MAP = {
  new:"badge-new", active:"badge-active", inactive:"badge-inactive", deprecated:"badge-deprecated",
  pending:"badge-pending", processing:"badge-processing", shipped:"badge-shipped",
  delivered:"badge-delivered", cancelled:"badge-cancelled",
  paid:"badge-paid", failed:"badge-failed", refunded:"badge-refunded", expired:"badge-expired",
};
export function Badge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();
  return <span className={`badge ${MAP[normalizedStatus] || "badge-inactive"}`}>{status}</span>;
}

Badge.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
