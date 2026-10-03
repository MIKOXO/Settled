import { Check, Copy } from 'lucide-react';
import useCopyToClipboard from '../hooks/useCopyToClipboard';

const SIZES = {
  sm: { field: 'px-3 py-2 text-xs', button: 'gap-1.5 px-3 py-2 text-xs' },
  md: { field: 'px-4 py-3 text-sm', button: 'gap-2 px-5 py-3 text-sm' },
};

/**
 * A read-only invite link with its copy button and copied confirmation. Shared
 * by the post-creation ShareInvite screen and the board header's invite popover,
 * so the field, the button, and the success state are defined once — the two
 * surfaces differ only in density.
 */
const InviteLinkDisplay = ({ url, size = 'md' }) => {
  const { copied, copy } = useCopyToClipboard(url);
  const sizing = SIZES[size] ?? SIZES.md;

  return (
    <div className="flex items-stretch gap-2">
      <div
        className={`min-w-0 flex-1 overflow-hidden rounded-btn border border-border bg-surface-2 ${sizing.field}`}
      >
        <p className="truncate select-all font-mono text-text-primary">{url}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={!url}
        className={`flex shrink-0 items-center rounded-btn font-semibold transition-all duration-200 disabled:opacity-60 ${sizing.button} ${
          copied
            ? 'bg-success/15 text-success'
            : 'bg-accent text-background hover:brightness-110'
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export default InviteLinkDisplay;