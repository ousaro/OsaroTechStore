import { Component } from "react";
import PropTypes from "prop-types";
import { FiAlertTriangle, FiHome, FiRefreshCcw } from "react-icons/fi";
import { getErrorMessage } from "../../lib/errorUtils.js";

export function ErrorFallback({
  error,
  title = "We hit a problem loading this view.",
  fallback = "This section could not be shown. Your session is still safe.",
  onRetry,
  homeHref = "#/",
}) {
  const message = getErrorMessage(error, fallback);

  return (
    <div className="error-boundary-shell">
      <div className="error-boundary-card">
        <span className="error-boundary-icon"><FiAlertTriangle /></span>
        <div>
          <div className="section-kicker">Something went wrong</div>
          <h1 className="error-boundary-title">{title}</h1>
          <p className="error-boundary-copy">{message}</p>
        </div>
        <div className="error-boundary-actions">
          {onRetry && (
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              <FiRefreshCcw /> Try again
            </button>
          )}
          <a className="btn btn-ghost" href={homeHref}>
            <FiHome /> Go home
          </a>
        </div>
      </div>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.any,
  title: PropTypes.string,
  fallback: PropTypes.string,
  onRetry: PropTypes.func,
  homeHref: PropTypes.string,
};

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      // Keep developer context in dev without exposing stack traces in the UI.
      console.error(error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <ErrorFallback
        error={this.state.error}
        onRetry={this.reset}
      />
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  onReset: PropTypes.func,
};
