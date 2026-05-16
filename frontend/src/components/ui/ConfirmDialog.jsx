import { FiAlertTriangle, FiX } from "react-icons/fi";

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", danger = true, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <span className="dialog-icon"><FiAlertTriangle size={22} /></span>
          <h3 className="dialog-title">{title}</h3>
          <button className="dialog-close" onClick={onCancel} aria-label="Close"><FiX size={18} /></button>
        </div>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
