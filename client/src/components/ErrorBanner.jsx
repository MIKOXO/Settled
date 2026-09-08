import { AlertCircle, X } from 'lucide-react';

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-btn border border-error/30 bg-error/10 px-3.5 py-2.5 font-sans text-sm text-error"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 text-error/70 transition-colors duration-200 hover:text-error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;