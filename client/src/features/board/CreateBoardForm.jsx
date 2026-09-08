import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Loader2,
  Plane,
  UtensilsCrossed,
  PartyPopper,
Tags,
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import Select from '../../components/Select';
import FieldError from '../../components/FieldError';
import ErrorBanner from '../../components/ErrorBanner';
import useFormErrors from '../../hooks/useFormErrors';
import { setSession } from '../../store/sessionSlice';
import { createBoard, getMe } from '../../services/board';

const BOARD_TYPES = [
  { value: '', label: 'Select a type (optional)', icon: null },
  { value: 'Trip', label: 'Trip', icon: Plane },
  { value: 'Dinner', label: 'Dinner', icon: UtensilsCrossed },
  { value: 'Event', label: 'Event', icon: PartyPopper },
  { value: 'Custom', label: 'Custom', icon: Tags },
];

const TYPE_META = {
  Trip: { icon: Plane, color: 'text-accent-secondary bg-accent-secondary/15 border-accent-secondary/30' },
  Dinner: { icon: UtensilsCrossed, color: 'text-accent bg-accent/15 border-accent/30' },
  Event: { icon: PartyPopper, color: 'text-accent bg-accent/15 border-accent/30' },
  Custom: { icon: Tags, color: 'text-text-muted bg-surface-2 border-border' },
};

const FIELD_MAP = {
  name: 'boardName',
  typeLabel: 'customType',
  creatorDisplayName: 'displayName',
  creatorEmail: 'email',
};

const inputClasses =
  'peer w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder:text-transparent focus:outline-none focus:border-accent transition-colors duration-200';
const labelClasses =
  'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 rounded bg-surface px-1 font-sans text-sm text-text-muted/60 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-accent peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs';

const CreateBoardForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    blockError,
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    setBlockError,
    clearBlockError,
  } = useFormErrors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearBlockError();
    setFieldErrors({});
    setSubmitting(true);

    try {
      const boardRes = await createBoard({
        name,
        type: type || undefined,
        ...(type === 'Custom' ? { typeLabel: customType.trim() } : {}),
        creatorDisplayName: displayName,
        creatorEmail: email,
      });

      const me = await getMe();

      dispatch(setSession({
        id: me.participant.id,
        boardId: me.board.id,
        role: me.participant.role,
        displayName: me.participant.displayName,
      }));

      navigate(`/share/${boardRes.board.inviteToken}`, {
        state: {
          boardName: me.board.name,
          inviteToken: boardRes.board.inviteToken,
        },
      });
    } catch (err) {
      const mapped = {};
      let mappedAny = false;

      if (Array.isArray(err.issues)) {
        for (const issue of err.issues) {
          const rawField = Array.isArray(issue.path) ? issue.path[0] : null;
          const localField = FIELD_MAP[rawField];
          if (localField) {
            mapped[localField] = issue.message;
            mappedAny = true;
          }
        }
      }

      if (mappedAny) {
        setFieldErrors(mapped);
        setBlockError('Please fix the highlighted fields and try again.');
      } else {
        setFieldErrors({});
        setBlockError(err.message || 'Something went wrong');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const TypeIcon = type ? TYPE_META[type].icon : null;
  const typeColor = type ? TYPE_META[type].color : '';
  const showCustomInput = type === 'Custom';

  const isFormComplete = Boolean(
    name.trim() &&
      displayName.trim() &&
      email.trim() &&
      (type !== 'Custom' || customType.trim()),
  );

  return (
    <div className="relative mx-auto max-w-md px-4 py-8">
      {/* Ambient warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      {/* Header */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-accent/15">
          <Link2 className="h-6 w-6 text-accent" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          Start a board
        </h1>
        <p className="mx-auto mt-1.5 max-w-sm font-sans text-sm text-text-muted">
          Name it, share the link — your group can join with zero signup.
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 rounded-card border border-border bg-surface p-5 sm:p-6"
      >
        {/* Block-level error */}
        <ErrorBanner message={blockError} onDismiss={clearBlockError} />

        {/* Board name */}
        <div className="relative">
          <input
            id="board-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearFieldError('boardName');
            }}
            placeholder=" "
            className={inputClasses}
          />
          <label htmlFor="board-name" className={labelClasses}>
            Board name
          </label>
        </div>
        <FieldError message={fieldErrors.boardName} />

        {/* Type select */}
        <div className="relative mt-4">
          <span className="mb-1.5 flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-wider text-text-muted">
            <Tags className="h-3.5 w-3.5" />
            Type
          </span>
          <Select
            name="board-type"
            value={type}
            onChange={(value) => {
              setType(value);
              clearFieldError('type');
            }}
            options={BOARD_TYPES}
            placeholder="Select a type (optional)"
          />

          {/* Custom type name input */}
          {showCustomInput && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-3"
            >
              <input
                id="custom-type"
                type="text"
                required
                maxLength={50}
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  clearFieldError('customType');
                }}
                placeholder=" "
                className={inputClasses}
              />
              <label htmlFor="custom-type" className={labelClasses}>
                Custom type
              </label>
            </motion.div>
          )}
          <FieldError message={fieldErrors.customType} />

          {/* Selected type chip (non-custom) */}
          {type && TypeIcon && !showCustomInput && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-2 inline-flex items-center gap-2 rounded-btn border px-2.5 py-1 font-sans text-xs font-medium ${typeColor}`}
            >
              <TypeIcon className="h-3.5 w-3.5" />
              <span>{type}</span>
            </motion.div>
          )}
        </div>

        <div className="my-4 h-px bg-border" />

        {/* Creator identity */}
        <p className="mb-3 font-sans text-sm font-medium text-text-primary">
          Tell us who you are
        </p>

        <div className="relative">
          <User className="pointer-events-none absolute right-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted/50" />
          <input
            id="display-name"
            type="text"
            required
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              clearFieldError('displayName');
            }}
            placeholder=" "
            className={`${inputClasses} pr-10`}
          />
          <label htmlFor="display-name" className={labelClasses}>
            Your display name
          </label>
        </div>
        <FieldError message={fieldErrors.displayName} />

        <div className="relative mt-4">
          <Mail className="pointer-events-none absolute right-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-muted/50" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            placeholder=" "
            className={`${inputClasses} pr-10`}
          />
          <label htmlFor="email" className={labelClasses}>
            Your email
          </label>
        </div>
        <FieldError message={fieldErrors.email} />
        <p className="mt-1.5 flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          Used for recovery only — never shown to the group.
        </p>

        <button
          type="submit"
          disabled={!isFormComplete || submitting}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-btn px-4 py-2.5 font-sans text-sm font-semibold transition-all duration-200 ${
            isFormComplete
              ? 'bg-accent text-background hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-accent/15'
              : 'bg-surface-2 text-text-muted/60 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create board
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateBoardForm;