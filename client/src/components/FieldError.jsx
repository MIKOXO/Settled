import { AlertCircle } from 'lucide-react';

const FieldError = ({ message, id }) => {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-error"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
};

export default FieldError;