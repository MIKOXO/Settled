import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { recoverRequest } from '../../services/board';

const RecoverAccessForm = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await recoverRequest(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <Mail className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Check your inbox
        </h1>
        <p className="mt-3 font-sans text-text-muted">
          If an account exists for that email, we&apos;ve sent a recovery link. It expires in 15 minutes.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-btn bg-surface border border-border px-5 py-2.5 font-sans text-sm font-medium text-text-muted hover:text-text-primary hover:border-accent transition-all duration-200"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-text-primary">
        Recover access
      </h1>
      <p className="mt-2 font-sans text-text-muted">
        Enter your email and we&apos;ll send you a link to get back in.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="recover-email" className="block font-sans text-sm font-medium text-text-muted mb-1.5">
            Email
          </label>
          <input
            id="recover-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-btn bg-surface border border-border px-4 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {error && (
          <p className="rounded-btn bg-error/10 px-3 py-2 font-sans text-sm text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-btn bg-accent px-4 py-3 font-sans text-sm font-semibold text-background hover:brightness-110 disabled:opacity-50 transition-all duration-200"
        >
          {submitting ? 'Sending...' : 'Send recovery link'}
        </button>
      </form>

      <p className="mt-6 text-center font-sans text-sm text-text-muted">
        <Link to="/" className="text-accent hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
};

export default RecoverAccessForm;
